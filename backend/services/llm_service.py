"""
LLM Service — NVIDIA NIM Generation
======================================
Calls meta/llama-3.1-70b-instruct via the NVIDIA NIM API to generate
AI-powered battery maintenance recommendations grounded in RAG context.
"""
import os
from openai import OpenAI
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

NVIDIA_API_KEY     = os.getenv("NVIDIA_API_KEY", "")
NVIDIA_BASE_URL    = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
GENERATION_MODEL   = os.getenv("GENERATION_MODEL", "meta/llama-3.1-70b-instruct")
MAX_TOKENS         = 1024
TEMPERATURE        = 0.3

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        if not NVIDIA_API_KEY:
            raise RuntimeError("NVIDIA_API_KEY is not set.")
        _client = OpenAI(api_key=NVIDIA_API_KEY, base_url=NVIDIA_BASE_URL)
    return _client


SYSTEM_PROMPT = """You are BatteryGuard AI, an expert battery health analysis assistant.
You have deep knowledge of lithium-ion battery electrochemistry, degradation mechanisms,
charging protocols, thermal management, and preventive maintenance.

Your role is to analyze battery telemetry data and provide actionable, specific maintenance
recommendations. Base your answers ONLY on:
1. The battery metrics and anomalies provided
2. The retrieved knowledge base context provided

Be concise but thorough. Use bullet points for recommendations.
Always mention specific values from the data when relevant.
Rate the overall battery health as: Excellent / Good / Fair / Poor / Critical.
"""


def _build_prompt(battery_summary: dict, anomalies: list[dict],
                  rag_chunks: list[dict], user_query: str) -> str:
    """Construct the user prompt with all context."""
    # Battery metrics section
    metrics = f"""## Battery Status Report
- Battery ID: {battery_summary.get('battery_id', 'N/A')}
- Cycle Count: {battery_summary.get('cycle_count', 'N/A')}
- State of Charge (SoC): {battery_summary.get('soc', 'N/A')}%
- Health Score: {battery_summary.get('health_score', 'N/A')}%
- Capacity: {battery_summary.get('capacity', 'N/A')} Ah (Nominal: 3.0 Ah)
- Capacity Retention: {battery_summary.get('capacity_retention', 'N/A')}%
- Internal Resistance: {battery_summary.get('internal_resistance', 'N/A')} mΩ
- Average Temperature: {battery_summary.get('avg_temperature', 'N/A')}°C
"""

    # Anomalies section
    if anomalies:
        anomaly_lines = []
        for a in anomalies[:8]:  # limit to 8 most recent/severe
            anomaly_lines.append(
                f"  - [{a['severity'].upper()}] Cycle {a['cycle_number']}: "
                f"{a['message']}"
            )
        anomaly_section = "## Detected Anomalies\n" + "\n".join(anomaly_lines) + "\n"
    else:
        anomaly_section = "## Detected Anomalies\nNo anomalies detected in recent cycles.\n"

    # RAG context section
    if rag_chunks:
        context_lines = []
        for chunk in rag_chunks:
            context_lines.append(
                f"[Source: {chunk['source']}]\n{chunk['text'][:400]}"
            )
        context_section = "## Relevant Knowledge Base Context\n" + "\n\n".join(context_lines) + "\n"
    else:
        context_section = "## Relevant Knowledge Base Context\nNo context retrieved.\n"

    return f"""{metrics}
{anomaly_section}
{context_section}
## User Query
{user_query}

Please provide a comprehensive analysis and specific maintenance recommendations for this battery.
"""


def generate_recommendation(
    battery_summary: dict,
    anomalies: list[dict],
    rag_chunks: list[dict],
    user_query: str = "Analyze this battery and provide maintenance recommendations.",
) -> dict:
    """
    Generate AI maintenance recommendations using NVIDIA NIM LLM.

    Returns dict with 'response' text and 'model' used.
    """
    client   = _get_client()
    prompt   = _build_prompt(battery_summary, anomalies, rag_chunks, user_query)

    completion = client.chat.completions.create(
        model=GENERATION_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": prompt},
        ],
        max_tokens=MAX_TOKENS,
        temperature=TEMPERATURE,
        stream=False,
    )

    response_text = completion.choices[0].message.content or ""
    return {
        'response': response_text,
        'model':    GENERATION_MODEL,
        'tokens_used': {
            'prompt':     completion.usage.prompt_tokens if completion.usage else 0,
            'completion': completion.usage.completion_tokens if completion.usage else 0,
        },
    }
