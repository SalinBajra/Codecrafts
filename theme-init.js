document.documentElement.classList.add('cms-loading');
window.setTimeout(() => document.documentElement.classList.remove('cms-loading'), 4500);
try {
  const requestedTheme = new URLSearchParams(location.search).get('theme');
  const savedTheme = localStorage.getItem('codecrafts-theme');
  if (requestedTheme === 'dark' || requestedTheme === 'light') document.documentElement.dataset.theme = requestedTheme;
  else if (savedTheme === 'dark' || savedTheme === 'light') document.documentElement.dataset.theme = savedTheme;
} catch {}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.brand b,.footer-brand b').forEach((node) => { node.textContent = 'CodeCraft'; });
});
