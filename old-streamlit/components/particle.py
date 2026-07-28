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