/* ================================================================
   JIRASO CART MANAGER
   Single source of truth for cart state across all pages.
   ================================================================ */

(function () {
  'use strict';

  /* ── Constants ─────────────────────────────────────────────── */
  const STORAGE_KEY  = 'jiraso_cart';
  const WA_NUMBER    = '918393976770';   // WhatsApp Business: 8393976770

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
      return parsed
        .filter(item => item && typeof item.name === 'string')
        .map(item => ({
          name:       item.name,
          size:       item.size || '1 L',
          qty:        Number.isFinite(item.qty) ? item.qty : 1,
          img:        item.img || item.image || 'assets/mustard.png',
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
   * Add or increment an item in the cart (silent — no modal).
   * Call openOrderModal() separately when you want the order form.
   * @param {object} item — must have at least `name`
   */
  function addItem(item) {
    // Block out-of-stock items
    if (item.outOfStock) {
      showOosToast(item.name || 'This product');
      return;
    }
    const cart     = readCart();
    const existing = cart.find(c => c.name === item.name && c.size === item.size);
    const qtyToAdd = Number.isFinite(item.qty) ? item.qty : 1;
    if (existing) {
      existing.qty += qtyToAdd;
    } else {
      cart.push({ ...item, qty: qtyToAdd });
    }
    writeCart(cart);
    refreshBadges();
  }

  /** Show a brief "Out of Stock" toast near the top of the page. */
  function showOosToast(name) {
    let toast = document.getElementById('jiraso-oos-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'jiraso-oos-toast';
      toast.style.cssText = [
        'position:fixed', 'top:5.5rem', 'left:50%', 'transform:translateX(-50%)',
        'background:#17140F', 'color:#fff', 'font-family:"DM Mono",monospace',
        'font-size:.72rem', 'text-transform:uppercase', 'letter-spacing:.08em',
        'padding:.65rem 1.5rem', 'border-radius:100px',
        'box-shadow:0 8px 24px rgba(0,0,0,.3)', 'z-index:9999',
        'transition:opacity .3s', 'pointer-events:none'
      ].join(';');
      document.body.appendChild(toast);
    }
    toast.textContent = `${name} is currently out of stock`;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
  }



  /** Remove item at index. */
  function removeItem(index) {
    const cart = readCart();
    cart.splice(index, 1);
    writeCart(cart);
    refreshBadges();
    renderCartPage();
  }

  /* ── Flying animation ──────────────────────────────────────── */
  function flyToCart(button, imgSrc) {
    const bagEl = $('.cart-count');
    if (!bagEl || !button) return;

    const btnRect = button.getBoundingClientRect();
    const bagRect = bagEl.getBoundingClientRect();

    const img = document.createElement('img');
    img.src         = imgSrc || 'assets/mustard.png';
    img.className   = 'flying-cart-item';
    img.style.left  = `${btnRect.left + btnRect.width  / 2 - 30}px`;
    img.style.top   = `${btnRect.top  + btnRect.height / 2 - 30}px`;
    document.body.appendChild(img);

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

  /* ══════════════════════════════════════════════════════════════
     ORDER FORM MODAL
     Opens after Add to Cart. Collects: Name, Address, Pincode,
     Contact No. — then sends everything to WhatsApp.
  ══════════════════════════════════════════════════════════════ */

  function injectOrderModal() {
    if (document.getElementById('jiraso-order-modal')) return;

    const style = document.createElement('style');
    style.textContent = `
      #jiraso-order-modal {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 8000;
        background: rgba(10,8,5,.78);
        backdrop-filter: blur(10px);
        align-items: center;
        justify-content: center;
        padding: 1.25rem;
      }
      #jiraso-order-modal.open { display: flex; }

      .jom-box {
        background: #FDFCF8;
        border-radius: 24px;
        width: 100%;
        max-width: 480px;
        padding: 2.25rem 2rem 2rem;
        box-shadow: 0 32px 80px rgba(0,0,0,.35);
        position: relative;
        animation: jomSlideUp .4s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes jomSlideUp {
        from { opacity:0; transform:translateY(28px) scale(.97); }
        to   { opacity:1; transform:none; }
      }
      .jom-close {
        position: absolute;
        top: 1.1rem; right: 1.25rem;
        background: #EDE8DF;
        border: none;
        width: 34px; height: 34px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.1rem;
        cursor: pointer;
        color: #5A554E;
        transition: background .2s;
      }
      .jom-close:hover { background: #DDD6CB; }

      .jom-title {
        font-family: 'Playfair Display', 'DM Serif Display', Georgia, serif;
        font-size: 1.55rem;
        font-style: italic;
        color: #17140F;
        margin-bottom: .25rem;
      }
      .jom-sub {
        font-size: .8rem;
        color: #928D85;
        margin-bottom: 1.5rem;
        line-height: 1.5;
      }

      .jom-field {
        display: flex;
        flex-direction: column;
        gap: .4rem;
        margin-bottom: 1rem;
      }
      .jom-label {
        font-family: 'DM Mono', monospace;
        font-size: .62rem;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: #5A554E;
        font-weight: 600;
      }
      .jom-input {
        border: 1.5px solid #DDD6CB;
        border-radius: 10px;
        padding: .75rem 1rem;
        font-size: .95rem;
        font-family: inherit;
        color: #17140F;
        background: #fff;
        outline: none;
        transition: border-color .2s, box-shadow .2s;
        width: 100%;
      }
      .jom-input:focus {
        border-color: #C4923A;
        box-shadow: 0 0 0 3px rgba(196,146,58,.15);
      }

      .jom-row {
        display: grid;
        grid-template-columns: 1fr 120px;
        gap: .75rem;
      }

      .jom-summary {
        background: #EDE8DF;
        border-radius: 12px;
        padding: .85rem 1rem;
        margin-bottom: 1.25rem;
        font-size: .78rem;
        color: #5A554E;
        line-height: 1.7;
      }
      .jom-summary strong { color: #17140F; font-weight: 600; }

      .jom-submit {
        width: 100%;
        padding: 1rem;
        background: #25D366;
        color: #fff;
        border: none;
        border-radius: 12px;
        font-family: 'DM Mono', monospace;
        font-size: .78rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .08em;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: .55rem;
        transition: background .2s, transform .15s, box-shadow .2s;
      }
      .jom-submit:hover {
        background: #1aab52;
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(37,211,102,.3);
      }
      .jom-note {
        text-align: center;
        font-size: .67rem;
        color: #C4A882;
        margin-top: .85rem;
        font-family: 'DM Mono', monospace;
        text-transform: uppercase;
        letter-spacing: .05em;
      }
      .jom-err {
        color: #c4392a;
        font-size: .72rem;
        margin-top: -.5rem;
        margin-bottom: .5rem;
        display: none;
      }

      @media(max-width:480px) {
        .jom-box { padding: 1.75rem 1.25rem 1.5rem; }
        .jom-row { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.id = 'jiraso-order-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'jom-title');
    modal.innerHTML = `
      <div class="jom-box">
        <button class="jom-close" id="jom-close-btn" aria-label="Close">✕</button>
        <h2 class="jom-title" id="jom-title">Complete Your Order</h2>
        <p class="jom-sub">Fill your details and we'll confirm your order on WhatsApp instantly.</p>

        <div id="jom-cart-summary" class="jom-summary"></div>

        <form id="jom-form" novalidate>
          <div class="jom-field">
            <label class="jom-label" for="jom-name">Full Name *</label>
            <input class="jom-input" type="text" id="jom-name" placeholder="e.g. Priya Sharma" autocomplete="name" required>
          </div>

          <div class="jom-field">
            <label class="jom-label" for="jom-phone">Contact Number *</label>
            <input class="jom-input" type="tel" id="jom-phone" placeholder="10-digit mobile number" autocomplete="tel" required maxlength="10">
          </div>

          <div class="jom-field">
            <label class="jom-label" for="jom-address">Delivery Address *</label>
            <input class="jom-input" type="text" id="jom-address" placeholder="House/Flat, Street, Area" autocomplete="street-address" required>
          </div>

          <div class="jom-row">
            <div class="jom-field" style="margin-bottom:1.25rem;">
              <label class="jom-label" for="jom-city">City</label>
              <input class="jom-input" type="text" id="jom-city" placeholder="City" autocomplete="address-level2">
            </div>
            <div class="jom-field" style="margin-bottom:1.25rem;">
              <label class="jom-label" for="jom-pin">Pincode *</label>
              <input class="jom-input" type="text" id="jom-pin" placeholder="6-digit" maxlength="6" required>
            </div>
          </div>

          <p class="jom-err" id="jom-err">Please fill all required fields correctly.</p>

          <button type="submit" class="jom-submit" id="jom-submit-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Send Order on WhatsApp
          </button>
          <p class="jom-note">Your order will be sent to our WhatsApp business account</p>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeOrderModal();
    });
    document.getElementById('jom-close-btn').addEventListener('click', closeOrderModal);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeOrderModal();
    });

    // Form submit
    document.getElementById('jom-form').addEventListener('submit', function(e) {
      e.preventDefault();
      submitOrder();
    });
  }

  function openOrderModal() {
    injectOrderModal();
    // Populate cart summary
    const cart = readCart();
    const summaryEl = document.getElementById('jom-cart-summary');
    if (summaryEl && cart.length) {
      const lines = cart.map(c => `<strong>${c.name}</strong> (${c.size}) × ${c.qty}${c.price ? ' — ₹' + (c.price * c.qty).toLocaleString('en-IN') : ''}`);
      const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
      summaryEl.innerHTML = lines.join('<br>') + (subtotal > 0 ? `<br><strong>Total: ₹${subtotal.toLocaleString('en-IN')}</strong>` : '');
    }
    document.getElementById('jiraso-order-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first input
    setTimeout(() => {
      const inp = document.getElementById('jom-name');
      if (inp) inp.focus();
    }, 100);
  }

  function closeOrderModal() {
    const modal = document.getElementById('jiraso-order-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function submitOrder() {
    const name    = document.getElementById('jom-name').value.trim();
    const phone   = document.getElementById('jom-phone').value.trim();
    const address = document.getElementById('jom-address').value.trim();
    const city    = document.getElementById('jom-city').value.trim();
    const pin     = document.getElementById('jom-pin').value.trim();
    const errEl   = document.getElementById('jom-err');

    // Basic validation
    if (!name || !phone || phone.length < 10 || !address || !pin || pin.length < 6) {
      errEl.style.display = 'block';
      errEl.textContent   = 'Please fill all required fields correctly (10-digit phone, 6-digit pincode).';
      return;
    }
    errEl.style.display = 'none';

    const cart = readCart();
    const orderLines = cart.map(c =>
      `• ${c.name} (${c.size}) × ${c.qty}${c.price ? ' — ₹' + (c.price * c.qty).toLocaleString('en-IN') : ''}`
    ).join('\n');
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

    const msg = [
      '🛒 *New Order — JIRASO Organics*',
      '',
      `*Customer:* ${name}`,
      `*Contact:* ${phone}`,
      `*Address:* ${address}${city ? ', ' + city : ''}`,
      `*Pincode:* ${pin}`,
      '',
      '*Order Details:*',
      orderLines,
      subtotal > 0 ? `\n*Total: ₹${subtotal.toLocaleString('en-IN')}*` : '',
      '',
      'Please confirm availability and delivery time. Thank you!'
    ].join('\n');

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    closeOrderModal();
  }

  /* ── Products / Overlay "Add to Cart" buttons ──────────────── */
  function bindAddButtons() {
    // Overlay cart buttons on product grid (products.html)
    $$('.product-card__overlay-cart').forEach(btn => {
      if (btn.dataset.cmBound) return;
      btn.dataset.cmBound = '1';

      btn.addEventListener('click', e => {
        e.stopPropagation();
        // Block if inside an out-of-stock card
        if (btn.closest('.product-card-wrap.oos')) {
          showOosToast(btn.dataset.name || 'This product');
          return;
        }
        const d = btn.dataset;

        addItem({
          name:       d.name       || 'Product',
          size:       d.size       || '1 L',
          img:        d.img        || 'assets/mustard.png',
          sub:        d.sub        || '',
          badge:      d.badge      || 'Wood Pressed',
          badgeColor: d.badgeColor || '#f3eb66',
          color:      d.color      || '#b8bea8',
          price:      parseInt(d.price) || 0,
        });
        flyToCart(btn, d.img);

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
          img:        d.img        || $('img.product-hero__img, .product-card__img')?.getAttribute('src') || 'assets/mustard.png',
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

    listEl.innerHTML = cart.map((item, i) => {
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
            <button class="cmi-rm" onclick="window.jirasoCM.removeItem(${i})">Remove</button>
          </div>
        </div>
      </li>`;
    }).join('');

    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    if (subEl)   subEl.textContent  = subtotal > 0 ? `₹${subtotal.toLocaleString('en-IN')}` : 'Contact for pricing';
    if (totalEl) totalEl.textContent = subtotal > 0 ? `₹${subtotal.toLocaleString('en-IN')}` : 'Contact for pricing';

    // WhatsApp bulk order — opens form modal
    if (waBtnEl) {
      waBtnEl.removeAttribute('href');
      waBtnEl.style.cursor = 'pointer';
      if (!waBtnEl.dataset.cmBound) {
        waBtnEl.dataset.cmBound = '1';
        waBtnEl.addEventListener('click', function(e) {
          e.preventDefault();
          openOrderModal();
        });
      }
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
  window.jirasoCM = { addItem, removeItem, changeQty, clearCart, flyToCart, openOrderModal };
  window.animateFlyToCart = flyToCart; // legacy compat

  /* ── Header hamburger / mobile drawer ─────────────────────── */
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
    onScroll();
  }

  /* ── Initialise ─────────────────────────────────────────────── */
  function init() {
    refreshBadges();
    bindAddButtons();
    renderCartPage();
    initMobileDrawer();
    initHeaderScroll();
    injectOrderModal();   // pre-inject modal DOM on load
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
