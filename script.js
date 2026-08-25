const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const footerCopy = document.querySelector('footer > p');
if (footerCopy) {
  footerCopy.innerHTML = '<strong>Direct from idea to launch.</strong><span>Strategy, design and development stay with the same small team.</span><a href="mailto:hello@codecrafts.studio">hello@codecrafts.studio <b aria-hidden="true">↗</b></a><small>Based in Nepal · working worldwide</small>';
}

const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.prepend(progress);

let scrollFrame = 0;
const updateProgress = () => {
  const distance = document.documentElement.scrollHeight - innerHeight;
  const amount = distance > 0 ? Math.min(scrollY / distance, 1) : 0;
  progress.style.transform = `scaleX(${amount})`;
  scrollFrame = 0;
};
addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
}, { passive: true });
updateProgress();

if (matchMedia('(pointer: fine)').matches && !reducedMotion) {
  const halo = document.createElement('div');
  halo.className = 'pointer-halo';
  halo.setAttribute('aria-hidden', 'true');
  document.body.append(halo);

  addEventListener('pointermove', (event) => {
    document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
  }, { passive: true });

  document.querySelectorAll('.button,.header-cta,.round-link,.text-link').forEach((target) => {
    target.addEventListener('pointermove', (event) => {
      const bounds = target.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      target.style.transform = `translate3d(${x * .09}px,${y * .14}px,0)`;
    });
    target.addEventListener('pointerleave', () => { target.style.transform = ''; });
  });

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
  const goalServices = { clarity: 'Website strategy & design', enquiries: 'Complete website', commerce: 'E-commerce' };
  if (goalServices[goal]) serviceSelect.value = goalServices[goal];
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

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
