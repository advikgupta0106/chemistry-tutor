import json

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