try {
  const requestedTheme = new URLSearchParams(location.search).get('theme');
  const savedTheme = localStorage.getItem('codecrafts-theme');
  if (requestedTheme === 'dark' || requestedTheme === 'light') document.documentElement.dataset.theme = requestedTheme;
  else if (savedTheme === 'dark' || savedTheme === 'light') document.documentElement.dataset.theme = savedTheme;
} catch {}
