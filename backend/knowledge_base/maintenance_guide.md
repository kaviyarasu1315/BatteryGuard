# Battery Preventive Maintenance Guide

## Purpose

This guide provides systematic procedures for maintaining lithium-ion battery systems in optimal operating condition. Regular preventive maintenance extends battery life by 30–100%, prevents unexpected failures, and ensures safety compliance.

## Maintenance Schedule Overview

| Frequency | Task Category |
|-----------|--------------|
| Daily | Visual inspection, SoC check, temperature monitoring |
| Weekly | Performance log review, anomaly check |
| Monthly | Capacity test, balancing verification, connection inspection |
| Quarterly | Full diagnostic, impedance spectroscopy, physical inspection |
| Annually | Complete system audit, replacement decision review |

---

## Daily Maintenance Tasks

### 1. Visual Inspection (2 minutes)
- [ ] Check for physical swelling or deformation of cells/modules
- [ ] Inspect for electrolyte leakage (yellowish liquid, chemical odor)
- [ ] Verify indicator lights/display show normal status
- [ ] Check ventilation is unobstructed

**Warning signs requiring immediate action:**
- Cell swelling or bulging > 2mm
- Chemical odor or visible electrolyte
- Smoke, sparks, or unusual heat
- BMS alarm or error codes

### 2. SoC Monitoring
- Record start-of-day and end-of-day SoC
- Verify SoC is within preferred operating range (20–80%)
- Alert if SoC drops below 15% unexpectedly

### 3. Temperature Check
- Verify operating temperature is within 15–35°C
- Record peak temperature during highest-demand period
- Flag any reading above 40°C for investigation

---

## Weekly Maintenance Tasks

### 1. Performance Log Review
Review trends over the past week:
- Average SoC utilization range
- Peak temperatures recorded
- Number of charge cycles completed
- Any anomalies flagged by BMS

### 2. Anomaly Investigation
For each flagged anomaly:
1. Identify the cycle and timestamp
2. Review context: temperature, load, ambient conditions
3. Classify: isolated incident vs. recurring pattern
4. Document findings in maintenance log

### 3. Charging Behavior Check
- Verify charging terminates correctly at target voltage
- Check charge time vs. expected (significant deviation = degradation indicator)
- Confirm CV phase tapering is normal (smooth current reduction)

---

## Monthly Maintenance Tasks

### 1. Capacity Test (Reference Performance Test)
Procedure:
1. Fully charge battery using standard CC-CV protocol
2. Rest for 1 hour at ambient temperature (25 ± 2°C)
3. Discharge at C/5 rate to discharge cutoff voltage
4. Measure total Ah delivered
5. Calculate SoH = (Measured Ah / Nominal Ah) × 100%
6. Record and compare with previous months

**Interpretation:**
| Month-over-Month Change | Action |
|------------------------|--------|
| < 0.5% drop | Normal aging |
| 0.5–2% drop | Monitor closely |
| > 2% drop | Investigate root cause |
| > 5% drop | Immediate assessment required |

### 2. Cell Balancing Verification
For multi-cell packs:
1. Fully charge pack
2. Measure individual cell voltages
3. Calculate maximum voltage difference between cells

**Limits:**
- < 10 mV: Excellent balance
- 10–30 mV: Acceptable, passive balancing will compensate
- 30–100 mV: Manual or active balancing required
- > 100 mV: Investigate weak cells; may need replacement

### 3. Connection and Contact Inspection
- Torque-check terminal bolts (per specification, typically 3–5 N·m)
- Check for corrosion on terminals (white/green powder)
- Inspect cable insulation for cracks or heat damage
- Clean contacts with isopropyl alcohol if contaminated

### 4. Cooling System Check
- Verify coolant flow rate (liquid-cooled systems)
- Check coolant level and pH (should be 7–9 for glycol systems)
- Inspect air filters (air-cooled systems) — clean or replace if clogged
- Verify fan operation at all speed settings

---

## Quarterly Maintenance Tasks

### 1. Electrochemical Impedance Spectroscopy (EIS) / DC Pulse Test
- Measure internal resistance at multiple frequencies
- Compare with baseline measurements from commissioning
- Document resistance growth rate

**Internal Resistance Growth Interpretation:**
| Increase from Baseline | Meaning |
|-----------------------|---------|
| < 20% | Normal aging |
| 20–50% | Moderate degradation |
| 50–100% | Significant degradation; plan replacement |
| > 100% | Cell approaching end of life |

### 2. Thermal Imaging Inspection
Using an IR camera:
- Scan all cells/modules during moderate load (0.5C discharge)
- Identify hot spots (> 5°C above neighboring cells)
- Document and trend hot spot locations

Hot spots indicate:
- High internal resistance cells
- Poor electrical connections
- Blocked cooling channels

### 3. Safety System Test
- Test Battery Management System (BMS) protection functions:
  - Overvoltage protection (trigger at 4.25V/cell, verify cutoff)
  - Undervoltage protection (trigger at 2.75V/cell, verify cutoff)
  - Overcurrent protection (simulate 3C current, verify cutoff)
  - Over-temperature protection (verify at 55°C cutoff)
- Test emergency disconnect function
- Verify alarm outputs are functioning

### 4. Physical Integrity Inspection
- Inspect module casings for cracks or deformation
- Check mounting hardware for looseness
- Inspect cable routing for chafing or pinching
- Verify moisture seals are intact

---

## Annual Maintenance Tasks

### 1. Full System Audit
- Complete capacity test (see Monthly, item 1)
- Complete EIS measurement at 1 kHz, 100 Hz, 10 Hz, 1 Hz, 0.1 Hz
- Generate degradation trend report
- Compare actual vs. predicted aging based on usage history

### 2. Replacement Decision Framework
Evaluate replacement based on:

**Replace immediately if:**
- SoH < 60%
- Internal resistance > 3× initial value
- Any cell shows voltage < 2.5V after full charge attempt
- Physical damage (swelling, leakage, cracks)
- Safety system failure

**Plan replacement within 6 months if:**
- SoH between 60–70%
- Internal resistance 2–3× initial value
- Cell imbalance > 100 mV despite balancing
- Recurring anomalies (> 3 critical anomalies in last 6 months)

**Continue with enhanced monitoring if:**
- SoH between 70–80%
- Degradation rate accelerating (> 1% per month)

### 3. Software and Firmware Updates
- Update BMS firmware to latest version
- Review and update alert thresholds based on current cell condition
- Back up all configuration parameters before updates
- Document all changes in system log

---

## Maintenance Record Keeping

All maintenance activities must be logged with:
- Date and time
- Battery ID and cycle count
- Technician name
- Measurements taken
- Findings and observations
- Actions taken
- Next scheduled maintenance date

**Data to retain for trend analysis:**
- Monthly capacity measurements
- Quarterly IR measurements
- Anomaly events log
- Temperature extremes log
- Charge cycle count

---

## Emergency Procedures

### Thermal Runaway Response
1. **Do not touch** — lithium fires are extremely hazardous
2. Activate fire suppression system (if installed)
3. Evacuate area immediately
4. Call emergency services
5. Use Class D extinguisher or copious water (NOT CO₂ or standard dry chemical)
6. Do not inhale fumes — toxic gases (HF, CO) are released

### Electrolyte Leak Response
1. Evacuate area (toxic vapors)
2. Wear PPE: nitrile gloves, safety glasses, respirator
3. Neutralize with baking soda solution
4. Clean with absorbent materials
5. Dispose as hazardous waste per local regulations

### Deep Discharge Recovery
If battery has discharged below minimum voltage:
1. Do not fast-charge — use trickle current (C/20) for first 30 min
2. Monitor temperature closely during recovery
3. If voltage does not rise to > 3.0V within 30 min, cell is likely damaged
4. Perform capacity test after recovery to assess damage
5. Replace if capacity < 70% of nominal
