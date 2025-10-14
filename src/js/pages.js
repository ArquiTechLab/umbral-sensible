// Código para las páginas
(function () {
  const maxAttempts = 20;
  const intervalMs = 150;

  // Manejo del menú de navegación y botones
  document.addEventListener('click', (ev) => {
    const toggle = ev.target.closest('.nav-toggle');
    if (toggle) {
      ev.preventDefault();
      const navList = document.querySelector('#main-nav ul');
      if (!navList) return;
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', expanded ? 'Abrir menú' : 'Cerrar menú');
      navList.classList.toggle('show');
      return;
    }

    // Manejo de botones de navegación (scroll a secciones)
    const navBtn = ev.target.closest('.nav-btn');
    if (navBtn) {
      ev.preventDefault();
      const selector = navBtn.dataset.target;
      const target = selector ? document.querySelector(selector) : null;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        markActiveByTarget(target);
      }
      return;
    }

    // Manejo del botón "volver arriba"
    const toTop = ev.target.closest('.to-top-btn');
    if (toTop) {
      ev.preventDefault();

      // Desconectar temporalmente el observer
      if (observer) observer.disconnect();

      // Scroll al top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Enfocar el main
      const main = document.querySelector('main');
      if (main) main.focus({ preventScroll: true });

      // Reactivar el observer después de un breve tiempo
      setTimeout(() => {
        setupObserverIfNeeded();
      }, 800); // Ajusta el tiempo si el scroll es más lento
    }

    let observer = null;
    let currentButtons = [];

    // Marca el botón activo según el índice
    function setActiveButtonIndex(idx) {
      currentButtons.forEach((b, i) => {
        b.classList.toggle('active', i === idx);
        if (i === idx) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    }

    // Marca el botón activo según el target visible
    function markActiveByTarget(target) {
      const idx = currentButtons.findIndex(b => {
        const sel = b.dataset.target;
        return sel && document.querySelector(sel) === target;
      });
      if (idx >= 0) setActiveButtonIndex(idx);
    }

    // Configura el observer si hay botones
    function setupObserverIfNeeded() {
      const buttons = Array.from(document.querySelectorAll('.nav-btn'));
      if (buttons.length === 0) return false;

      currentButtons = buttons;
      const sections = buttons.map(b => document.querySelector(b.dataset.target)).filter(Boolean);

      if (observer) observer.disconnect();
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            markActiveByTarget(entry.target);
          }
        });
      }, { threshold: 0.5 });

      sections.forEach(s => observer.observe(s));
      return true;
    }

    // Intenta configurar el observer con reintentos
    function ensureSetupWithRetries() {
      let attempts = 0;
      if (!setupObserverIfNeeded()) {
        const timer = setInterval(() => {
          attempts++;
          if (setupObserverIfNeeded() || attempts >= maxAttempts) clearInterval(timer);
        }, intervalMs);
      }
    }

    // Escuchar eventos para intentar configurar el observer
    document.addEventListener('DOMContentLoaded', ensureSetupWithRetries);
    document.addEventListener('includes:loaded', ensureSetupWithRetries);
  })();
})();

