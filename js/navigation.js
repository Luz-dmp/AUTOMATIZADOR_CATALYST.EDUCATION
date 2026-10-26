(function () {
  'use strict';

  const routes = new Map();
  const navIds = {
    home: 'navHome',
    sim: 'navSim',
    compilados: 'navCompilados',
    mini: 'navMini',
    users: 'navUsers',
    profile: 'navProfile'
  };
  const menuRoutes = {
    navHome: 'home',
    navSim: 'sim',
    navCompilados: 'compilados',
    navMini: 'mini',
    navUsers: 'users',
    navProfile: 'profile',
    navLogout: 'logout'
  };
  const entryTargets = {
    home: '#homeMain',
    sim: '.app',
    compilados: '#homeAreas',
    mini: '#homeAreas',
    users: '#userDashboard',
    profile: '#userDashboard',
    editor: '.app'
  };
  let activeRoute = 'home';

  function updateActive(route) {
    activeRoute = route;
    const activeId = navIds[route];
    document.querySelectorAll('.nav-item').forEach(item => {
      const active = item.id === activeId;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    document.body.dataset.view = route;
  }

  function animateEntry(route) {
    const target = document.querySelector(entryTargets[route]);
    if (!target || target.hidden) return;
    target.classList.remove('view-enter');
    requestAnimationFrame(() => target.classList.add('view-enter'));
    window.setTimeout(() => target.classList.remove('view-enter'), 300);
  }

  function register(route, handler) {
    if (routes.has(route)) throw new Error(`La ruta "${route}" ya está registrada.`);
    if (typeof handler !== 'function') throw new TypeError(`La ruta "${route}" requiere un controlador.`);
    routes.set(route, handler);
  }

  function navigate(route) {
    const handler = routes.get(route);
    if (!handler) throw new Error(`La ruta "${route}" no tiene un controlador.`);
    const accepted = handler();
    if (accepted === false) return false;
    updateActive(route);
    document.body.classList.remove('nav-open');
    const toggle = document.getElementById('navToggle');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Abrir menú');
    animateEntry(route);
    window.dispatchEvent(new CustomEvent('catalyst:navigate', { detail: { route } }));
    return true;
  }

  function handleMenuClick(event) {
    const button = event.target.closest('button.nav-item');
    if (!button) return;
    const route = menuRoutes[button.id];
    if (!route) return;
    event.preventDefault();
    if (route === 'logout') {
      const handler = routes.get(route);
      if (!handler) throw new Error('La acción de cerrar sesión no tiene un controlador.');
      handler();
      return;
    }
    navigate(route);
  }

  const menu = document.querySelector('.main-nav');
  if (!menu) throw new Error('No se encontró el menú principal de Catalyst.');
  menu.addEventListener('click', handleMenuClick);

  const toggle = document.getElementById('navToggle');
  toggle?.addEventListener('click', () => {
    const expanded = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Cerrar menú' : 'Abrir menú');
  });

  window.CatalystNavigation = {
    register,
    navigate,
    updateActive,
    animate: animateEntry,
    get activeRoute() { return activeRoute; }
  };
  updateActive('home');
})();
