"""
Data Loader Service
===================
Loads and caches the battery cycle dataset.
Auto-generates data if CSV does not exist.
"""
import os
import sys
import pandas as pd
import numpy as np

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'battery_cycles.csv')

_df_cache: pd.DataFrame | None = None


def _ensure_data():
    """Generate data if CSV does not exist."""
    if not os.path.exists(DATA_PATH):
        print("[data_loader] CSV not found — generating synthetic data...")
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        from data.generate_data import generate_data
        generate_data()


def load_data(force_reload: bool = False) -> pd.DataFrame:
    """Load dataset (cached after first call)."""
    global _df_cache
    if _df_cache is None or force_reload:
        _ensure_data()
        _df_cache = pd.read_csv(DATA_PATH, parse_dates=['timestamp'])
    return _df_cache


def get_batteries() -> list[dict]:
    """Return summary info for all battery IDs."""
    df = load_data()
    result = []
    for bat_id in sorted(df['battery_id'].unique()):
        bat = df[df['battery_id'] == bat_id]
        last = bat.iloc[-1]
        result.append({
            'id': bat_id,
            'cycle_count': int(last['cycle_number']),
            'health_score': round(float(last['health_score']), 2),
            'capacity': round(float(last['capacity_discharge']), 4),
            'internal_resistance': round(float(last['internal_resistance']), 2),
            'avg_temperature': round(float(last['avg_temperature']), 2),
            'last_updated': str(last['timestamp']),
        })
    return result


def get_battery_df(battery_id: str) -> pd.DataFrame:
    """Return all rows for a specific battery, sorted by cycle."""
    df = load_data()
    bat = df[df['battery_id'] == battery_id].copy()
    if bat.empty:
        raise ValueError(f"Battery '{battery_id}' not found.")
    return bat.sort_values('cycle_number').reset_index(drop=True)


def get_latest_cycle(battery_id: str) -> pd.Series:
    """Return the most recent cycle row for a battery."""
    return get_battery_df(battery_id).iloc[-1]


def get_cycle_row(battery_id: str, cycle_number: int) -> pd.Series:
    """Return a specific cycle row."""
    bat = get_battery_df(battery_id)
    row = bat[bat['cycle_number'] == cycle_number]
    if row.empty:
        raise ValueError(f"Cycle {cycle_number} not found for battery '{battery_id}'.")
    return row.iloc[0]
