/* Broken Egg Labs — clean front-end (replaces the WordPress/Barba/jQuery bundle).
   - Contact modal (Web3Forms -> daniel.sofinet@gmail.com)
   - Reveal gate (adds .ready so pages show on direct load)
   - Auto-hide header (slides up on scroll down, back on scroll up)
   - Client-side router with a circular clip-path reveal; URL stays "/"
   - Progressive video autoplay-on-view
   No dependencies. */
(function () {
  "use strict";
  var ACCESS_KEY = "b10bd5d4-b5bd-4a2e-9363-1f25ee7c138b";
  var MAIN_SEL = 'main[data-barba="container"], main';

  /* ---------------------------------------------------------------- reveal gate */
  function reveal() {
    document.documentElement.classList.add("ready");
    document.body.classList.add("ready");
  }

  /* ---------------------------------------------------------------- contact modal */
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

  function openModal() {
    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.style.overflow = "hidden";
    var first = modal.querySelector('input[name="name"]');
    setTimeout(function () { if (first) first.focus(); }, 60);
  }
  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  modal.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.querySelector(".bke-hp").checked) return;
    statusEl.textContent = "";
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { Accept: "application/json" }, body: new FormData(form),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.success) modal.querySelector(".bke-body").classList.add("is-sent");
        else throw new Error("err");
      })
      .catch(function () {
        statusEl.textContent = "Something went wrong — email us at daniel.sofinet@gmail.com.";
        sendBtn.disabled = false;
        sendBtn.textContent = "Send message";
      });
  });

  /* ---------------------------------------------------------------- videos */
  var vidObserver = null;
  function initVideos() {
    var vids = document.querySelectorAll("video[autoplay], video.bke-vid");
    if (!vids.length) return;
    if (!("IntersectionObserver" in window)) {
      vids.forEach(function (v) { v.play().catch(function () {}); });
      return;
    }
    if (!vidObserver) {
      vidObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) en.target.play().catch(function () {});
          else en.target.pause();
        });
      }, { threshold: 0.25 });
    }
    vids.forEach(function (v) { vidObserver.observe(v); });
  }

  /* ---------------------------------------------------------------- process slider
     The old GSAP pin-scroll is gone; replace it with simple drag-to-scroll
     (matches the "grab" indicator) plus wheel + touch. */
  function initSlider() {
    var pin = document.getElementById("sectionPin");
    if (!pin || pin.dataset.bkeSlider) return;
    pin.dataset.bkeSlider = "1";
    var down = false, startX = 0, startScroll = 0, moved = false;
    pin.addEventListener("pointerdown", function (e) {
      down = true; moved = false;
      startX = e.clientX;
      startScroll = pin.scrollLeft;
      pin.classList.add("bke-dragging");
      pin.setPointerCapture && pin.setPointerCapture(e.pointerId);
    });
    pin.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      pin.scrollLeft = startScroll - dx;
    });
    function end() { down = false; pin.classList.remove("bke-dragging"); }
    pin.addEventListener("pointerup", end);
    pin.addEventListener("pointercancel", end);
    pin.addEventListener("pointerleave", end);
    // block accidental clicks after a drag
    pin.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    // vertical wheel scrolls horizontally while hovering the strip
    pin.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var max = pin.scrollWidth - pin.clientWidth;
      if ((pin.scrollLeft <= 0 && e.deltaY < 0) || (pin.scrollLeft >= max && e.deltaY > 0)) return;
      e.preventDefault();
      pin.scrollLeft += e.deltaY;
    }, { passive: false });
  }
  window.bkeInitSlider = initSlider;

  /* ---------------------------------------------------------------- auto-hide header */
  var lastY = window.pageYOffset || 0;
  function onScroll() {
    var header = document.querySelector("header");
    if (!header) return;
    var y = window.pageYOffset || 0;
    if (y < 90) header.classList.remove("bke-nav-hidden");
    else if (y > lastY + 6) header.classList.add("bke-nav-hidden");
    else if (y < lastY - 6) header.classList.remove("bke-nav-hidden");
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------------------------------------------------------- circular router */
  var trans = document.createElement("div");
  trans.className = "bke-trans";
  document.body.appendChild(trans);
  var busy = false;

  function reinit() {
    reveal();
    initVideos();
    if (window.bkeInitSlider) window.bkeInitSlider();
    var header = document.querySelector("header");
    if (header) header.classList.remove("bke-nav-hidden");
    lastY = 0;
  }

  // resolve relative URLs in fetched content against the page it came from, so
  // assets keep working no matter which directory the content is injected into
  var SKIP = /^(https?:|data:|blob:|mailto:|tel:|#|\/\/|javascript:)/i;
  function absolutize(root, baseUrl) {
    var base = new URL(baseUrl, location.href);
    function fix(el, attr) {
      var v = el.getAttribute(attr);
      if (!v || SKIP.test(v)) return;
      try { el.setAttribute(attr, new URL(v, base).href); } catch (e) {}
    }
    root.querySelectorAll("[src]").forEach(function (el) { fix(el, "src"); });
    root.querySelectorAll("[poster]").forEach(function (el) { fix(el, "poster"); });
    root.querySelectorAll("a[href]").forEach(function (el) { fix(el, "href"); });
    root.querySelectorAll('[srcset]').forEach(function (el) {
      var v = el.getAttribute("srcset");
      if (!v) return;
      el.setAttribute("srcset", v.split(",").map(function (p) {
        var seg = p.trim().split(/\s+/);
        if (seg[0] && !SKIP.test(seg[0])) { try { seg[0] = new URL(seg[0], base).href; } catch (e) {} }
        return seg.join(" ");
      }).join(", "));
    });
    root.querySelectorAll('[style*="url("]').forEach(function (el) {
      el.setAttribute("style", el.getAttribute("style").replace(/url\((['"]?)([^'")]+)\1\)/g, function (m, q, u) {
        if (SKIP.test(u)) return m;
        try { return "url(" + q + new URL(u, base).href + q + ")"; } catch (e) { return m; }
      }));
    });
  }

  function navigate(url, x, y) {
    if (busy) return;
    busy = true;
    trans.style.setProperty("--bx", x + "px");
    trans.style.setProperty("--by", y + "px");
    fetch(url, { headers: { "X-Requested-With": "bke" } })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var newMain = doc.querySelector(MAIN_SEL);
        if (!newMain) throw new Error("no main");
        absolutize(newMain, url);
        var bg = newMain.getAttribute("data-bg") || "#F7F6F1";
        trans.style.background = bg;
        // 1) cover: circle expands from the click point
        trans.classList.add("is-cover");
        setTimeout(function () {
          // 2) swap content behind the cover
          var cur = document.querySelector(MAIN_SEL);
          cur.innerHTML = newMain.innerHTML;
          cur.className = newMain.className;
          cur.setAttribute("data-bg", bg);
          if (newMain.getAttribute("style")) cur.setAttribute("style", newMain.getAttribute("style"));
          document.title = doc.title;
          document.body.style.background = bg;
          window.scrollTo(0, 0);
          reinit();
          // 3) reveal: fade the cover away to show the new page
          requestAnimationFrame(function () {
            trans.classList.add("is-reveal");
            setTimeout(function () {
              trans.classList.remove("is-cover", "is-reveal");
              busy = false;
            }, 520);
          });
        }, 470);
      })
      .catch(function () { window.location.href = url; });
  }

  /* ---------------------------------------------------------------- click handling */
  // contact triggers (capture, wins over everything)
  document.addEventListener("click", function (e) {
    var t = e.target.closest('[data-contact], a[href^="mailto:"]');
    if (!t) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openModal();
  }, true);

  // internal navigation -> circular transition, URL stays "/"
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || a.hasAttribute("data-contact") || a.target === "_blank") return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    var url;
    try { url = new URL(href, location.href); } catch (_) { return; }
    if (url.origin !== location.origin || !/\.html(\?|#|$)/.test(url.pathname)) return;
    e.preventDefault();
    navigate(url.pathname + url.search, e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
  });

  /* ---------------------------------------------------------------- boot */
  reveal();
  initVideos();
  initSlider();
})();
