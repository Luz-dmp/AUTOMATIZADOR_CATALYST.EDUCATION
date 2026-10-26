(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const sourceArt = $('homeNanamiArt');
  const companion = $('nanamiCompanion');
  const bubble = $('nanamiBubble');
  const trigger = $('nanamiTrigger');
  const messages = {
    home: [
      '¡Hoy es un buen día para superar tus límites!',
      'Tu próxima versión comienza con lo que aprendes hoy.',
      '¡Bienvenido a Catalyst! Vamos por ese siguiente nivel.',
      'Cada pregunta es una oportunidad para descubrir lo que sabes.',
      'Una idea, un buen plan y un primer paso: ya puedes empezar.',
      'Estudiar a tu ritmo también es avanzar.'
    ],
    sim: [
      '¡Nanami está listo! Respira, concéntrate y demuestra lo que has aprendido.',
      'Cada simulacro ayuda a reconocer fortalezas y temas para seguir practicando.',
      'Un paso más hoy: prepara el documento y revisamos el cuadernillo juntos.',
      'La práctica es un buen lugar para descubrir qué quieres repasar.'
    ],
    compilados: [
      'Elige un área y reúne las preguntas que necesitas para tu material.',
      'Un buen compilado empieza por un objetivo claro. ¿Qué área vas a trabajar?',
      'Tú organizas las preguntas; yo te acompaño con el siguiente paso.'
    ],
    mini: [
      'Un reto breve también puede ayudarte a enfocar el repaso.',
      'Elige un área para preparar una práctica de hasta 12 preguntas.',
      'Poco a poco y con intención: vamos a preparar tu mini-simulacro.'
    ],
    area: [
      '¡Buena elección! Revisa el área seleccionada y prepara tu material.',
      'Ya tenemos el área. El siguiente paso es importar o elegir preguntas.',
      'Tu espacio de trabajo está listo; aquí puedes organizar el contenido.'
    ],
    profile: [
      'Aquí puedes revisar los datos de tu cuenta y las áreas que tienes autorizadas.',
      'Tu perfil reúne la información de acceso de esta cuenta.',
      '¿Quieres crear material? Desde aquí puedes ir directamente a elegir un área.'
    ],
    users: [
      'Este es el espacio administrativo. Los cambios se aplican al directorio real.',
      'Revisa cada cuenta y sus permisos antes de guardar cambios.',
      'La gestión segura empieza por verificar el rol y las áreas asignadas.'
    ],
    empty: [
      'Este espacio te espera. Explora las opciones disponibles para dar el primer paso.',
      'Todavía no hay contenido aquí. Puedes comenzar desde las herramientas de creación.',
      'Cuando tengas materiales guardados, aparecerán aquí con sus datos reales.'
    ],
    busy: [
      'Estoy organizando el contenido. Enseguida estará listo para revisar.',
      'Un momento: estoy preparando la vista previa a partir de tu documento.',
      'Estoy trabajando en el cuadernillo; puedes revisar el resultado cuando termine.'
    ],
    success: [
      '¡Acción completada! Cada práctica suma experiencia.',
      '¡Buen trabajo! La operación terminó correctamente.',
      '¡Listo! Puedes continuar con el siguiente paso.',
      'Terminaste esta etapa. Revisa el material cuando quieras.'
    ],
    error: [
      'No pasa nada: revisemos el mensaje y vamos paso a paso.',
      'Esta operación no terminó. Comprueba el detalle y vuelve a intentarlo si corresponde.',
      'Un contratiempo no define tu avance. El mensaje indica qué necesita atención.'
    ],
    warning: [
      'Vamos paso a paso. Revisa el aviso antes de continuar.',
      'Hay algo que conviene comprobar primero; el mensaje te indica qué hacer.',
      'Tómate un momento para revisar este paso y seguir con seguridad.'
    ]
  };
  const labels = {
    home: 'NANAMI TE DA LA BIENVENIDA',
    sim: 'PREPARANDO EL SIMULACRO',
    compilados: 'ESTUDIO POR ÁREAS',
    mini: 'RETO BREVE',
    area: 'ÁREA SELECCIONADA',
    profile: 'TU CUENTA',
    users: 'GESTIÓN SEGURA',
    empty: 'UN NUEVO COMIENZO',
    busy: 'PREPARANDO TU MATERIAL',
    success: '¡MUY BIEN!',
    error: 'AQUÍ ESTOY PARA AYUDAR',
    warning: 'UN PASO A LA VEZ'
  };
  const previous = new Map();
  let bubbleTimer = 0;
  let reactionTimer = 0;
  let currentContext = 'home';
  let currentHomeMessage = '';
  let currentName = '';

  function choose(context) {
    const options = messages[context] || messages.home;
    const last = previous.get(context);
    let index = Math.floor(Math.random() * options.length);
    if (options.length > 1 && index === last) index = (index + 1 + Math.floor(Math.random() * (options.length - 1))) % options.length;
    previous.set(context, index);
    return options[index];
  }

  function cloneArt(className) {
    if (!sourceArt) throw new Error('No se encontró la ilustración de Nanami.');
    const art = sourceArt.cloneNode(false);
    art.removeAttribute('id');
    art.alt = '';
    art.setAttribute('aria-hidden', 'true');
    art.classList.add(className);
    return art;
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '¡Buenos días!';
    if (hour >= 12 && hour < 19) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  }

  function setHomeMessage() {
    currentName = $('profileName')?.textContent;
    currentHomeMessage = choose('home');
    updateWelcomeText();
  }

  function updateWelcomeText() {
    const greeting = currentName && currentName !== 'Usuario'
      ? `${getGreeting()} ${currentName}. `
      : `${getGreeting()} `;
    $('homeMotivation').textContent = `${greeting}${currentHomeMessage}`;
  }

  function hideBubble() {
    window.clearTimeout(bubbleTimer);
    window.clearTimeout(reactionTimer);
    bubble.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  function showBubble(message, label, autoClose = true) {
    window.clearTimeout(reactionTimer);
    $('nanamiMessage').textContent = message;
    $('nanamiContext').textContent = label;
    bubble.hidden = false;
    bubble.classList.remove('nanami-bubble-enter');
    requestAnimationFrame(() => bubble.classList.add('nanami-bubble-enter'));
    trigger.setAttribute('aria-expanded', 'true');
    window.clearTimeout(bubbleTimer);
    if (autoClose) bubbleTimer = window.setTimeout(hideBubble, 7200);
    companion.classList.remove('is-reacting');
    requestAnimationFrame(() => companion.classList.add('is-reacting'));
  }

  function setContext(context, options = {}) {
    window.clearTimeout(reactionTimer);
    currentContext = context;
    if (context === 'home') {
      companion.hidden = true;
      hideBubble();
      setHomeMessage();
      return;
    }
    companion.hidden = false;
    const message = choose(context);
    if (options.open !== false) showBubble(message, labels[context] || labels.home);
  }

  function react(type) {
    const context = ['success', 'error', 'warning'].includes(type) ? type : null;
    if (!context || currentContext === 'home') return;
    window.clearTimeout(reactionTimer);
    reactionTimer = window.setTimeout(() => {
      showBubble(choose(context), labels[context], true);
    }, 2700);
  }

  function decorateEmpty(target, message) {
    if (!target) return;
    const state = document.createElement('div');
    state.className = 'nanami-generated-empty';
    state.append(cloneArt('nanami-empty-art'));
    const copy = document.createElement('span');
    copy.textContent = message || choose('empty');
    state.appendChild(copy);
    target.replaceChildren(state);
    target.classList.add('has-nanami-empty');
  }

  $('nanamiPortrait').appendChild(cloneArt('nanami-companion-art'));
  $('nanamiBusyPortrait').appendChild(cloneArt('nanami-busy-art'));
  $('nanamiEmptyHint').append(cloneArt('nanami-empty-art'), document.createTextNode(choose('empty')));
  $('userDirectoryLoading').prepend(cloneArt('nanami-loading-art'));
  $('dashboardLoadState').prepend(cloneArt('nanami-loading-art'));

  trigger.addEventListener('click', () => {
    if (!bubble.hidden) {
      hideBubble();
      return;
    }
    showBubble(choose(currentContext), labels[currentContext] || labels.home, false);
  });
  $('nanamiClose').addEventListener('click', hideBubble);

  window.addEventListener('catalyst:navigate', event => {
    const context = event.detail?.route || 'home';
    setContext(context);
  });

  document.querySelectorAll('#homeMain .hbtn, #homeAreas .acard').forEach(card => {
    const respond = () => {
      $('homeNanamiArt').classList.remove('nanami-react');
      requestAnimationFrame(() => $('homeNanamiArt').classList.add('nanami-react'));
    };
    card.addEventListener('pointerenter', respond);
    card.addEventListener('focus', respond);
  });
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const icon = item.querySelector(':scope > span:first-child');
      if (!icon) return;
      icon.classList.remove('nav-icon-pop');
      requestAnimationFrame(() => icon.classList.add('nav-icon-pop'));
      window.setTimeout(() => icon.classList.remove('nav-icon-pop'), 360);
    });
  });

  window.CatalystNanami = {
    setContext,
    react,
    decorateEmpty,
    updateIdentity(user) {
      currentName = user?.name || '';
      if (currentContext === 'home') updateWelcomeText();
    }
  };
  setContext(window.CatalystNavigation?.activeRoute || 'home', { open: false });
})();
