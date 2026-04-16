// =============================================================
// DRINKPOUCH — PRODUCTION JAVASCRIPT
// GSAP + ScrollTrigger Animations
// =============================================================

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// =============================================================
// UTILITIES
// =============================================================
const qs  = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

// =============================================================
// 1. SCROLL-BASED HEADER BEHAVIOR
// =============================================================
(function initHeader() {
  const header = qs('#site-header');
  let scrolled = false;

  const update = () => {
    const shouldBeScrolled = window.scrollY > 60;
    if (shouldBeScrolled !== scrolled) {
      scrolled = shouldBeScrolled;
      header.classList.toggle('is-scrolled', scrolled);
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// =============================================================
// 2. MOBILE MENU
// =============================================================
(function initMobileMenu() {
  const toggle  = qs('#menu-toggle');
  const drawer  = qs('#mobile-drawer');
  const overlay = qs('#mobile-overlay');
  if (!toggle || !drawer) return;

  const open = () => {
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    drawer.classList.contains('is-open') ? close() : open();
  });
  overlay.addEventListener('click', close);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
  });
})();

// =============================================================
// 3. VIDEO SOUND TOGGLE
// =============================================================
(function initSoundToggle() {
  const btn   = qs('#sound-toggle');
  const video = qs('.hero-banner__bg-video');
  if (!btn || !video) return;

  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    btn.textContent = video.muted ? 'Sound: off' : 'Sound: on ';
  });
})();

// =============================================================
// 4. FAQ ACCORDION — smooth height animation
// =============================================================
(function initFAQs() {
  qsa('.faq-item').forEach(item => {
    const summary = qs('summary', item);
    const body    = qs('.faq-item__body', item);
    const icon    = qs('.faq-icon', item);
    if (!summary || !body) return;

    // Hide content initially
    gsap.set(body, { height: 0, overflow: 'hidden', opacity: 0 });

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      const isOpen = item.hasAttribute('open');

      if (isOpen) {
        // Close
        gsap.to(body, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: () => item.removeAttribute('open'),
        });
        if (icon) icon.textContent = '+';
      } else {
        // Open
        item.setAttribute('open', '');
        const fullHeight = body.scrollHeight;
        gsap.fromTo(body, { height: 0, opacity: 0 }, {
          height: fullHeight,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => gsap.set(body, { height: 'auto' }),
        });
        if (icon) icon.textContent = '−';
      }
    });
  });
})();

// =============================================================
// 5. HERO BANNER — entrance animations
// =============================================================
(function initHeroAnimations() {
  const lines = qsa('.hero-line');
  if (!lines.length) return;

  gsap.fromTo(lines,
    { opacity: 0, y: '10%' },
    {
      opacity: 1,
      y: 0,
      delay: 0.5,
      stagger: 0.4,
      duration: 1.2,
      ease: 'power3.out',
    }
  );

  // Hero logo parallax on scroll
  const logo = qs('.hero-banner__logo');
  if (logo) {
    gsap.to(logo, {
      opacity: 0,
      y: '10%',
      scrollTrigger: {
        trigger: '#hero-banner',
        scrub: true,
        start: 'top top',
        end: 'top+=300 top',
      },
    });
  }
})();

// =============================================================
// 6. FEATURED PRODUCTS — stagger entrance
// =============================================================
(function initProductsAnimation() {
  const section = qs('#products');
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top bottom-=10%',
    },
  });

  tl.fromTo(
    qsa('#products .featured-products__line'),
    { opacity: 0, y: '10%' },
    { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power2.out' }
  ).fromTo(
    qsa('#products .product-card-wrap'),
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power2.out' },
    '-=0.4'
  );
})();

// =============================================================
// 7. VISUAL HEADING — scroll-driven char color reveal
// =============================================================
(function initVisualHeading() {
  const heading = qs('#visual-heading-text');
  if (!heading) return;

  // Fade-in eyebrow and footer
  ['.visual-heading__eyebrow', '.visual-heading__footer'].forEach(sel => {
    const el = qs(sel);
    if (el) {
      gsap.fromTo(el, { opacity: 0 }, {
        opacity: 1,
        delay: 0.5,
        duration: 1,
        scrollTrigger: { trigger: el, start: 'top bottom-=15%' },
      });
    }
  });

  // Inline images fade in
  gsap.fromTo(
    qsa('.visual-heading__img'),
    { opacity: 0 },
    {
      opacity: 1,
      delay: 0.75,
      stagger: 0.25,
      duration: 0.8,
      scrollTrigger: {
        trigger: heading,
        start: 'top bottom-=20%',
      },
    }
  );

  // SplitText char color reveal — only if GSAP SplitText is available
  if (typeof SplitText !== 'undefined') {
    try {
      // We need text nodes without the inline images - clone approach
      const split = SplitText.create(heading, { type: 'words' });
      gsap.to(split.words, {
        color: 'var(--color-navy)',
        stagger: 0.06,
        scrollTrigger: {
          trigger: '#about',
          scrub: true,
          start: 'top bottom-=20%',
          end: 'bottom bottom-=10%',
        },
      });
    } catch (e) {
      // SplitText fallback — just animate opacity
      gsap.fromTo(heading, { opacity: 0 }, {
        opacity: 1,
        scrollTrigger: { trigger: heading, start: 'top bottom-=20%' },
      });
    }
  }
})();

// =============================================================
// 8. PINNED HIGHLIGHTS — scroll-triggered pin + block sequences
// =============================================================
(function initPinnedHighlights() {
  const section     = qs('#pinned-section');
  const blocksWrap  = qs('#pinned-blocks');
  const progressBar = qs('#pinned-progress-bar');
  const products    = qs('#pinned-products');

  if (!section || !blocksWrap) return;

  const blocks = qsa('#pinned-blocks .pinned-block');
  let totalY   = 0;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: true,
      anticipatePin: 1,
      start: 'top top',
      end: 'bottom+=200% top',
    },
  });

  // Set initial opacities
  blocks.forEach((block, i) => {
    gsap.set(block, { opacity: 1 / (i + 1) });
  });

  blocks.forEach((block, index) => {
    totalY += block.offsetHeight;

    // Fade the next block in
    if (index >= 1) {
      tl.to(block, { opacity: 1, duration: 2, ease: 'linear' }, '<');
    }

    // Scroll the blocks wrapper up
    tl.to(blocksWrap, {
      y: -totalY,
      duration: 2,
      ease: 'linear',
    }, `block-${index}-out`);

    // Fade this block out
    tl.to(block, {
      opacity: 0,
      duration: 2,
      ease: 'linear',
    }, `block-${index}-out`);

    // Progress bar
    if (progressBar) {
      tl.to(progressBar, {
        height: `${(50 / blocks.length) * (index + 1)}%`,
        duration: 1,
      }, `block-${index}-out`);
    }
  });

  // Transition to products
  if (products) {
    tl.fromTo(
      blocksWrap,
      { opacity: 1 },
      { opacity: 0, duration: 1 },
      'products-in'
    ).fromTo(
      products,
      { opacity: 0, y: '20%' },
      { opacity: 1, y: 0, duration: 1 },
      'products-in'
    );

    if (progressBar) {
      tl.to(progressBar, { height: '100%', duration: 1 }, 'products-in');
    }
  }
})();

// =============================================================
// 9. PRODUCT QUOTE — section entrance + char reveal
// =============================================================
(function initProductQuoteAnimation() {
  const section = qs('#product-quote');
  if (!section) return;

  // Whole section fade in
  gsap.fromTo(section,
    { opacity: 0 },
    {
      opacity: 1,
      scrollTrigger: {
        trigger: section,
        start: 'top bottom-=25%',
      },
      duration: 0.8,
      delay: 0.3,
    }
  );

  // Char-by-char details reveal
  if (typeof SplitText !== 'undefined') {
    const detailsTL = gsap.timeline({
      scrollTrigger: {
        trigger: '.product-quote__details',
        start: 'top bottom-=20%',
      },
    });

    [qs('#pq-heading'), qs('#pq-body')].forEach(el => {
      if (!el) return;
      try {
        const split = SplitText.create(el, { type: 'chars' });
        detailsTL.from(split.chars, {
          visibility: 'hidden',
          stagger: 0.018,
          duration: 0.01,
        });
      } catch (e) { /* fallback — no split */ }
    });
  }
})();

// =============================================================
// 10. STATEMENT BLOCKS — stagger entrance
// =============================================================
(function initStatementBlocks() {
  const blocks = qsa('#statement-blocks .statement-block');
  if (!blocks.length) return;

  gsap.fromTo(blocks,
    { opacity: 0, x: 40 },
    {
      opacity: 1,
      x: 0,
      delay: 0.5,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#statement-blocks',
        start: 'top bottom-=15%',
      },
    }
  );
})();

// =============================================================
// 11. IMAGE & TEXT — entrance
// =============================================================
(function initImageAndText() {
  const section = qs('#variety');
  if (!section) return;

  gsap.fromTo(section,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.8,
      delay: 0.4,
      scrollTrigger: {
        trigger: section,
        start: 'top bottom-=25%',
      },
    }
  );

  // Char reveal for details text
  if (typeof SplitText !== 'undefined') {
    const detailsTL = gsap.timeline({
      scrollTrigger: {
        trigger: '.image-and-text__details',
        start: 'top bottom-=20%',
      },
    });
    qsa('#variety .image-and-text__details p').forEach(el => {
      try {
        const split = SplitText.create(el, { type: 'chars' });
        detailsTL.from(split.chars, {
          visibility: 'hidden',
          stagger: 0.02,
        });
      } catch(e) { /* skip */ }
    });
  }
})();

// =============================================================
// 12. COMPARISON TABLE — row-by-row reveal
// =============================================================
(function initComparisonTable() {
  const section = qs('#comparison');
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top bottom-=30%',
    },
  });

  tl.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 0.6 });

  // Each row of cells animates together
  const maxRow = 6;
  for (let row = 1; row <= maxRow; row++) {
    tl.fromTo(
      qsa(`#comparison .ct-cell[data-row="${row}"]`),
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' },
      `row-${row}`
    );
  }
})();

// =============================================================
// 13. FAQs — entrance animation
// =============================================================
(function initFAQsAnimation() {
  const section = qs('#faqs');
  if (!section) return;

  ['.faqs__eyebrow', '.faqs__button'].forEach(sel => {
    const el = qs(sel);
    if (!el) return;
    gsap.fromTo(el, { opacity: 0 }, {
      opacity: 1,
      scrollTrigger: { trigger: el, start: 'top bottom-=10%' },
      duration: 0.6,
    });
  });

  gsap.fromTo(
    qsa('#faqs .faq-item'),
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.12,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#faqs .faqs__accordions',
        start: 'top bottom-=20%',
      },
    }
  );
})();

// =============================================================
// 14. ARTICLES — entrance
// =============================================================
(function initArticlesAnimation() {
  const section = qs('#articles');
  if (!section) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top bottom-=20%',
    },
  });

  tl.fromTo(
    qsa('#articles .featured-articles__line'),
    { opacity: 0, y: '10%' },
    { opacity: 1, y: 0, ease: 'power2.out', duration: 0.6 }
  ).fromTo(
    qsa('#articles .article-card'),
    { opacity: 0 },
    { opacity: 1, stagger: 0.2, duration: 0.7, ease: 'power2.out' },
    '-=0.3'
  );
})();

// =============================================================
// 15. FOOTER NEWSLETTER ANIMATION
// =============================================================
(function initFooterAnimation() {
  const footer = qs('.site-footer');
  if (!footer) return;

  gsap.fromTo('.site-footer__newsletter-heading',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.site-footer__newsletter',
        start: 'top bottom-=15%',
      },
    }
  );
})();

// =============================================================
// 16. SMOOTH MARQUEE — product card ingredients
//     (CSS-based, but this JS ensures it restarts cleanly)
// =============================================================
(function initMarquee() {
  qsa('.ingredients-track').forEach(track => {
    const parent = track.parentElement;
    if (!parent) return;
    // Pause on hover
    parent.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    parent.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  });
})();

// =============================================================
// 17. GENERAL SCROLL REVEAL — generic utility for generic items
// =============================================================
(function initGenericReveal() {
  // Smooth reveal anything with [data-reveal]
  qsa('[data-reveal]').forEach(el => {
    const dir   = el.dataset.reveal || 'up';
    const delay = parseFloat(el.dataset.delay) || 0;

    const fromVars = { opacity: 0 };
    if (dir === 'up')    fromVars.y = 40;
    if (dir === 'left')  fromVars.x = -40;
    if (dir === 'right') fromVars.x = 40;
    if (dir === 'scale') fromVars.scale = 0.92;

    gsap.fromTo(el, fromVars, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      delay,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom-=10%',
      },
    });
  });
})();
