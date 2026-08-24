# Battery Degradation Factors and Capacity Fade Mechanisms

## Overview

All lithium-ion batteries experience degradation over time, manifesting as capacity fade (reduced energy storage) and power fade (increased internal resistance). Understanding the root causes allows operators to minimize degradation through proper usage and maintenance.

## Primary Degradation Mechanisms

### 1. Solid Electrolyte Interphase (SEI) Growth

The SEI layer forms on the anode surface through electrolyte decomposition reactions. It is both necessary (protects the anode) and a cause of degradation:

- **Formation**: During first few cycles (formation cycling)
- **Growth**: Continues slowly over lifetime, especially at:
  - High temperatures (> 35°C)
  - High SoC (> 80%) during storage
  - High charging rates

**Impact**:
- Consumes lithium inventory permanently → capacity fade
- Increases ohmic resistance → power fade
- Contributes to 20–30% of total capacity loss in most applications

### 2. Lithium Plating

Occurs when lithium ions cannot intercalate into graphite and deposit as metallic lithium:

**Conditions that cause plating:**
- Low temperature charging (< 5°C)
- High charge rate (> 1C, especially on aged anodes)
- High SoC (> 90%)
- Overcharge events

**Impact**:
- Irreversible capacity loss
- Dendrite growth → potential separator puncture → internal short
- Can trigger thermal runaway

### 3. Cathode Structural Degradation

For NMC cathodes:
- **Phase transitions**: Layered → spinel/rock salt at particle surfaces
- **Particle cracking**: Due to volumetric expansion/contraction during cycling
- **Mn dissolution** (NMC): Manganese dissolves into electrolyte and deposits on anode

**Impact**:
- Loss of active cathode material → capacity fade
- Increased charge transfer resistance → power fade
- Accelerated by: deep discharge, high temperature, high voltage

### 4. Electrolyte Decomposition

Organic electrolyte (LiPF₆ in EC/DMC) decomposes:
- At elevated temperature: LiPF₆ → LiF + PF₅
- At high voltage: Oxidation of solvent at cathode surface
- Forms gaseous by-products → cell swelling

**Impact**:
- Ionic conductivity decrease → resistance increase
- Gas pressure buildup → mechanical stress on cell

### 5. Binder Degradation

PVDF binder on electrodes degrades over cycling:
- Electrode particles lose electrical contact
- Active material becomes electrically isolated

**Impact**:
- Capacity loss proportional to lost active material
- More pronounced at high C-rates and high temperature

## Degradation Rate Models

### Cycle-Dependent Capacity Fade
Empirical power-law model:
```
Q(n) = Q₀ × (1 - A × n^β)
```
Where:
- Q₀ = initial capacity (Ah)
- n = cycle number
- A = degradation coefficient (material/condition dependent)
- β = power exponent (typically 0.5–1.0)

### Calendar Aging (Arrhenius)
Temperature-dependent capacity loss during storage:
```
ΔQ_calendar = B × exp(-Eₐ/RT) × t^0.5
```
Where:
- B = pre-exponential factor
- Eₐ = activation energy (~0.3–0.6 eV)
- R = gas constant
- T = temperature (K)
- t = storage time (hours)

**Rule of thumb**: Every 10°C rise in storage temperature doubles the rate of calendar aging.

## State of Health (SoH) Indicators

| SoH Range | Status | Recommended Action |
|-----------|--------|-------------------|
| 100–90% | Excellent | Normal operation |
| 90–80% | Good | Continue with monitoring |
| 80–70% | Fair | Increase monitoring frequency |
| 70–60% | Poor | Plan for replacement |
| < 60% | Critical | Immediate replacement |

**Industry standard**: SoH = 80% is the standard end-of-life criterion for EV batteries.

## Depth of Discharge (DoD) Impact

Shallower discharge cycles dramatically extend cycle life:

| DoD | Approximate Cycles to 80% SoH |
|-----|-------------------------------|
| 100% | 300–500 |
| 80% | 600–1,000 |
| 50% | 1,500–2,500 |
| 30% | 4,000–7,000 |
| 10% | 15,000–30,000 |

## Internal Resistance Growth

Internal resistance (IR) growth is a reliable degradation indicator:
- Fresh cell: 50–100 mΩ
- End-of-life (80% SoH): typically 150–300 mΩ
- Power fade is proportional to IR increase: P_max = V²/(4R)

**Growth drivers** (in order of impact):
1. SEI layer thickening (dominant)
2. Lithium plating
3. Electrolyte depletion
4. Binder degradation and particle isolation
5. Current collector corrosion (long-term)

## Detecting Early Degradation Signals

### Voltage-Based Indicators
- Increasing voltage sag during high-power pulses
- Flatter discharge curve (loss of capacity from cathode)
- Irregular voltage plateau positions

### Thermal Indicators
- Higher internal heat generation per Ah (Q = I²×R×t)
- Temperature differential increasing between cells in a pack
- Core temperature exceeding surface temperature by > 5°C

### Capacity-Based Indicators
- Decreasing Ah delivered at same discharge cutoff voltage
- Shortening charge time (fewer Ah needed to reach CV phase)
- Increasing charge-to-discharge capacity ratio (Coulombic efficiency < 99.9%)

## Recommendations to Minimize Degradation

1. **Keep SoC between 20–80%** for daily operation
2. **Avoid temperatures above 35°C** during charging
3. **Never charge at temperatures below 5°C**
4. **Limit fast charging** to emergency situations
5. **Monitor IR growth** — >2× initial IR indicates significant aging
6. **Balance cells** in multi-cell packs monthly
7. **Perform full calibration cycles** (0–100%) monthly to recalibrate SoC estimation
8. **Store at 50% SoC** if battery will be unused for > 1 month
