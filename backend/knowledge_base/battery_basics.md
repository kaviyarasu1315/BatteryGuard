# Lithium-Ion Battery Fundamentals

## Overview

Lithium-ion (Li-ion) batteries are electrochemical energy storage devices that operate through the reversible intercalation of lithium ions between two electrode materials. They are the dominant energy storage technology for portable electronics, electric vehicles, and grid-scale applications due to their high energy density, low self-discharge, and long cycle life.

## Electrochemical Principles

### Cell Components

| Component | Material (NMC) | Function |
|-----------|---------------|----------|
| Cathode | LiNi₀.₅Mn₀.₃Co₀.₂O₂ | Li-ion source/sink, electron acceptor |
| Anode | Graphite (LiC₆) | Li-ion host during charging |
| Electrolyte | LiPF₆ in organic solvent | Ion transport medium |
| Separator | Polyolefin membrane | Electrical isolation, ion permeable |
| Current collectors | Al (cathode), Cu (anode) | Electron conduction |

### Charge/Discharge Reactions

**During Charging:**
- Cathode: LiNMCO₂ → Li₁₋ₓNMCO₂ + x Li⁺ + x e⁻
- Anode: C + x Li⁺ + x e⁻ → LiₓC

**During Discharging (reverse):**
- Anode supplies Li⁺ ions through the electrolyte to the cathode
- Electrons flow through the external circuit, producing usable electrical work

## Key Performance Parameters

### Voltage
- **Nominal voltage**: 3.6–3.7 V (NMC chemistry)
- **Charge cutoff**: 4.20 V (upper voltage limit)
- **Discharge cutoff**: 2.75–3.00 V (lower voltage limit)
- Operating outside these limits accelerates degradation

### Capacity
- Measured in Ampere-hours (Ah) or milliampere-hours (mAh)
- **Nominal capacity**: Rated capacity at standard conditions (25°C, C/5 rate)
- **State of Charge (SoC)**: Remaining capacity as % of current maximum
- **State of Health (SoH)**: Current maximum capacity as % of rated capacity

### C-Rate
The C-rate describes charge/discharge current relative to capacity:
- **1C**: Full charge/discharge in 1 hour
- **C/2 (0.5C)**: Full charge/discharge in 2 hours
- **2C**: Full charge/discharge in 30 minutes
- Higher C-rates produce more heat and cause faster degradation

### Internal Resistance
- Comprises electrolyte resistance, charge-transfer resistance, and diffusion impedance
- Fresh cell: 50–100 mΩ (typical 18650)
- Increases with aging; directly impacts power capability and heat generation
- Measured via Electrochemical Impedance Spectroscopy (EIS) or DC pulse method

## State of Charge (SoC) Estimation Methods

### Open Circuit Voltage (OCV) Method
Uses the established relationship between resting voltage and SoC. Requires the battery to be at rest (no current) for accurate readings. Best for initial calibration.

**Typical OCV-SoC curve (NMC):**
| SoC (%) | OCV (V) |
|---------|---------|
| 100 | 4.20 |
| 90 | 4.10 |
| 80 | 4.00 |
| 70 | 3.90 |
| 60 | 3.80 |
| 50 | 3.70 |
| 40 | 3.60 |
| 30 | 3.50 |
| 20 | 3.40 |
| 10 | 3.30 |
| 0 | 3.00 |

### Coulomb Counting
Integrates current over time to track charge flow:
```
SoC(t) = SoC(t₀) + (1/Q_nominal) × ∫I(t)dt
```
Requires an accurate initial SoC and suffers from drift over time due to sensor noise and Coulombic efficiency losses.

### Extended Kalman Filter (EKF)
Combines OCV and Coulomb counting with a battery equivalent circuit model. Most accurate method for real-time BMS applications.

## Battery Equivalent Circuit Model

The Thevenin equivalent circuit model:
```
V_terminal = OCV - I·R₀ - I·R₁·(1 - e^(-t/τ₁))
```
Where:
- R₀ = ohmic resistance
- R₁ = polarization resistance
- τ₁ = RC time constant
- OCV = open-circuit voltage

## Cycle Life and Calendar Life

- **Cycle life**: Number of complete charge/discharge cycles before capacity drops to 80% of rated
  - NMC: 500–2000 cycles depending on depth of discharge
  - LFP: 2000–6000 cycles
- **Calendar life**: Degradation due to time even without cycling; typically 10–20 years at 25°C

## Safety Considerations

### Thermal Runaway
Triggered by:
- Overcharge (voltage > 4.3V)
- Over-temperature (> 60°C)
- Internal short circuit
- Physical damage (puncture, crush)

### Safe Operating Area (SOA)
All battery systems should operate within:
- Voltage: 2.75 V – 4.20 V
- Temperature: -20°C to +60°C (charge: 0°C to +45°C)
- Current: ≤ 2C for most applications
