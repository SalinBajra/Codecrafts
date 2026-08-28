(() => {
  const pageName = (location.pathname.split('/').filter(Boolean).pop() || 'index').replace(/\.html$/, '');
  const page = pageName === 'index' ? 'home' : pageName;
  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const text = (selector, value, root = document) => { const node = one(selector, root); if (node && value != null) node.textContent = value; };
  const el = (tag, className, value) => { const node = document.createElement(tag); if (className) node.className = className; if (value != null) node.textContent = value; return node; };
  const lines = (node, value) => {
    if (!node || value == null) return;
    node.replaceChildren();
    String(value).split('\n').forEach((line, index) => { if (index) node.append(document.createElement('br')); node.append(document.createTextNode(line)); });
  };
  const linkUrl = (value, fallback = '#') => /^(https?:\/\/|mailto:|\/|#)/i.test(String(value || '').trim()) ? String(value).trim() : fallback;
  const imageUrl = (value, fallback = '') => /^(https:\/\/|\/|assets\/)/i.test(String(value || '').trim()) ? String(value).trim() : fallback;
  const updateLink = (node, label, url) => {
    if (!node) return;
    const decorations = [...node.children].filter((child) => child.matches('svg,.external-mark,.action-plus') || child.getAttribute('aria-hidden') === 'true');
    const fallback = node.getAttribute('href') || '#';
    node.replaceChildren(document.createTextNode(label || ''));
    decorations.forEach((child) => node.append(' ', child));
    node.href = linkUrl(url, fallback);
  };

  function applySeo(content) {
    const seo = content.seo?.[page];
    if (!seo) return;
    if (seo.title) document.title = seo.title;
    [['meta[name="description"]', 'description'], ['meta[property="og:title"]', 'title'], ['meta[property="og:description"]', 'description'], ['meta[name="twitter:title"]', 'title'], ['meta[name="twitter:description"]', 'description']].forEach(([selector, key]) => {
      const node = one(selector); if (node && seo[key]) node.content = seo[key];
    });
  }

  function applyCommon(content) {
    const site = content.site || {};
    all('.brand b,.footer-brand b').forEach((node) => { if (site.brandName) node.textContent = site.brandName; });
    updateLink(one('.header-cta'), site.headerCtaLabel, site.headerCtaUrl);
    const footer = one('footer > p');
    if (footer) {
      text('strong', site.footerLineOne, footer); text('span', site.footerLineTwo, footer);
      const email = one('a', footer);
      if (email && site.email) { email.href = `mailto:${site.email}`; if (email.firstChild) email.firstChild.textContent = `${site.email} `; }
    }
  }

  function applyHome(home) {
    if (!home) return;
    text('.approved-hero h1 span', home.hero?.titleMain); text('.approved-hero h1 em', home.hero?.titleAccent); text('.approved-intro', home.hero?.description);
    const actions = all('.approved-actions a'); updateLink(actions[0], home.hero?.primaryLabel, home.hero?.primaryUrl); updateLink(actions[1], home.hero?.secondaryLabel, home.hero?.secondaryUrl);
    const device = one('.approved-device-composite');
    if (device) { device.src = imageUrl(home.hero?.deviceImage, device.getAttribute('src')); if (home.hero?.deviceAlt) device.alt = home.hero.deviceAlt; }
    text('.client-rail-copy strong', home.clients?.label); text('.client-rail-copy span', home.clients?.description);
    const clientGroup = one('.client-rail-group');
    if (clientGroup && Array.isArray(home.clients?.items)) {
      clientGroup.replaceChildren(...home.clients.items.map((client) => {
        const chip = el('div', `client-chip ${client.styleClass || ''}`.trim()); chip.setAttribute('role', 'listitem');
        const logo = el('span', 'client-logo'); const image = el('img'); image.src = imageUrl(client.image); image.alt = client.name || '';
        logo.append(image); chip.append(logo); return chip;
      }));
    }
    text('.client-path-head h2', home.problemSection?.title); text('.client-path-head p', home.problemSection?.description);
    const goals = one('.goal-grid');
    if (goals && Array.isArray(home.problemSection?.cards)) goals.replaceChildren(...home.problemSection.cards.map((card) => {
      const link = el('a'); link.href = linkUrl(card.url); link.append(el('span', '', card.eyebrow), el('h3', '', card.title), el('p', '', card.description), el('b', '', card.linkLabel)); return link;
    }));
    lines(one('.engagements-head h2'), home.engagements?.title);
    const engagements = one('.engagement-grid');
    if (engagements && Array.isArray(home.engagements?.cards)) engagements.replaceChildren(...home.engagements.cards.map((card, index) => {
      const link = el('a', `engagement-card ${index % 2 ? 'engagement-build' : 'engagement-direction'}`); link.href = linkUrl(card.url);
      const body = el('div'); body.append(el('p', '', card.eyebrow), el('h3', '', card.title), el('small', '', card.description)); link.append(body, el('b', '', card.linkLabel)); return link;
    }));
    const after = one('.after-launch-link');
    if (after) { after.href = linkUrl(home.engagements?.afterLaunchUrl, after.href); text('span', home.engagements?.afterLaunchEyebrow, after); text('strong', home.engagements?.afterLaunchTitle, after); }
    lines(one('.home-closing-copy h2'), home.closing?.title); text('.home-closing-copy span', home.closing?.description); updateLink(one('.home-closing .round-link'), home.closing?.buttonLabel, home.closing?.buttonUrl);
  }

  function applyIntro(intro) {
    const heading = one('.page-intro h1');
    if (heading && intro) { heading.replaceChildren(document.createTextNode(intro.titleMain || ''), document.createElement('br'), el('em', '', intro.titleAccent)); }
    text('.page-intro > p', intro?.description);
  }

  function applyWork(work) {
    if (!work) return;
    applyIntro(work.intro);
    const stack = one('.project-stack');
    if (stack && Array.isArray(work.projects)) stack.replaceChildren(...work.projects.map((project) => {
      const article = el('article', 'project reveal'); article.id = project.id || '';
      const imageLink = el('a', 'project-image'); imageLink.href = linkUrl(project.url); imageLink.target = '_blank'; imageLink.rel = 'noopener';
      const image = el('img'); image.src = imageUrl(project.image); image.alt = project.imageAlt || ''; image.loading = 'lazy'; image.decoding = 'async'; image.width = 1440; image.height = 900;
      const visit = el('span', '', project.visitLabel); const mark = el('i', 'external-mark'); mark.setAttribute('aria-hidden', 'true'); visit.append(' ', mark); imageLink.append(image, visit);
      const meta = el('div', 'project-meta'); const heading = el('div'); heading.append(el('span', '', project.category), el('h2', '', project.title));
      const summary = el('p'); summary.append(el('strong', '', 'Challenge:'), ` ${project.challenge || ''} `, el('strong', '', 'Response:'), ` ${project.response || ''}`);
      const tags = el('div', 'tags'); (project.tags || []).forEach((tag) => tags.append(el('span', '', tag))); meta.append(heading, summary, tags); article.append(imageLink, meta); return article;
    }));
    text('.closing > p', work.closing?.eyebrow);
    const heading = one('.closing h2'); if (heading) heading.replaceChildren(document.createTextNode(work.closing?.titleMain || ''), document.createElement('br'), el('em', '', work.closing?.titleAccent));
    updateLink(one('.closing .round-link'), work.closing?.buttonLabel, work.closing?.buttonUrl);
  }

  function applyServices(services) {
    if (!services) return;
    applyIntro(services.intro);
    const list = one('.detail-list');
    if (list && Array.isArray(services.items)) list.replaceChildren(...services.items.map((item) => {
      const article = el('article', 'reveal'); article.id = item.id || ''; const body = el('div'); body.append(el('h2', '', item.title), el('p', '', item.description));
      const bullets = el('ul'); (item.bullets || []).forEach((bullet) => bullets.append(el('li', '', bullet))); body.append(bullets); article.append(body); return article;
    }));
    text('.fit-panel h2', services.fit?.title); const fit = one('.fit-panel > ul'); if (fit) fit.replaceChildren(...(services.fit?.bullets || []).map((bullet) => el('li', '', bullet)));
    updateLink(one('.fit-panel .button'), services.fit?.buttonLabel, services.fit?.buttonUrl); text('.faq-intro h2', services.faq?.title); text('.faq-intro p', services.faq?.description);
    const faqs = one('.faq-list');
    if (faqs && Array.isArray(services.faq?.items)) faqs.replaceChildren(...services.faq.items.map((item) => {
      const details = el('details'); const summary = el('summary', '', item.question); const plus = el('span', '', '+'); plus.setAttribute('aria-hidden', 'true'); summary.append(plus); details.append(summary, el('p', '', item.answer)); return details;
    }));
  }

  function applyAbout(about) {
    if (!about) return;
    applyIntro(about.intro); text('.about-statement h2', about.statement);
    const values = one('.values'); if (values && Array.isArray(about.values)) values.replaceChildren(...about.values.map((value) => { const article = el('article', 'reveal'); article.append(el('h3', '', value.title), el('p', '', value.description)); return article; }));
    text('.about-invite p', about.inviteText); updateLink(one('.about-invite a'), about.inviteLabel, about.inviteUrl);
  }

  function applyContact(contact) {
    if (!contact) return;
    text('.contact-copy h1', contact.title); text('.contact-copy > p', contact.description); updateLink(one('.contact-copy .external-link'), contact.email, `mailto:${contact.email}`);
    const choices = one('select[name="service"]');
    if (choices && Array.isArray(contact.serviceOptions)) { const placeholder = el('option', '', 'Choose the closest option'); placeholder.value = ''; choices.replaceChildren(placeholder, ...contact.serviceOptions.map((value) => el('option', '', value))); }
    text('.contact-form button[type="submit"]', contact.submitLabel);
  }

  async function load() {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch('/api/content', { signal: controller.signal, headers: { accept: 'application/json' } });
      if (!response.ok) return;
      const content = await response.json(); applySeo(content); applyCommon(content);
      if (page === 'home') applyHome(content.home); if (page === 'work') applyWork(content.work); if (page === 'services') applyServices(content.services); if (page === 'about') applyAbout(content.about); if (page === 'contact') applyContact(content.contact);
      document.dispatchEvent(new CustomEvent('codecrafts:content-ready'));
    } catch (_) { /* Static HTML remains the resilient fallback. */ }
    finally { clearTimeout(timer); }
  }
  load();
})();
