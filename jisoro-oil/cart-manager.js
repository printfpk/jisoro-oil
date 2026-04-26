/* ================================================================
   JIRASO CART MANAGER
   Single source of truth for cart state across all pages.
   ================================================================ */

(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────── */
  const STORAGE_KEY  = 'jiraso_cart';
  const WA_NUMBER    = '918393976770';

  /* ── Helpers ───────────────────────────────────────────────── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ── Cart State ────────────────────────────────────────────── */

  /** Read cart array from localStorage. Always returns a clean array. */
  function readCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Normalise — handle both old (no qty) and new (qty) formats
      return parsed
        .filter(item => item && typeof item.name === 'string')
        .map(item => ({
          name:       item.name,
          size:       item.size || '1 L',
          qty:        Number.isFinite(item.qty) ? item.qty : 1,
          img:        item.img || item.image || 'assets/bottle.jpeg',
          sub:        item.sub || item.subtitle || '',
          badge:      item.badge || 'Wood Pressed',
          badgeColor: item.badgeColor || '#f3eb66',
          color:      item.color || item.cardBg || '#b8bea8',
          price:      Number.isFinite(item.price) ? item.price : 0,
        }));
    } catch {
      return [];
    }
  }

  /** Write cart array to localStorage. */
  function writeCart(cart) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
  }

  /** Total number of individual units in the cart. */
  function totalQty(cart) {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  /* ── Badge Updates ─────────────────────────────────────────── */

  /** Refresh every `.cart-count` badge on the page with the current count. */
  function refreshBadges() {
    const cart  = readCart();
    const count = totalQty(cart);
    $$('.cart-count').forEach(el => { el.textContent = count; });
  }

  /* ── Add to Cart ───────────────────────────────────────────── */

  /**
   * Add or increment an item.
   * @param {object} item — must have at least `name`
   */
  function addItem(item) {
    const cart     = readCart();
    const existing = cart.find(c => c.name === item.name && c.size === item.size);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    writeCart(cart);
    refreshBadges();
  }

  /** Remove item at index. */
  function removeItem(index) {
    const cart = readCart();
    cart.splice(index, 1);
    writeCart(cart);
    refreshBadges();
    renderCartPage(); // re-draw cart page if present
  }

  /* ── Flying animation ──────────────────────────────────────── */
  function flyToCart(button, imgSrc) {
    const bagEl = $('.cart-count');
    if (!bagEl || !button) return;

    const btnRect = button.getBoundingClientRect();
    const bagRect = bagEl.getBoundingClientRect();

    const img = document.createElement('img');
    img.src         = imgSrc || 'assets/bottle.jpeg';
    img.className   = 'flying-cart-item';
    img.style.left  = `${btnRect.left + btnRect.width  / 2 - 30}px`;
    img.style.top   = `${btnRect.top  + btnRect.height / 2 - 30}px`;
    document.body.appendChild(img);

    // Force reflow then animate
    img.getBoundingClientRect();
    img.style.left      = `${bagRect.left + bagRect.width  / 2 - 30}px`;
    img.style.top       = `${bagRect.top  + bagRect.height / 2 - 30}px`;
    img.style.transform = 'scale(0.1)';
    img.style.opacity   = '0.3';

    bagEl.classList.remove('cart-bump');
    setTimeout(() => {
      img.remove();
      bagEl.classList.add('cart-bump');
      setTimeout(() => bagEl.classList.remove('cart-bump'), 600);
    }, 800);
  }

  /* ── Products / Overlay "Add to Cart" buttons ──────────────── */
  function bindAddButtons() {
    // Overlay cart buttons on product grid (products.html)
    $$('.product-card__overlay-cart').forEach(btn => {
      // Prevent double-binding
      if (btn.dataset.cmBound) return;
      btn.dataset.cmBound = '1';

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const d = btn.dataset;
        addItem({
          name:       d.name       || 'Product',
          size:       d.size       || '1 L',
          img:        d.img        || 'assets/bottle.jpeg',
          sub:        d.sub        || '',
          badge:      d.badge      || 'Wood Pressed',
          badgeColor: d.badgeColor || '#f3eb66',
          color:      d.color      || '#b8bea8',
          price:      parseInt(d.price) || 0,
        });
        flyToCart(btn, d.img);

        // Brief button feedback
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Added!';
        btn.classList.add('is-added');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('is-added'); }, 1800);
      });
    });

    // Product-detail page "Add to Cart" buttons (product-*.html)
    $$('[data-add-to-cart]').forEach(btn => {
      if (btn.dataset.cmBound) return;
      btn.dataset.cmBound = '1';

      btn.addEventListener('click', () => {
        const d = btn.dataset;
        addItem({
          name:       d.name       || $('h1')?.textContent?.trim() || 'Product',
          size:       d.size       || '1 L',
          img:        d.img        || $('img.product-hero__img, .product-card__img')?.getAttribute('src') || 'assets/bottle.jpeg',
          sub:        d.sub        || '',
          badge:      d.badge      || 'Wood Pressed',
          badgeColor: d.badgeColor || '#f3eb66',
          color:      d.color      || '#b8bea8',
          price:      parseInt(d.price) || 0,
        });
        flyToCart(btn, btn.dataset.img);

        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Added!';
        btn.classList.add('is-added');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('is-added'); }, 1800);
      });
    });
  }

  /* ── Cart Page Rendering ───────────────────────────────────── */
  function renderCartPage() {
    const emptyEl    = $('#cart-page-empty');
    const listEl     = $('#cart-page-items');
    const summaryEl  = $('#cart-summary-panel');
    const labelEl    = $('#cart-page-total-label');
    const countEl    = $('#summary-count');
    const subEl      = $('#summary-subtotal');
    const totalEl    = $('#summary-total');
    const waBtnEl    = $('#whatsapp-order-btn');
    const continueEl = $('#cart-continue-link');

    if (!listEl) return;

    const cart  = readCart();
    const count = totalQty(cart);

    if (labelEl) labelEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    if (countEl) countEl.textContent = count;

    if (!cart.length) {
      if (emptyEl)    { emptyEl.style.display    = 'flex'; }
      if (summaryEl)  { summaryEl.classList.remove('show'); }
      if (continueEl) { continueEl.style.display = 'none'; }
      listEl.innerHTML = '';
      return;
    }

    if (emptyEl)    { emptyEl.style.display = 'none'; }
    if (summaryEl)  { summaryEl.classList.add('show'); }
    if (continueEl) { continueEl.style.display = 'inline-flex'; }

    // Build item cards using new premium classes
    listEl.innerHTML = cart.map((item, i) => {
      const waText = encodeURIComponent(`Hi, I'd like to order ${item.name} (${item.size}) x${item.qty}`);
      return `<li class="cmi">
        <div class="cmi-thumb" style="background:${item.color};">
          <img src="${item.img}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cmi-body">
          <p class="cmi-name">${item.name}</p>
          <p class="cmi-size">${item.size}</p>
          ${item.sub ? `<p class="cmi-sub">${item.sub}</p>` : ''}
          <div class="cmi-actions">
            <div class="cmi-qty">
              <button class="cmi-qbtn" onclick="window.jirasoCM.changeQty(${i},-1)" aria-label="Decrease">−</button>
              <span class="cmi-qnum">${item.qty}</span>
              <button class="cmi-qbtn" onclick="window.jirasoCM.changeQty(${i},+1)" aria-label="Increase">+</button>
            </div>
            <a class="cmi-wa" href="https://wa.me/${WA_NUMBER}?text=${waText}" target="_blank" rel="noopener noreferrer">
              <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </a>
            <button class="cmi-rm" onclick="window.jirasoCM.removeItem(${i})">Remove</button>
          </div>
        </div>
      </li>`;
    }).join('');

    // Summary totals
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    if (subEl)   subEl.textContent  = subtotal > 0 ? `₹${subtotal.toLocaleString('en-IN')}` : 'Contact for pricing';
    if (totalEl) totalEl.textContent = subtotal > 0 ? `₹${subtotal.toLocaleString('en-IN')}` : 'Contact for pricing';

    // WhatsApp bulk order link
    if (waBtnEl) {
      const msg = '🛒 JIRASO Order:\n' + cart.map(c => `• ${c.name} (${c.size}) x${c.qty}`).join('\n') + '\n\nPlease confirm availability.';
      waBtnEl.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    }
  }

  /* ── Change Qty ─────────────────────────────────────────────── */
  function changeQty(index, delta) {
    const cart = readCart();
    if (!cart[index]) return;
    cart[index].qty = Math.max(1, cart[index].qty + delta);
    writeCart(cart);
    refreshBadges();
    renderCartPage();
  }

  /* ── Clear All ──────────────────────────────────────────────── */
  function clearCart() {
    writeCart([]);
    refreshBadges();
    renderCartPage();
  }

  /* ── Expose public API ──────────────────────────────────────── */
  window.jirasoCM = { addItem, removeItem, changeQty, clearCart, flyToCart };
  window.animateFlyToCart = flyToCart; // legacy compat

  /* ── Header hamburger / mobile drawer (shared across inner pages) */
  function initMobileDrawer() {
    const hbg    = $('#hbg');
    const drawer = $('#mob-drawer');
    const close  = $('#mob-close');
    if (!hbg || !drawer) return;

    const closeDrawer = () => {
      drawer.classList.remove('open');
      hbg.classList.remove('open');
      document.body.style.overflow = '';
    };

    hbg.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      hbg.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    
    if (close) close.addEventListener('click', closeDrawer);
    
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ── Header scroll solid state ──────────────────────────────── */
  function initHeaderScroll() {
    const hdr = $('#hdr');
    if (!hdr) return;
    const onScroll = () => hdr.classList.toggle('solid', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* ── Initialise ─────────────────────────────────────────────── */
  function init() {
    refreshBadges();       // always sync badge count on every page
    bindAddButtons();      // wire up add-to-cart buttons
    renderCartPage();      // draw cart page if cart elements exist
    initMobileDrawer();    // mobile menu
    initHeaderScroll();    // header scroll effect
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
