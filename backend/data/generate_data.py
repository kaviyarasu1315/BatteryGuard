"""
Synthetic Battery Dataset Generator
====================================
Generates realistic Li-ion battery cycle data for 5 battery units
over 500 charge/discharge cycles each.

Degradation model:
  - Capacity fade:       C(n) = C0 * (1 - alpha*(n/N)^beta) + noise
  - Internal resistance: R(n) = R0 * (1 + gamma*(n/N)^delta) + noise

Anomalies are injected at predetermined cycles to test detection.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os, sys

RANDOM_SEED = 42
NUM_BATTERIES = 5
NUM_CYCLES = 500
NOMINAL_CAPACITY_AH = 3.0          # Ah — typical 18650 cell pack
INITIAL_RESISTANCE_MOHM = 85.0     # mΩ
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "battery_cycles.csv")


def _degradation_capacity(cycle, total_cycles=NUM_CYCLES, c0=NOMINAL_CAPACITY_AH,
                           alpha=0.22, beta=0.85):
    """Exponential-power capacity fade model"""
    return c0 * (1.0 - alpha * (cycle / total_cycles) ** beta)


def _degradation_resistance(cycle, total_cycles=NUM_CYCLES, r0=INITIAL_RESISTANCE_MOHM,
                             gamma=0.70, delta=0.75):
    """Power-law internal resistance growth model"""
    return r0 * (1.0 + gamma * (cycle / total_cycles) ** delta)


def _voltage_from_soc(soc_pct):
    """Approximate OCV-SoC relationship for Li-NMC cell"""
    soc = np.clip(soc_pct / 100.0, 0, 1)
    # Piecewise linear approximation
    return 3.0 + 1.2 * soc - 0.4 * soc ** 2 + 0.1 * soc ** 3


def generate_data(seed=RANDOM_SEED):
    rng = np.random.default_rng(seed)
    records = []

    battery_configs = [
        {"id": "BAT-001", "health_init": 1.00, "temp_bias": 0.0,  "anomaly_cycles": [87, 213, 356]},
        {"id": "BAT-002", "health_init": 0.97, "temp_bias": 2.5,  "anomaly_cycles": [112, 278, 421]},
        {"id": "BAT-003", "health_init": 0.99, "temp_bias":-1.0,  "anomaly_cycles": [65, 190, 315, 480]},
        {"id": "BAT-004", "health_init": 0.95, "temp_bias": 4.0,  "anomaly_cycles": [145, 300, 445]},
        {"id": "BAT-005", "health_init": 1.00, "temp_bias":-0.5,  "anomaly_cycles": [55, 175, 390, 460]},
    ]

    base_time = datetime(2023, 1, 1, 0, 0, 0)

    for cfg in battery_configs:
        bat_id = cfg["id"]
        health_init = cfg["health_init"]
        temp_bias = cfg["temp_bias"]
        anomaly_cycles = set(cfg["anomaly_cycles"])
        # Accumulate time (each cycle ~ 2 hours charge + 1.5 hours discharge)
        t = base_time + timedelta(hours=int(rng.integers(0, 48)))

        for cycle in range(1, NUM_CYCLES + 1):
            is_anomaly = cycle in anomaly_cycles
            anomaly_type = None

            # Effective cycle considering initial health
            eff_cycle = cycle * health_init

            # Capacity
            cap_mean = _degradation_capacity(eff_cycle)
            cap_noise = rng.normal(0, 0.008)
            if is_anomaly and rng.random() < 0.6:
                anomaly_type = "capacity_drop"
                cap_noise -= rng.uniform(0.12, 0.20)
            capacity_discharge = max(0.5, cap_mean + cap_noise)
            capacity_charge = capacity_discharge * rng.uniform(1.005, 1.015)  # CE < 100%

            # Internal resistance
            r_mean = _degradation_resistance(eff_cycle)
            r_noise = rng.normal(0, 2.5)
            if is_anomaly and rng.random() < 0.5:
                anomaly_type = anomaly_type or "resistance_spike"
                r_noise += rng.uniform(15, 35)
            internal_resistance = max(50, r_mean + r_noise)

            # Voltage
            soc_avg = rng.uniform(45, 65)
            avg_voltage = _voltage_from_soc(soc_avg) + rng.normal(0, 0.01)
            if is_anomaly and rng.random() < 0.45:
                anomaly_type = anomaly_type or "voltage_anomaly"
                avg_voltage += rng.choice([-1, 1]) * rng.uniform(0.15, 0.35)
            max_voltage = min(4.22, avg_voltage + rng.uniform(0.35, 0.55))
            min_voltage = max(2.85, avg_voltage - rng.uniform(0.55, 0.75))

            # Current
            avg_current_charge = rng.uniform(1.3, 1.8)
            avg_current_discharge = -rng.uniform(1.2, 1.7)
            if is_anomaly and rng.random() < 0.35:
                anomaly_type = anomaly_type or "current_surge"
                avg_current_charge *= rng.uniform(1.8, 2.5)

            # Temperature
            base_temp = 25.0 + temp_bias
            temp_noise = rng.normal(0, 1.5)
            avg_temperature = base_temp + temp_noise + 0.015 * eff_cycle
            if is_anomaly and rng.random() < 0.7:
                anomaly_type = anomaly_type or "temperature_spike"
                avg_temperature += rng.uniform(15, 28)
            max_temperature = avg_temperature + rng.uniform(3, 8)
            min_temperature = avg_temperature - rng.uniform(2, 5)

            # Times
            charge_time_h = capacity_charge / avg_current_charge * rng.uniform(0.95, 1.10)
            discharge_time_h = abs(capacity_discharge / avg_current_discharge) * rng.uniform(0.95, 1.05)

            # Energy
            charge_energy = capacity_charge * avg_voltage
            discharge_energy = abs(capacity_discharge * avg_voltage)
            coulombic_efficiency = min(100, (capacity_discharge / capacity_charge) * 100)

            # Health score (0–100)
            health_score = (capacity_discharge / NOMINAL_CAPACITY_AH) * 100

            records.append({
                "battery_id":             bat_id,
                "cycle_number":           cycle,
                "timestamp":              t.strftime("%Y-%m-%dT%H:%M:%S"),
                "avg_voltage":            round(avg_voltage, 4),
                "max_voltage":            round(max_voltage, 4),
                "min_voltage":            round(min_voltage, 4),
                "avg_current_charge":     round(avg_current_charge, 4),
                "avg_current_discharge":  round(avg_current_discharge, 4),
                "avg_temperature":        round(avg_temperature, 3),
                "max_temperature":        round(max_temperature, 3),
                "min_temperature":        round(min_temperature, 3),
                "capacity_charge":        round(capacity_charge, 5),
                "capacity_discharge":     round(capacity_discharge, 5),
                "internal_resistance":    round(internal_resistance, 3),
                "charge_time_h":          round(charge_time_h, 4),
                "discharge_time_h":       round(discharge_time_h, 4),
                "charge_energy_wh":       round(charge_energy, 4),
                "discharge_energy_wh":    round(discharge_energy, 4),
                "coulombic_efficiency":   round(coulombic_efficiency, 3),
                "health_score":           round(health_score, 2),
                "is_anomaly":             is_anomaly,
                "anomaly_type":           anomaly_type or "",
            })

            # Advance time: charge + discharge + rest
            t += timedelta(hours=charge_time_h + discharge_time_h + rng.uniform(0.5, 2.0))

    df = pd.DataFrame(records)
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"[generate_data] Wrote {len(df)} rows -> {OUTPUT_PATH}")
    return df


if __name__ == "__main__":
    generate_data()
