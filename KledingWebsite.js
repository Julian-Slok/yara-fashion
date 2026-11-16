(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#site-nav');
  const toast = document.querySelector('.toast');
  let toastTimer;

  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 821px)').addEventListener('change', closeMenu);

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  document.querySelector('[data-copy-address]')?.addEventListener('click', async () => {
    const address = 'Yara Fashion, Ouddiemerlaan 199, 1111 GZ Diemen';
    try {
      await navigator.clipboard.writeText(address);
      showToast('Adres gekopieerd.');
    } catch {
      showToast('Kopiëren lukte niet. Het adres is Ouddiemerlaan 199, Diemen.');
    }
  });

  // Animate on entry without hiding content while waiting for JavaScript or an observer.
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const activeAnimations = new Set();
  let revealObserver;
  const revealTargets = document.querySelectorAll(
    '.intro-heading, .intro-copy, .section-heading, .collection-card, ' +
    '.photo-note, .brands-note, .services-heading, .service-item, .visit-copy, .visit-card, ' +
    '.detail-heading, .detail-visual, .detail-panel, .detail-cta, .related-link, ' +
    '.hours-table, .practical-feature'
  );

  function reveal(element, delay = 0) {
    if (motionPreference.matches || typeof element.animate !== 'function') return;
    const animation = element.animate([
      { opacity: 0, translate: '0 28px' },
      { opacity: 1, translate: '0 0' }
    ], {
      duration: 850,
      delay,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'backwards'
    });
    activeAnimations.add(animation);
    const release = () => activeAnimations.delete(animation);
    animation.addEventListener('finish', release, { once: true });
    animation.addEventListener('cancel', release, { once: true });
  }

  if (!motionPreference.matches && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const siblings = [...element.parentElement.children].filter((child) =>
          child.matches('.collection-card, .service-item')
        );
        reveal(element, Math.max(0, siblings.indexOf(element)) * 85);
        revealObserver.unobserve(element);
      });
    }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });
    revealTargets.forEach((element) => revealObserver.observe(element));
    document.querySelectorAll('.hero-content > *').forEach((element, index) => {
      reveal(element, index * 90);
    });
  }

  motionPreference.addEventListener('change', () => {
    if (!motionPreference.matches) return;
    revealObserver?.disconnect();
    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations.clear();
  });

  // One frame per scroll update; animations above use no continuous scroll handler.
  const header = document.querySelector('.site-header');
  const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
  const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href')));
  let scrollFrame = 0;
  function updateScrollState() {
    scrollFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    header.style.setProperty('--scroll-progress', progress);
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    let current = -1;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= header.offsetHeight + 140) current = index;
    });
    if (progress >= .99 && window.scrollY > 0) current = sectionLinks.length - 1;
    sectionLinks.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleScrollUpdate() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState);
  }
  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate);
  window.addEventListener('pageshow', scheduleScrollUpdate);
  updateScrollState();
})();
