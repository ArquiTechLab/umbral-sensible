// Buscador simple para incluir archivos HTML via fetch
(function () {
  async function includeHTML() {
    const nodes = document.querySelectorAll('[data-include]');
    for (const node of nodes) {
      const url = node.getAttribute('data-include');
      if (!url) continue;
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const html = await res.text();
        // Inserta el HTML y ejecuta scripts si los hay
        node.innerHTML = html;
        // Mover scripts para ejecutarlos
        node.querySelectorAll('script').forEach(old => {
          const script = document.createElement('script');
          if (old.src) script.src = old.src;
          if (old.type) script.type = old.type;
          script.textContent = old.textContent;
          old.parentNode.replaceChild(script, old);
        });
      } catch (err) {
        console.error('include-html error loading', url, err);
      }
    }
    document.dispatchEvent(new CustomEvent('includes:loaded'));
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Ajustar el padding-bottom del body según la altura del footer
    (function adjustBodyPaddingForFooter() {
      const footer = document.querySelector('footer');
      if (!footer) return;

      // Calcula altura renderizada (incluye padding)
      const rect = footer.getBoundingClientRect();
      const height = Math.ceil(rect.height);

      // Establece la variable CSS y el padding-bottom del body
      document.documentElement.style.setProperty('--footer-h', height + 'px');
      document.body.style.paddingBottom = height + 'px';

      // Reajustar al redimensionar (con retardo)
      let t;
      window.addEventListener('resize', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const h2 = Math.ceil(footer.getBoundingClientRect().height);
          document.documentElement.style.setProperty('--footer-h', h2 + 'px');
          document.body.style.paddingBottom = h2 + 'px';
        }, 120);
      });
    })();
  }

  // Ejecutar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', includeHTML);
  } else {
    includeHTML();
  }
})();
