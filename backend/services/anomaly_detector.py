"""
Anomaly Detection Service
==========================
Detects abnormal patterns in battery cycle data using:
  - Z-score thresholds on voltage, temperature, current
  - Consecutive capacity drop detection
  - Absolute threshold violations
"""
import numpy as np
import pandas as pd
from typing import Any

# ──── Thresholds ──────────────────────────────────────────────────────────────
Z_SCORE_WARN     = 2.0
Z_SCORE_CRIT     = 3.0
TEMP_WARN        = 40.0   # °C
TEMP_CRIT        = 50.0   # °C
VOLTAGE_LOW_WARN = 3.10   # V
VOLTAGE_HIGH_WARN= 4.23   # V
CAPACITY_DROP_WARN = 0.04  # 4 % consecutive drop
CAPACITY_DROP_CRIT = 0.08  # 8 % consecutive drop
RESISTANCE_GROWTH  = 1.50  # 50 % growth over baseline triggers warning


def _z_scores(series: pd.Series) -> pd.Series:
    mu, sigma = series.mean(), series.std()
    if sigma == 0:
        return pd.Series(np.zeros(len(series)), index=series.index)
    return (series - mu) / sigma


def _make_anomaly(cycle: int, ts: str, atype: str, severity: str,
                  value: float, threshold: float, message: str) -> dict[str, Any]:
    return {
        'cycle_number': int(cycle),
        'timestamp':    ts,
        'type':         atype,
        'severity':     severity,
        'value':        round(float(value), 4),
        'threshold':    round(float(threshold), 4),
        'message':      message,
    }


def detect_anomalies(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Run all anomaly detectors on a battery's cycle DataFrame.

    Returns list of anomaly dicts sorted by cycle_number.
    """
    anomalies: list[dict] = []
    df = df.copy().sort_values('cycle_number').reset_index(drop=True)

    # ── 1. Voltage Z-score anomalies ─────────────────────────────────────────
    v_z = _z_scores(df['avg_voltage'])
    for i, (z, row) in enumerate(zip(v_z, df.itertuples())):
        if abs(z) >= Z_SCORE_CRIT:
            anomalies.append(_make_anomaly(
                row.cycle_number, str(row.timestamp), 'voltage_anomaly', 'critical',
                row.avg_voltage, Z_SCORE_CRIT,
                f"Critical voltage deviation: {row.avg_voltage:.3f} V (Z={z:.2f})"
            ))
        elif abs(z) >= Z_SCORE_WARN:
            anomalies.append(_make_anomaly(
                row.cycle_number, str(row.timestamp), 'voltage_anomaly', 'warning',
                row.avg_voltage, Z_SCORE_WARN,
                f"Unusual voltage: {row.avg_voltage:.3f} V (Z={z:.2f})"
            ))

    # ── 2. Voltage absolute threshold violations ──────────────────────────────
    for _, row in df.iterrows():
        if row['max_voltage'] > VOLTAGE_HIGH_WARN:
            anomalies.append(_make_anomaly(
                row['cycle_number'], str(row['timestamp']), 'overvoltage', 'critical',
                row['max_voltage'], VOLTAGE_HIGH_WARN,
                f"Overvoltage detected: {row['max_voltage']:.3f} V exceeds {VOLTAGE_HIGH_WARN} V limit"
            ))
        if row['min_voltage'] < VOLTAGE_LOW_WARN:
            anomalies.append(_make_anomaly(
                row['cycle_number'], str(row['timestamp']), 'undervoltage', 'warning',
                row['min_voltage'], VOLTAGE_LOW_WARN,
                f"Undervoltage detected: {row['min_voltage']:.3f} V below {VOLTAGE_LOW_WARN} V limit"
            ))

    # ── 3. Temperature anomalies ─────────────────────────────────────────────
    for _, row in df.iterrows():
        if row['max_temperature'] >= TEMP_CRIT:
            anomalies.append(_make_anomaly(
                row['cycle_number'], str(row['timestamp']), 'temperature_spike', 'critical',
                row['max_temperature'], TEMP_CRIT,
                f"CRITICAL: Temperature {row['max_temperature']:.1f}°C exceeds {TEMP_CRIT}°C safety limit"
            ))
        elif row['max_temperature'] >= TEMP_WARN:
            anomalies.append(_make_anomaly(
                row['cycle_number'], str(row['timestamp']), 'temperature_spike', 'warning',
                row['max_temperature'], TEMP_WARN,
                f"Elevated temperature: {row['max_temperature']:.1f}°C exceeds {TEMP_WARN}°C"
            ))

    # ── 4. Current surge anomalies ────────────────────────────────────────────
    c_z = _z_scores(df['avg_current_charge'])
    for z, row in zip(c_z, df.itertuples()):
        if z >= Z_SCORE_CRIT:
            anomalies.append(_make_anomaly(
                row.cycle_number, str(row.timestamp), 'current_surge', 'critical',
                row.avg_current_charge, Z_SCORE_CRIT,
                f"Charge current surge: {row.avg_current_charge:.3f} A (Z={z:.2f})"
            ))
        elif z >= Z_SCORE_WARN:
            anomalies.append(_make_anomaly(
                row.cycle_number, str(row.timestamp), 'current_surge', 'warning',
                row.avg_current_charge, Z_SCORE_WARN,
                f"Elevated charge current: {row.avg_current_charge:.3f} A (Z={z:.2f})"
            ))

    # ── 5. Sudden capacity drop (consecutive cycles) ──────────────────────────
    caps = df['capacity_discharge'].values
    cycles = df['cycle_number'].values
    timestamps = df['timestamp'].values
    for i in range(1, len(caps)):
        prev_cap = caps[i - 1]
        if prev_cap <= 0:
            continue
        drop_pct = (prev_cap - caps[i]) / prev_cap
        if drop_pct >= CAPACITY_DROP_CRIT:
            anomalies.append(_make_anomaly(
                int(cycles[i]), str(timestamps[i]), 'capacity_drop', 'critical',
                drop_pct * 100, CAPACITY_DROP_CRIT * 100,
                f"Sudden capacity drop of {drop_pct*100:.1f}% from cycle {int(cycles[i-1])} to {int(cycles[i])}"
            ))
        elif drop_pct >= CAPACITY_DROP_WARN:
            anomalies.append(_make_anomaly(
                int(cycles[i]), str(timestamps[i]), 'capacity_drop', 'warning',
                drop_pct * 100, CAPACITY_DROP_WARN * 100,
                f"Notable capacity drop of {drop_pct*100:.1f}% between cycles {int(cycles[i-1])} and {int(cycles[i])}"
            ))

    # ── 6. Internal resistance spike ─────────────────────────────────────────
    baseline_r = float(df['internal_resistance'].iloc[:10].mean())
    r_z = _z_scores(df['internal_resistance'])
    for z, row in zip(r_z, df.itertuples()):
        growth = (row.internal_resistance - baseline_r) / baseline_r if baseline_r > 0 else 0
        if z >= Z_SCORE_CRIT and growth > 0.2:
            anomalies.append(_make_anomaly(
                row.cycle_number, str(row.timestamp), 'resistance_spike', 'warning',
                row.internal_resistance, baseline_r * RESISTANCE_GROWTH,
                f"Internal resistance spike: {row.internal_resistance:.1f} mΩ (Z={z:.2f})"
            ))

    # Deduplicate same cycle+type and sort
    seen = set()
    unique = []
    for a in sorted(anomalies, key=lambda x: (x['cycle_number'], x['type'])):
        key = (a['cycle_number'], a['type'])
        if key not in seen:
            seen.add(key)
            unique.append(a)

    return unique


def anomaly_summary(anomalies: list[dict]) -> dict:
    """Return aggregate summary of anomalies."""
    total     = len(anomalies)
    critical  = sum(1 for a in anomalies if a['severity'] == 'critical')
    warnings  = total - critical
    by_type: dict[str, int] = {}
    for a in anomalies:
        by_type[a['type']] = by_type.get(a['type'], 0) + 1
    return {
        'total':    total,
        'critical': critical,
        'warnings': warnings,
        'by_type':  by_type,
    }
