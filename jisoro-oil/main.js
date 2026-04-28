// =============================================================
// DRINKPOUCH — PRODUCTION JAVASCRIPT
// GSAP + ScrollTrigger Animations
// =============================================================

// Register GSAP plugins safely (SplitText may fail to load on some browsers/CDN states).
if (typeof gsap !== 'undefined') {
  const gsapPlugins = [];
  if (typeof ScrollTrigger !== 'undefined') gsapPlugins.push(ScrollTrigger);
  if (typeof SplitText !== 'undefined') gsapPlugins.push(SplitText);
  if (gsapPlugins.length) gsap.registerPlugin(...gsapPlugins);
}

// =============================================================
// UTILITIES
// =============================================================
const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

// =============================================================
// 1. SCROLL-BASED HEADER BEHAVIOR
// =============================================================
(function initHeader() {
  const header = qs('#site-header');
  if (!header) return;

  // Keep navbar appearance fixed across scroll.
  header.classList.remove('is-scrolled');
})();

// =============================================================
// 2. MOBILE MENU
// =============================================================
(function initMobileMenu() {
  const toggle = qs('#menu-toggle');
  const drawer = qs('#mobile-drawer');
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
  const btn = qs('#sound-toggle');
  const video = qs('.hero-banner__bg-video');
  if (!btn || !video) return;

  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    btn.textContent = video.muted ? 'Sound: off' : 'Sound: on ';
  });
})();

// =============================================================
// 4. CART
// =============================================================
(function initCart() {
  const CART_STORAGE_KEY = 'jiraso_cart';
  const WHATSAPP_NUMBER = '919479976760';

  const addButtons = qsa('.product-card-quick-add');
  const navCount = qs('#cart-count-nav');
  const bagCount = qs('#cart-count-bag');
  const cartPageList = qs('#cart-page-items');
  const cartPageEmpty = qs('#cart-page-empty');
  const cartPageTotal = qs('#cart-page-total');

  let cartItems = [];

  const safeReadCart = () => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(item => item && typeof item.name === 'string' && Number.isFinite(item.qty))
        .map(item => ({
          name: item.name,
          size: item.size || 'Standard',
          qty: item.qty,
          image: item.image || 'assets/mustard.png',
          subtitle: item.subtitle || 'Pure wood-pressed oil.',
          badge: item.badge || 'In Cart',
          cardBg: item.cardBg || '#E8E4D9',
        }));
    } catch (e) {
      return [];
    }
  };

  const persistCart = () => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      // Ignore storage errors (private browsing / storage full).
    }
  };

  const totalCount = () => cartItems.reduce((sum, item) => sum + item.qty, 0);

  const setCountText = (el, count) => {
    if (!el) return;
    el.textContent = count;
  };

  window.animateFlyToCart = (button, imgUrl) => {
    const bagIcon = qs('#cart-count-bag') || qs('#cart-count-nav') || qs('.cart-count');
    if (!bagIcon || !button) return;

    const btnRect = button.getBoundingClientRect();
    const bagRect = bagIcon.getBoundingClientRect();

    const img = document.createElement('img');
    img.src = imgUrl || 'assets/mustard.png';
    img.className = 'flying-cart-item';
    img.style.left = `${btnRect.left + btnRect.width / 2 - 30}px`;
    img.style.top = `${btnRect.top + btnRect.height / 2 - 30}px`;
    document.body.appendChild(img);

    img.getBoundingClientRect();

    img.style.left = `${bagRect.left + bagRect.width / 2 - 30}px`;
    img.style.top = `${bagRect.top + bagRect.height / 2 - 30}px`;
    img.style.transform = 'scale(0.1)';
    img.style.opacity = '0.5';

    bagIcon.classList.remove('cart-bump');
    setTimeout(() => {
      img.remove();
      bagIcon.classList.add('cart-bump');
    }, 800);
  };

  const renderCartItems = () => {
    const count = totalCount();
    setCountText(navCount, count);
    setCountText(bagCount, count);

    if (cartPageTotal) {
      cartPageTotal.textContent = String(count);
    }

    if (!cartPageList || !cartPageEmpty) return;

    cartPageList.innerHTML = '';

    if (!cartItems.length) {
      cartPageEmpty.style.display = 'block';
      return;
    }

    cartPageEmpty.style.display = 'none';

    cartItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'cart-page__item cart-product-card';

      const cardWrap = document.createElement('div');
      cardWrap.className = 'product-card-wrap';

      const card = document.createElement('a');
      card.className = 'product-card';
      card.href = '#';
      card.style.setProperty('--card-bg', item.cardBg || '#E8E4D9');

      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = item.badge || 'In Cart';

      const imageWrap = document.createElement('div');
      imageWrap.className = 'product-card__image-wrap';

      const image = document.createElement('img');
      image.className = 'product-card__img';
      image.src = item.image || 'assets/mustard.png';
      image.alt = item.name;

      const footer = document.createElement('div');
      footer.className = 'product-card__footer';

      const titleRow = document.createElement('div');
      titleRow.className = 'product-card__title-row';

      const name = document.createElement('p');
      name.className = 'product-card__name';
      name.textContent = item.name;

      const size = document.createElement('p');
      size.className = 'product-card__size eyebrow';
      size.textContent = `${item.size || 'Standard'} x ${item.qty}`;

      const sub = document.createElement('p');
      sub.className = 'product-card__sub eyebrow';
      sub.textContent = item.subtitle || 'Pure wood-pressed oil.';

      titleRow.appendChild(name);
      titleRow.appendChild(size);
      footer.appendChild(titleRow);
      footer.appendChild(sub);
      imageWrap.appendChild(image);
      card.appendChild(badge);
      card.appendChild(imageWrap);
      card.appendChild(footer);

      const actions = document.createElement('div');
      actions.className = 'cart-card-actions';

      const orderBtn = document.createElement('button');
      orderBtn.type = 'button';
      orderBtn.className = 'product-card-quick-add product-card-quick-add--whatsapp';
      orderBtn.textContent = 'Order via WhatsApp';
      orderBtn.addEventListener('click', () => {
        const msg = `Hi, I want to order ${item.name} (${item.size || 'Standard'}) - Qty: ${item.qty}.`;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      });

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'product-card-quick-add product-card-quick-add--remove';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        cartItems.splice(index, 1);
        persistCart();
        renderCartItems();
      });

      actions.appendChild(orderBtn);
      actions.appendChild(removeBtn);
      cardWrap.appendChild(card);
      cardWrap.appendChild(actions);
      li.appendChild(cardWrap);
      cartPageList.appendChild(li);
    });
  };

  const extractProductInfo = (button) => {
    const wrap = button.closest('.product-card-wrap');
    if (!wrap) {
      return {
        name: 'Item',
        size: 'Standard',
        image: 'assets/mustard.png',
        subtitle: 'Pure wood-pressed oil.',
        badge: 'In Cart',
        cardBg: '#E8E4D9',
      };
    }

    const name = qs('.product-card__name', wrap)?.textContent?.trim() || 'Item';
    const size = qs('.product-card__size', wrap)?.textContent?.trim() || 'Standard';
    const image = qs('.product-card__img', wrap)?.getAttribute('src') || 'assets/mustard.png';
    const subtitle = qs('.product-card__sub', wrap)?.textContent?.trim() || 'Pure wood-pressed oil.';
    const badge = qs('.badge', wrap)?.textContent?.trim() || 'In Cart';
    const cardBg = qs('.product-card', wrap)?.style.getPropertyValue('--card-bg')?.trim() || '#E8E4D9';

    return { name, size, image, subtitle, badge, cardBg };
  };

  const addToCart = (item) => {
    const existing = cartItems.find(cartItem => cartItem.name === item.name && cartItem.size === item.size);
    if (existing) {
      existing.qty += 1;
    } else {
      cartItems.push({ ...item, qty: 1 });
    }

    persistCart();
    renderCartItems();
  };

  cartItems = safeReadCart();
  renderCartItems();

  addButtons.forEach(button => {
    button.addEventListener('click', () => {
      const item = extractProductInfo(button);
      addToCart(item);
      window.animateFlyToCart(button, item.image);
    });
  });

})();

// =============================================================
// 5. FAQ ACCORDION — smooth height animation
// =============================================================
(function initFAQs() {
  qsa('.faq-item').forEach(item => {
    const summary = qs('summary', item);
    const body = qs('.faq-item__body', item);
    const icon = qs('.faq-icon', item);
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
// 6. HERO BANNER — entrance animations
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
// 7. FEATURED PRODUCTS — stagger entrance
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
// 8. VISUAL HEADING — scroll-driven typing reveal
// =============================================================
(function initVisualHeading() {
  const heading = qs('#visual-heading-text');
  if (!heading) return;
  if (heading.dataset.typingInit === 'true') return;

  // Native char-splitting so typing works even without SplitText plugin.
  const textNodes = [];
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = walker.nextNode();
  while (current) {
    textNodes.push(current);
    current = walker.nextNode();
  }

  const charSpans = [];
  textNodes.forEach(node => {
    const frag = document.createDocumentFragment();
    const chars = [...node.nodeValue];

    chars.forEach(ch => {
      const span = document.createElement('span');
      span.className = 'typing-char';
      span.textContent = ch;
      frag.appendChild(span);
      charSpans.push(span);
    });

    node.parentNode.replaceChild(frag, node);
  });

  if (!charSpans.length) return;

  // Prevent repeated wrapping if script executes again.
  heading.dataset.typingInit = 'true';

  gsap.set(charSpans, {
    opacity: 0,
    color: 'var(--color-navy)',
  });

  gsap.to(charSpans, {
    opacity: 1,
    stagger: 0.018,
    duration: 0.01,
    ease: 'none',
    scrollTrigger: {
      trigger: heading,
      start: 'top 86%',
      end: 'bottom 58%',
      scrub: true,
    },
  });
})();

// =============================================================
// 9. PINNED HIGHLIGHTS — scroll-triggered pin + block sequences
// =============================================================
(function initPinnedHighlights() {
  const section = qs('#pinned-section');
  const blocksWrap = qs('#pinned-blocks');
  const products = qs('#pinned-products');

  if (!section || !blocksWrap) return;

  // Keep this section static (no pinning/scroll animation).
  section.style.height = 'auto';
  section.style.overflow = 'visible';
  blocksWrap.style.transform = 'none';

  qsa('#pinned-blocks .pinned-block').forEach((block) => {
    block.style.opacity = '1';
  });

  if (products) {
    products.style.opacity = '1';
    products.style.transform = 'none';
  }
})();

// =============================================================
// 10. PRODUCT QUOTE — section entrance + char reveal
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
      } catch (e) { /* skip */ }
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
  qsa('[data-reveal]').forEach(el => {
    // Disable CSS transitions so GSAP can animate smoothly without lag
    el.style.transition = 'none';

    const dir = el.dataset.reveal || 'up';
    // The HTML has data-delay="1", "2", etc. Treat them as 150ms steps.
    const delay = (parseFloat(el.dataset.delay) || 0) * 0.15;

    const fromVars = { opacity: 0 };
    if (dir === 'up') fromVars.y = 40;
    if (dir === 'left') fromVars.x = -40;
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
        start: 'top bottom',
      },
    });
  });
})();

// =============================================================
// 18. PHOTO CAROUSEL
// =============================================================
(function initCarousel() {
  const track = document.getElementById('carousel-track');
  const dotsEl = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

  // Build dots
  if (dotsEl) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }

  function getDots() {
    return dotsEl ? dotsEl.querySelectorAll('.carousel-dot') : [];
  }

  function goTo(index) {
    // Wrap around
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update dots
    getDots().forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
    });

    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Keyboard support
  document.addEventListener('keydown', e => {
    if (!document.getElementById('pinned-section')) return;
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  }, { passive: true });

  // Auto-play every 5 seconds
  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  startAuto();

  // Pause auto-play on hover
  const wrapper = track.closest('.carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
    wrapper.addEventListener('mouseleave', startAuto);
  }
})();

// =============================================================
// 19. INJECT "PARTNER US" NAV LINK ON ALL PAGES
// =============================================================
(function injectPartnerNav() {
  // Desktop nav
  var navUl = document.querySelector('.nav-links');
  if (navUl && !navUl.querySelector('a[href="partner.html"]')) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = 'partner.html';
    a.textContent = 'Partner Us';
    li.appendChild(a);
    navUl.appendChild(li);
  }

  // Mobile drawer
  var drawer = document.getElementById('mob-drawer');
  if (drawer && !drawer.querySelector('a[href="partner.html"]')) {
    var da = document.createElement('a');
    da.href = 'partner.html';
    da.textContent = 'Partner Us';
    drawer.appendChild(da);
  }

  // Footer nav
  var footerNav = document.querySelector('.site-footer-premium__links');
  if (footerNav && !footerNav.querySelector('a[href="partner.html"]')) {
    var fa = document.createElement('a');
    fa.href = 'partner.html';
    fa.textContent = 'Partner Us';
    footerNav.appendChild(fa);
  }
})();

// =============================================================
// 20. GSAP FLIP TEXT ANIMATION FOR NAVBAR & FOOTER
// =============================================================
(function initFlipTextHover() {
  if (typeof gsap === 'undefined') return;

  // Small delay to ensure all injected links (like Partner Us) are in the DOM
  setTimeout(() => {
    const links = document.querySelectorAll('.nav-links a, .site-footer-premium__links a, .site-footer__col a, .fc a, .mob-drawer a');
    
    links.forEach(link => {
      if (link.querySelector('svg') || link.dataset.flipInit) return;
      link.dataset.flipInit = 'true';

      const text = link.textContent.trim();
      if (!text) return;

      link.textContent = '';
      link.style.overflow = 'hidden';
      
      const wrapper = document.createElement('div');
      wrapper.className = 'flip-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-flex';
      wrapper.style.overflow = 'hidden';
      wrapper.style.height = '1.2em'; // Fixed height to prevent shifting
      wrapper.style.lineHeight = '1.2em';

      const front = document.createElement('div');
      front.className = 'flip-front';
      front.style.display = 'inline-block';

      const back = document.createElement('div');
      back.className = 'flip-back';
      back.style.position = 'absolute';
      back.style.left = '0';
      back.style.top = '0';
      back.style.display = 'inline-block';
      back.style.width = '100%';

      // Manual character splitting for guaranteed "SplitText" effect
      const chars = text.split('');
      chars.forEach(char => {
        const spanF = document.createElement('span');
        spanF.textContent = char === ' ' ? '\u00A0' : char;
        spanF.style.display = 'inline-block';
        front.appendChild(spanF);

        const spanB = document.createElement('span');
        spanB.textContent = char === ' ' ? '\u00A0' : char;
        spanB.style.display = 'inline-block';
        back.appendChild(spanB);
      });

      wrapper.appendChild(front);
      wrapper.appendChild(back);
      link.appendChild(wrapper);

      const frontChars = front.querySelectorAll('span');
      const backChars = back.querySelectorAll('span');

      gsap.set(backChars, { yPercent: 100 });

      const tl = gsap.timeline({ paused: true });
      tl.to(frontChars, { 
        yPercent: -100, 
        stagger: 0.02, 
        duration: 0.45, 
        ease: 'power3.inOut' 
      }, 0)
      .to(backChars, { 
        yPercent: 0, 
        stagger: 0.02, 
        duration: 0.45, 
        ease: 'power3.inOut' 
      }, 0);

      link.addEventListener('mouseenter', () => tl.play());
      link.addEventListener('mouseleave', () => tl.reverse());
    });
  }, 100); 
})();
