"""
BatteryGuard Flask Application
================================
Main entry point for the backend API server.
Production-ready: auto-ingests knowledge base on startup,
supports Render PORT env var, and allows Vercel CORS origins.
"""
import os
import threading
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

from routes.battery  import battery_bp
from routes.analysis import analysis_bp
from routes.anomaly  import anomaly_bp
from routes.rag      import rag_bp

app = Flask(__name__)

# ── CORS: allow local dev + any Vercel/Render production domain ───────────────
CORS(app, origins=[
    # Local development
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    # Vercel production (all preview + production deployments)
    "https://batteryguard.vercel.app",
    "https://battery-guard.vercel.app",
    "https://batteryguard-kaviyarasu.vercel.app",
], supports_credentials=True)

# Also allow all *.vercel.app subdomains via wildcard header
@app.after_request
def add_cors_headers(response):
    origin = response.headers.get('Access-Control-Allow-Origin', '')
    # If the origin wasn't matched above but is from vercel.app, allow it
    from flask import request as req
    req_origin = req.headers.get('Origin', '')
    if req_origin.endswith('.vercel.app') or req_origin.endswith('.onrender.com'):
        response.headers['Access-Control-Allow-Origin']  = req_origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

# Register blueprints
app.register_blueprint(battery_bp,  url_prefix='/api')
app.register_blueprint(analysis_bp, url_prefix='/api')
app.register_blueprint(anomaly_bp,  url_prefix='/api')
app.register_blueprint(rag_bp,      url_prefix='/api')


@app.route('/api/health', methods=['GET'])
def health_check():
    from services.rag_service import get_kb_status
    kb = get_kb_status()
    return jsonify({
        'status':   'ok',
        'service':  'BatteryGuard API',
        'version':  '1.0.0',
        'kb_status': kb,
    })


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500


def _auto_ingest():
    """Auto-ingest knowledge base in background thread on startup."""
    try:
        from services.rag_service import ingest_knowledge_base, get_kb_status
        status = get_kb_status()
        if status['chunk_count'] == 0:
            print("[startup] Knowledge base empty — ingesting now...")
            result = ingest_knowledge_base()
            print(f"[startup] KB ingestion done: {result}")
        else:
            print(f"[startup] KB already loaded ({status['chunk_count']} chunks). Skipping.")
    except Exception as e:
        print(f"[startup] KB auto-ingest failed: {e}")


# Start KB ingestion in background so server boots immediately
_ingest_thread = threading.Thread(target=_auto_ingest, daemon=True)
_ingest_thread.start()


if __name__ == '__main__':
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5000)))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    print(f"[BatteryGuard] Starting API server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=debug)
