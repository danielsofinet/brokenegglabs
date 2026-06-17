/* Broken Egg Labs — contact modal (clean vanilla JS).
   Opens from the nav "Contact" link, any old mailto link, or any [data-contact]
   element. Submits to Web3Forms -> daniel.sofinet@gmail.com. No dependencies. */
(function () {
  var ACCESS_KEY = "b10bd5d4-b5bd-4a2e-9363-1f25ee7c138b";

  /* ---------------------------------------------------------------- clean URL
     Keep the address bar at "/" on every page. The page transitions (Barba)
     otherwise change it to the full path, e.g. /projects/minot-vin.html. Barba
     loads pages by the clicked link's href, not the visible URL, so pinning the
     displayed URL to "/" is safe (verified across multi-page navigation). */
  (function () {
    var push = history.pushState.bind(history);
    var replace = history.replaceState.bind(history);
    history.pushState = function (s, t) { return push(s, t, "/"); };
    history.replaceState = function (s, t) { return replace(s, t, "/"); };
    try { replace(history.state, "", "/"); } catch (e) {}
  })();

  var modal = document.createElement("div");
  modal.className = "bke-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML =
    '<div class="bke-scrim" data-close></div>' +
    '<div class="bke-card" role="dialog" aria-modal="true" aria-label="Contact Broken Egg Labs">' +
      '<button class="bke-close" type="button" aria-label="Close" data-close>&times;</button>' +
      '<div class="bke-body">' +
        '<p class="bke-eyebrow">Say hello</p>' +
        '<h2 class="bke-title">Let’s make<br>something.</h2>' +
        '<p class="bke-sub">Tell us a little about your project and we’ll get back to you.</p>' +
        '<form class="bke-form" novalidate>' +
          '<input type="hidden" name="access_key" value="' + ACCESS_KEY + '">' +
          '<input type="hidden" name="subject" value="New message from brokenegglabs.com">' +
          '<input type="hidden" name="from_name" value="Broken Egg Labs site">' +
          '<input type="checkbox" name="botcheck" class="bke-hp" tabindex="-1" autocomplete="off">' +
          '<label class="bke-field"><span>Name</span><input type="text" name="name" autocomplete="name" required></label>' +
          '<label class="bke-field"><span>Email</span><input type="email" name="email" autocomplete="email" required></label>' +
          '<label class="bke-field"><span>Message</span><textarea name="message" rows="4" required></textarea></label>' +
          '<button class="bke-send" type="submit">Send message</button>' +
          '<p class="bke-status" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<div class="bke-success"><p class="bke-success-emoji">✨</p><h3>Thank you!</h3><p>Your message is on its way — we’ll be in touch soon.</p></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  var form = modal.querySelector(".bke-form");
  var statusEl = modal.querySelector(".bke-status");
  var sendBtn = modal.querySelector(".bke-send");
  var lastFocus = null;

  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    var first = modal.querySelector('input[name="name"]');
    setTimeout(function () { if (first) first.focus(); }, 60);
  }
  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // open from: nav Contact link, legacy mailto links, or anything [data-contact]
  // capture phase + stopImmediatePropagation so we win over the old theme JS
  // Triggers: anything marked [data-contact] (the contact CTAs on the contact
  // page) and any legacy mailto link. The nav "Contact" link is NOT intercepted —
  // it navigates to the contact page as normal.
  document.addEventListener("click", function (e) {
    var t = e.target.closest('[data-contact], a[href^="mailto:"]');
    if (!t) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open(e);
  }, true);
  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });

  // Progressive autoplay for background videos. IntersectionObserver is unreliable
  // with the theme's transform-based virtual scroll (ASScroll), so we poll each
  // video's real position a few times a second: play the ones in view, pause the
  // rest. Robust to ASScroll, page transitions, and the muted-autoplay policy.
  function initVideos() {
    document.querySelectorAll("video[autoplay], video.bke-vid").forEach(function (v) {
      v.muted = true;
      v.setAttribute("playsinline", "");
      v.removeAttribute("controls");
    });
    tickVideos();
  }
  function tickVideos() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll("video[autoplay], video.bke-vid").forEach(function (v) {
      var r = v.getBoundingClientRect();
      var inView = r.height > 0 && r.top < vh * 0.95 && r.bottom > vh * 0.05;
      if (inView) {
        v.muted = true;
        if (v.paused) v.play().catch(function () {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }
  initVideos();
  setInterval(tickVideos, 300);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.querySelector(".bke-hp").checked) return; // honeypot
    statusEl.textContent = "";
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success) {
          modal.querySelector(".bke-body").classList.add("is-sent");
        } else {
          throw new Error(data && data.message ? data.message : "error");
        }
      })
      .catch(function () {
        statusEl.textContent = "Something went wrong — email us at daniel.sofinet@gmail.com.";
        sendBtn.disabled = false;
        sendBtn.textContent = "Send message";
      });
  });

  /* ---------------------------------------------------------------- replacement nav
     Hide the GSAP-pinned header and run our own fixed clone. It stays put, folds
     smoothly on scroll the same way on every page, and recolours itself light/dark
     to match the page it's over. */
  var bkeNav = null;
  function isDarkBg(hex) {
    if (!hex) return false;
    hex = hex.replace("#", "").trim();
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var r = parseInt(hex.substr(0, 2), 16), g = parseInt(hex.substr(2, 2), 16), b = parseInt(hex.substr(4, 2), 16);
    if (isNaN(r)) return false;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
  }
  function currentBg() {
    var m = document.querySelector('[data-barba="container"]') || document.querySelector("main");
    return (m && m.getAttribute("data-bg")) || "#F7F6F1";
  }
  function syncNavColor() {
    if (bkeNav) bkeNav.classList.toggle("is-dark", isDarkBg(currentBg()));
  }
  function buildNav() {
    if (bkeNav) return;
    var orig = document.querySelector("header");
    if (!orig) return;
    // a <div>, not a <header>, so the theme's JS (which animates `header` opacity on
    // the intro) doesn't touch our nav and leave it stuck invisible
    bkeNav = document.createElement("div");
    bkeNav.className = "bke-nav";
    bkeNav.innerHTML = orig.innerHTML;
    bkeNav.querySelectorAll("a[href]").forEach(function (a) {
      var m = (a.getAttribute("href") || "").match(/(index|pr|cs|contact)\.html$/);
      if (m) a.setAttribute("href", "/" + m[0]);
    });
    document.body.appendChild(bkeNav);
    syncNavColor();
    holdNavForPreloader();
  }
  // On a full page load the theme plays an intro preloader (~3s). Don't show our nav
  // on top of it — reveal it when the preloader lifts, so it appears with the page
  // (just like it stays put during a Barba navigation, which has no preloader).
  function preloaderActive() {
    var p = document.querySelector(".pre-load");
    if (!p) return false;
    var cs = getComputedStyle(p);
    return cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity || "1") > 0.01;
  }
  function holdNavForPreloader() {
    if (!bkeNav || !preloaderActive()) return;
    bkeNav.classList.add("bke-preload-wait");
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (!preloaderActive() || tries > 80) {
        bkeNav.classList.remove("bke-preload-wait");
        clearInterval(iv);
      }
    }, 80);
  }
  buildNav();
  // re-colour + reset fold state whenever a new page is swapped in
  new MutationObserver(function () {
    syncNavColor();
    navVY = 0;
    if (bkeNav) bkeNav.classList.remove("bke-hide");
    initVideos();
    // a new page swapped in — reveal the transition cover once its layout settles
    if (coverActive) { clearTimeout(coverHideTimer); coverHideTimer = setTimeout(hideCover, 1250); }
  }).observe(document.body, { childList: true });

  /* ---------------------------------------------------------------- page transition
     Show a branded circle wipe on internal navigation (visual only — the theme's
     Barba still does the actual swap). The cover stays up through the swap AND the
     post-swap layout settle, so the new page never "blinks into place"; it lifts once
     the content has settled. */
  var cover = document.createElement("div");
  cover.className = "bke-cover";
  document.body.appendChild(cover);
  var coverActive = false, coverHideTimer = null;
  function showCover(x, y) {
    cover.classList.remove("is-out");
    cover.style.setProperty("--cx", (x || window.innerWidth / 2) + "px");
    cover.style.setProperty("--cy", (y || window.innerHeight / 2) + "px");
    void cover.offsetWidth;
    cover.classList.add("is-in");
    coverActive = true;
    clearTimeout(coverHideTimer);
    coverHideTimer = setTimeout(hideCover, 2800); // fallback if nav never completes
  }
  function hideCover() {
    if (!coverActive) return;
    coverActive = false;
    clearTimeout(coverHideTimer);
    cover.classList.add("is-out");
    setTimeout(function () { cover.classList.remove("is-in", "is-out"); }, 560);
  }
  // capture phase so we run before Barba calls preventDefault (visual only — we don't
  // stop the event, Barba still performs the swap)
  document.addEventListener("click", function (e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || a.hasAttribute("data-contact") || a.target === "_blank") return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    var url;
    try { url = new URL(href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin || !/\.html(\?|#|$)/.test(url.pathname)) return;
    showCover(e.clientX, e.clientY);
  }, true);

  // Fold: hide on scroll down, show on scroll up, always show near the top.
  // ASScroll hijacks the wheel (native scroll stays at 0) on desktop, so we track a
  // virtual scroll position from wheel deltas; on touch devices native scroll works.
  var navVY = 0;
  function navShow() { if (bkeNav) bkeNav.classList.remove("bke-hide"); }
  function navHide() { if (bkeNav) bkeNav.classList.add("bke-hide"); }
  window.addEventListener("wheel", function (e) {
    if (!bkeNav) return;
    navVY = Math.max(0, navVY + e.deltaY);
    if (navVY < 100) navShow();
    else if (e.deltaY > 6) navHide();
    else if (e.deltaY < -6) navShow();
  }, { passive: true });
  var navLastY = 0;
  window.addEventListener("scroll", function () {
    if (!bkeNav) return;
    var y = window.pageYOffset || 0;
    if (y < 80) navShow();
    else if (y > navLastY + 6) navHide();
    else if (y < navLastY - 6) navShow();
    navLastY = y;
  }, { passive: true });

  /* ---------------------------------------------------------------- Process slider
     "The Process" strip (#sectionPin) — the original GSAP pin-scroll is dead, so we
     drive it as a drag-to-scroll strip. Delegated on document so it keeps working
     after page transitions without re-init. */
  var dragPin = null, startX = 0, startScroll = 0, moved = false;
  document.addEventListener("pointerdown", function (e) {
    var pin = e.target.closest && e.target.closest("#sectionPin");
    if (!pin) return;
    dragPin = pin; startX = e.clientX; startScroll = pin.scrollLeft; moved = false;
    pin.classList.add("bke-dragging");
  });
  document.addEventListener("pointermove", function (e) {
    if (!dragPin) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    dragPin.scrollLeft = startScroll - dx;
  });
  function endDrag() { if (dragPin) { dragPin.classList.remove("bke-dragging"); dragPin = null; } }
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);
  document.addEventListener("click", function (e) {
    if (moved && e.target.closest && e.target.closest("#sectionPin")) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  document.addEventListener("wheel", function (e) {
    var pin = e.target.closest && e.target.closest("#sectionPin");
    if (!pin) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    var max = pin.scrollWidth - pin.clientWidth;
    if ((pin.scrollLeft <= 0 && e.deltaY < 0) || (pin.scrollLeft >= max && e.deltaY > 0)) return;
    e.preventDefault();
    pin.scrollLeft += e.deltaY;
  }, { passive: false });
})();
