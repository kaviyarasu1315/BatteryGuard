"""
State-of-Charge (SoC) Estimator
=================================
Implements two estimation methods:
  1. OCV-based lookup (fast, requires rest)
  2. Coulomb counting (dynamic, requires known initial SoC)

Reference OCV-SoC table: NMC Li-ion cell at 25°C
"""
import numpy as np
from scipy.interpolate import interp1d
import pandas as pd

# OCV-SoC lookup table (voltage → SoC fraction 0–1)
_OCV_TABLE = {
    4.20: 1.00, 4.15: 0.95, 4.10: 0.90, 4.05: 0.85,
    4.00: 0.80, 3.95: 0.75, 3.90: 0.70, 3.85: 0.65,
    3.80: 0.60, 3.75: 0.55, 3.70: 0.50, 3.65: 0.45,
    3.60: 0.40, 3.55: 0.35, 3.50: 0.30, 3.45: 0.25,
    3.40: 0.20, 3.35: 0.15, 3.30: 0.10, 3.20: 0.05,
    3.00: 0.00,
}

_voltages = sorted(_OCV_TABLE.keys())
_socs     = [_OCV_TABLE[v] for v in _voltages]

_ocv_to_soc_fn = interp1d(
    _voltages, _socs, kind='linear',
    bounds_error=False, fill_value=(0.0, 1.0)
)


def ocv_to_soc(voltage: float) -> float:
    """Convert open-circuit voltage (V) to SoC (0–100 %)."""
    return float(np.clip(_ocv_to_soc_fn(voltage) * 100, 0.0, 100.0))


def coulomb_counting(
    initial_soc_pct: float,
    current_array: np.ndarray,
    dt_hours: float,
    nominal_capacity_ah: float,
    coulombic_efficiency: float = 0.995,
) -> list[float]:
    """
    Coulomb counting SoC estimation.

    Args:
        initial_soc_pct: Starting SoC in percent.
        current_array:   Array of current values (A). Positive = charging.
        dt_hours:        Time step between measurements (hours).
        nominal_capacity_ah: Rated battery capacity (Ah).
        coulombic_efficiency: CE factor (default 0.995 for Li-ion).

    Returns:
        List of SoC values (%) at each time step, length = len(current_array) + 1.
    """
    soc = initial_soc_pct / 100.0
    trace = [soc * 100.0]
    for I in current_array:
        eta = coulombic_efficiency if I > 0 else 1.0
        delta = (eta * I * dt_hours) / nominal_capacity_ah
        soc = float(np.clip(soc + delta, 0.0, 1.0))
        trace.append(soc * 100.0)
    return trace


def estimate_soc_series(battery_df: pd.DataFrame) -> list[dict]:
    """
    Estimate SoC for each cycle using the OCV method on avg_voltage.
    Returns a list of dicts with cycle_number, soc, voltage.
    """
    records = []
    for _, row in battery_df.iterrows():
        soc = ocv_to_soc(float(row['avg_voltage']))
        records.append({
            'cycle_number': int(row['cycle_number']),
            'soc':          round(soc, 2),
            'voltage':      round(float(row['avg_voltage']), 4),
            'timestamp':    str(row['timestamp']),
        })
    return records


def generate_charge_curve(cycle_row: pd.Series, num_points: int = 120) -> dict:
    """
    Synthesise charge and discharge curves for a single cycle.
    Uses CC-CV charging model and linear discharge approximation.
    """
    rng = np.random.default_rng(int(cycle_row['cycle_number']) * 7)

    cap    = float(cycle_row['capacity_charge'])
    v_max  = min(4.22, float(cycle_row['max_voltage']))
    v_min  = max(2.90, float(cycle_row['min_voltage']))
    i_nom  = abs(float(cycle_row['avg_current_charge']))
    t_chg  = float(cycle_row['charge_time_h'])
    t_dis  = float(cycle_row['discharge_time_h'])
    r_int  = float(cycle_row['internal_resistance']) / 1000.0  # Ohm

    t_c = np.linspace(0, t_chg, num_points)
    cc_end = int(num_points * 0.72)

    # CC phase: voltage rises from v_min toward v_max
    v_cc = np.linspace(v_min + 0.15, v_max - 0.04, cc_end) + rng.normal(0, 0.004, cc_end)
    i_cc = np.full(cc_end, i_nom) + rng.normal(0, 0.025, cc_end)

    # CV phase: voltage stays at v_max, current tapers
    cv_pts = num_points - cc_end
    v_cv = np.full(cv_pts, v_max) + rng.normal(0, 0.002, cv_pts)
    i_cv = i_nom * np.exp(-np.linspace(0, 3.5, cv_pts)) + rng.normal(0, 0.01, cv_pts)

    charge_v = np.concatenate([v_cc, v_cv])
    charge_i = np.concatenate([i_cc, i_cv])
    charge_soc = np.linspace(0, 100, num_points)

    # Discharge: linear voltage drop + slight curve, constant negative current
    t_d = np.linspace(0, t_dis, num_points)
    x   = np.linspace(0, 1, num_points)
    dis_v = v_max - 0.05 - (v_max - v_min - 0.15) * x**0.85 + rng.normal(0, 0.006, num_points)
    dis_i = -abs(float(cycle_row['avg_current_discharge'])) * np.ones(num_points) + rng.normal(0, 0.03, num_points)
    dis_soc = np.linspace(100, 0, num_points)

    def row_list(t_arr, v_arr, i_arr, s_arr):
        return [
            {'time': round(float(t), 4), 'voltage': round(float(v), 4),
             'current': round(float(i), 4), 'soc': round(float(s), 2)}
            for t, v, i, s in zip(t_arr, v_arr, i_arr, s_arr)
        ]

    return {
        'charge':    row_list(t_c, charge_v, charge_i, charge_soc),
        'discharge': row_list(t_d, dis_v,    dis_i,    dis_soc),
    }
