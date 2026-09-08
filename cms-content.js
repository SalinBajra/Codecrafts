(() => {
  const pageName = (location.pathname.split('/').filter(Boolean).pop() || 'index').replace(/\.html$/, '');
  const page = pageName === 'index' ? 'home' : pageName;
  const brandCopy = (value) => value == null ? value : String(value).replace(/\bCodeCrafts\b/g, 'CodeCraft');
  const serviceAdditions = [
    { id: 'crm-systems', title: 'Organise the work behind it.', description: 'A CRM shaped around your team, so enquiries, projects and follow-ups do not disappear between tools.', bullets: ['Lead capture and pipeline design', 'Follow-up and handover workflows', 'Email, calendar and form connections'] },
    { id: 'ai-agents', title: 'Put repetitive work on autopilot.', description: 'Practical AI agents for enquiries, calls and internal workflows—with a clear human handoff when judgment matters.', bullets: ['Website and WhatsApp enquiry agents', 'Voice agents for inbound calls', 'Lead qualification and appointment booking', 'Monitoring, refinement and safe escalation'] }
  ];
  const one = (selector, root = document) => root.querySelector(selector);
  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const mark = (node, path) => { if (node && path) node.dataset.cmsPath = path; return node; };
  const text = (selector, value, root = document, path = '') => { const node = one(selector, root); if (node && value != null) node.textContent = value; mark(node, path); };
  const el = (tag, className, value) => { const node = document.createElement(tag); if (className) node.className = className; if (value != null) node.textContent = value; return node; };
  const lines = (node, value) => {
    if (!node || value == null) return;
    node.replaceChildren();
    String(value).split('\n').forEach((line, index) => { if (index) node.append(document.createElement('br')); node.append(document.createTextNode(line)); });
  };
  const linkUrl = (value, fallback = '#') => /^(https?:\/\/|mailto:|\/|#)/i.test(String(value || '').trim()) ? String(value).trim() : fallback;
  const imageUrl = (value, fallback = '') => /^(https:\/\/|\/|assets\/)/i.test(String(value || '').trim()) ? String(value).trim() : fallback;
  const updateLink = (node, label, url, path = '') => {
    if (!node) return;
    const decorations = [...node.children].filter((child) => child.matches('svg,.external-mark,.action-plus') || child.getAttribute('aria-hidden') === 'true');
    const fallback = node.getAttribute('href') || '#';
    node.replaceChildren(document.createTextNode(label || ''));
    decorations.forEach((child) => node.append(' ', child));
    node.href = linkUrl(url, fallback);
    mark(node, path);
  };

  function normalizeBrand() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(node.parentElement.tagName)) continue;
      nodes.push(node);
    }
    nodes.forEach((node) => { node.nodeValue = node.nodeValue.replace(/\bCodeCrafts\b/g, 'CodeCraft'); });
    document.querySelectorAll('[title],[alt],meta[content]').forEach((node) => {
      ['title','alt','content'].forEach((attribute) => {
        if (node.hasAttribute(attribute)) node.setAttribute(attribute, node.getAttribute(attribute).replace(/\bCodeCrafts\b/g, 'CodeCraft'));
      });
    });
    document.title = document.title.replace(/\bCodeCrafts\b/g, 'CodeCraft');
  }

  function applySeo(content) {
    const seo = content.seo?.[page];
    if (!seo) return;
    if (seo.title) document.title = brandCopy(seo.title);
    [['meta[name="description"]', 'description'], ['meta[property="og:title"]', 'title'], ['meta[property="og:description"]', 'description'], ['meta[name="twitter:title"]', 'title'], ['meta[name="twitter:description"]', 'description']].forEach(([selector, key]) => {
      const node = one(selector); if (node && seo[key]) node.content = brandCopy(seo[key]);
    });
  }

  function applyCommon(content) {
    const site = content.site || {};
    // The public brand is fixed as CodeCraft. Do not let legacy CMS data
    // restore the old plural name after a refresh.
    updateLink(one('.header-cta'), brandCopy(site.headerCtaLabel), site.headerCtaUrl, 'site.headerCtaLabel');
    // Footer copy is intentionally static and is not controlled by the CMS.
  }

  function applyHome(home) {
    if (!home) return;
    text('.approved-hero h1 span', home.hero?.titleMain, document, 'home.hero.titleMain'); text('.approved-hero h1 em', home.hero?.titleAccent, document, 'home.hero.titleAccent'); text('.approved-intro', brandCopy(home.hero?.description), document, 'home.hero.description');
    const actions = all('.approved-actions a'); updateLink(actions[0], home.hero?.primaryLabel, home.hero?.primaryUrl, 'home.hero.primaryLabel'); updateLink(actions[1], home.hero?.secondaryLabel, home.hero?.secondaryUrl, 'home.hero.secondaryLabel');
    const device = one('.approved-device-composite');
    if (device) { device.src = imageUrl(home.hero?.deviceImage, device.getAttribute('src')); if (home.hero?.deviceAlt) device.alt = home.hero.deviceAlt; mark(device, 'home.hero.deviceImage'); }
    text('.client-rail-copy strong', home.clients?.label, document, 'home.clients.label'); text('.client-rail-copy span', home.clients?.description, document, 'home.clients.description');
    const clientGroup = one('.client-rail-group');
    if (clientGroup && Array.isArray(home.clients?.items)) {
      clientGroup.replaceChildren(...home.clients.items.map((client, index) => {
        const chip = el('div', `client-chip ${client.styleClass || ''}`.trim()); chip.setAttribute('role', 'listitem');
        const logo = el('span', 'client-logo'); const image = el('img'); image.src = imageUrl(client.image); image.alt = client.name || '';
        logo.append(image); chip.append(logo); mark(chip, `home.clients.items.${index}.image`); return chip;
      }));
    }
    text('.client-path-head h2', home.problemSection?.title, document, 'home.problemSection.title'); text('.client-path-head p', home.problemSection?.description, document, 'home.problemSection.description');
    const goals = one('.goal-grid');
    if (goals && Array.isArray(home.problemSection?.cards)) goals.replaceChildren(...home.problemSection.cards.map((card, index) => {
      const link = el('a'); link.href = linkUrl(card.url); link.append(el('span', '', card.eyebrow), el('h3', '', card.title), el('p', '', card.description), el('b', '', card.linkLabel)); mark(link, `home.problemSection.cards.${index}`); return link;
    }));
    lines(mark(one('.engagements-head h2'), 'home.engagements.title'), home.engagements?.title);
    const engagements = one('.engagement-grid');
    if (engagements && Array.isArray(home.engagements?.cards)) engagements.replaceChildren(...home.engagements.cards.map((card, index) => {
      const link = el('a', `engagement-card ${index % 2 ? 'engagement-build' : 'engagement-direction'}`); link.href = linkUrl(card.url);
      const body = el('div'); body.append(el('p', '', card.eyebrow), el('h3', '', card.title), el('small', '', card.description)); link.append(body, el('b', '', card.linkLabel)); mark(link, `home.engagements.cards.${index}`); return link;
    }));
    const after = one('.after-launch-link');
    if (after) { after.href = linkUrl(home.engagements?.afterLaunchUrl, after.href); text('span', home.engagements?.afterLaunchEyebrow, after, 'home.engagements.afterLaunchEyebrow'); text('strong', home.engagements?.afterLaunchTitle, after, 'home.engagements.afterLaunchTitle'); mark(after, 'home.engagements'); }
    lines(mark(one('.home-closing-copy h2'), 'home.closing.title'), home.closing?.title); text('.home-closing-copy span', home.closing?.description, document, 'home.closing.description'); updateLink(one('.home-closing .round-link'), home.closing?.buttonLabel, home.closing?.buttonUrl, 'home.closing.buttonLabel');
  }

  function applyIntro(intro, basePath) {
    const heading = one('.page-intro h1');
    if (heading && intro) { heading.replaceChildren(document.createTextNode(intro.titleMain || ''), document.createElement('br'), el('em', '', intro.titleAccent)); mark(heading, `${basePath}.titleMain`); mark(one('em', heading), `${basePath}.titleAccent`); }
    text('.page-intro > p', brandCopy(intro?.description), document, `${basePath}.description`);
  }

  function applyWork(work) {
    if (!work) return;
    applyIntro(work.intro, 'work.intro');
    const stack = one('.project-stack');
    if (stack && Array.isArray(work.projects)) stack.replaceChildren(...work.projects.map((project, index) => {
      const article = el('article', 'project reveal'); article.id = project.id || '';
      const imageLink = el('a', 'project-image'); imageLink.href = linkUrl(project.url); imageLink.target = '_blank'; imageLink.rel = 'noopener';
      const image = el('img'); image.src = imageUrl(project.image); image.alt = project.imageAlt || ''; image.loading = 'lazy'; image.decoding = 'async'; image.width = 1440; image.height = 900;
      const visit = el('span', '', project.visitLabel); const mark = el('i', 'external-mark'); mark.setAttribute('aria-hidden', 'true'); visit.append(' ', mark); imageLink.append(image, visit);
      const meta = el('div', 'project-meta'); const heading = el('div'); heading.append(el('span', '', project.category), el('h2', '', project.title));
      const summary = el('p'); summary.append(el('strong', '', 'Challenge:'), ` ${project.challenge || ''} `, el('strong', '', 'Response:'), ` ${project.response || ''}`);
      const tags = el('div', 'tags'); (project.tags || []).forEach((tag) => tags.append(el('span', '', tag))); meta.append(heading, summary, tags); article.append(imageLink, meta); mark(article, `work.projects.${index}`); return article;
    }));
    text('.closing > p', brandCopy(work.closing?.eyebrow), document, 'work.closing.eyebrow');
    const heading = one('.closing h2'); if (heading) heading.replaceChildren(document.createTextNode(work.closing?.titleMain || ''), document.createElement('br'), el('em', '', work.closing?.titleAccent));
    mark(heading, 'work.closing.titleMain'); updateLink(one('.closing .round-link'), work.closing?.buttonLabel, work.closing?.buttonUrl, 'work.closing.buttonLabel');
  }

  function applyServices(services) {
    if (!services) return;
    applyIntro(services.intro, 'services.intro');
    const list = one('.detail-list');
    const serviceItems = [...(Array.isArray(services.items) ? services.items : [])];
    serviceAdditions.forEach((addition) => { if (!serviceItems.some((item) => item.id === addition.id)) serviceItems.push(addition); });
    const coreItems = serviceItems.filter((item) => !['crm-systems', 'ai-agents'].includes(item.id));
    const featuredItems = serviceItems.filter((item) => ['crm-systems', 'ai-agents'].includes(item.id));
    const featured = one('.featured-services-grid');
    if (featured) featured.replaceChildren(...featuredItems.map((item, index) => {
      const article = el('article', `featured-service ${item.id || ''}`.trim());
      article.id = `featured-${item.id || index}`;
      article.append(el('span', 'featured-service-kicker', item.id === 'crm-systems' ? 'CRM systems' : 'AI agents'), el('h2', '', brandCopy(item.title)), el('p', '', brandCopy(item.description)));
      const bullets = el('ul'); (item.bullets || []).slice(0, 3).forEach((bullet) => bullets.append(el('li', '', brandCopy(bullet))));
      article.append(bullets); mark(article, `services.items.${serviceItems.indexOf(item)}`); return article;
    }));
    if (list) list.replaceChildren(...coreItems.map((item, index) => {
      const article = el('article', 'reveal'); article.id = item.id || ''; const body = el('div'); body.append(el('h2', '', brandCopy(item.title)), el('p', '', brandCopy(item.description)));
      const bullets = el('ul'); (item.bullets || []).forEach((bullet) => bullets.append(el('li', '', brandCopy(bullet)))); body.append(bullets); article.append(body); mark(article, `services.items.${index}`); return article;
    }));
    text('.fit-panel h2', brandCopy(services.fit?.title), document, 'services.fit.title'); const fit = one('.fit-panel > ul'); if (fit) { fit.replaceChildren(...(services.fit?.bullets || []).map((bullet) => el('li', '', brandCopy(bullet)))); mark(fit, 'services.fit.bullets'); }
    updateLink(one('.fit-panel .button'), brandCopy(services.fit?.buttonLabel), services.fit?.buttonUrl, 'services.fit.buttonLabel'); text('.faq-intro h2', brandCopy(services.faq?.title), document, 'services.faq.title'); text('.faq-intro p', brandCopy(services.faq?.description), document, 'services.faq.description');
    const faqs = one('.faq-list');
    if (faqs && Array.isArray(services.faq?.items)) faqs.replaceChildren(...services.faq.items.map((item, index) => {
      const details = el('details'); const summary = el('summary', '', brandCopy(item.question)); const plus = el('span', '', '+'); plus.setAttribute('aria-hidden', 'true'); summary.append(plus); details.append(summary, el('p', '', brandCopy(item.answer))); mark(details, `services.faq.items.${index}`); return details;
    }));
  }

  function applyAbout(about) {
    if (!about) return;
    applyIntro(about.intro, 'about.intro'); text('.about-statement h2', brandCopy(about.statement), document, 'about.statement');
    const values = one('.values'); if (values && Array.isArray(about.values)) values.replaceChildren(...about.values.map((value, index) => { const article = el('article', 'reveal'); article.append(el('h3', '', value.title), el('p', '', value.description)); mark(article, `about.values.${index}`); return article; }));
    text('.about-invite p', brandCopy(about.inviteText), document, 'about.inviteText'); updateLink(one('.about-invite a'), brandCopy(about.inviteLabel), about.inviteUrl, 'about.inviteLabel');
  }

  function applyContact(contact) {
    if (!contact) return;
    text('.contact-copy h1', brandCopy(contact.title), document, 'contact.title'); text('.contact-copy > p', brandCopy(contact.description), document, 'contact.description'); updateLink(one('.contact-copy .external-link'), contact.email, `mailto:${contact.email}`, 'contact.email');
    const choices = one('select[name="service"]');
    if (choices && Array.isArray(contact.serviceOptions)) { const placeholder = el('option', '', 'Choose the closest option'); placeholder.value = ''; choices.replaceChildren(placeholder, ...contact.serviceOptions.map((value) => el('option', '', value))); }
    text('.contact-form button[type="submit"]', contact.submitLabel, document, 'contact.submitLabel');
  }

  function applyContent(content) {
    applySeo(content); applyCommon(content); normalizeBrand();
    if (page === 'home') applyHome(content.home); if (page === 'work') applyWork(content.work); if (page === 'services') applyServices(content.services); if (page === 'about') applyAbout(content.about); if (page === 'contact') applyContact(content.contact);
    document.documentElement.classList.remove('cms-loading');
    document.dispatchEvent(new CustomEvent('codecrafts:content-ready'));
  }

  function enableCmsLocator() {
    if (document.documentElement.dataset.cmsLocator === 'on') return;
    document.documentElement.dataset.cmsLocator = 'on';
    const style = document.createElement('style');
    style.textContent = `[data-cms-locator="on"] [data-cms-path]{cursor:pointer!important;transition:outline-color .15s,box-shadow .15s}[data-cms-locator="on"] [data-cms-path]:hover{outline:2px solid #7954ff!important;outline-offset:4px;box-shadow:0 0 0 7px rgba(121,84,255,.12)!important}`;
    document.head.append(style);
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-cms-path]');
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      window.parent.postMessage({ type: 'codecrafts:cms-locate', path: target.dataset.cmsPath }, location.origin);
    }, true);
  }

  async function load() {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch(`/api/content?v=${Date.now()}`, { cache: 'no-store', signal: controller.signal, headers: { accept: 'application/json', 'cache-control': 'no-cache' } });
      if (!response.ok) return;
      applyContent(await response.json());
    } catch (_) { /* Static HTML remains the resilient fallback. */ }
    finally { clearTimeout(timer); document.documentElement.classList.remove('cms-loading'); }
  }
  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin || event.data?.type !== 'codecrafts:cms-preview' || !event.data.content) return;
    enableCmsLocator();
    applyContent(event.data.content);
  });
  load();
})();
