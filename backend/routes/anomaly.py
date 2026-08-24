"""
Anomaly Routes
==============
GET  /api/battery/<id>/anomalies  - Detected anomalies for a battery
POST /api/battery/<id>/anomalies/summary - Anomaly statistics
"""
from flask import Blueprint, jsonify, request
from services.data_loader      import get_battery_df
from services.anomaly_detector import detect_anomalies, anomaly_summary

anomaly_bp = Blueprint('anomaly', __name__)


@anomaly_bp.route('/battery/<battery_id>/anomalies', methods=['GET'])
def get_anomalies(battery_id):
    """Return all detected anomalies for a battery, optionally filtered."""
    try:
        df        = get_battery_df(battery_id)
        anomalies = detect_anomalies(df)

        # Optional filters
        severity = request.args.get('severity')       # 'warning' | 'critical'
        atype    = request.args.get('type')            # anomaly type string
        limit    = int(request.args.get('limit', 200))

        if severity:
            anomalies = [a for a in anomalies if a['severity'] == severity]
        if atype:
            anomalies = [a for a in anomalies if a['type'] == atype]

        # Sort by severity first (critical first), then by cycle descending
        sev_order = {'critical': 0, 'warning': 1}
        anomalies.sort(key=lambda a: (sev_order.get(a['severity'], 9), -a['cycle_number']))

        summary = anomaly_summary(anomalies)
        return jsonify({
            'battery_id': battery_id,
            'summary':    summary,
            'anomalies':  anomalies[:limit],
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@anomaly_bp.route('/battery/<battery_id>/anomalies/timeline', methods=['GET'])
def anomaly_timeline(battery_id):
    """
    Return anomaly data structured for timeline chart rendering.
    Each item has cycle, severity, and type only (lightweight).
    """
    try:
        df        = get_battery_df(battery_id)
        anomalies = detect_anomalies(df)

        timeline = []
        for a in anomalies:
            timeline.append({
                'cycle':    a['cycle_number'],
                'type':     a['type'],
                'severity': a['severity'],
                'value':    a['value'],
                'message':  a['message'],
            })

        # Sort chronologically
        timeline.sort(key=lambda x: x['cycle'])

        return jsonify({
            'battery_id': battery_id,
            'timeline':   timeline,
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
