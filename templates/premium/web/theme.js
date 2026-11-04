// Theme: ?theme=light|dark > saved choice > OS preference. Toggle with [data-theme-toggle].
(() => {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search).get('theme');
  let saved = null; try { saved = localStorage.getItem('ds-theme'); } catch {}
  const os = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  root.dataset.theme = q || saved || os;
  addEventListener('DOMContentLoaded', () => {
    for (const b of document.querySelectorAll('[data-theme-toggle]')) {
      const sync = () => b.setAttribute('aria-pressed', String(root.dataset.theme === 'light'));
      sync();
      b.addEventListener('click', () => {
        root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
        try { localStorage.setItem('ds-theme', root.dataset.theme); } catch {}
        sync();
      });
    }
    for (const list of document.querySelectorAll('[role="tablist"]')) {
      const tabs = [...list.querySelectorAll('[role="tab"]')];
      tabs.forEach((t) => t.addEventListener('click', () => tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)))));
    }
  });
})();
