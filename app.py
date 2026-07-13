import os
import json
import time
import uuid
from datetime import datetime, timezone
import streamlit as st
import streamlit.components.v1 as components

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from rdkit import Chem
from rdkit.Chem import Draw

from youtube_search import YoutubeSearch

from components.beaker import build_beaker_html
from components.atom import build_atom_html
from components.particle import build_particle_html

# ---------------- Page Config ----------------
st.set_page_config(page_title="Chemistry Tutor", layout="wide")

# ---------------- Setup ----------------
load_dotenv()


def get_api_key():
    key = os.getenv("GOOGLE_API_KEY")
    if key:
        return key
    try:
        return st.secrets.get("GOOGLE_API_KEY")
    except Exception:
        return None


google_api_key = get_api_key()

if not google_api_key:
    st.error("⚠️ GOOGLE_API_KEY is not configured. Add it to a local .env file, or to Streamlit secrets when deployed.")
    st.stop()

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=google_api_key
)

# Per-session rate limit to protect the shared API key/budget on a multi-user deployment.
RATE_LIMIT_MAX_QUESTIONS = 8
RATE_LIMIT_WINDOW_SECONDS = 60

# ---------------- Auth (Google sign-in) ----------------
# Only enforced when [auth] secrets are configured (Google OAuth client), so local
# dev without that setup still works, just without cross-session persistence below.
def auth_configured():
    try:
        return bool(st.secrets.get("auth", {}).get("client_id"))
    except Exception:
        return False


AUTH_CONFIGURED = auth_configured()

if AUTH_CONFIGURED:
    if not st.user.is_logged_in:
        st.title("🧪 Chemistry Tutor")
        st.write("Sign in with Google to save and access your chat history across visits.")
        st.button("Sign in with Google", on_click=st.login)
        st.stop()
    user_email = st.user.email
else:
    user_email = None

# ---------------- Persistent storage (Supabase) ----------------
# Only enabled when both signed in and Supabase secrets are configured; otherwise
# chats stay session-only (in-memory), which is still safe for multi-user privacy.
def get_supabase_client():
    try:
        url = st.secrets["SUPABASE_URL"]
        key = st.secrets["SUPABASE_SERVICE_KEY"]
    except Exception:
        return None
    from supabase import create_client
    try:
        return create_client(url, key)
    except Exception:
        return None


supabase = get_supabase_client()
PERSISTENCE_ENABLED = supabase is not None and user_email is not None


def enrich_visual_data(data):
    """Compute the SMILES image / YouTube results once, whether the answer was
    just generated or is being hydrated from storage on load."""
    smiles = data.get("main_compound_smiles", "")
    if smiles and "smiles_image" not in data:
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol:
                data["smiles_image"] = Draw.MolToImage(mol, size=(350, 350))
        except Exception:
            pass

    query = data.get("youtube_search_query", "")
    if query and "video_results" not in data:
        try:
            data["video_results"] = YoutubeSearch(query, max_results=3).to_dict()
        except Exception:
            data["video_results"] = None
    return data


def serialize_chat_for_db(chat):
    display = []
    for item in chat["display"]:
        data = {k: v for k, v in item["data"].items() if k != "smiles_image"}
        display.append({"question": item["question"], "data": data})
    return {"title": chat["title"], "display": display}


def fetch_user_chats():
    if not PERSISTENCE_ENABLED:
        return {}
    try:
        res = (
            supabase.table("chats")
            .select("id, title, display")
            .eq("user_email", user_email)
            .order("updated_at")
            .execute()
        )
        return {row["id"]: {"title": row["title"], "display": row["display"]} for row in res.data}
    except Exception as e:
        st.error(f"⚠️ Could not load saved chats: {e}")
        return {}


def upsert_chat(chat_id, chat):
    if not PERSISTENCE_ENABLED:
        return
    try:
        supabase.table("chats").upsert({
            "id": chat_id,
            "user_email": user_email,
            "title": chat["title"],
            "display": serialize_chat_for_db(chat)["display"],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception as e:
        st.error(f"⚠️ Could not save chat: {e}")


def delete_chat_row(chat_id):
    if not PERSISTENCE_ENABLED:
        return
    try:
        supabase.table("chats").delete().eq("id", chat_id).execute()
    except Exception as e:
        st.error(f"⚠️ Could not delete chat from storage: {e}")


SYSTEM_PROMPT_TEXT = """
You are a chemistry helper. For every question, respond ONLY in valid JSON 
with this exact structure, nothing else (no markdown, no backticks):

{
  "topic": "Short topic name",
  "question_type": "concept" or "calculation" or "experiment" or "refused",
  "visual_type": "beaker" or "atom" or "particle" or "none",
  "concept_explanation": "Clear explanation of the fundamental concept",
  "steps": ["Step 1...", "Step 2...", "Step 3..."],
  "observations": "What you would observe (only relevant for experiment type, else empty string)",
  "formula": "Relevant formula if calculation type, else empty string",
  "worked_solution": ["Line 1 of working...", "Line 2..."],
  "final_answer": "Final numeric/symbolic answer if calculation type, else empty string",
  "main_compound_smiles": "SMILES string of main compound, or empty string",
  "youtube_search_query": "Short search query for a real reference video",
  "beaker_stages": [
    {"label": "Stage name", "description": "What happens", "liquid_color": "#hex", "bubbles": true_or_false, "smoke": true_or_false}
  ],
  "atom_data": {
    "element": "Element name",
    "protons": 0, "neutrons": 0, "electrons_per_shell": [2, 8, 1]
  },
  "particle_data": {
    "title": "e.g. Gas particles at high temperature",
    "particle_count": 12,
    "speed": "slow" or "medium" or "fast",
    "container_color": "#hex"
  }
}

Rules:
- CRITICAL: Always match your explanation depth strictly to the class level given in square brackets at the start of the user message:
  * Class 9: Simple language, shell model only (2,8,8 rule), no subshells, basic definitions, everyday examples
  * Class 10: Slightly deeper, introduce valency, basic reactions, periodic trends simply
  * Class 11: Full depth — quantum numbers, subshells (s,p,d,f), orbitals, Aufbau principle, Hund rule, Pauli exclusion principle, thermodynamic terms, equilibrium constants, proper IUPAC naming
  * Class 12: Advanced depth — reaction mechanisms, coordination chemistry, electrochemistry with Nernst equation, polymer structures, biomolecule details
  * Undergraduate: University level — molecular orbital theory, spectroscopy, statistical thermodynamics, advanced organic mechanisms
  * Never simplify a Class 11 or 12 answer to Class 9 level. Never overwhelm a Class 9 student with Class 11 concepts.
- Always give comprehensive, exam-ready answers. Never truncate explanations. For Class 11 and 12, answers should be detailed enough that a student could use them directly as study notes without needing any other source. Include all relevant exceptions, examples, and applications.
- If the question is NOT related to chemistry, set question_type to "refused" and explain politely in concept_explanation that you only answer chemistry questions. Leave all other fields empty.
- If the question involves making dangerous substances, illegal activities, or could cause harm to anyone, set question_type to "refused" and explain in concept_explanation that you cannot help with this. Leave all other fields empty.
- question_type "experiment": fill beaker_stages (3-5 stages) and observations, use visual_type "beaker".
- question_type "concept" about atomic structure: use visual_type "atom" and fill atom_data.
- question_type about gases/kinetic theory/states of matter: use visual_type "particle" and fill particle_data.
- question_type "calculation": fill formula, worked_solution (step by step), final_answer. Use visual_type "none" unless a visual genuinely helps.
- Only fill the data object matching visual_type; leave other data objects with empty/default values.
- beaker_stages, atom_data, particle_data should ONLY be filled if their corresponding visual_type is chosen.
"""

SYLLABUS = {
    "Class 9": ["Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of the Atom"],
    "Class 10": ["Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements"],
    "Class 11": ["Some Basic Concepts of Chemistry", "Structure of Atom", "Classification of Elements & Periodicity", "Chemical Bonding and Molecular Structure", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions", "Hydrogen", "s-Block Elements", "p-Block Elements (Group 13-14)", "Organic Chemistry Basics", "Hydrocarbons"],
    "Class 12": ["Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry", "p-Block Elements (Group 15-18)", "d and f Block Elements", "Coordination Compounds", "Haloalkanes and Haloarenes", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"],
    "Undergraduate": ["Quantum Chemistry", "Spectroscopy", "Thermodynamics & Statistical Mechanics", "Organic Reaction Mechanisms", "Inorganic Coordination Chemistry", "Analytical Chemistry", "Physical Chemistry - Kinetics", "Electrochemistry (Advanced)", "Polymer Chemistry"],
    "Others": ["General"]
}

st.markdown("""
<style>
.stApp { background: #0d0d0d; color: #ececec; }
section[data-testid="stSidebar"] { background: #111111; border-right: 1px solid #222222; }
.stChatMessage { background: #1a1a1a; border-radius: 14px; padding: 10px; }
h1, h2, h3 { color: #ffffff; }
.stButton button { border-radius: 10px; border: 1px solid #444444; color: #ececec; background: transparent; }
.stButton button:hover { background: #222222; color: #ffffff; }
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; margin-bottom:8px; }
.badge-concept { background:#1a3a5c; color:#7eb8f7; }
.badge-calculation { background:#3a2a00; color:#fcd34d; }
.badge-experiment { background:#0a2a1a; color:#6ee7b7; }
.badge-refused { background:#2a0a0a; color:#fda4af; }
</style>
""", unsafe_allow_html=True)

# ---------------- Highlight Chemistry Terms ----------------
def highlight_text(text):
    chemistry_terms = [
        # Class 9
        "mixture", "compound", "element", "atom", "molecule",
        "physical change", "chemical change", "evaporation",
        "condensation", "sublimation", "distillation", "filtration",
        "saturated", "unsaturated", "solute", "solvent", "solution",
        "colloid", "suspension", "Tyndall effect", "Brownian motion",
        "proton", "neutron", "electron", "nucleus", "shell",
        "atomic number", "mass number", "isotope", "isobar",
        # Class 10
        "chemical reaction", "reactant", "product", "catalyst",
        "oxidation", "reduction", "redox", "corrosion", "rancidity",
        "precipitation", "neutralization", "exothermic", "endothermic",
        "pH", "acid", "base", "salt", "indicator", "litmus",
        "valency", "ionic bond", "covalent bond", "metallic bond",
        "periodic table", "period", "group", "alkali metal",
        "alkaline earth metal", "halogen", "noble gas",
        "electronegativity", "electron affinity", "ionization energy",
        "alloy", "amalgam", "ore", "mineral", "refining",
        "hydrocarbon", "alkane", "alkene", "alkyne", "isomer",
        "functional group", "homologous series", "substitution",
        "addition reaction", "saponification", "esterification",
        # Class 11
        "Aufbau Principle", "Pauli Exclusion Principle", "Hund's Rule",
        "quantum number", "principal quantum number", "azimuthal",
        "magnetic quantum number", "spin quantum number",
        "orbital", "subshell", "electron configuration",
        "s-orbital", "p-orbital", "d-orbital", "f-orbital",
        "sp3", "sp2", "sigma bond", "pi bond",
        "hybridization", "VSEPR", "dipole moment",
        "van der Waals", "hydrogen bond", "ionic radius",
        "atomic radius", "Le Chatelier", "equilibrium constant",
        "Kc", "Kp", "degree of dissociation", "buffer solution",
        "activation energy", "enthalpy", "entropy", "Gibbs energy",
        "Hess's Law", "bond energy", "lattice energy",
        "Avogadro", "mole", "molarity", "molality", "normality",
        "mole fraction", "limiting reagent", "stoichiometry",
        "Boyle's Law", "Charles Law", "ideal gas", "real gas",
        "van der Waals equation", "critical temperature",
        "s-block", "p-block", "d-block", "f-block",
        "transition metal",
        # Class 12
        "electrochemistry", "electrolysis", "electrode",
        "anode", "cathode", "Faraday", "Nernst equation",
        "cell potential", "EMF", "standard electrode potential",
        "galvanic cell", "electrolytic cell", "fuel cell",
        "chemical kinetics", "rate of reaction", "rate law",
        "order of reaction", "half life", "Arrhenius equation",
        "molecularity", "activation complex", "transition state",
        "solid state", "unit cell", "crystal lattice",
        "coordination number", "packing efficiency",
        "Schottky defect", "Frenkel defect", "semiconductor",
        "colligative properties", "osmotic pressure", "osmosis",
        "vapour pressure", "Raoult's Law",
        "Van't Hoff factor",
        "surface chemistry", "adsorption", "absorption",
        "emulsion", "sol", "gel", "coagulation", "peptization",
        "coordination compound", "ligand", "chelate",
        "crystal field theory", "spectrochemical series",
        "haloalkane", "haloarene", "nucleophilic substitution",
        "SN1", "SN2", "elimination reaction",
        "alcohol", "phenol", "ether", "aldehyde", "ketone",
        "carboxylic acid", "ester", "amide", "amine",
        "aromatic", "benzene", "electrophilic",
        "nucleophilic", "carbocation", "carbanion", "free radical",
        "polymer", "monomer", "addition polymer", "condensation polymer",
        "biomolecule", "carbohydrate", "protein", "amino acid",
        "enzyme", "vitamin", "nucleic acid", "DNA", "RNA",
        # Undergraduate
        "molecular orbital theory", "HOMO", "LUMO",
        "spectroscopy", "NMR", "IR spectroscopy", "mass spectrometry",
        "statistical thermodynamics", "partition function",
        "quantum mechanics", "wave function", "Schrodinger equation",
        "Heisenberg uncertainty principle", "de Broglie",
        "reaction mechanism", "stereochemistry", "chirality",
        "enantiomer", "diastereomer", "racemic mixture",
        "retrosynthesis", "protecting group", "Grignard reagent"
    ]
    for term in chemistry_terms:
        if term in text:
            text = text.replace(
                term,
                f'<span style="background:#1a2a1a; color:#86efac; padding:1px 4px; border-radius:3px; font-weight:500;">{term}</span>'
            )
    return text

# ---------------- Multi-Chat Session State ----------------
# Chats always live in st.session_state (per-browser-session) so one student can
# never see another student's chats mid-session. When signed in with Supabase
# configured, they're additionally loaded from / saved to per-user DB rows so
# they survive refreshes, restarts, and return visits.
def make_empty_chat():
    return {"title": "New Chat", "messages": [SystemMessage(content=SYSTEM_PROMPT_TEXT)], "display": []}


if "chats" not in st.session_state:
    saved = fetch_user_chats()
    if saved:
        st.session_state.chats = {}
        for chat_id, chat in saved.items():
            for item in chat["display"]:
                enrich_visual_data(item["data"])
            st.session_state.chats[chat_id] = {
                "title": chat["title"],
                "display": chat["display"],
                "messages": [SystemMessage(content=SYSTEM_PROMPT_TEXT)]
            }
        st.session_state.active_chat = list(saved.keys())[-1]
    else:
        first_id = str(uuid.uuid4())
        st.session_state.chats = {first_id: make_empty_chat()}
        st.session_state.active_chat = first_id


def build_chat_export(chat):
    lines = [f"# {chat['title']}\n"]
    for item in chat["display"]:
        lines.append(f"## Q: {item['question']}\n")
        data = item["data"]
        if data.get("question_type") == "refused":
            lines.append(data.get("concept_explanation", ""))
        else:
            lines.append(data.get("concept_explanation", ""))
            if data.get("formula"):
                lines.append(f"\nFormula: {data['formula']}")
            for i, step in enumerate(data.get("worked_solution") or data.get("steps") or [], 1):
                lines.append(f"{i}. {step}")
            if data.get("final_answer"):
                lines.append(f"\nFinal Answer: {data['final_answer']}")
        lines.append("\n")
    return "\n".join(lines)

# ---------------- Sidebar ----------------
with st.sidebar:
    if AUTH_CONFIGURED:
        st.caption(f"Signed in as {user_email}")
        if st.button("Sign out"):
            st.logout()
        st.divider()

    st.header("⚙️ Settings")
    school_class = st.selectbox("Class / Grade", list(SYLLABUS.keys()))
    class_topics = SYLLABUS.get(school_class, ["General"])
    topic_choice = st.selectbox("Pick a Syllabus Topic", ["General"] + class_topics)
    custom_concept = st.text_input("Or type your own concept", placeholder="e.g. Le Chatelier's Principle")

    if custom_concept.strip():
        match = next((t for t in class_topics if custom_concept.strip().lower() in t.lower() or t.lower() in custom_concept.strip().lower()), None)
        topic_filter = match if match else "General"
        if not match:
            st.caption("⚠️ Not found in syllabus — defaulting to **General**")
    else:
        topic_filter = topic_choice

    with st.expander(f"📘 View {school_class} Syllabus"):
        for t in class_topics:
            st.write(f"• {t}")

    st.divider()

    empty_chats = [c for c in st.session_state.chats.values() if not c["display"]]
    if st.button("➕ New Chat", use_container_width=True):
        if len(empty_chats) >= 3:
            st.warning("You have unused empty chats. Use one before creating a new one.")
        else:
            new_id = str(uuid.uuid4())
            st.session_state.chats[new_id] = make_empty_chat()
            st.session_state.active_chat = new_id
            upsert_chat(new_id, st.session_state.chats[new_id])
            st.rerun()

    st.header("💬 Your Chats")
    for chat_id in reversed(list(st.session_state.chats.keys())):
        chat = st.session_state.chats[chat_id]
        is_active = chat_id == st.session_state.active_chat
        col1, col2 = st.columns([4, 1])
        with col1:
            label = ("👉 " if is_active else "") + chat["title"]
            if st.button(label, key=f"select_{chat_id}", use_container_width=True):
                st.session_state.active_chat = chat_id
                st.rerun()
        with col2:
            if st.button("🗑️", key=f"delete_{chat_id}"):
                del st.session_state.chats[chat_id]
                delete_chat_row(chat_id)
                if st.session_state.active_chat == chat_id:
                    remaining = list(st.session_state.chats.keys())
                    if remaining:
                        st.session_state.active_chat = remaining[-1]
                    else:
                        new_id = str(uuid.uuid4())
                        st.session_state.chats[new_id] = make_empty_chat()
                        st.session_state.active_chat = new_id
                        upsert_chat(new_id, st.session_state.chats[new_id])
                st.rerun()

# ---------------- Active Chat ----------------
active_chat = st.session_state.chats[st.session_state.active_chat]

st.title("🧪 Chemistry Tutor")
st.caption(f"Class: {school_class} | Topic: {topic_filter} | Chat: {active_chat['title']}")

if active_chat["display"]:
    st.download_button(
        "⬇️ Download this chat",
        data=build_chat_export(active_chat),
        file_name=f"{active_chat['title'][:40] or 'chat'}.md",
        mime="text/markdown",
    )

for item in active_chat["display"]:
    with st.chat_message("user"):
        st.write(item["question"])
    with st.chat_message("assistant"):
        data = item["data"]
        qtype = data.get("question_type", "concept")
        vtype = data.get("visual_type", "none")

        badge_class = f"badge-{qtype}" if qtype in ("concept", "calculation", "experiment", "refused") else "badge-concept"
        st.markdown(f'<span class="badge {badge_class}">{qtype.upper()}</span>', unsafe_allow_html=True)

        if qtype == "refused":
            st.warning(f"🚫 {data.get('concept_explanation', 'I can only answer chemistry questions.')}")
        else:
            # Highlighted explanation
            explanation = data.get('concept_explanation', '')
            st.markdown("**📖 Explanation:**")
            st.markdown(highlight_text(explanation), unsafe_allow_html=True)

            if qtype == "calculation":
                if data.get("formula"):
                    st.markdown(f"**🧮 Formula:** `{data.get('formula')}`")
                ws = data.get("worked_solution", [])
                if ws:
                    st.markdown("**✏️ Worked Solution:**")
                    for i, line in enumerate(ws, 1):
                        st.write(f"{i}. {line}")
                if data.get("final_answer"):
                    st.success(f"**Final Answer:** {data.get('final_answer')}")
            else:
                steps = data.get("steps", [])
                if steps:
                    st.markdown("**🧫 Steps:**")
                    for i, step in enumerate(steps, 1):
                        st.markdown(highlight_text(f"{i}. {step}"), unsafe_allow_html=True)
                if data.get("observations"):
                    st.markdown("**👀 Observations:**")
                    st.markdown(highlight_text(data.get('observations', '')), unsafe_allow_html=True)

            if vtype == "beaker" and data.get("beaker_stages"):
                components.html(build_beaker_html(data["beaker_stages"]), height=440)
            elif vtype == "atom" and data.get("atom_data"):
                components.html(build_atom_html(data["atom_data"]), height=380)
            elif vtype == "particle" and data.get("particle_data"):
                components.html(build_particle_html(data["particle_data"]), height=300)

            smiles_image = data.get("smiles_image")
            if smiles_image is not None:
                st.image(smiles_image, caption=data.get("main_compound_smiles", ""))

            if data.get("youtube_search_query"):
                st.markdown("**🎥 Reference Videos:**")
                results = data.get("video_results")
                if results:
                    cols = st.columns(len(results))
                    for col, vid in zip(cols, results):
                        with col:
                            st.video(f"https://www.youtube.com/watch?v={vid['id']}")
                            st.caption(vid.get("title", "")[:50])
                elif results == []:
                    st.write("No videos found for this topic.")
                else:
                    st.write("Could not fetch reference videos.")

# ---------------- Chat Input ----------------
user_input = st.chat_input("Ask a chemistry question...")

if user_input:
    if not user_input.strip():
        st.stop()

    if len(user_input) > 500:
        st.warning("⚠️ Question too long. Please keep it under 500 characters.")
        st.stop()

    now = time.time()
    recent = [t for t in st.session_state.get("question_times", []) if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(recent) >= RATE_LIMIT_MAX_QUESTIONS:
        st.warning(f"⚠️ You're asking questions faster than I can keep up! Please wait a moment and try again.")
        st.stop()
    recent.append(now)
    st.session_state.question_times = recent

    contextual_prompt = f"[Class: {school_class}, Topic focus: {topic_filter}] {user_input}"
    active_chat["messages"].append(HumanMessage(content=contextual_prompt))

    with st.spinner("Thinking..."):
        try:
            response = model.invoke(active_chat["messages"])
        except Exception:
            active_chat["messages"].pop()
            st.error("⚠️ Couldn't reach the AI tutor right now. Please try again in a moment.")
            st.stop()

    active_chat["messages"].append(response)

    try:
        data = json.loads(response.content)
    except json.JSONDecodeError:
        data = {
            "concept_explanation": response.content, "question_type": "concept", "visual_type": "none",
            "steps": [], "observations": "", "formula": "", "worked_solution": [], "final_answer": "",
            "main_compound_smiles": "", "youtube_search_query": "", "beaker_stages": [],
            "atom_data": {}, "particle_data": {}, "topic": ""
        }

    enrich_visual_data(data)

    active_chat["display"].append({"question": user_input, "data": data})

    if active_chat["title"] == "New Chat":
        active_chat["title"] = user_input[:30] + ("..." if len(user_input) > 30 else "")

    upsert_chat(st.session_state.active_chat, active_chat)

    st.rerun()