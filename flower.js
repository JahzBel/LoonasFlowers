/* ---------------------------------------------
   Anime.js 3.x + scroll
   Las timelines no se reproducen solas: se les
   hace seek() con el progreso del scroll.
   --------------------------------------------- */


document.addEventListener('DOMContentLoaded', () => {
  if (typeof anime === 'undefined') return;
  if (sessionStorage.getItem("accessGranted") !== "true") {
    window.location.href = "index.html";
  }
  const playingAudio = false;
  document.addEventListener('scroll', () => {
    const audio = document.getElementById('background-audio');
    if (audio && !playingAudio) {
      audio.play();
      playingAudio = true;
    }
  });
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Motor: asocia una timeline al scroll de un contenedor --------- */

  const jobs = [];

  function progressOf(el) {
    const total = el.offsetHeight - window.innerHeight;
    if (total <= 0) return 1;
    return clamp(-el.getBoundingClientRect().top / total, 0, 1);
  }

  function bindToScroll(el, tl) {
    tl.seek(0);
    if (reduce) { tl.seek(tl.duration); return; }
    jobs.push({ el, tl, cur: progressOf(el) });
  }

  function loop() {
    for (const j of jobs) {
      const target = progressOf(j.el);
      j.cur += (target - j.cur) * 0.12;                 // 0.12 = inercia
      if (Math.abs(target - j.cur) < 0.0004) j.cur = target;
      j.tl.seek(j.tl.duration * j.cur);
    }
    requestAnimationFrame(loop);
  }

  /* --- 1. La flor tipográfica ----------------------------------------
     Todas las distancias van en em, así la flor conserva sus
     proporciones cuando el font-size cambia con el clamp() */

  const stage = document.querySelector('.scroll-stage');

  if (stage) {
    const flor = anime.timeline({ autoplay: false, easing: 'easeOutCubic' });

    flor
      // Las letras se juntan
      .add({
        targets: '.msg-wrapper',
        gap: ['3rem', '0rem'],
        duration: 500,
      }, 0)

      // El tallo baja y se estira
      .add({
        targets: '.tallo-wrapper',
        translateX: '-1em',
        translateY: '1.4em',
        scaleX: 1.6,
        scaleY: 4.5,
        color: 'rgb(63,125,78)',
        duration: 900,
      }, 500)

      // El centro crece
      .add({
        targets: '.center-wrapper',
        scale: 1.6,
        color: 'rgb(107,68,35)',
        duration: 800,
      }, 700)

      // La corola sube a su sitio
      .add({
        targets: '.pettal-wrapper',
        translateX: '1em',
        translateY: '0em',
        duration: 800,
      }, 700)

      // Los pétalos se abren en abanico
      .add({
        targets: '.petal',
        rotate: (el, i) => i * 45,          // 8 pétalos = 360/8
        translateY: '-1.85em',               // radio de la corola
        scale: 1.25,
        color: 'rgb(240,180,41)',
        duration: 800,
        delay: anime.stagger(55),
      }, 1000)

      // La pista de "baja para que florezca" se retira
      .add({
        targets: '.hint',
        opacity: [0.55, 0],
        duration: 400,
      }, 300);

    bindToScroll(stage, flor);
  }

  /* --- 2. Las frases en slides --------------------------------------- */

  document.querySelectorAll('.slides').forEach((section) => {
    const slides = [...section.querySelectorAll('.slide')];
    if (!slides.length) return;

    const STEP = 1000;   // tiempo virtual que dura cada frase
    const FADE = 420;    // tiempo virtual de la transición
    const VH_POR_FRASE = 85;   // cuánto scroll ocupa cada frase

    const alto = slides.length * VH_POR_FRASE + 15;
    section.style.height = alto + 'vh';
    section.style.height = alto + 'svh';   // si el navegador no soporta svh, ignora esta línea

    const tl = anime.timeline({ autoplay: false, easing: 'easeOutQuad' });

    slides.forEach((slide, i) => {
      if (i > 0) {
        tl.add({
          targets: slide,
          opacity: [0, 1],
          translateY: [26, 0],
          duration: FADE,
        }, i * STEP);
      }
      if (i < slides.length - 1) {
        tl.add({
          targets: slide,
          opacity: [1, 0],
          translateY: [0, -26],
          duration: FADE,
          easing: 'easeInQuad',
        }, i * STEP + STEP - FADE);
      }
    });

    bindToScroll(section, tl);
  });

  /* --- 3. Tulipanes: encajar cada fila en el ancho disponible ---------
     Los .container miden 320x480 px fijos. En vez de reescribir
     tulipan.css en unidades relativas, se escala la fila completa
     con transform, así se ve idéntica, solo más pequeña. */

  const MARGEN = 24;   // respiro a los lados, en px

  function fitRows() {
    document.querySelectorAll('.flower-main, .flower-wrapper').forEach((row) => {
      const kids = [...row.children];
      if (!kids.length) return;

      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const natural = kids.reduce((w, k) => w + k.offsetWidth, 0)
                    + gap * (kids.length - 1);

      // La flor morada va un 20% más grande, como en el diseño original
      const base = row.classList.contains('flower-main') ? 1.2 : 1;
      const s = Math.min(base, (window.innerWidth - MARGEN) / natural);

      row.style.setProperty('--s', s.toFixed(3));
    });
  }

  fitRows();

  let resizeId;
  window.addEventListener('resize', () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(fitRows, 120);
  });

  if (!reduce) requestAnimationFrame(loop);
});
