/* Chesapeake Police Department Recruiting - site behavior */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: solid background after scrolling ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- Active nav link while scrolling ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav ul a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (l) {
      var s = document.querySelector(l.getAttribute("href"));
      if (s) sectionObs.observe(s);
    });
  }

  /* ---------- Hero video (falls back to animated background if file missing) ---------- */
  var video = document.querySelector(".hero-video");
  var vToggle = document.getElementById("video-toggle");
  if (video) {
    var source = video.querySelector("source");
    var markMissing = function () { video.classList.add("is-missing"); vToggle.hidden = true; };
    video.addEventListener("error", markMissing);
    if (source) source.addEventListener("error", markMissing);
    video.addEventListener("loadeddata", function () {
      vToggle.hidden = false;
      video.closest(".hero").classList.add("has-video");
      if (reduceMotion) { video.pause(); vToggle.textContent = "Play Video"; }
    });
    vToggle.addEventListener("click", function () {
      if (video.paused) { video.play(); vToggle.textContent = "Pause Video"; vToggle.setAttribute("aria-label", "Pause background video"); }
      else { video.pause(); vToggle.textContent = "Play Video"; vToggle.setAttribute("aria-label", "Play background video"); }
    });
  }

  /* ---------- Aerial band video: pause button, and pause when off screen ---------- */
  var aerial = document.querySelector(".aerial-video");
  var aToggle = document.querySelector(".aerial-toggle");
  if (aerial && aToggle) {
    var userPaused = reduceMotion;
    if (reduceMotion) { aerial.removeAttribute("autoplay"); aerial.pause(); aToggle.textContent = "Play Video"; aToggle.setAttribute("aria-label", "Play background video"); }
    aToggle.addEventListener("click", function () {
      if (aerial.paused) { userPaused = false; aerial.play(); aToggle.textContent = "Pause Video"; aToggle.setAttribute("aria-label", "Pause background video"); }
      else { userPaused = true; aerial.pause(); aToggle.textContent = "Play Video"; aToggle.setAttribute("aria-label", "Play background video"); }
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !userPaused) { var pr = aerial.play(); if (pr && pr.catch) pr.catch(function () {}); }
          else if (!e.isIntersecting) aerial.pause();
        });
      }, { threshold: 0.1 }).observe(aerial);
    }
  }

  /* ---------- Academy countdown ---------- */
  var clock = document.getElementById("countdown");
  if (clock) {
    var target = new Date(clock.getAttribute("data-target")).getTime();
    var parts = {};
    ["days", "hours", "minutes", "seconds"].forEach(function (u) { parts[u] = clock.querySelector('[data-unit="' + u + '"]'); });
    var tick = function () {
      var diff = Math.max(0, target - Date.now());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff / 3600000) % 24;
      var m = Math.floor(diff / 60000) % 60;
      var s = Math.floor(diff / 1000) % 60;
      parts.days.textContent = d;
      parts.hours.textContent = String(h).padStart(2, "0");
      parts.minutes.textContent = String(m).padStart(2, "0");
      parts.seconds.textContent = String(s).padStart(2, "0");
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Animated number counters ---------- */
  function formatNum(n, fmt) { return fmt === "comma" ? n.toLocaleString("en-US") : String(n); }
  function runCounter(el) {
    var to = parseInt(el.getAttribute("data-to"), 10);
    var fmt = el.getAttribute("data-format");
    if (reduceMotion) { el.textContent = formatNum(to, fmt); return; }
    var start = null, dur = 1800;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(Math.round(to * eased), fmt);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  var counters = document.querySelectorAll(".count");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el, i) {
      // small stagger for items in the same row
      el.style.transitionDelay = (i % 4) * 0.08 + "s";
      revealObs.observe(el);
    });
    var countObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) { el.textContent = formatNum(parseInt(el.getAttribute("data-to"), 10), el.getAttribute("data-format")); });
  }

  /* ---------- Video modal ---------- */
  var modal = document.getElementById("video-modal");
  var frame = document.getElementById("modal-frame");
  var modalTitle = document.getElementById("modal-title");
  var lastFocus = null;
  function openModal(url, title, aspect) {
    lastFocus = document.activeElement;
    modalTitle.textContent = title || "Video";
    frame.innerHTML = "";
    frame.classList.remove("fit");
    frame.style.aspectRatio = "";
    if (url) {
      if (/\.(mp4|webm)$/i.test(url)) {
        var v = document.createElement("video");
        v.src = url; v.controls = true; v.autoplay = true; v.playsInline = true; v.muted = true; v.loop = true;
        frame.classList.add("fit");
        frame.style.aspectRatio = aspect || "";
        v.addEventListener("loadedmetadata", function () {
          if (v.videoWidth) frame.style.aspectRatio = v.videoWidth + " / " + v.videoHeight;
        });
        frame.appendChild(v);
      } else {
        var f = document.createElement("iframe");
        f.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "autoplay=1";
        f.title = title || "Video";
        f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        f.allowFullscreen = true;
        frame.appendChild(f);
      }
    } else {
      frame.innerHTML = "<p>Video coming soon.</p>";
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").focus();
  }
  function closeModal() {
    modal.hidden = true;
    frame.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  // Hide "Play Video" buttons that don't have a video yet (fill in data-video to show them)
  document.querySelectorAll(".play-btn").forEach(function (btn) {
    if (!btn.getAttribute("data-video")) btn.hidden = true;
  });
  document.querySelectorAll(".play-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { openModal(btn.getAttribute("data-video"), btn.getAttribute("data-title"), btn.getAttribute("data-aspect")); });
  });
  modal.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", closeModal); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!modal.hidden) closeModal();
      else if (nav.classList.contains("open")) setMenu(false);
    }
  });

  /* ---------- Contact form: opens the visitor's email app ---------- */
  var form = document.getElementById("contact-form");
  var formError = document.getElementById("form-error");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var first = (d.get("first") || "").trim();
      var last = (d.get("last") || "").trim();
      var email = (d.get("email") || "").trim();
      if (!first || !last || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formError.hidden = false;
        return;
      }
      formError.hidden = true;
      var subject = "Recruiting inquiry: " + d.get("interest") + " - " + first + " " + last;
      var body =
        "Name: " + first + " " + last + "\n" +
        "Phone: " + (d.get("phone") || "") + "\n" +
        "Email: " + email + "\n" +
        "Interested in: " + d.get("interest") + "\n\n" +
        (d.get("message") || "");
      window.location.href = "mailto:CPDrecruiting@CityOfChesapeake.Net?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
