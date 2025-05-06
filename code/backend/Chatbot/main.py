import os
import re
import json
import datetime
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

# ── CONFIGURATION ─────────────────────────────────────────────────────────────
GEMINI_API_KEY = "AIzaSyCux93dMVw11Yopdng20wm-2nS4J2tQQqE"
GEMINI_URL     = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
MONGO_URI      = "mongodb+srv://pallamreddyviswas:7G4h7FIrUxSt8RiF@cluster0.lzcvb.mongodb.net/Anusandhan?retryWrites=true&w=majority&appName=Cluster0"
MONGO_DB_NAME  = "Anusandhan"
CLIENT_ORIGIN  = "http://localhost:5173"

if not all([MONGO_URI, MONGO_DB_NAME, GEMINI_URL, GEMINI_API_KEY]):
    raise EnvironmentError(
        "Missing required environment variables: MONGO_URI, MONGO_DB_NAME, GEMINI_URL, GEMINI_API_KEY"
    )

# ── APP & CORS SETUP ───────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=CLIENT_ORIGIN, supports_credentials=True)

# ── DATABASE SETUP ───────────────────────────────────────────────────────────
client = MongoClient(MONGO_URI)
db     = client[MONGO_DB_NAME]

# ── GLOBAL CONTEXT ────────────────────────────────────────────────────────────
conversation_context = []

# ── HELPERS ────────────────────────────────────────────────────────────────────
def sanitize_for_json(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    if isinstance(obj, list):
        return [sanitize_for_json(v) for v in obj]
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    return obj


def extract_json(text: str):
    m = re.search(r"(\{.*\})", text, re.S)
    if not m:
        raise ValueError("No JSON object found in LLM response")
    return json.loads(m.group(1))

# ── PROJECT DESCRIPTION ────────────────────────────────────────────────────────
PROJECT_DESCRIPTION = (
    "You are assisting with a KPI Dashboard system. "
    "Queries are scoped to a specific project by its ID. "
    "Always respond using names rather than internal IDs."
)

# ── SCHEMA DISCOVERY ───────────────────────────────────────────────────────────
def describe_collections():
    schema = {}
    for name in db.list_collection_names():
        doc = db[name].find_one()
        schema[name] = list(doc.keys()) if doc else []
    return schema


def find_project_field(doc: dict) -> str:
    for key in doc.keys():
        if re.match(r"^project[_]?id$", key, re.IGNORECASE):
            return key
    return None

# ── NAME RESOLUTION ────────────────────────────────────────────────────────────
def resolve_names(records: list[dict]) -> list[dict]:
    for doc in records:
        if 'kpi_id' in doc and doc['kpi_id']:
            kpi = db['kpis'].find_one({'_id': ObjectId(doc['kpi_id'])}, {'indicator':1})
            doc['kpi_name'] = kpi['indicator'] if kpi else None
            del doc['kpi_id']
        if 'task_id' in doc and doc['task_id']:
            task = db['tasks'].find_one({'_id': ObjectId(doc['task_id'])}, {'title':1})
            doc['task_name'] = task['title'] if task else None
            del doc['task_id']
        if 'project_id' in doc and doc['project_id']:
            proj = db['projects'].find_one({'_id': ObjectId(doc['project_id'])}, {'name':1})
            doc['project_name'] = proj['name'] if proj else None
            del doc['project_id']
    return records

# ── GEMINI-DRIVEN QUERY PLANNING ───────────────────────────────────────────────
def plan_query_with_gemini(question: str, project_id: ObjectId, schema: dict) -> dict:
    history = '\n'.join(f"Q: {q}\nA: {a}" for q, a in conversation_context[-10:]) or 'None yet.'
    schema_snip = "\n".join(f"- {c}: {schema[c]}" for c in schema)

    prompt = f"""
You output only a JSON spec for a MongoDB find() query.

PROJECT DESCRIPTION:
{PROJECT_DESCRIPTION}

HISTORY:
{history}

AVAILABLE SCHEMA:
{schema_snip}

QUESTION:
{question}

CONSTRAINTS:
- Always scope to project ID: {project_id}
- Use only listed collections/fields
- No extra text—only JSON with 'collection', 'filter', 'projection'

If no relevant field, return {{"collection":"","filter":{{}},"projection":{{}}}}"""

    resp = requests.post(
        GEMINI_URL,
        headers={"Content-Type":"application/json"},
        params={"key": GEMINI_API_KEY},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature":0.0, "maxOutputTokens":1024}
        }
    )
    resp.raise_for_status()
    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    return extract_json(raw)

# ── PROJECT FILTER ENFORCEMENT ─────────────────────────────────────────────────
def enforce_project_filter(spec: dict, project_id: ObjectId) -> dict:
    coll = spec.get('collection', '')
    if not coll:
        return spec
    if coll == 'projects':
        spec['filter'] = {'_id': project_id}
        return spec
    sample = db[coll].find_one()
    if not sample:
        raise ValueError(f"No docs in '{coll}' to infer project field")
    proj_field = find_project_field(sample)
    if not proj_field:
        raise ValueError(f"No project reference field in '{coll}'")
    spec['filter'] = {proj_field: project_id}
    return spec

# ── EXECUTION & CLEANUP ─────────────────────────────────────────────────────────
def execute_query_spec(spec: dict) -> list[dict]:
    coll = spec.get('collection', '')
    if not coll:
        return []
    return list(db[coll].find(spec.get('filter', {}), spec.get('projection', {})))

def strip_sensitive(records: list[dict]) -> list[dict]:
    return [{k:v for k,v in doc.items() if k not in {'passwordHash','ssn','creditCard'}} for doc in records]

# ── SUMMARIZATION ──────────────────────────────────────────────────────────────
def summarize_with_gemini(question: str, clean_results: list[dict]) -> str:
    enriched = resolve_names(clean_results)
    sanitized = sanitize_for_json(enriched)

    instr = ["Always refer to entities by names, not IDs."]
    if 'summary' in question.lower():
        instr.append("Include project details, KPIs, KPIUpdates timeline, and visualisations; omit visuals for generic summary.")
    if any(k in question.lower() for k in ('progress','timeline')):
        instr.append("Show project date range and KPIUpdates over time.")
    if 'location' in question.lower():
        instr.append("Use project.states for location; ignore success stories.")
    task_text = ' '.join(instr)

    prompt = f"""
PROJECT DESCRIPTION:
{PROJECT_DESCRIPTION}

QUESTION:
{question}

RESULTS:
{json.dumps(sanitized, indent=2)}

TASK:
- {task_text}
- Do NOT output raw JSON.
"""

    resp = requests.post(
        GEMINI_URL,
        headers={"Content-Type":"application/json"},
        params={"key": GEMINI_API_KEY},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature":0.7, "maxOutputTokens":1024}
        }
    )
    resp.raise_for_status()
    return resp.json()["candidates"][0]["content"]["parts"][0]["text"]

# ── GREETING/THANKS HANDLERS ───────────────────────────────────────────────────
def is_greeting(msg: str) -> bool:
    return bool(re.match(r"^(hi|hello|hey|hii|hey there)[!.]?$", msg.strip(), re.IGNORECASE))

def is_thanks(msg: str) -> bool:
    return bool(re.search(r"\b(thanks|thank(?: you| u)|thx)\b", msg, re.IGNORECASE))

# ── MAIN ENDPOINT ─────────────────────────────────────────────────────────────
@app.route('/api/message', methods=['POST'])
def handle_message():
    data       = request.get_json(force=True)
    project_id = data.get('project_id')
    question   = data.get('message', '').strip()

    if not project_id or not question:
        return jsonify({'response': "I don't have enough information to answer that."}), 200

    if is_greeting(question):
        return jsonify({'response': 'Hello! How can I help you with this project today?'}), 200

    if is_thanks(question):
        return jsonify({'response': "You're welcome! Anything else about this project I can assist with?"}), 200

    try:
        pid = ObjectId(project_id)
        schema = describe_collections()
        spec = plan_query_with_gemini(question, pid, schema)
        spec = enforce_project_filter(spec, pid)
        results = execute_query_spec(spec)

        # Irrelevant or empty queries
        if not spec.get('collection') or not results:
            return jsonify({'response': "I don't have enough information to answer that."}), 200

        clean   = strip_sensitive(results)
        summary = summarize_with_gemini(question, clean)
        conversation_context.append((question, summary))
        conversation_context[:] = conversation_context[-10:]

        return jsonify({'response': summary}), 200
    except:
        return jsonify({'response': "I don't have enough information to answer that."}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port= 5001, debug=True)
