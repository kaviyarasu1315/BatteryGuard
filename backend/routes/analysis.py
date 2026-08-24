"""
Analysis Routes
===============
POST /api/analyze  - Run full SoC + trend analysis for a battery
GET  /api/battery/<id>/trends - Health trend data for charts
"""
from flask import Blueprint, jsonify, request
import numpy as np
from services.data_loader   import get_battery_df
from services.soc_estimator import estimate_soc_series

analysis_bp = Blueprint('analysis', __name__)


@analysis_bp.route('/analyze', methods=['POST'])
def analyze_battery():
    """Run a full analysis pass on a battery and return all computed metrics."""
    try:
        body       = request.get_json(force=True) or {}
        battery_id = body.get('battery_id')
        if not battery_id:
            return jsonify({'error': 'battery_id is required'}), 400

        df = get_battery_df(battery_id)

        # SoC series
        soc_series = estimate_soc_series(df)

        # Capacity trend
        cap_arr = df['capacity_discharge'].values
        cyc_arr = df['cycle_number'].values

        # Compute degradation rate (linear fit slope per 100 cycles)
        if len(cap_arr) > 10:
            z = np.polyfit(cyc_arr, cap_arr, 1)
            deg_rate_per_100 = abs(float(z[0])) * 100  # Ah lost per 100 cycles
        else:
            deg_rate_per_100 = 0.0

        # Predicted remaining cycles to 80% SoH (end of life)
        nominal      = 3.0
        eol_capacity = nominal * 0.80
        current_cap  = float(df.iloc[-1]['capacity_discharge'])
        current_cycle= int(df.iloc[-1]['cycle_number'])
        if deg_rate_per_100 > 0 and current_cap > eol_capacity:
            cycles_remaining = int((current_cap - eol_capacity) / (deg_rate_per_100 / 100))
        else:
            cycles_remaining = 0

        # Resistance trend
        r_arr = df['internal_resistance'].values
        baseline_r = float(r_arr[:10].mean())
        current_r  = float(r_arr[-1])

        # Temperature statistics
        temp_arr = df['avg_temperature'].values

        return jsonify({
            'battery_id': battery_id,
            'analysis': {
                'capacity_fade': {
                    'initial_capacity':    round(float(cap_arr[0]), 4),
                    'current_capacity':    round(current_cap, 4),
                    'total_fade_pct':      round((1 - current_cap / float(cap_arr[0])) * 100, 2),
                    'degradation_rate_per_100_cycles': round(deg_rate_per_100, 5),
                    'predicted_eol_cycles': cycles_remaining,
                },
                'resistance': {
                    'baseline_mohm':  round(baseline_r, 2),
                    'current_mohm':   round(current_r, 2),
                    'growth_pct':     round((current_r - baseline_r) / baseline_r * 100, 2),
                },
                'temperature': {
                    'mean_c':  round(float(temp_arr.mean()), 2),
                    'max_c':   round(float(df['max_temperature'].max()), 2),
                    'min_c':   round(float(df['min_temperature'].min()), 2),
                    'std_c':   round(float(temp_arr.std()), 2),
                },
                'current_soc': round(float(soc_series[-1]['soc']), 2) if soc_series else 0.0,
                'current_cycle': current_cycle,
            },
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analysis_bp.route('/battery/<battery_id>/trends', methods=['GET'])
def battery_trends(battery_id):
    """
    Return aggregated trend data for charting:
    - Capacity fade series
    - Internal resistance growth series
    - Temperature series
    - Health score series
    Downsampled for frontend chart performance.
    """
    try:
        df   = get_battery_df(battery_id)
        step = max(1, len(df) // 150)   # max 150 data points
        df_s = df.iloc[::step].copy()

        trends = []
        for _, row in df_s.iterrows():
            trends.append({
                'cycle':               int(row['cycle_number']),
                'capacity':            round(float(row['capacity_discharge']), 4),
                'internal_resistance': round(float(row['internal_resistance']), 2),
                'avg_temperature':     round(float(row['avg_temperature']), 2),
                'health_score':        round(float(row['health_score']), 2),
                'coulombic_efficiency':round(float(row['coulombic_efficiency']), 3),
                'is_anomaly':          bool(row['is_anomaly']),
            })

        return jsonify({
            'battery_id': battery_id,
            'data_points': len(trends),
            'trends': trends,
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
