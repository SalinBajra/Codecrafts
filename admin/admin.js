(() => {
  const sections = [
    ['site', 'General'], ['home', 'Homepage'], ['work', 'Work'], ['services', 'Services'],
    ['about', 'About'], ['contact', 'Contact'], ['seo', 'SEO']
  ];
  const descriptions = {
    site: 'Shared brand, header and footer content', home: 'Homepage copy, links and imagery',
    work: 'Portfolio introduction, projects and closing CTA', services: 'Service offers, fit criteria and FAQs',
    about: 'Studio story, values and invitation', contact: 'Contact introduction and form choices',
    seo: 'Search titles and descriptions for every page'
  };
  const labels = {
    titleMain: 'Main title', titleAccent: 'Accent title', description: 'Description', primaryLabel: 'Primary button label',
    primaryUrl: 'Primary button URL', secondaryLabel: 'Secondary button label', secondaryUrl: 'Secondary button URL',
    deviceImage: 'Device image path', deviceAlt: 'Device image alt text', updatedAt: 'Last updated',
    brandName: 'Brand name', headerCtaLabel: 'Header button label', headerCtaUrl: 'Header button URL',
    footerLineOne: 'Footer line one', footerLineTwo: 'Footer line two', afterLaunchEyebrow: 'After-launch label',
    afterLaunchTitle: 'After-launch title', afterLaunchUrl: 'After-launch URL', linkLabel: 'Link label',
    buttonLabel: 'Button label', buttonUrl: 'Button URL', imageAlt: 'Image alt text', visitLabel: 'Visit link label',
    submitLabel: 'Submit button label', serviceOptions: 'Service options', inviteText: 'Invitation text',
    inviteLabel: 'Invitation link label', inviteUrl: 'Invitation URL'
  };

  const loginView = document.querySelector('#login-view');
  const app = document.querySelector('#cms-app');
  const loginForm = document.querySelector('#login-form');
  const loginMessage = document.querySelector('#login-message');
  const nav = document.querySelector('#cms-nav');
  const editor = document.querySelector('#editor');
  const sectionTitle = document.querySelector('#section-title');
  const sectionEyebrow = document.querySelector('#section-eyebrow');
  const publishButton = document.querySelector('#publish-button');
  const saveState = document.querySelector('#save-state');
  const notice = document.querySelector('#cms-notice');
  const loadingTemplate = document.querySelector('#loading-template');
  const previewFrame = document.querySelector('#preview-frame');
  const openPreview = document.querySelector('#open-preview');
  const mobilePreviewButton = document.querySelector('#mobile-preview-button');
  const previewClose = document.querySelector('#preview-close');
  const previewCanvas = document.querySelector('.preview-canvas');
  let content = null;
  const routeSection = location.pathname.split('/').filter(Boolean).pop();
  let activeSection = sections.some(([key]) => key === routeSection) ? routeSection : 'site';
  let dirty = false;
  let previewTimer = 0;
  const previewPages = { site: '/', home: '/', work: '/work', services: '/services', about: '/about', contact: '/contact', seo: '/' };

  const friendly = (key) => labels[key] || String(key).replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ').trim();
  const pathString = (path) => path.join('.');
  const get = (path) => path.reduce((value, key) => value?.[key], content);
  const set = (path, value) => {
    const parent = path.slice(0, -1).reduce((object, key) => object[key], content);
    parent[path[path.length - 1]] = value;
    markDirty();
  };
  const escape = (value) => String(value).replace(/[&<>'"]/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));

  function markDirty() {
    dirty = true;
    publishButton.disabled = false;
    saveState.textContent = 'Unpublished changes';
    saveState.className = 'save-state dirty';
    clearTimeout(previewTimer);
    previewTimer = setTimeout(sendPreview, 120);
  }

  function sendPreview() {
    if (!content || !previewFrame?.contentWindow) return;
    previewFrame.contentWindow.postMessage({ type: 'codecrafts:cms-preview', content }, location.origin);
  }

  function updatePreviewPage() {
    if (!previewFrame) return;
    const path = previewPages[activeSection] || '/';
    openPreview.href = path;
    if (previewFrame.getAttribute('src') !== path) previewFrame.setAttribute('src', path);
    else sendPreview();
  }

  function inputType(key, value) {
    if (/url|image/i.test(key)) return 'url';
    if (/email/i.test(key)) return 'email';
    return 'text';
  }

  function isLong(key, value) {
    return String(value).length > 85 || /description|statement|answer|challenge|response/i.test(key);
  }

  function renderPrimitive(key, value, path) {
    const long = isLong(key, value);
    const isImage = /image/i.test(key);
    const control = long
      ? `<textarea id="field-${escape(pathString(path))}" data-field="${escape(pathString(path))}">${escape(value)}</textarea>`
      : `<input id="field-${escape(pathString(path))}" type="${inputType(key, value)}" value="${escape(value)}" data-field="${escape(pathString(path))}">`;
    return `<div class="field ${long ? 'full' : ''}"><label for="field-${escape(pathString(path))}">${escape(friendly(key))}</label>${isImage ? `<div class="media-field">${control}<label class="media-upload">Upload image<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" data-upload="${escape(pathString(path))}"></label></div>` : control}</div>`;
  }

  function emptyFor(value) {
    if (Array.isArray(value)) return [];
    if (value && typeof value === 'object') return {};
    return '';
  }

  function renderArray(key, value, path) {
    const objectItems = value.some((item) => item && typeof item === 'object');
    if (!objectItems) {
      const rows = value.map((item, index) => `<div class="primitive-row"><input value="${escape(item)}" data-field="${escape(pathString([...path, index]))}"><button class="icon-button danger" type="button" data-remove="${escape(pathString(path))}" data-index="${index}" aria-label="Remove">×</button></div>`).join('');
      return `<div class="field full"><label>${escape(friendly(key))}</label><div class="primitive-list">${rows}</div><button class="add-button" type="button" data-add="${escape(pathString(path))}" data-kind="primitive">Add item</button></div>`;
    }
    const items = value.map((item, index) => {
      const title = item.title || item.question || item.id || `${friendly(key)} ${index + 1}`;
      return `<div class="repeater-item" data-cms-group="${escape(pathString([...path, index]))}"><div class="group-heading"><div><h3>${escape(title)}</h3><p>Item ${index + 1}</p></div><div class="item-actions"><button class="icon-button" type="button" data-move="${escape(pathString(path))}" data-index="${index}" data-direction="-1" aria-label="Move up">↑</button><button class="icon-button" type="button" data-move="${escape(pathString(path))}" data-index="${index}" data-direction="1" aria-label="Move down">↓</button><button class="icon-button danger" type="button" data-remove="${escape(pathString(path))}" data-index="${index}" aria-label="Remove">×</button></div></div><div class="field-grid">${renderObject(item, [...path, index], false)}</div></div>`;
    }).join('');
    return `<div class="field full"><label>${escape(friendly(key))}</label><div class="repeater">${items}</div><button class="add-button" type="button" data-add="${escape(pathString(path))}" data-kind="object">Add ${escape(friendly(key).replace(/s$/, ''))}</button></div>`;
  }

  function renderObject(object, path, wrap = true) {
    const fields = Object.entries(object).filter(([key]) => !['version', 'updatedAt'].includes(key)).map(([key, value]) => {
      const nextPath = [...path, key];
      if (Array.isArray(value)) return renderArray(key, value, nextPath);
      if (value && typeof value === 'object') {
        return `<details class="content-panel" data-cms-group="${escape(pathString(nextPath))}" open><summary>${escape(friendly(key))}</summary><div class="content-panel__body"><div class="field-grid">${renderObject(value, nextPath, false)}</div></div></details>`;
      }
      return renderPrimitive(key, value ?? '', nextPath);
    }).join('');
    if (!wrap) return fields;
    return `<div class="editor-group"><div class="group-heading"><div><h2>${escape(friendly(path[path.length - 1]))}</h2><p>${escape(descriptions[path[path.length - 1]] || 'Edit and publish this website content.')}</p></div></div><div class="field-grid">${fields}</div></div>`;
  }

  function render() {
    sectionTitle.textContent = sections.find(([key]) => key === activeSection)?.[1] || friendly(activeSection);
    sectionEyebrow.textContent = descriptions[activeSection] || 'Website content';
    editor.innerHTML = renderObject(content[activeSection], [activeSection]);
    nav.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.section === activeSection));
  }

  function renderNav() {
    nav.innerHTML = sections.map(([key, label]) => `<button type="button" data-section="${key}">${label}</button>`).join('');
  }

  function locateEditorPath(path) {
    if (!path || typeof path !== 'string') return;
    const section = path.split('.')[0];
    if (sections.some(([key]) => key === section) && activeSection !== section) {
      activeSection = section;
      history.replaceState(null, '', section === 'site' ? '/admin' : `/admin/${section}`);
      render();
    }
    requestAnimationFrame(() => {
      const candidates = [...editor.querySelectorAll('[data-field],[data-cms-group]')];
      let target = candidates.find((node) => node.dataset.field === path);
      if (!target) {
        target = candidates
          .filter((node) => node.dataset.cmsGroup && (path.startsWith(`${node.dataset.cmsGroup}.`) || node.dataset.cmsGroup === path))
          .sort((a, b) => b.dataset.cmsGroup.length - a.dataset.cmsGroup.length)[0];
      }
      if (!target) return;
      target.closest('details')?.setAttribute('open', '');
      const highlight = target.closest('.field,.content-panel,.repeater-item') || target;
      editor.querySelectorAll('.located').forEach((node) => node.classList.remove('located'));
      highlight.classList.add('located');
      highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const control = target.matches('input,textarea') ? target : target.querySelector('input,textarea');
      setTimeout(() => control?.focus({ preventScroll: true }), 420);
      setTimeout(() => highlight.classList.remove('located'), 2600);
    });
  }

  async function request(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', headers: { 'content-type': 'application/json', ...(options.headers || {}) }, ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Request failed.');
    return body;
  }

  async function loadContent() {
    editor.innerHTML = '';
    editor.append(loadingTemplate.content.cloneNode(true));
    const result = await request('/api/cms-content');
    content = result.content;
    dirty = false;
    publishButton.disabled = true;
    notice.hidden = result.source !== 'fallback';
    if (result.source === 'fallback') notice.textContent = 'The CMS is showing the built-in website content. Connect Supabase before publishing changes.';
    if (result.source === 'supabase-empty') {
      saveState.textContent = 'Ready for first publish';
      saveState.className = 'save-state success';
    }
    renderNav();
    render();
    updatePreviewPage();
  }

  async function openApp() {
    loginView.hidden = true;
    app.hidden = false;
    try { await loadContent(); }
    catch (error) {
      app.hidden = true;
      loginView.hidden = false;
      loginMessage.textContent = error.message;
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector('button');
    button.disabled = true;
    loginMessage.textContent = '';
    try {
      await request('/api/cms-login', { method: 'POST', body: JSON.stringify({ password: document.querySelector('#password').value }) });
      document.querySelector('#password').value = '';
      await openApp();
    } catch (error) { loginMessage.textContent = error.message; }
    finally { button.disabled = false; }
  });

  nav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-section]');
    if (!button) return;
    activeSection = button.dataset.section;
    history.replaceState(null, '', activeSection === 'site' ? '/admin' : `/admin/${activeSection}`);
    render();
    updatePreviewPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  editor.addEventListener('input', (event) => {
    if (!event.target.matches('[data-field]')) return;
    const path = event.target.dataset.field.split('.').map((part) => /^\d+$/.test(part) ? Number(part) : part);
    set(path, event.target.value);
  });

  editor.addEventListener('change', async (event) => {
    const input = event.target.closest('[data-upload]');
    if (!input || !input.files?.[0]) return;
    const file = input.files[0];
    const label = input.closest('.media-upload');
    const original = label.firstChild.textContent;
    label.firstChild.textContent = 'Uploading...';
    input.disabled = true;
    try {
      const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      const result = await request('/api/cms-media', { method: 'POST', body: JSON.stringify({ name: file.name, type: file.type, data }) });
      const path = input.dataset.upload.split('.').map((part) => /^\d+$/.test(part) ? Number(part) : part);
      set(path, result.url); render();
    } catch (error) { notice.hidden = false; notice.textContent = error.message; label.firstChild.textContent = original; input.disabled = false; }
  });

  editor.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const toPath = (value) => value.split('.').map((part) => /^\d+$/.test(part) ? Number(part) : part);
    if (button.dataset.remove) {
      get(toPath(button.dataset.remove)).splice(Number(button.dataset.index), 1);
      markDirty(); render();
    }
    if (button.dataset.move) {
      const list = get(toPath(button.dataset.move));
      const from = Number(button.dataset.index);
      const to = from + Number(button.dataset.direction);
      if (to >= 0 && to < list.length) { [list[from], list[to]] = [list[to], list[from]]; markDirty(); render(); }
    }
    if (button.dataset.add) {
      const list = get(toPath(button.dataset.add));
      if (button.dataset.kind === 'primitive') list.push('');
      else list.push(list[0] ? JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(list[0]).map(([key, value]) => [key, emptyFor(value)])))) : {});
      markDirty(); render();
    }
  });

  publishButton.addEventListener('click', async () => {
    if (!dirty) return;
    publishButton.disabled = true;
    publishButton.dataset.publishing = 'true';
    publishButton.textContent = 'Publishing...';
    try {
      const result = await request('/api/cms-content', { method: 'PUT', body: JSON.stringify({ content }) });
      content = result.content;
      dirty = false;
      saveState.textContent = 'Published';
      saveState.className = 'save-state success';
      notice.hidden = true;
      setTimeout(() => { if (!dirty) { saveState.textContent = 'Saved'; saveState.className = 'save-state'; } }, 2500);
    } catch (error) {
      notice.hidden = false;
      notice.textContent = error.message;
    } finally {
      publishButton.dataset.publishing = 'false';
      publishButton.disabled = !dirty;
      publishButton.textContent = 'Publish changes';
    }
  });

  document.querySelector('#logout-button').addEventListener('click', async () => {
    try { await request('/api/cms-logout', { method: 'POST', body: '{}' }); } catch (_) {}
    location.reload();
  });

  previewFrame?.addEventListener('load', () => setTimeout(sendPreview, 80));

  mobilePreviewButton?.addEventListener('click', () => {
    app.classList.add('preview-open');
    document.body.style.overflow = 'hidden';
    sendPreview();
  });

  previewClose?.addEventListener('click', () => {
    app.classList.remove('preview-open');
    document.body.style.overflow = '';
  });

  document.querySelector('.preview-sizes')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-preview-size]');
    if (!button) return;
    previewCanvas.dataset.previewSize = button.dataset.previewSize;
    document.querySelectorAll('[data-preview-size]').forEach((item) => item.classList.toggle('active', item === button));
  });

  window.addEventListener('beforeunload', (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });

  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin || event.data?.type !== 'codecrafts:cms-locate') return;
    locateEditorPath(event.data.path);
  });

  request('/api/cms-session').then((result) => result.authenticated ? openApp() : null).catch(() => null);
})();
