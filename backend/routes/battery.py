"""
Battery Routes
==============
GET /api/batteries                    - list all batteries
GET /api/battery/<id>/summary         - latest summary for one battery
GET /api/battery/<id>/cycles          - full cycle history
GET /api/battery/<id>/charge-curves   - charge/discharge curves for latest cycle
"""
from flask import Blueprint, jsonify, request
from services.data_loader  import get_batteries, get_battery_df, get_latest_cycle
from services.soc_estimator import ocv_to_soc, generate_charge_curve
from services.anomaly_detector import detect_anomalies, anomaly_summary

battery_bp = Blueprint('battery', __name__)


@battery_bp.route('/batteries', methods=['GET'])
def list_batteries():
    try:
        batteries = get_batteries()
        # Enrich with anomaly counts
        for bat in batteries:
            df = get_battery_df(bat['id'])
            anomalies = detect_anomalies(df)
            summary   = anomaly_summary(anomalies)
            bat['anomaly_count']    = summary['total']
            bat['critical_count']   = summary['critical']
            bat['soc']              = round(ocv_to_soc(
                float(df.iloc[-1]['avg_voltage'])), 2)
            # Status label
            hs = bat['health_score']
            if hs >= 90:   bat['status'] = 'excellent'
            elif hs >= 80: bat['status'] = 'good'
            elif hs >= 70: bat['status'] = 'fair'
            elif hs >= 60: bat['status'] = 'poor'
            else:          bat['status'] = 'critical'
        return jsonify({'batteries': batteries})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@battery_bp.route('/battery/<battery_id>/summary', methods=['GET'])
def battery_summary(battery_id):
    try:
        df   = get_battery_df(battery_id)
        last = df.iloc[-1]
        soc  = round(ocv_to_soc(float(last['avg_voltage'])), 2)
        hs   = float(last['health_score'])

        anomalies = detect_anomalies(df)
        a_summary = anomaly_summary(anomalies)

        capacity   = float(last['capacity_discharge'])
        nominal    = 3.0
        cap_ret    = round((capacity / nominal) * 100, 2)

        # Resistance growth
        baseline_r = float(df.iloc[:10]['internal_resistance'].mean())
        current_r  = float(last['internal_resistance'])
        r_growth   = round(((current_r - baseline_r) / baseline_r) * 100, 2)

        return jsonify({
            'battery_id':          battery_id,
            'cycle_count':         int(last['cycle_number']),
            'health_score':        round(hs, 2),
            'soc':                 soc,
            'capacity':            round(capacity, 4),
            'nominal_capacity':    nominal,
            'capacity_retention':  cap_ret,
            'internal_resistance': round(current_r, 2),
            'resistance_growth_pct': r_growth,
            'avg_temperature':     round(float(last['avg_temperature']), 2),
            'max_temperature':     round(float(last['max_temperature']), 2),
            'coulombic_efficiency':round(float(last['coulombic_efficiency']), 3),
            'last_updated':        str(last['timestamp']),
            'status': (
                'excellent' if hs >= 90 else
                'good' if hs >= 80 else
                'fair' if hs >= 70 else
                'poor' if hs >= 60 else 'critical'
            ),
            'anomaly_summary': a_summary,
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@battery_bp.route('/battery/<battery_id>/cycles', methods=['GET'])
def battery_cycles(battery_id):
    try:
        df = get_battery_df(battery_id)

        # Optional: downsample for performance if full=false
        full  = request.args.get('full', 'false').lower() == 'true'
        step  = 1 if full else max(1, len(df) // 200)
        df_s  = df.iloc[::step].copy()

        records = []
        for _, row in df_s.iterrows():
            records.append({
                'cycle_number':        int(row['cycle_number']),
                'timestamp':           str(row['timestamp']),
                'capacity_discharge':  round(float(row['capacity_discharge']), 5),
                'capacity_charge':     round(float(row['capacity_charge']), 5),
                'internal_resistance': round(float(row['internal_resistance']), 3),
                'avg_temperature':     round(float(row['avg_temperature']), 3),
                'max_temperature':     round(float(row['max_temperature']), 3),
                'avg_voltage':         round(float(row['avg_voltage']), 4),
                'coulombic_efficiency':round(float(row['coulombic_efficiency']), 3),
                'health_score':        round(float(row['health_score']), 2),
                'is_anomaly':          bool(row['is_anomaly']),
            })

        return jsonify({
            'battery_id': battery_id,
            'total_cycles': int(df['cycle_number'].max()),
            'returned_cycles': len(records),
            'cycles': records,
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@battery_bp.route('/battery/<battery_id>/charge-curves', methods=['GET'])
def charge_curves(battery_id):
    try:
        df   = get_battery_df(battery_id)
        # Which cycle to show? Default = latest. Allow ?cycle=N
        cycle_num = request.args.get('cycle', None)
        if cycle_num is not None:
            row = df[df['cycle_number'] == int(cycle_num)]
            if row.empty:
                return jsonify({'error': f'Cycle {cycle_num} not found'}), 404
            cycle_row = row.iloc[0]
        else:
            cycle_row = df.iloc[-1]

        curves = generate_charge_curve(cycle_row)
        return jsonify({
            'battery_id':   battery_id,
            'cycle_number': int(cycle_row['cycle_number']),
            'charge':       curves['charge'],
            'discharge':    curves['discharge'],
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
