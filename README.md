<div align="center">

<img src="https://img.shields.io/badge/BatteryGuard-AI%20Health%20Assistant-22c55e?style=for-the-badge&logo=bolt&logoColor=white"/>

# âš¡ BatteryGuard
### AI Battery Health Analysis Assistant

**EEE Capstone Project Â· Agentic AI + RAG Â· Intermediate Level**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-LLaMA%203.1%2070B-76B900?style=flat-square&logo=nvidia)](https://build.nvidia.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5.5-FF6B35?style=flat-square)](https://www.trychroma.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> An AI-powered full-stack platform that analyzes battery voltage, current, temperature, and charge cycles to assess battery condition, detect abnormal behavior, and generate grounded maintenance recommendations using Retrieval-Augmented Generation (RAG).

**Author:** Kaviyarasu C  
**Stream:** Electrical & Electronics Engineering (EEE)  
**Type:** AI Training Capstone Project (#11)

[Live Demo](#-deployment) Â· [API Docs](#-api-reference) Â· [Setup Guide](#-local-development)

</div>

---

## ðŸ“‹ Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [AI Pipeline](#-ai-pipeline)
- [API Reference](#-api-reference)
- [Local Development](#-local-development)
- [Deployment](#-deployment)
  - [Backend â†’ Render](#backend--render)
  - [Frontend â†’ Vercel](#frontend--vercel)
- [Environment Variables](#-environment-variables)
- [Dataset](#-dataset)
- [Knowledge Base](#-knowledge-base)
- [Screenshots](#-screenshots)

---

## ðŸŽ¯ Project Overview

BatteryGuard is a capstone-grade, full-stack AI application built for the **Electrical & Electronics Engineering** stream. It implements the **Agentic AI + RAG** paradigm to provide intelligent battery health monitoring.

The platform ingests historical battery cycle data (voltage, current, temperature, capacity, internal resistance, coulombic efficiency) for multiple battery units, applies statistical anomaly detection algorithms, computes State-of-Charge (SoC) estimates via OCV lookup tables and Coulomb counting, and then leverages a **Retrieval-Augmented Generation (RAG)** pipeline â€” backed by **NVIDIA NIM** (`meta/llama-3.1-70b-instruct` + `nvidia/nv-embedqa-e5-v5`) and **ChromaDB** â€” to generate grounded, citation-backed maintenance recommendations.

### Expected Outcome
> Students develop an AI-powered battery analysis platform capable of assessing battery condition from historical datasets.

---

## âœ¨ Key Features

| Feature | Description |
|---|---|
| ðŸ”‹ **Battery Dashboard** | Real-time overview of 5 battery units (BAT-001 â†’ BAT-005) with health scores, SoC, cycle counts, and status labels |
| ðŸ“ˆ **Charge/Discharge Curves** | Synthesised CC-CV charge and discharge curves per cycle using realistic electrochemical models |
| âš¡ **SoC Estimation** | OCV-based lookup (NMC cell table) + Coulomb counting with configurable coulombic efficiency |
| ðŸ“‰ **Health Trend Analysis** | Capacity fade, internal resistance growth, and health score evolution over 500 cycles |
| ðŸš¨ **Anomaly Detection** | 6-mode statistical detector: voltage Z-score, overvoltage/undervoltage threshold, temperature spike, current surge, sudden capacity drop, resistance spike |
| ðŸ§  **RAG Knowledge Base** | 5 expert markdown documents (battery basics, charging, degradation, maintenance, temperature effects) embedded via NVIDIA NIM `nv-embedqa-e5-v5` and stored in ChromaDB |
| ðŸ¤– **AI Recommendations** | Full RAG + LLM pipeline using `meta/llama-3.1-70b-instruct` to generate grounded, source-cited maintenance advice |
| ðŸ’¬ **AI Assistant** | Interactive chat interface with battery context injection and knowledge base retrieval per query |

---

## ðŸ— System Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     BatteryGuard Platform                    â”‚
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚   React Frontend (Vite)  â”‚   â”‚   Flask Backend API    â”‚  â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚
â”‚  â”‚  â”‚ Overview Dashboard  â”‚  â”‚   â”‚  â”‚  /api/batteries  â”‚  â”‚  â”‚
â”‚  â”‚  â”‚ Charge Curve Charts â”‚â—„â”€â”¼â”€â”€â”€â”¼â”€â–ºâ”‚  /api/battery/*  â”‚  â”‚  â”‚
â”‚  â”‚  â”‚ Anomaly Timeline    â”‚  â”‚   â”‚  â”‚  /api/recommend  â”‚  â”‚  â”‚
â”‚  â”‚  â”‚ AI Assistant Chat   â”‚  â”‚   â”‚  â”‚  /api/anomalies  â”‚  â”‚  â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚
â”‚           Tailwind CSS           â”‚  â”‚  Analysis Engine â”‚  â”‚  â”‚
â”‚           Recharts               â”‚  â”‚  â€¢ SoC Estimator â”‚  â”‚  â”‚
â”‚           Framer Motion          â”‚  â”‚  â€¢ Anomaly Detectâ”‚  â”‚  â”‚
â”‚           Lucide Icons           â”‚  â”‚  â€¢ Data Loader   â”‚  â”‚  â”‚
â”‚                                 â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚
â”‚                                 â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚
â”‚                                 â”‚  â”‚   RAG Pipeline   â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”‚  ChromaDB  â”‚  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”‚ (Vectors)  â”‚  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚        â”‚          â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”‚ NVIDIA NIM â”‚  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”‚ Embeddings â”‚  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”‚ nv-embedqa â”‚  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚        â”‚          â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”‚ LLaMA 3.1  â”‚  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â”‚  70B NIM   â”‚  â”‚  â”‚  â”‚
â”‚                                 â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚  â”‚
â”‚                                 â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚
â”‚                                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Data Flow â€” AI Recommendation Pipeline

```
User Query
    â”‚
    â–¼
[Battery Telemetry]      [Anomaly Detection]
  latest cycle stats   â†  Z-score + threshold
    â”‚                        rules (6 types)
    â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
    â”‚                            â”‚
    â–¼                            â–¼
[RAG Query Builder]  â†  enriched query string
    â”‚
    â–¼
[NVIDIA NIM Embedding]  â”€â”€â”€ nv-embedqa-e5-v5
    â”‚                         (query input_type)
    â–¼
[ChromaDB Vector Search]  â”€â”€â”€ cosine similarity
    â”‚                         top-5 chunks
    â–¼
[LLaMA 3.1 70B NIM]  â†  battery data + anomalies
    â”‚                     + retrieved KB context
    â–¼
[Grounded Recommendation]
  â€¢ Cites specific KB sources
  â€¢ References actual measured values
  â€¢ Structured: Assessment â†’ Findings â†’ Actions â†’ Monitoring
```

---

## ðŸ›  Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| Vite | 5.4.2 | Build tool & dev server |
| Tailwind CSS | 3.4.10 | Utility-first styling |
| Recharts | 2.12.7 | Interactive charts |
| Framer Motion | 11.3.21 | Animations & transitions |
| Lucide React | 0.438.0 | Icon library |
| Axios | 1.7.4 | HTTP client |
| React Markdown | 9.0.1 | AI response rendering |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| Flask | 3.0.3 | REST API framework |
| Flask-CORS | 4.0.1 | Cross-origin resource sharing |
| OpenAI SDK | 1.40.0 | NVIDIA NIM API client |
| ChromaDB | 0.5.5 | Vector database (RAG) |
| Pandas | Latest | Data manipulation |
| NumPy | Latest | Numerical computation |
| SciPy | Latest | OCV-SoC interpolation |
| Gunicorn | 22.0.0 | Production WSGI server |
| python-dotenv | 1.0.1 | Environment management |

### AI / ML
| Component | Model / Tool |
|---|---|
| LLM Generation | `meta/llama-3.1-70b-instruct` via NVIDIA NIM |
| Text Embeddings | `nvidia/nv-embedqa-e5-v5` via NVIDIA NIM |
| Vector Store | ChromaDB (persistent, cosine similarity) |
| SoC Estimation | OCV lookup table (NMC cell) + Coulomb counting |
| Anomaly Detection | Z-score (Ïƒ=2/3) + absolute threshold rules |

---

## ðŸ“ Project Structure

```
Battery IQ/
â”‚
â”œâ”€â”€ .env.example                    # Environment variable template
â”œâ”€â”€ .gitignore
â”œâ”€â”€ README.md
â”‚
â”œâ”€â”€ backend/                        # Python Flask API
â”‚   â”œâ”€â”€ app.py                      # Flask entry point, blueprint registration
â”‚   â”œâ”€â”€ requirements.txt            # Python dependencies
â”‚   â”œâ”€â”€ .env                        # âš ï¸ Local secrets (not committed)
â”‚   â”‚
â”‚   â”œâ”€â”€ data/
â”‚   â”‚   â”œâ”€â”€ battery_cycles.csv      # Synthetic dataset (5 batteries Ã— 500 cycles)
â”‚   â”‚   â””â”€â”€ generate_data.py        # Dataset generation script
â”‚   â”‚
â”‚   â”œâ”€â”€ knowledge_base/             # RAG document corpus
â”‚   â”‚   â”œâ”€â”€ battery_basics.md       # Li-ion cell fundamentals
â”‚   â”‚   â”œâ”€â”€ charging_best_practices.md
â”‚   â”‚   â”œâ”€â”€ degradation_factors.md
â”‚   â”‚   â”œâ”€â”€ maintenance_guide.md
â”‚   â”‚   â””â”€â”€ temperature_effects.md
â”‚   â”‚
â”‚   â”œâ”€â”€ services/                   # Business logic layer
â”‚   â”‚   â”œâ”€â”€ data_loader.py          # CSV loader & battery aggregation
â”‚   â”‚   â”œâ”€â”€ soc_estimator.py        # OCV lookup + Coulomb counting + curve gen
â”‚   â”‚   â”œâ”€â”€ anomaly_detector.py     # 6-mode statistical anomaly detection
â”‚   â”‚   â”œâ”€â”€ embeddings.py           # NVIDIA NIM nv-embedqa-e5-v5 wrapper
â”‚   â”‚   â”œâ”€â”€ rag_service.py          # ChromaDB ingest + cosine retrieval
â”‚   â”‚   â””â”€â”€ llm_service.py          # LLaMA 3.1 70B generation + prompt builder
â”‚   â”‚
â”‚   â””â”€â”€ routes/                     # Flask Blueprints
â”‚       â”œâ”€â”€ battery.py              # /api/batteries, /api/battery/<id>/*
â”‚       â”œâ”€â”€ analysis.py             # /api/battery/<id>/analysis
â”‚       â”œâ”€â”€ anomaly.py              # /api/battery/<id>/anomalies
â”‚       â””â”€â”€ rag.py                  # /api/recommend, /api/ingest-knowledge
â”‚
â””â”€â”€ frontend/                       # React + Vite application
    â”œâ”€â”€ index.html
    â”œâ”€â”€ vite.config.js              # Vite config + /api proxy
    â”œâ”€â”€ tailwind.config.js
    â”œâ”€â”€ postcss.config.js
    â”œâ”€â”€ package.json
    â”‚
    â””â”€â”€ src/
        â”œâ”€â”€ main.jsx                # React DOM entry
        â”œâ”€â”€ App.jsx                 # Root layout, tab navigation, battery selector
        â”œâ”€â”€ index.css               # Global styles + Tailwind directives
        â”‚
        â”œâ”€â”€ api/
        â”‚   â””â”€â”€ client.js           # Axios instance + all API call functions
        â”‚
        â”œâ”€â”€ components/
        â”‚   â”œâ”€â”€ Sidebar.jsx         # Battery list panel with health indicators
        â”‚   â”œâ”€â”€ BatteryCard.jsx     # Individual battery status card
        â”‚   â””â”€â”€ charts/
        â”‚       â”œâ”€â”€ AnomalyChart.jsx        # Timeline scatter chart
        â”‚       â”œâ”€â”€ CapacityFadeChart.jsx   # Area + line fade trend
        â”‚       â”œâ”€â”€ ChargeCurveChart.jsx    # CC-CV charge/discharge curves
        â”‚       â”œâ”€â”€ InternalResistanceChart.jsx
        â”‚       â””â”€â”€ SoCGauge.jsx            # Radial SoC gauge
        â”‚
        â””â”€â”€ pages/
            â”œâ”€â”€ Overview.jsx        # KPI cards + health summary
            â”œâ”€â”€ Analysis.jsx        # Charge curves + capacity fade + SoC
            â”œâ”€â”€ Anomalies.jsx       # Full anomaly log with filters
            â””â”€â”€ Assistant.jsx       # AI chat + RAG recommendations
```

---

## ðŸ¤– AI Pipeline

### 1. Knowledge Base Ingestion (one-time)

```
POST /api/ingest-knowledge
```

1. Reads all 5 markdown files from `backend/knowledge_base/`
2. Chunks each document (800 chars, 150-char overlap)
3. Embeds chunks via **NVIDIA NIM** `nv-embedqa-e5-v5` (`passage` input type)
4. Stores vectors + metadata in **ChromaDB** (cosine similarity index)

### 2. SoC Estimation

Two methods implemented in `soc_estimator.py`:

- **OCV Method** â€” Maps average cycle voltage to SoC% using a calibrated NMC OCV-SoC lookup table (3.00Vâ†’0% to 4.20Vâ†’100%), interpolated with SciPy.
- **Coulomb Counting** â€” Integrates current over time: `Î”SoC = (Î· Ã— I Ã— Î”t) / C_nominal`, where Î· = 0.995 (Li-ion coulombic efficiency).

### 3. Anomaly Detection (6 Modes)

| Mode | Method | Thresholds |
|---|---|---|
| Voltage Z-score | Z-score on `avg_voltage` | Warning: \|Z\|â‰¥2, Critical: \|Z\|â‰¥3 |
| Overvoltage | Absolute threshold on `max_voltage` | Critical: >4.23V |
| Undervoltage | Absolute threshold on `min_voltage` | Warning: <3.10V |
| Temperature Spike | Absolute on `max_temperature` | Warning: â‰¥40Â°C, Critical: â‰¥50Â°C |
| Current Surge | Z-score on `avg_current_charge` | Warning: Zâ‰¥2, Critical: Zâ‰¥3 |
| Capacity Drop | Consecutive cycle % change | Warning: â‰¥4%, Critical: â‰¥8% |
| Resistance Spike | Z-score + growth ratio | Critical: Zâ‰¥3 and >20% from baseline |

### 4. RAG + LLM Recommendation

```python
# Simplified pipeline
rag_query = f"{user_query} Health {health}%, capacity {cap_ret}%, temp {temp}Â°C"
chunks = retrieve_context(rag_query, top_k=5)   # NVIDIA NIM embedding + ChromaDB
result = generate_recommendation(battery_summary, anomalies, chunks)  # LLaMA 3.1 70B
```

The LLM prompt enforces:
- Citation of specific KB sources for every recommendation
- Reference to actual measured values (voltages, temperatures, cycle counts)
- Structured output: Assessment â†’ Key Findings â†’ Recommendations â†’ Monitoring Plan

---

## ðŸ”Œ API Reference

### Battery Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/batteries` | List all batteries with summary stats |
| `GET` | `/api/battery/<id>/summary` | Full summary: SoC, health, capacity, resistance |
| `GET` | `/api/battery/<id>/cycles` | Cycle history (downsampled by default; `?full=true` for all) |
| `GET` | `/api/battery/<id>/charge-curves` | CC-CV curves for latest or `?cycle=N` |

### Analysis & Anomaly Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/battery/<id>/analysis` | SoC series, capacity fade, trend data |
| `GET` | `/api/battery/<id>/anomalies` | Full anomaly log with severity and type |

### RAG / AI Endpoints

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/ingest-knowledge` | â€” | Ingest/update knowledge base into ChromaDB |
| `GET` | `/api/knowledge/status` | â€” | Check KB ingestion status + chunk count |
| `POST` | `/api/recommend` | `{battery_id, query}` | Full RAG + LLM recommendation |

### Example Request

```bash
curl -X POST https://your-api.onrender.com/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "battery_id": "BAT-001",
    "query": "What maintenance actions should I take for this battery?"
  }'
```

### Example Response

```json
{
  "battery_id": "BAT-001",
  "response": "**Battery Assessment**\nBAT-001 shows 77.97% health at 500 cycles...\n\n**Key Findings**\nâ€¢ Per the Degradation Factors guide, capacity retention at 77.97% indicates...",
  "model": "meta/llama-3.1-70b-instruct",
  "rag_sources": [
    { "source": "degradation_factors", "similarity": 0.923, "excerpt": "..." },
    { "source": "maintenance_guide", "similarity": 0.887, "excerpt": "..." }
  ],
  "anomaly_count": 527,
  "tokens_used": { "prompt": 1840, "completion": 412 }
}
```

---

## ðŸš€ Local Development

### Prerequisites

- Python 3.10 or higher
- Node.js 18+ and npm
- NVIDIA NIM API key â€” get one free at [build.nvidia.com](https://build.nvidia.com)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/batteryguard.git
cd batteryguard
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate      # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env and add your NVIDIA_API_KEY
```

**.env** (backend):
```env
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxx
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
GENERATION_MODEL=meta/llama-3.1-70b-instruct
EMBEDDING_MODEL=nvidia/nv-embedqa-e5-v5
CHROMA_PERSIST_DIR=./chroma_db
FLASK_DEBUG=true
FLASK_PORT=5000
```

```bash
# Start the Flask server
python app.py
# â†’ Running on http://localhost:5000
```

### 3. Ingest Knowledge Base (one-time)

```bash
curl -X POST http://localhost:5000/api/ingest-knowledge
# â†’ {"status": "ingested", "files_processed": 5, "total_chunks": 38, "new_chunks": 38}
```

### 4. Frontend Setup

```bash
cd ../frontend

npm install
npm run dev
# â†’ http://localhost:5173
```

Vite automatically proxies `/api/*` requests to `http://localhost:5000`, so no CORS configuration is needed in development.

### 5. Verify Everything Works

```bash
# Health check
curl http://localhost:5000/api/health
# â†’ {"status": "ok", "service": "BatteryGuard API", "version": "1.0.0"}

# Battery list
curl http://localhost:5000/api/batteries
# â†’ {"batteries": [...5 batteries...]}
```

Open **http://localhost:5173** in your browser.

---

## ðŸŒ Deployment

### Backend â†’ Render

1. **Push code to GitHub** (see [GitHub steps](#-github-deployment) below)

2. Go to [render.com](https://render.com) â†’ **New Web Service**

3. Connect your GitHub repository and select the repo

4. Configure the service:

   | Setting | Value |
   |---|---|
   | **Name** | `batteryguard-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |
   | **Instance Type** | Free (or Starter for better performance) |

5. Add **Environment Variables** in Render dashboard:

   ```
   NVIDIA_API_KEY        = nvapi-xxxxxxxxxxxx
   NVIDIA_BASE_URL       = https://integrate.api.nvidia.com/v1
   GENERATION_MODEL      = meta/llama-3.1-70b-instruct
   EMBEDDING_MODEL       = nvidia/nv-embedqa-e5-v5
   CHROMA_PERSIST_DIR    = ./chroma_db
   FLASK_DEBUG           = false
   ```

6. Click **Create Web Service** â†’ wait for deploy

7. After deploy, ingest the knowledge base:
   ```bash
   curl -X POST https://batteryguard-api.onrender.com/api/ingest-knowledge
   ```

8. Copy your Render URL: `https://batteryguard-api.onrender.com`

> [!NOTE]
> Render free tier spins down after 15 minutes of inactivity. The first request after sleep may take ~30 seconds. ChromaDB data persists within a deploy but resets on new deploys â€” re-run `POST /api/ingest-knowledge` after each redeploy.

---

### Frontend â†’ Vercel

1. Go to [vercel.com](https://vercel.com) â†’ **Add New Project**

2. Import your GitHub repository

3. Configure project settings:

   | Setting | Value |
   |---|---|
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

4. Add **Environment Variable**:

   ```
   VITE_API_BASE_URL = https://batteryguard-api.onrender.com
   ```

5. Update `frontend/src/api/client.js` to use the env variable:

   ```js
   // src/api/client.js
   const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
   ```

6. Update `vite.config.js` for production CORS â€” the Vercel frontend calls Render backend directly (no proxy in production):

   ```js
   // vite.config.js â€” production uses VITE_API_BASE_URL, proxy only for local dev
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
       }
     }
   }
   ```

7. Update Flask CORS in `backend/app.py` to allow the Vercel domain:

   ```python
   CORS(app, origins=[
       "http://localhost:5173",
       "https://batteryguard.vercel.app",   # your Vercel URL
       "https://*.vercel.app",
   ])
   ```

8. Click **Deploy** â†’ your frontend is live at `https://batteryguard.vercel.app`

---

## ðŸ“¤ GitHub Deployment

### Initial Setup

```bash
# From project root (Battery IQ/)
git init                             # if not already initialized
git add .
git commit -m "feat: initial BatteryGuard capstone project"
```

### Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `batteryguard`
3. Set to **Private** (contains capstone work) or **Public**
4. Do **NOT** initialize with README (you already have one)
5. Click **Create repository**

### Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/batteryguard.git
git branch -M main
git push -u origin main
```

### What Gets Committed (via .gitignore)

âœ… **Committed:**
- All source code (`backend/`, `frontend/src/`)
- `requirements.txt`, `package.json`
- `knowledge_base/*.md` documents
- `data/battery_cycles.csv` (synthetic, safe to commit)
- `README.md`, `.env.example`, `.gitignore`

âŒ **NOT Committed (gitignored):**
- `backend/.env` (contains API key â€” never commit this)
- `backend/chroma_db/` (vector DB â€” rebuilt on deploy)
- `node_modules/`, `__pycache__/`, `dist/`

---

## ðŸ”‘ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `NVIDIA_API_KEY` | âœ… | NVIDIA NIM API key from [build.nvidia.com](https://build.nvidia.com) |
| `NVIDIA_BASE_URL` | âœ… | `https://integrate.api.nvidia.com/v1` |
| `GENERATION_MODEL` | âœ… | `meta/llama-3.1-70b-instruct` |
| `EMBEDDING_MODEL` | âœ… | `nvidia/nv-embedqa-e5-v5` |
| `CHROMA_PERSIST_DIR` | âœ… | `./chroma_db` |
| `FLASK_DEBUG` | âšª | `true` for dev, `false` for prod |
| `FLASK_PORT` | âšª | `5000` (default) |

### Frontend (Vercel Environment)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | âœ… (prod) | Render backend URL, e.g. `https://batteryguard-api.onrender.com` |

---

## ðŸ“Š Dataset

The project uses a **synthetic battery cycle dataset** (`backend/data/battery_cycles.csv`) generated by `generate_data.py`.

**Specifications:**
- **5 batteries**: BAT-001 through BAT-005
- **500 cycles** per battery (2,500 rows total)
- **Features per cycle:**

| Column | Type | Description |
|---|---|---|
| `battery_id` | str | Battery identifier |
| `cycle_number` | int | Cycle index (1â€“500) |
| `timestamp` | datetime | Simulated measurement timestamp |
| `avg_voltage` | float (V) | Mean cell voltage |
| `min_voltage` | float (V) | Minimum voltage in cycle |
| `max_voltage` | float (V) | Maximum voltage in cycle |
| `avg_current_charge` | float (A) | Mean charge current |
| `avg_current_discharge` | float (A) | Mean discharge current |
| `avg_temperature` | float (Â°C) | Mean temperature |
| `max_temperature` | float (Â°C) | Peak temperature |
| `capacity_charge` | float (Ah) | Charge capacity |
| `capacity_discharge` | float (Ah) | Discharge capacity |
| `internal_resistance` | float (mÎ©) | DC internal resistance |
| `coulombic_efficiency` | float | Charge/discharge ratio |
| `charge_time_h` | float (h) | Time to full charge |
| `discharge_time_h` | float (h) | Discharge duration |
| `health_score` | float (%) | Derived health metric |
| `is_anomaly` | bool | Ground-truth anomaly flag |

---

## ðŸ“š Knowledge Base

Five expert documents embedded into ChromaDB for RAG retrieval:

| Document | Topics Covered |
|---|---|
| `battery_basics.md` | Li-ion electrochemistry, cell structure, chemistry types (NMC/LFP/NCA) |
| `charging_best_practices.md` | CC-CV charging, C-rate guidelines, partial charging benefits, BMS role |
| `degradation_factors.md` | SEI growth, lithium plating, cathode cracking, electrolyte oxidation |
| `maintenance_guide.md` | Inspection schedules, balancing, storage SoC, recovery procedures |
| `temperature_effects.md` | Optimal ranges, thermal runaway indicators, cold-weather protocols |

**RAG Configuration:**
- Chunk size: 800 characters | Overlap: 150 characters
- Embedding: `nvidia/nv-embedqa-e5-v5` (asymmetric: `passage` for docs, `query` for retrieval)
- Similarity: Cosine distance in ChromaDB HNSW index
- Top-K retrieval: 5 chunks per query

---

## ðŸ–¼ Screenshots

> The following pages are available in the live application:

| Page | Description |
|---|---|
| **Overview** | KPI cards (SoC, Health %, Cycles, Temp), battery status summary |
| **Analysis** | Charge/discharge curves, capacity fade chart, SoC gauge, resistance trend |
| **Anomalies** | Filterable anomaly log with severity badges (Critical / Warning) |
| **AI Assistant** | Chat interface with RAG-powered responses citing knowledge base sources |

---

## ðŸ“„ License

This project is developed as an academic capstone and is licensed under the **MIT License**.

---

<div align="center">

**BatteryGuard** â€” EEE Capstone Project #11

Built with âš¡ by **Kaviyarasu C**

*Agentic AI + RAG Â· NVIDIA NIM Â· React Â· Flask Â· ChromaDB*

</div>
