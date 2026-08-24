# Temperature Effects on Lithium-Ion Battery Performance and Longevity

## Introduction

Temperature is the single most influential external factor affecting lithium-ion battery performance, safety, and longevity. Both high and low temperature extremes create distinct problems, making thermal management a critical discipline in battery system design and operation.

## Temperature Effects on Electrochemical Performance

### Ion Transport and Conductivity

Electrolyte ionic conductivity follows an Arrhenius relationship with temperature:
```
σ(T) = σ₀ × exp(-Eₐ / kT)
```

| Temperature | Relative Ionic Conductivity | Relative Power Output |
|-------------|----------------------------|----------------------|
| -20°C | ~15% | ~10–20% |
| 0°C | ~50% | ~60–70% |
| 25°C | 100% (reference) | 100% |
| 45°C | ~130% | ~110% |
| 60°C | ~150% | ~115% (unsafe) |

**Key insight**: Cold temperatures severely limit power output even though the battery's energy content (capacity) is mostly preserved at rest. The energy is "locked" due to slow ion diffusion.

### Diffusion Kinetics

Lithium-ion solid-state diffusion coefficients in electrode materials:
- Decrease ~2–3× for every 10°C drop
- At -10°C, diffusion is ~10× slower than at 25°C
- Slow diffusion → concentration gradients → voltage polarization → premature cutoff

## High Temperature Effects (> 35°C)

### Performance Impact
- Short-term performance improvement (faster kinetics)
- Increased self-discharge rate (~2× per 10°C)
- Reduced viscosity → better rate capability

### Degradation Impact (Dominant Concern)

**SEI Layer Acceleration:**
- Each 10°C increase roughly doubles the SEI growth rate
- Results in accelerated lithium inventory loss and resistance increase

**Electrolyte Decomposition:**
- LiPF₆ hydrolysis accelerates above 40°C
- Produces HF which attacks cathode particles
- Gas generation (CO₂, H₂) causes cell swelling

**Cathode Dissolution:**
- Mn dissolution from NMC/LMO cathodes
- Dissolved ions deposit on anode, blocking lithium sites

**Quantitative Example:**
A battery stored at 40°C ages approximately **4× faster** than one stored at 20°C in calendar life tests.

### Thermal Runaway Risk Zones

| Temperature | Risk Level | Effect |
|-------------|-----------|--------|
| < 45°C | Low | Normal aging acceleration |
| 45–60°C | Moderate | Rapid degradation, SEI breakdown |
| 60–80°C | High | Electrolyte decomposition, gassing |
| 80–120°C | Very High | SEI exothermic decomposition |
| > 120°C | Critical | Possible thermal runaway initiation |
| > 150°C | Extreme | Separator melting, uncontrolled reaction |

**Thermal runaway** is a self-sustaining exothermic reaction. Once initiated:
1. Separator melts → internal short circuit
2. Cathode releases oxygen → fuel for reaction
3. Temperature spikes to 400–900°C
4. Cell venting, fire, or explosion possible

## Low Temperature Effects (< 10°C)

### Performance Impact
- Significant capacity reduction (can lose 20–40% at 0°C)
- Increased internal resistance → poor power delivery
- Voltage sag more pronounced → premature shutoff by protection circuits

### Degradation Impact

**Lithium Plating (Most Dangerous):**
- When charging at low temperatures, Li⁺ cannot intercalate fast enough
- Metallic lithium deposits on anode surface as dendrites
- Dendrites grow with each charge cycle → risk of separator puncture

**Guidelines to prevent cold-temperature plating:**
- Never charge below 0°C
- Reduce charge rate by 50% for every 5°C below 15°C
- Pre-heat battery to > 10°C before charging

**Electrolyte Freezing:**
- Standard electrolytes freeze below -30°C
- Frozen electrolyte = zero ion transport = no operation

## Optimal Operating Temperature Ranges

| Application | Recommended Range | Absolute Limits |
|-------------|-------------------|----------------|
| Charging | 10°C – 35°C | 0°C – 45°C |
| Discharging | -10°C – 45°C | -20°C – 60°C |
| Storage (short-term) | 15°C – 25°C | -20°C – 45°C |
| Storage (long-term) | 15°C – 20°C at 50% SoC | -10°C – 30°C |

## Thermal Management System (TMS) Design Principles

### Passive Cooling
- Heat spreaders (aluminum, copper)
- Phase-change materials (PCM)
- Thermal insulation for cold climates

### Active Cooling Methods

**Air Cooling:**
- Cost-effective, simple
- Thermal uniformity challenges in large packs
- Adequate for low-power applications (< 1C average)

**Liquid Cooling:**
- Much better heat transfer coefficient (water: 4× air)
- Used in EVs (Tesla, GM Bolt) and grid storage
- Requires pump, coolant circuit, sealing

**Direct Refrigerant Cooling:**
- Highest performance
- Complex and expensive
- Used in high-performance racing or extreme environments

### Temperature Uniformity Requirements
Cell-to-cell temperature variation in a pack should be:
- **< 3°C**: Ideal (balanced aging)
- **3–5°C**: Acceptable
- **> 5°C**: Warning — significant cell imbalance and uneven aging expected
- **> 10°C**: Critical — operational hazard

## Monitoring and Alerting Guidelines

### Sensor Placement
- Minimum 1 temperature sensor per 10 cells
- Place sensors at: hottest predicted location, coldest location, center of pack
- Use NTC thermistors or thermocouples with < 0.5°C accuracy

### Alert Thresholds

| Alert Level | Temperature Condition | Recommended Response |
|-------------|----------------------|----------------------|
| Info | > 35°C during charge | Log event, monitor |
| Warning | > 40°C any operation | Reduce C-rate by 50% |
| Warning | < 5°C during charge | Pause charging, pre-heat |
| Critical | > 50°C any operation | Suspend all operations |
| Emergency | > 60°C | Disconnect, initiate cooling |
| Shutdown | > 70°C | Emergency disconnect |

## Seasonal and Environmental Considerations

**Summer (Hot Climate):**
- Park in shade; do not leave battery systems in hot vehicles
- Pre-cool system before high-power operation
- Schedule charging during cooler hours (night/morning)

**Winter (Cold Climate):**
- Allow battery to warm to operating temperature before discharge
- Do not fast-charge cold batteries
- Use insulation or active pre-heating
- Expect 20–30% reduced range/capacity in EVs at -10°C

**Humidity:**
- High humidity accelerates corrosion of electrical connections
- Maintain dry environment for battery storage areas
- Inspect seals and gaskets quarterly in humid environments
