(function () {
  "use strict";
  var D = window.INHALT || {};
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- Texte ---------- */
  var name = D.kuenstlername || "Musik";
  $("name").textContent = name;
  $("logo").textContent = name;
  $("footer-name").textContent = name;
  $("untertitel").textContent = D.untertitel || "";
  $("kurztext").textContent = D.kurztext || "";
  $("jahr").textContent = new Date().getFullYear();
  document.title = name + " – " + (D.untertitel || "Musik");
  if (D.appsLink) { $("apps-link").href = D.appsLink; $("footer-apps").href = D.appsLink; }
  if (D.impressumLink) $("impressum").href = D.impressumLink;

  /* ---------- Socials ---------- */
  var PLATTFORMEN = {
    instagram: ["Instagram", "#e1306c"], tiktok: ["TikTok", "#25f4ee"], youtube: ["YouTube", "#ff0033"],
    spotify: ["Spotify", "#1ed760"], soundcloud: ["SoundCloud", "#ff5500"], applemusic: ["Apple Music", "#fa2d48"],
    beatstars: ["BeatStars", "#f53b57"], x: ["X", "#ffffff"], discord: ["Discord", "#5865f2"]
  };
  var socials = D.socials || {};
  function chip(url, label, farbe) {
    var a = el("a", "chip");
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    var dot = el("i"); dot.style.setProperty("--c", farbe);
    a.appendChild(dot); a.appendChild(document.createTextNode(label));
    return a;
  }
  Object.keys(PLATTFORMEN).forEach(function (k) {
    if (!socials[k]) return;
    $("hero-socials").appendChild(chip(socials[k], PLATTFORMEN[k][0], PLATTFORMEN[k][1]));
    $("socials").appendChild(chip(socials[k], PLATTFORMEN[k][0], PLATTFORMEN[k][1]));
  });
  if (D.appsLink) $("socials").appendChild(chip(D.appsLink, "Newcall Apps", "#8a5cff"));

  var mail = $("mail-btn");
  if (D.email) {
    mail.href = "mailto:" + D.email + "?subject=" + encodeURIComponent("Anfrage über deine Website");
  } else {
    var erster = Object.keys(PLATTFORMEN).filter(function (k) { return socials[k]; })[0];
    if (erster) { mail.href = socials[erster]; mail.target = "_blank"; mail.rel = "noopener"; mail.textContent = "Schreib mir auf " + PLATTFORMEN[erster][0]; }
    else mail.parentNode.hidden = true;
  }

  /* ---------- Einbettungen (erst nach Klick, wegen Datenschutz) ---------- */
  function einbettung(link) {
    var m;
    if ((m = link.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|artist|episode)\/([A-Za-z0-9]+)/)))
      return { dienst: "Spotify", src: "https://open.spotify.com/embed/" + m[1] + "/" + m[2], hoehe: m[1] === "track" ? 152 : 352 };
    if (/soundcloud\.com\//.test(link))
      return { dienst: "SoundCloud", src: "https://w.soundcloud.com/player/?url=" + encodeURIComponent(link) + "&color=%23ff3d6e&visual=false&show_comments=false", hoehe: 166 };
    if ((m = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/)))
      return { dienst: "YouTube", src: "https://www.youtube-nocookie.com/embed/" + m[1], hoehe: 0 };
    if ((m = link.match(/music\.apple\.com\/(.+)/)))
      return { dienst: "Apple Music", src: "https://embed.music.apple.com/" + m[1], hoehe: 175 };
    return null;
  }

  /* ---------- Songs ---------- */
  var VERLAEUFE = [
    "linear-gradient(135deg,#ff3d6e,#8a5cff)", "linear-gradient(135deg,#1e3cff,#00d4ff)", "linear-gradient(135deg,#ff8a00,#ff3d6e)",
    "linear-gradient(135deg,#00c896,#1e3cff)", "linear-gradient(135deg,#8a5cff,#00d4ff)", "linear-gradient(135deg,#222,#666)"
  ];
  var audio = $("audio");
  var aktuell = null;
  (D.songs || []).forEach(function (s, i) {
    var card = el("article", "track reveal");
    var cover = el("div", "cover");
    cover.style.setProperty("--g", VERLAEUFE[i % VERLAEUFE.length]);
    if (s.cover) { var img = el("img"); img.src = s.cover; img.alt = s.titel; img.loading = "lazy"; cover.appendChild(img); }
    else cover.appendChild(el("div", "cover-title", s.titel));
    card.appendChild(cover);
    card.appendChild(el("h3", null, s.titel));
    card.appendChild(el("p", "meta", [s.jahr, s.rolle].filter(Boolean).join(" · ")));

    if (s.datei) {
      var btn = el("button", "play", "▶");
      btn.setAttribute("aria-label", s.titel + " abspielen");
      btn.addEventListener("click", function () { spiele(s, card); });
      cover.appendChild(btn);
    } else if (s.link) {
      var e = einbettung(s.link);
      if (e) {
        var c = el("button", "consent");
        c.appendChild(document.createTextNode("▶ Player von " + e.dienst + " laden"));
        c.appendChild(el("small", null, "Erst beim Klick werden Daten an " + e.dienst + " übertragen."));
        c.addEventListener("click", function () {
          var box = el("div", "embed"), f = el("iframe");
          f.src = e.src; f.loading = "lazy"; f.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
          f.title = s.titel;
          if (e.hoehe) f.height = e.hoehe; else f.style.aspectRatio = "16 / 9";
          box.appendChild(f); c.replaceWith(box);
        });
        card.appendChild(c);
      } else {
        var a = el("a", "consent", "↗ Anhören"); a.href = s.link; a.target = "_blank"; a.rel = "noopener";
        card.appendChild(a);
      }
    } else {
      card.appendChild(el("p", "soon", "Bald verfügbar"));
    }
    $("tracks").appendChild(card);
  });

  /* ---------- Player ---------- */
  function zeit(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ":" + ("0" + (t % 60)).slice(-2); }
  function knopf() {
    var an = !audio.paused;
    $("p-play").textContent = an ? "❚❚" : "▶";
    document.querySelectorAll(".track").forEach(function (t) {
      var p = t.querySelector(".play");
      var spielt = t === (aktuell && aktuell.card) && an;
      t.classList.toggle("playing", spielt);
      if (p) p.textContent = spielt ? "❚❚" : "▶";
    });
  }
  function spiele(s, card) {
    if (aktuell && aktuell.card === card) { audio.paused ? audio.play() : audio.pause(); return; }
    aktuell = { s: s, card: card };
    audio.src = s.datei;
    $("p-title").textContent = s.titel + " – " + name;
    $("player").hidden = false;
    verbindeAnalyse();
    audio.play().catch(function () {});
  }
  $("p-play").addEventListener("click", function () { if (aktuell) audio.paused ? audio.play() : audio.pause(); });
  audio.addEventListener("play", knopf);
  audio.addEventListener("pause", knopf);
  audio.addEventListener("ended", knopf);
  audio.addEventListener("timeupdate", function () {
    var d = audio.duration || 0;
    $("p-fill").style.width = d ? (audio.currentTime / d * 100) + "%" : "0";
    $("p-time").textContent = zeit(d - audio.currentTime);
  });
  $("p-bar").addEventListener("click", function (ev) {
    var r = this.getBoundingClientRect();
    if (audio.duration) audio.currentTime = (ev.clientX - r.left) / r.width * audio.duration;
  });

  /* ---------- Leistungen, Über mich ---------- */
  (D.leistungen || []).forEach(function (l, i) {
    var c = el("div", "service reveal");
    c.appendChild(el("span", "num", ("0" + (i + 1)).slice(-2)));
    c.appendChild(el("h3", null, l.titel));
    c.appendChild(el("p", null, l.text));
    c.appendChild(el("span", "preis", l.preis ? l.preis : "Preis auf Anfrage"));
    $("services").appendChild(c);
  });
  (D.ueberMich || []).forEach(function (t) { $("ueber-text").appendChild(el("p", null, t)); });
  (D.fakten || []).forEach(function (f) {
    var c = el("div", "fact reveal");
    c.appendChild(el("strong", null, f.zahl)); c.appendChild(el("span", null, f.text));
    $("facts").appendChild(c);
  });

  /* ---------- Einblenden beim Scrollen, Navigation ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (r) { io.observe(r); });
  } else document.querySelectorAll(".reveal").forEach(function (r) { r.classList.add("show"); });
  function navCheck() { $("nav").classList.toggle("solid", window.scrollY > 30); }
  window.addEventListener("scroll", navCheck, { passive: true }); navCheck();

  /* ---------- Wellenform im Kopfbereich ---------- */
  var cv = $("wave"), cx = cv.getContext("2d"), analyser = null, daten = null;
  function verbindeAnalyse() {
    if (analyser || location.protocol === "file:") return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      var ctx = new AC();
      var src = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser(); analyser.fftSize = 256;
      src.connect(analyser); analyser.connect(ctx.destination);
      daten = new Uint8Array(analyser.frequencyBinCount);
      audio.addEventListener("play", function () { ctx.resume(); });
    } catch (e) { analyser = null; }
  }
  function groesse() { var r = window.devicePixelRatio || 1; cv.width = cv.clientWidth * r; cv.height = cv.clientHeight * r; }
  // "Bewegung reduzieren" in Windows/iOS: Wellenform steht still, bewegt sich nur während Musik läuft.
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var laeuft = false;
  function starte() { if (!laeuft) { laeuft = true; requestAnimationFrame(male); } }
  window.addEventListener("resize", function () { groesse(); if (!laeuft) male(performance.now()); });
  audio.addEventListener("play", starte);
  groesse();
  function male(t) {
    var w = cv.width, h = cv.height, n = Math.max(24, Math.floor(w / (14 * (window.devicePixelRatio || 1))));
    var bw = w / n, live = analyser && !audio.paused;
    if (live) analyser.getByteFrequencyData(daten);
    cx.clearRect(0, 0, w, h);
    var g = cx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "#ff3d6e"); g.addColorStop(1, "#8a5cff");
    cx.fillStyle = g;
    for (var i = 0; i < n; i++) {
      var v;
      if (live) v = daten[Math.floor(Math.pow(i / n, 1.6) * daten.length * 0.8)] / 255;
      else v = 0.18 + 0.14 * Math.sin(t / 900 + i * 0.35) + 0.1 * Math.sin(t / 530 + i * 0.9);
      var bh = Math.max(3, v * h * 0.9);
      cx.globalAlpha = 0.35 + v * 0.5;
      cx.fillRect(i * bw + bw * 0.25, h - bh, bw * 0.5, bh);
    }
    if (!ruhig || !audio.paused) requestAnimationFrame(male);
    else laeuft = false;
  }
  starte();
})();
