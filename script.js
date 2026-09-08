const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('motion-ready');
// The public brand is CodeCraft. Set it immediately so the static shell never
// flashes the legacy plural name while CMS content is loading.
document.querySelectorAll('.brand b,.footer-brand b').forEach((node) => { node.textContent = 'CodeCraft'; });
// Footer content is owned by the CMS hydrator below. Do not write a legacy
// fallback here: doing so races the CMS request and can make stale content
// appear after a refresh when the request is slow or unavailable.
const footerNav = document.querySelector('footer > div:nth-of-type(2)');
if (footerNav && !document.querySelector('.footer-social')) {
  const social = document.createElement('div');
  social.className = 'footer-social';
  social.setAttribute('aria-label', 'Social media');
  social.innerHTML = '<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg></a><a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5ZM17.5 6.2a1.1 1.1 0 1 1-1.1 1.1 1.1 0 0 1 1.1-1.1Z"/></svg></a><a href="#" aria-label="WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.5-1.4A10 10 0 1 0 12 2Zm0 2a8 8 0 1 1-4.1 14.9l-.5-.3-2.9.7.8-2.8-.3-.5A8 8 0 0 1 12 4Zm-3 3.5c-.3 0-.7.1-.9.5-.3.4-1 1-1 2.4 0 1.4 1 2.8 1.1 3 .2.2 2 3.1 4.9 4.2 2.4.9 2.9.7 3.4.6.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.4-.2-.8-.4l-1.4-.7c-.4-.1-.6-.2-.9.2l-.6.8c-.2.2-.3.3-.7.1-.4-.2-1.1-.4-2-1.2-.7-.6-1.2-1.4-1.3-1.7-.1-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.5-.6-.8-.6H9Z"/></svg></a>';
  footerNav.append(social);
}
const closingSection = document.querySelector('.home-closing');
if (closingSection && !document.querySelector('.home-capabilities')) {
  const capabilities = document.createElement('section');
  capabilities.className = 'home-capabilities shell reveal';
  capabilities.setAttribute('aria-label', 'Additional CodeCraft capabilities');
  capabilities.innerHTML = '<p>Beyond the website</p><div><a href="/services#crm-systems"><strong>CRM systems</strong><span>Keep leads and follow-ups moving.</span></a><a href="/services#ai-agents"><strong>AI agents</strong><span>Handle repetitive enquiries with care.</span></a></div>';
  closingSection.before(capabilities);
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
document.addEventListener('codecrafts:content-ready', () => {
  document.querySelectorAll('.reveal:not(.visible)').forEach((node) => observer.observe(node));
});

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
