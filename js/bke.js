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
          '<label class="bke-field"><span>Name</span><input type="text" name="name" required></label>' +
          '<label class="bke-field"><span>Email</span><input type="email" name="email" required></label>' +
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

  // Reliable, progressive autoplay for background videos: play when scrolled
  // into view, pause when off-screen. Works even if the old theme JS interferes,
  // and keeps initial load light (preload="metadata" + faststart).
  (function () {
    var vids = document.querySelectorAll("video[autoplay], video.bke-vid");
    if (!vids.length) return;
    if (!("IntersectionObserver" in window)) {
      vids.forEach(function (v) { v.play().catch(function () {}); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) en.target.play().catch(function () {});
          else en.target.pause();
        });
      },
      { threshold: 0.25 }
    );
    vids.forEach(function (v) { io.observe(v); });
  })();

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
