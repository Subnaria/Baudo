/* Hero: automatic banner framing, scroll parallax, and navigation state */
(() => {
  const hero = document.getElementById('home');
  const nav = document.getElementById('nav');
  if (!hero) return;

  const bg = hero.querySelector('.hero-bg');
  const inner = hero.querySelector('.hero-inner');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 720px)');

  /* Approximate bottom of the BAUDO word in the banner image. */
  const BAUDO_BOTTOM = 0.56;
  const GAP = 40;
  let nw = 0;
  let nh = 0;

  const fit = () => {
    if (!bg || !inner || !nw) return;
    if (mobile.matches) {
      hero.style.minHeight = '';
      bg.style.removeProperty('--bg-y');
      return;
    }

    const W = hero.clientWidth;
    const socle = inner.offsetHeight;
    const need = BAUDO_BOTTOM * (nh / nw * W) + socle + GAP;
    const H = Math.round(Math.min(Math.max(window.innerHeight, 700, need), 1500));
    hero.style.minHeight = String(H) + 'px';

    const ih = nh * Math.max(W / nw, H / nh);
    const slack = ih - H;
    const target = H - socle - GAP;
    const offset = Math.min(Math.max(BAUDO_BOTTOM * ih - target, 0), Math.max(slack, 0));
    bg.style.setProperty('--bg-y', String(-offset) + 'px');
  };

  const img = new Image();
  img.onload = () => {
    nw = img.naturalWidth;
    nh = img.naturalHeight;
    fit();
  };
  img.src = 'img/Basic/Banner/Banner-Baudo.webp';

  let queued = false;
  const update = () => {
    queued = false;
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (!still) {
      const p = Math.min(1, Math.max(0, y / hero.offsetHeight));
      hero.style.setProperty('--p', p.toFixed(4));
    }
  };

  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', fit);
  if (document.fonts) document.fonts.ready.then(fit);
  update();
})();
