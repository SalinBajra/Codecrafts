const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('motion-ready');
const footerCopy = document.querySelector('footer > p');
if (footerCopy) {
  footerCopy.innerHTML = '<strong>Clear thinking. Distinct websites.</strong><span>Strategy, design and development with one accountable team in Nepal.</span><a href="mailto:hello@codecrafts.studio">hello@codecrafts.studio <b aria-hidden="true">↗︎</b></a><small>Based in Nepal · working worldwide</small>';
}

if (matchMedia('(pointer: fine)').matches && !reducedMotion) {
  document.querySelectorAll('.project-image').forEach((project) => {
    project.addEventListener('pointermove', (event) => {
      const bounds = project.getBoundingClientRect();
      project.style.setProperty('--project-x', `${event.clientX - bounds.left}px`);
      project.style.setProperty('--project-y', `${event.clientY - bounds.top}px`);
      project.classList.add('is-active');
    });
    project.addEventListener('pointerleave', () => project.classList.remove('is-active'));
  });
}

if (nav) {
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.type = 'button';
  themeToggle.innerHTML = '<span class="bulb-fixture" aria-hidden="true"><svg class="bulb-svg" viewBox="0 0 48 66" focusable="false"><path class="bulb-cap" d="M18 5c0-3 12-3 12 0v3H18z"/><path class="bulb-holder" d="M15 8h18l-2 14H17z"/><path class="bulb-threads" d="M16 11h16M16 15h16M17 19h14"/><rect class="bulb-collar" x="14" y="21" width="20" height="5" rx="2.5"/><path class="bulb-envelope" d="M18 25c-6 3-9 9-8 17 1 10 7 18 14 19 7-1 13-9 14-19 1-8-2-14-8-17z"/><path class="bulb-supports" d="M18 51l2-15M30 51l-2-15M20 40q4 6 8 0"/><path class="bulb-highlight" d="M15 34c-2 5-1 11 2 15"/></svg></span><span class="theme-label"></span>';
  document.querySelector('.site-header')?.append(themeToggle);

  const applyThemeLabel = () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeToggle.querySelector('.theme-label').textContent = dark ? 'Pull for light' : 'Pull for dark';
    themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = dark ? '#0e0e11' : '#f6f5f2';
  };
  applyThemeLabel();

  themeToggle.addEventListener('click', () => {
    themeToggle.classList.remove('is-pulled');
    void themeToggle.offsetWidth;
    themeToggle.classList.add('is-pulled');
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('codecrafts-theme', next); } catch {}
    applyThemeLabel();
    window.dispatchEvent(new CustomEvent('codecrafts:theme', { detail: { theme: next } }));
    setTimeout(() => themeToggle.classList.remove('is-pulled'), 520);
  });
}

if (menu && nav) {
  const setMenuState = (open) => {
    const isMobile = innerWidth <= 720;
    const isOpen = isMobile && open;
    menu.setAttribute('aria-expanded', String(isOpen));
    nav.classList.toggle('open', isOpen);
    nav.inert = isMobile && !isOpen;
  };
  const closeMenu = () => setMenuState(false);
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    setMenuState(!open);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menu.focus();
    }
  });
  addEventListener('resize', () => {
    setMenuState(false);
  }, { passive: true });
  closeMenu();
}

document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

const goal = new URLSearchParams(location.search).get('goal');
const serviceSelect = document.querySelector('select[name="service"]');
if (goal && serviceSelect) {
  const goalServices = { review: 'Website clarity review', clarity: 'Website direction', credibility: 'Complete website', action: 'Complete website', enquiries: 'Complete website', commerce: 'E-commerce' };
  if (goalServices[goal]) serviceSelect.value = goalServices[goal];
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

const art = document.querySelector('.hero-art');
if (art && matchMedia('(pointer:fine)').matches && !reducedMotion) {
  const cards = [...art.querySelectorAll('.concept-card')];
  art.addEventListener('pointermove', (event) => {
    const bounds = art.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    cards.forEach((card, index) => {
      const depth = (index + 1) * 5;
      card.style.marginLeft = `${x * depth}px`;
      card.style.marginTop = `${y * depth}px`;
    });
  });
  art.addEventListener('pointerleave', () => cards.forEach((card) => {
    card.style.marginLeft = '';
    card.style.marginTop = '';
  }));
}

const hero = document.querySelector('.hero');
if (hero && art && !reducedMotion) {
  const cards = [...art.querySelectorAll('.concept-card')];
  let heroFrame = 0;
  const updateHeroMotion = () => {
    const bounds = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(bounds.height * .72, 1)));
    const movements = [[-18, -18], [0, -34], [18, -14]];
    cards.forEach((card, index) => {
      const [x, y] = movements[index] || [0, -20];
      card.style.translate = `${x * progress}px ${y * progress}px`;
      card.style.scale = `${1 - progress * .018}`;
    });
    art.style.setProperty('--hero-exit', progress.toFixed(3));
    heroFrame = 0;
  };
  addEventListener('scroll', () => {
    if (!heroFrame) heroFrame = requestAnimationFrame(updateHeroMotion);
  }, { passive: true });
  updateHeroMotion();
}

// Homepage network: elastic points pull their connections into a quiet web.
const heroWeb = document.querySelector('.hero-web');
if (heroWeb) {
  const context = heroWeb.getContext('2d');
  const heroSection = heroWeb.closest('.hero');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0, active: false };
  let webNodes = [];
  let webWidth = 0;
  let webHeight = 0;
  let webDpr = 1;
  let webFrame = 0;
  let webVisible = true;

  const seed = (index, offset = 0) => {
    const value = Math.sin((index + 1) * 9283.17 + offset * 74.31) * 43758.5453;
    return value - Math.floor(value);
  };

  const buildWeb = () => {
    if (webFrame) {
      cancelAnimationFrame(webFrame);
      webFrame = 0;
    }
    const bounds = heroWeb.getBoundingClientRect();
    webWidth = Math.max(1, bounds.width);
    webHeight = Math.max(1, bounds.height);
    webDpr = Math.min(devicePixelRatio || 1, 1.6);
    heroWeb.width = Math.round(webWidth * webDpr);
    heroWeb.height = Math.round(webHeight * webDpr);
    context.setTransform(webDpr, 0, 0, webDpr, 0, 0);
    const count = webWidth < 720 ? 10 : 18;
    webNodes = Array.from({ length: count }, (_, index) => {
      const x = (.04 + seed(index) * .92) * webWidth;
      const y = (.08 + seed(index, 2) * .84) * webHeight;
      return {
        baseX: x,
        baseY: y,
        x,
        y,
        radius: 1.7 + seed(index, 4) * 2.2,
        phase: seed(index, 7) * Math.PI * 2,
        drift: 4 + seed(index, 9) * 10
      };
    });
    drawWeb(performance.now());
  };

  const drawWeb = (time) => {
    context.clearRect(0, 0, webWidth, webHeight);
    const dark = document.documentElement.dataset.theme === 'dark';
    const lineColor = dark ? '155,132,255' : '102,72,224';
    const nodeColor = dark ? '188,173,255' : '113,78,244';
    const influence = Math.min(255, webWidth * .24);

    webNodes.forEach((node, index) => {
      const idleX = Math.sin(time * .00022 + node.phase) * node.drift;
      const idleY = Math.cos(time * .00018 + node.phase * 1.3) * node.drift * .62;
      let targetX = node.baseX + idleX;
      let targetY = node.baseY + idleY;
      if (pointer.active) {
        const dx = pointer.x - targetX;
        const dy = pointer.y - targetY;
        const distance = Math.hypot(dx, dy);
        if (distance < influence) {
          const pull = Math.pow(1 - distance / influence, 2) * (index % 3 === 0 ? .34 : .2);
          targetX += dx * pull;
          targetY += dy * pull;
        }
      }
      node.x += (targetX - node.x) * .055;
      node.y += (targetY - node.y) * .055;
    });

    const points = pointer.active
      ? [...webNodes, { x: pointer.x, y: pointer.y, radius: 2.4, pointer: true }]
      : webNodes;
    const linkRange = Math.min(360, Math.max(220, webWidth * .28));

    for (let first = 0; first < points.length; first += 1) {
      for (let second = first + 1; second < points.length; second += 1) {
        const a = points[first];
        const b = points[second];
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        if (distance > linkRange) continue;
        const strength = (1 - distance / linkRange) * (a.pointer || b.pointer ? .34 : .2);
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const bend = Math.sin(time * .00035 + first * 1.7 + second) * Math.min(13, distance * .045);
        const normalX = distance ? -(b.y - a.y) / distance : 0;
        const normalY = distance ? (b.x - a.x) / distance : 0;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.quadraticCurveTo(midX + normalX * bend, midY + normalY * bend, b.x, b.y);
        context.strokeStyle = `rgba(${lineColor},${strength})`;
        context.lineWidth = a.pointer || b.pointer ? 1.15 : .78;
        context.stroke();
      }
    }

    points.forEach((node) => {
      const glow = context.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 5.5);
      glow.addColorStop(0, `rgba(${nodeColor},${node.pointer ? .42 : .34})`);
      glow.addColorStop(1, `rgba(${nodeColor},0)`);
      context.fillStyle = glow;
      context.beginPath();
      context.arc(node.x, node.y, node.radius * 5.5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = `rgba(${nodeColor},${node.pointer ? .84 : .62})`;
      context.beginPath();
      context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      context.fill();
    });

    if (!still && webVisible) webFrame = requestAnimationFrame(drawWeb);
  };

  heroSection.addEventListener('pointermove', (event) => {
    const bounds = heroWeb.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    pointer.active = true;
  }, { passive: true });
  heroSection.addEventListener('pointerleave', () => { pointer.active = false; });

  new ResizeObserver(buildWeb).observe(heroWeb);
  new IntersectionObserver(([entry]) => {
    webVisible = entry.isIntersecting;
    if (webVisible && !still && !webFrame) webFrame = requestAnimationFrame(drawWeb);
    if (!webVisible && webFrame) {
      cancelAnimationFrame(webFrame);
      webFrame = 0;
    }
  }).observe(heroSection);
}

const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button');
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to send');
      form.reset();
      status.textContent = 'Thank you — we’ll be in touch shortly.';
    } catch (error) {
      status.textContent = error.message || 'Something went wrong. Please email hello@codecrafts.studio.';
    } finally {
      button.disabled = false;
    }
  });
}
