export function initHeaderNetwork(canvasId = "globalNetwork") {

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  /* ================= RESIZE ================= */

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  /* ================= CONFIG ================= */

  const COUNT = 80;          // Mehr Punkte = dichter
  const MAX_DIST = 170;      // Mehr Verbindungen

  const points = [];

  for (let i = 0; i < COUNT; i++) {
    points.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    });
  }

  /* ================= ANIMATION ================= */

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];

      p1.x += p1.vx;
      p1.y += p1.vy;

      if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
      if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

      /* ---- Punkte ---- */

      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill();

      /* ---- Linien ---- */

      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {

          const opacity = 1 - dist / MAX_DIST;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          ctx.strokeStyle = `rgba(255,255,255,${opacity * 0.35})`;
          ctx.lineWidth = 1.2;

          /* Glow */
          ctx.shadowBlur = 0;
          ctx.shadowColor = "rgba(255,255,255,0.4)";

          ctx.stroke();

          ctx.shadowBlur = 0;
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}
