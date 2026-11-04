(() => {
  const key = 'rostok-theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let choice;
  function read() {
    try { choice = localStorage.getItem(key); } catch { /* Use the system theme. */ }
  }
  function apply() {
    const dark = choice === 'dark' || (choice !== 'light' && system.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]').content = dark ? '#18221e' : '#f2f3eb';
    const button = document.getElementById('themeButton');
    if (!button) return;
    button.textContent = dark ? '☀ Светлая' : '☾ Тёмная';
    button.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    button.title = button.getAttribute('aria-label');
  }
  read();
  apply();
  system.addEventListener('change', apply);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { read(); apply(); }
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('themeButton').addEventListener('click', () => {
      choice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, choice); } catch { /* Still apply it to this tab. */ }
      apply();
    });
  });
})();
