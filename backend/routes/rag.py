"""
RAG + AI Recommendation Routes
================================
POST /api/ingest-knowledge   - Ingest knowledge base into ChromaDB (one-time)
POST /api/recommend          - Generate AI recommendations (RAG + LLM)
GET  /api/knowledge/status   - Check KB ingestion status
"""
from flask import Blueprint, jsonify, request
from services.data_loader      import get_battery_df, get_latest_cycle
from services.anomaly_detector import detect_anomalies
from services.soc_estimator    import ocv_to_soc
from services.rag_service      import ingest_knowledge_base, retrieve_context, get_kb_status
from services.llm_service      import generate_recommendation

rag_bp = Blueprint('rag', __name__)


@rag_bp.route('/ingest-knowledge', methods=['POST'])
def ingest_knowledge():
    """
    Trigger knowledge base ingestion into ChromaDB.
    Safe to call multiple times — skips already-ingested chunks.
    """
    try:
        result = ingest_knowledge_base()
        return jsonify(result)
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rag_bp.route('/knowledge/status', methods=['GET'])
def knowledge_status():
    """Return status of the ChromaDB knowledge base."""
    try:
        status = get_kb_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rag_bp.route('/recommend', methods=['POST'])
def recommend():
    """
    Full RAG + LLM pipeline:
    1. Get battery summary and anomalies
    2. Retrieve relevant KB chunks
    3. Generate LLM recommendation
    """
    try:
        body       = request.get_json(force=True) or {}
        battery_id = body.get('battery_id')
        user_query = body.get('query', 'Analyze this battery and provide maintenance recommendations.')

        if not battery_id:
            return jsonify({'error': 'battery_id is required'}), 400

        # Step 1: Get battery context
        df    = get_battery_df(battery_id)
        last  = df.iloc[-1]
        soc   = round(ocv_to_soc(float(last['avg_voltage'])), 2)
        cap   = float(last['capacity_discharge'])
        cap_ret = round((cap / 3.0) * 100, 2)

        baseline_r = float(df.iloc[:10]['internal_resistance'].mean())
        current_r  = float(last['internal_resistance'])

        battery_summary = {
            'battery_id':          battery_id,
            'cycle_count':         int(last['cycle_number']),
            'health_score':        round(float(last['health_score']), 2),
            'soc':                 soc,
            'capacity':            round(cap, 4),
            'capacity_retention':  cap_ret,
            'internal_resistance': round(current_r, 2),
            'avg_temperature':     round(float(last['avg_temperature']), 2),
        }

        # Step 2: Anomaly detection
        all_anomalies = detect_anomalies(df)
        # Only pass the 8 most severe
        anomalies = sorted(
            all_anomalies,
            key=lambda a: (0 if a['severity'] == 'critical' else 1, -a['cycle_number'])
        )[:8]

        # Step 3: RAG retrieval
        # Build a rich query from battery state + user query
        rag_query = (
            f"{user_query} "
            f"Battery health {round(float(last['health_score']), 1)}%, "
            f"capacity retention {cap_ret}%, "
            f"internal resistance {round(current_r, 1)} mOhm, "
            f"temperature {round(float(last['avg_temperature']), 1)}°C, "
            f"cycle count {int(last['cycle_number'])}."
        )
        rag_chunks = retrieve_context(rag_query, top_k=5)

        # Step 4: LLM generation
        result = generate_recommendation(
            battery_summary=battery_summary,
            anomalies=anomalies,
            rag_chunks=rag_chunks,
            user_query=user_query,
        )

        return jsonify({
            'battery_id': battery_id,
            'query':      user_query,
            'response':   result['response'],
            'model':      result['model'],
            'tokens_used': result['tokens_used'],
            'rag_sources': [
                {'source': c['source'], 'similarity': c['similarity'], 'excerpt': c['text'][:200]}
                for c in rag_chunks
            ],
            'battery_summary': battery_summary,
            'anomaly_count': len(all_anomalies),
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
