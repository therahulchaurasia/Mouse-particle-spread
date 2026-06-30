const stage = document.getElementById('stage');

const DISTANCE_MIN = 50;
const DISTANCE_MAX = 110;

let spawnInterval = null;

window.addEventListener('pointerdown', (e) => {
  const x = e.clientX;
  const y = e.clientY;

  spawnInterval = setInterval(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = DISTANCE_MIN + Math.random() * (DISTANCE_MAX - DISTANCE_MIN);
    const tx = x + Math.cos(angle) * distance;
    const ty = y + Math.sin(angle) * distance;

    const bx = (Math.random() * 2 - 1) * 25;
    const by = (Math.random() * 2 - 1) * 25;

    const scale = 0.5 + Math.random() * 1.3;

    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.setProperty('--x', `${x}px`);
    particle.style.setProperty('--y', `${y}px`);
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--bx', `${bx}px`);
    particle.style.setProperty('--by', `${by}px`);
    particle.style.setProperty('--scale', scale);

    const dot = document.createElement('div');
    dot.className = 'particle-dot';
    particle.appendChild(dot);

    stage.appendChild(particle);
  }, 50);
});

window.addEventListener('pointerup', () => {
  clearInterval(spawnInterval);
  spawnInterval = null;

  stage.querySelectorAll('.particle').forEach((p) => {
    const rect = p.getBoundingClientRect();
    const fx = rect.left + rect.width / 2;
    const fy = rect.top + rect.height / 2;

    p.style.setProperty('--fx', `${fx}px`);
    p.style.setProperty('--fy', `${fy}px`);
    p.classList.add('releasing');

    p.addEventListener('animationend', (e) => {
      if (e.animationName === 'fade') p.remove();
    });
  });
});
