import os
import json
import uuid
import streamlit as st
import streamlit.components.v1 as components

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from rdkit import Chem
from rdkit.Chem import Draw

from youtube_search import YoutubeSearch

# ---------------- Setup ----------------
load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=google_api_key
)

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
Rules:
- CRITICAL: Always match your explanation depth strictly to the class level given in square brackets at the start of the user message:
  * Class 9: Simple language, shell model only (2,8,8 rule), no subshells, basic definitions, everyday examples
  * Class 10: Slightly deeper, introduce valency, basic reactions, periodic trends simply
  * Class 11: Full depth — quantum numbers, subshells (s,p,d,f), orbitals, Aufbau principle, Hund rule, Pauli exclusion principle, thermodynamic terms, equilibrium constants, proper IUPAC naming
  * Class 12: Advanced depth — reaction mechanisms, coordination chemistry, electrochemistry with Nernst equation, polymer structures, biomolecule details
  * Undergraduate: University level — molecular orbital theory, spectroscopy, statistical thermodynamics, advanced organic mechanisms
  * Never simplify a Class 11 or 12 answer to Class 9 level. Never overwhelm a Class 9 student with Class 11 concepts.
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

# ---------------- Chat Persistence ----------------
CHATS_FILE = "data/chats.json"

def load_chats():
    if os.path.exists(CHATS_FILE):
        try:
            with open(CHATS_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    return json.loads(content)
        except Exception:
            pass
    return {}

def save_chats():
    # Bug 6 fix — atomic write using temp file
    # If save fails, original file stays intact and user sees an error
    try:
        saveable = {}
        for chat_id, chat in st.session_state.chats.items():
            saveable[chat_id] = {
                "title": chat["title"],
                "display": chat["display"]
            }
        temp_file = CHATS_FILE + ".tmp"
        with open(temp_file, "w") as f:
            json.dump(saveable, f, indent=2)
        os.replace(temp_file, CHATS_FILE)
    except Exception as e:
        st.error(f"⚠️ Could not save chats: {e}")

# ---------------- Page Config ----------------
st.set_page_config(page_title="Chemistry Tutor", layout="wide")

st.markdown("""
<style>
.stApp { background: linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #164e63 100%); color: #e2e8f0; }
section[data-testid="stSidebar"] { background: #0f172a; border-right: 1px solid #334155; }
.stChatMessage { background: #1e293b; border-radius: 14px; padding: 10px; }
h1, h2, h3 { color: #5eead4; }
.stButton button { border-radius: 10px; border: 1px solid #5eead4; color: #5eead4; background: transparent; }
.stButton button:hover { background: #5eead4; color: #0f172a; }
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; margin-bottom:8px; }
.badge-concept { background:#1e3a8a; color:#93c5fd; }
.badge-calculation { background:#78350f; color:#fcd34d; }
.badge-experiment { background:#064e3b; color:#6ee7b7; }
.badge-refused { background:#4c0519; color:#fda4af; }
</style>
""", unsafe_allow_html=True)

# ---------------- Beaker Animation ----------------
def build_beaker_html(stages):
    labels_js = json.dumps([s.get("label", "") for s in stages])
    descs_js = json.dumps([s.get("description", "") for s in stages])
    colors_js = json.dumps([s.get("liquid_color", "#60a5fa") for s in stages])
    bubbles_js = json.dumps([bool(s.get("bubbles", False)) for s in stages])
    smoke_js = json.dumps([bool(s.get("smoke", False)) for s in stages])
    temp_labels_js = json.dumps([
        "Heating..." if s.get("smoke") else ("Bubbling..." if s.get("bubbles") else "Stable")
        for s in stages
    ])
    n_stages = len(stages)

    return f"""
    <div style="display:flex; justify-content:center; padding:14px; font-family:'Segoe UI',sans-serif;">
      <div style="text-align:center; width:340px;">
        <div style="position:relative; width:220px; height:270px; margin:0 auto; border:6px solid #94a3b8; border-top:none; border-radius:0 0 24px 24px; box-shadow:0 0 25px rgba(94,234,212,0.15), inset 0 0 20px rgba(255,255,255,0.05); overflow:hidden;">
          <div style="position:absolute; top:0; left:10px; width:18px; height:100%; background:linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.02)); border-radius:50%; z-index:6;"></div>
          <div id="tempLabel" style="position:absolute; top:10px; width:100%; text-align:center; font-size:11px; color:#fca5a5; font-weight:600; z-index:6; transition:opacity 0.6s ease;"></div>
          <div id="liquid" style="position:absolute; bottom:0; left:0; width:100%; height:65%; transition:background 1.8s ease-in-out, height 1.8s ease-in-out;">
            <div style="position:absolute; top:-10px; left:0; width:200%; height:20px; background:rgba(255,255,255,0.25); border-radius:50%; animation:waveMove 2.8s linear infinite;"></div>
          </div>
          <div id="bubbleLayer" style="position:absolute; bottom:0; left:0; width:100%; height:65%; overflow:hidden;"></div>
          <div id="smokeLayer" style="position:absolute; top:-50px; left:0; width:100%; height:70px; overflow:hidden;"></div>
          <div style="position:absolute; bottom:6px; left:10%; width:80%; height:4px; background:rgba(255,255,255,0.15); border-radius:4px; z-index:6;">
            <div id="progressFill" style="height:100%; width:0%; background:#5eead4; border-radius:4px; transition:width 1.5s ease-in-out;"></div>
          </div>
        </div>
        <div id="stageLabel" style="margin-top:16px; font-weight:700; font-size:18px; color:#5eead4;"></div>
        <div id="stageDesc" style="font-size:13px; color:#cbd5e1; margin-top:6px; min-height:40px;"></div>
        <div id="stageCounter" style="margin-top:8px; font-size:12px; color:#64748b;"></div>
      </div>
    </div>
    <style>
      @keyframes waveMove {{0%{{transform:translateX(0);}}100%{{transform:translateX(-50%);}}}}
      .bubble {{position:absolute; bottom:0; background:rgba(255,255,255,0.8); border-radius:50%; animation-name:rise; animation-timing-function:ease-in; animation-iteration-count:infinite;}}
      @keyframes rise {{0%{{transform:translateY(0) scale(1); opacity:0.9;}}100%{{transform:translateY(-170px) scale(0.3); opacity:0;}}}}
      .smoke {{position:absolute; bottom:0; background:rgba(226,232,240,0.4); border-radius:50%; filter:blur(5px); animation-name:drift; animation-timing-function:ease-out; animation-iteration-count:infinite;}}
      @keyframes drift {{0%{{transform:translateY(0) scale(0.5); opacity:0.6;}}100%{{transform:translateY(-70px) scale(1.6); opacity:0;}}}}
    </style>
    <script>
      const labels={labels_js}, descs={descs_js}, colors={colors_js};
      const bubblesOn={bubbles_js}, smokeOn={smoke_js}, tempLabels={temp_labels_js};
      const total = {n_stages};
      let idx=0;

      function gradientFor(hex) {{
        return `linear-gradient(to top, ${{hex}}, ${{hex}}cc)`;
      }}

      function renderStage(isFinal) {{
        const liquid = document.getElementById('liquid');
        liquid.style.background = gradientFor(colors[idx]);
        document.getElementById('stageLabel').innerText = labels[idx];
        document.getElementById('stageDesc').innerText = descs[idx];
        document.getElementById('stageCounter').innerText = "Stage " + (idx+1) + " / " + total;
        document.getElementById('tempLabel').innerText = tempLabels[idx];
        document.getElementById('progressFill').style.width = (((idx+1)/total)*100) + '%';
        liquid.style.height = (isFinal ? '58%' : '65%');

        const bl = document.getElementById('bubbleLayer'); bl.innerHTML = '';
        if (bubblesOn[idx]) {{
          const count = isFinal ? 4 : 10;
          for (let i=0;i<count;i++) {{
            const b=document.createElement('div'); b.className='bubble';
            const size = 4 + Math.random()*7;
            b.style.width = size+'px'; b.style.height = size+'px';
            b.style.left=(Math.random()*90)+'%';
            b.style.animationDuration = (isFinal ? 3.5 : (1.6 + Math.random()*1.2)) + 's';
            b.style.animationDelay=(Math.random()*2)+'s';
            bl.appendChild(b);
          }}
        }}

        const sl = document.getElementById('smokeLayer'); sl.innerHTML = '';
        if (smokeOn[idx]) {{
          for (let i=0;i<6;i++) {{
            const s=document.createElement('div'); s.className='smoke';
            const size = 18 + Math.random()*12;
            s.style.width = size+'px'; s.style.height = size+'px';
            s.style.left=(Math.random()*80)+'%';
            s.style.animationDuration = (2.6 + Math.random()*1.2) + 's';
            s.style.animationDelay=(Math.random()*2)+'s';
            sl.appendChild(s);
          }}
        }}
      }}

      function loop() {{
        const isFinal = (idx === total - 1);
        renderStage(isFinal);
        idx = (idx+1) % total;
      }}

      loop();
      setInterval(loop, 3200);
    </script>
    """

# ---------------- Atom Animation ----------------
def build_atom_html(atom_data):
    element = atom_data.get("element", "Atom")
    protons = atom_data.get("protons", 1)
    neutrons = atom_data.get("neutrons", 0)
    shells = atom_data.get("electrons_per_shell", [1])
    shell_names = ["K", "L", "M", "N", "O", "P"]
    shell_colors = ["#5eead4", "#fbbf24", "#f472b6", "#a78bfa", "#60a5fa", "#34d399"]

    shells_html = ""
    for i, count in enumerate(shells):
        radius = 50 + i * 35
        color = shell_colors[i % len(shell_colors)]
        name = shell_names[i] if i < len(shell_names) else f"Shell {i+1}"
        shells_html += f"""
        <div class="shell" style="width:{radius*2}px; height:{radius*2}px; border-color:{color}55;">
          <div class="shell-label" style="color:{color};">{name}</div>
        """
        for e in range(count):
            angle = (360 / count) * e if count else 0
            duration = 4 + i * 1.3 + (e % 3) * 0.4
            shells_html += f"""
            <div class="electron-orbit" style="animation-duration:{duration}s; animation-delay:{-(angle/360)*duration}s;">
              <div class="electron" style="background:{color}; box-shadow:0 0 8px {color};"></div>
            </div>
            """
        shells_html += "</div>"

    return f"""
    <div style="display:flex; justify-content:center; align-items:center; padding:20px; font-family:'Segoe UI',sans-serif;">
      <div style="position:relative; width:360px; height:360px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; width:40px; height:40px; border-radius:50%; background:radial-gradient(circle at 35% 35%, #fde68a, #f59e0b); box-shadow:0 0 20px #f59e0b; display:flex; align-items:center; justify-content:center; font-size:10px; color:#1f2937; font-weight:bold; z-index:5;">
          {protons}p {neutrons}n
        </div>
        {shells_html}
        <div style="position:absolute; bottom:-30px; font-size:16px; font-weight:700; color:#5eead4;">{element}</div>
      </div>
    </div>
    <style>
      .shell {{ position:absolute; border:1px dashed; border-radius:50%; }}
      .shell-label {{ position:absolute; top:-2px; left:50%; transform:translateX(-50%); font-size:10px; font-weight:700; background:#0f172a; padding:0 4px; }}
      .electron-orbit {{ position:absolute; top:0; left:0; width:100%; height:100%; animation-name:spin; animation-timing-function:linear; animation-iteration-count:infinite; }}
      .electron {{ position:absolute; top:-4px; left:50%; width:9px; height:9px; margin-left:-4.5px; border-radius:50%; }}
      @keyframes spin {{ from {{ transform:rotate(0deg); }} to {{ transform:rotate(360deg); }} }}
    </style>
    """

# ---------------- Particle Animation ----------------
def build_particle_html(particle_data):
    title = particle_data.get("title", "Particle Motion")
    count = particle_data.get("particle_count", 10)
    speed = particle_data.get("speed", "medium")
    color = particle_data.get("container_color", "#1e293b")
    speed_map = {"slow": 6, "medium": 3, "fast": 1.2}
    dur = speed_map.get(speed, 3)

    particles = ""
    for i in range(count):
        delay = (i % 6) * 0.3
        size = 8 + (i % 3) * 2
        particles += f"""
        <div class="particle" style="
            width:{size}px; height:{size}px;
            animation-duration:{dur + (i % 3) * 0.4}s;
            animation-delay:{delay}s;
            left:{(i * 37) % 90}%;
            top:{(i * 53) % 80}%;
        "></div>
        """

    return f"""
    <div style="display:flex; justify-content:center; padding:14px; font-family:'Segoe UI',sans-serif;">
      <div style="text-align:center;">
        <div style="position:relative; width:300px; height:220px; border:3px solid #475569; border-radius:14px; background:{color}33; overflow:hidden;">
          {particles}
        </div>
        <div style="margin-top:10px; font-size:14px; color:#5eead4; font-weight:600;">{title}</div>
        <div style="font-size:12px; color:#94a3b8;">Speed: {speed}</div>
      </div>
    </div>
    <style>
      .particle {{ position:absolute; background:#5eead4; border-radius:50%; box-shadow:0 0 6px #5eead4; animation-name:bounce; animation-timing-function:linear; animation-iteration-count:infinite; }}
      @keyframes bounce {{
        0% {{ transform:translate(0,0); }}
        25% {{ transform:translate(60px,-40px); }}
        50% {{ transform:translate(120px,30px); }}
        75% {{ transform:translate(40px,60px); }}
        100% {{ transform:translate(0,0); }}
      }}
    </style>
    """

# ---------------- Multi-Chat Session State ----------------
if "chats" not in st.session_state:
    saved = load_chats()
    if saved:
        st.session_state.chats = {}
        for chat_id, chat in saved.items():
            st.session_state.chats[chat_id] = {
                "title": chat["title"],
                "display": chat["display"],
                "messages": [SystemMessage(content=SYSTEM_PROMPT_TEXT)]
            }
        st.session_state.active_chat = list(saved.keys())[-1]
    else:
        first_id = str(uuid.uuid4())
        st.session_state.chats = {
            first_id: {"title": "New Chat", "messages": [SystemMessage(content=SYSTEM_PROMPT_TEXT)], "display": []}
        }
        st.session_state.active_chat = first_id

# ---------------- Sidebar ----------------
with st.sidebar:
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

    # Bug 5 fix — limit empty chats to max 3
    empty_chats = [c for c in st.session_state.chats.values() if not c["display"]]
    if st.button("➕ New Chat", use_container_width=True):
        if len(empty_chats) >= 3:
            st.warning("You have unused empty chats. Use one before creating a new one.")
        else:
            new_id = str(uuid.uuid4())
            st.session_state.chats[new_id] = {
                "title": "New Chat",
                "messages": [SystemMessage(content=SYSTEM_PROMPT_TEXT)],
                "display": []
            }
            st.session_state.active_chat = new_id
            save_chats()
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
                if st.session_state.active_chat == chat_id:
                    remaining = list(st.session_state.chats.keys())
                    if remaining:
                        st.session_state.active_chat = remaining[-1]
                    else:
                        new_id = str(uuid.uuid4())
                        st.session_state.chats[new_id] = {
                            "title": "New Chat",
                            "messages": [SystemMessage(content=SYSTEM_PROMPT_TEXT)],
                            "display": []
                        }
                        st.session_state.active_chat = new_id
                save_chats()
                st.rerun()

# ---------------- Active Chat ----------------
active_chat = st.session_state.chats[st.session_state.active_chat]

st.title("🧪 Chemistry Tutor")
st.caption(f"Class: {school_class} | Topic: {topic_filter} | Chat: {active_chat['title']}")

for item in active_chat["display"]:
    with st.chat_message("user"):
        st.write(item["question"])
    with st.chat_message("assistant"):
        data = item["data"]
        qtype = data.get("question_type", "concept")
        vtype = data.get("visual_type", "none")

        badge_class = f"badge-{qtype}" if qtype in ("concept", "calculation", "experiment", "refused") else "badge-concept"
        st.markdown(f'<span class="badge {badge_class}">{qtype.upper()}</span>', unsafe_allow_html=True)

        # Bug 2 and Bug 4 fix — refused questions show warning and nothing else
        if qtype == "refused":
            st.warning(f"🚫 {data.get('concept_explanation', 'I can only answer chemistry questions.')}")
        else:
            st.markdown(f"**📖 Explanation:** {data.get('concept_explanation', '')}")

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
                        st.write(f"{i}. {step}")
                if data.get("observations"):
                    st.markdown(f"**👀 Observations:** {data.get('observations')}")

            if vtype == "beaker" and data.get("beaker_stages"):
                components.html(build_beaker_html(data["beaker_stages"]), height=440)
            elif vtype == "atom" and data.get("atom_data"):
                components.html(build_atom_html(data["atom_data"]), height=380)
            elif vtype == "particle" and data.get("particle_data"):
                components.html(build_particle_html(data["particle_data"]), height=300)

            smiles = data.get("main_compound_smiles", "")
            if smiles:
                try:
                    mol = Chem.MolFromSmiles(smiles)
                    if mol:
                        img = Draw.MolToImage(mol, size=(350, 350))
                        st.image(img, caption=smiles)
                except Exception:
                    pass

            query = data.get("youtube_search_query", "")
            if query:
                st.markdown("**🎥 Reference Videos:**")
                try:
                    results = YoutubeSearch(query, max_results=3).to_dict()
                    if results:
                        cols = st.columns(len(results))
                        for col, vid in zip(cols, results):
                            with col:
                                st.video(f"https://www.youtube.com/watch?v={vid['id']}")
                                st.caption(vid.get("title", "")[:50])
                    else:
                        st.write("No videos found for this topic.")
                except Exception as e:
                    st.write(f"Error fetching videos: {e}")

# ---------------- Chat Input ----------------
user_input = st.chat_input("Ask a chemistry question...")

if user_input:
    # Bug 1 fix — ignore whitespace only input
    if not user_input.strip():
        st.stop()

    # Bug 3 fix — limit input length to 500 characters
    if len(user_input) > 500:
        st.warning("⚠️ Question too long. Please keep it under 500 characters.")
        st.stop()

    contextual_prompt = f"[Class: {school_class}, Topic focus: {topic_filter}] {user_input}"
    active_chat["messages"].append(HumanMessage(content=contextual_prompt))

    with st.spinner("Thinking..."):
        response = model.invoke(active_chat["messages"])

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

    active_chat["display"].append({"question": user_input, "data": data})

    if active_chat["title"] == "New Chat":
        active_chat["title"] = user_input[:30] + ("..." if len(user_input) > 30 else "")

    save_chats()
    st.rerun()