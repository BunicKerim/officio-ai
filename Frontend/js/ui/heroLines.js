export function initHeroLines(canvasId = "appHeroLines") {

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let mouse = { x: null, y: null };

  function resize() {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  const POINT_COUNT = 95;
  const MAX_DISTANCE = 150;
  
  const points = [];

  function getSafeArea() {
    const content =
      document.querySelector(".hero-container") ||
      document.querySelector(".header-inner");

    if (!content) return null;

    const rect = content.getBoundingClientRect();
    const parentRect = canvas.parentElement.getBoundingClientRect();

    return {
      x: rect.left - parentRect.left - 150,
      y: rect.top - parentRect.top - 150,
      width: rect.width + 300,
      height: rect.height + 300
    };
  }

  function isInsideSafeArea(x, y, safe) {
    if (!safe) return false;
    return (
      x > safe.x &&
      x < safe.x + safe.width &&
      y > safe.y &&
      y < safe.y + safe.height
    );
  }

  // Punkte mit Tiefenebene (z)
  for (let i = 0; i < POINT_COUNT; i++) {
    points.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      z: Math.random() // depth factor
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const safeArea = getSafeArea();

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];

      p1.x += p1.vx * (0.6 + p1.z);
      p1.y += p1.vy * (0.6 + p1.z);

      if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
      if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

      // Maus Parallax
      if (mouse.x && mouse.y) {
        const dx = mouse.x - p1.x;
        const dy = mouse.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          p1.x -= dx * 0.003 * p1.z;
          p1.y -= dy * 0.003 * p1.z;
        }
      }

      if (isInsideSafeArea(p1.x, p1.y, safeArea)) continue;

      // Glow Punkt
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 2.5 + p1.z * 2, 0, Math.PI * 2);

      ctx.fillStyle = `rgba(255,255,255,${0.7 + p1.z * 0.3})`;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(139,92,246,0.8)";
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];

        if (isInsideSafeArea(p2.x, p2.y, safeArea)) continue;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MAX_DISTANCE) {

          const gradient = ctx.createLinearGradient(
            p1.x, p1.y, p2.x, p2.y
          );

          gradient.addColorStop(0, "rgba(139,92,246,0.6)");
          gradient.addColorStop(1, "rgba(99,102,241,0.4)");

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.2 + p1.z;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}
