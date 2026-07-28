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