(function () {
  "use strict";
  var D = window.INHALT || {};
  var SONGS = window.SONGS || [];
  var lokal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = lokal ? "http://127.0.0.1:8787/" : "https://snafgyzhegwkxmunmxje.supabase.co/functions/v1/kehrwerk-license";
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function euro(n) { return n.toLocaleString("de-DE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €"; }
  function toast(t) { var x = $("toast"); x.textContent = t; x.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { x.hidden = true; }, 4200); }

  function call(payload) {
    return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || j.error) { var e = new Error(j.error || "Fehler " + r.status); e.status = r.status; throw e; } return j; }); })
      .catch(function (e) { if (e.message === "Failed to fetch") e.message = "Keine Verbindung. Bitte versuch es gleich noch einmal."; throw e; });
  }

  /* ---------- Texte & Links ---------- */
  var name = D.kuenstlername || "Newcall";
  $("name").textContent = name;
  $("logo").textContent = name;
  $("untertitel").textContent = D.untertitel || "";
  $("kurztext").textContent = D.kurztext || "";
  $("jahr").textContent = new Date().getFullYear();
  if (D.unreleased) { $("unreleased-bar").href = D.unreleased; $("unreleased-btn").href = D.unreleased; }
  else { $("unreleased-bar").hidden = true; $("unreleased-btn").hidden = true; }
  if (D.kommission) { $("kommission-link").href = D.kommission; $("insta-btn").href = D.kommission; }
  if (D.appsLink) { $("apps-link").href = D.appsLink; $("footer-apps").href = D.appsLink; }
  if (D.startLink) $("footer-start").href = D.startLink;
  if (D.impressumLink) $("impressum").href = D.impressumLink;

  /* ---------- Socials ---------- */
  var PLATTFORMEN = {
    spotify: ["Spotify", "#1ed760"], applemusic: ["Apple Music", "#fa2d48"], amazonmusic: ["Amazon Music", "#25d1da"],
    youtube: ["YouTube", "#ff0033"], instagram: ["Instagram", "#e1306c"], tiktok: ["TikTok", "#25f4ee"], soundcloud: ["SoundCloud", "#ff5500"]
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

  /* ---------- Songs (aus YouTube, songs.js) ---------- */
  var audio = $("audio"), aktuell = -1, karten = [];
  function zeit(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ":" + ("0" + (t % 60)).slice(-2); }
  // Musikvideos im Breitbild haben oben und unten schwarze Balken im Vorschaubild: erkennen und wegschneiden.
  function schwarzeBalken(img) {
    try {
      var c = document.createElement("canvas"); c.width = 40; c.height = 40;
      var g = c.getContext("2d"); g.drawImage(img, 0, 0, 40, 40);
      function dunkel(y) { var d = g.getImageData(0, y, 40, 1).data, s = 0; for (var i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / (40 * 3) < 18; }
      return dunkel(1) && dunkel(3) && dunkel(36) && dunkel(38) && !dunkel(20);
    } catch (e) { return false; }
  }
  SONGS.forEach(function (s, i) {
    var card = el("article", "track reveal");
    var cover = el("div", "cover");
    var img = el("img"); img.src = s.cover; img.alt = "Cover " + s.titel; img.loading = "lazy";
    img.addEventListener("load", function () { if (schwarzeBalken(img)) img.classList.add("letterbox"); });
    cover.appendChild(img);
    var btn = el("button", "play", "▶");
    btn.type = "button";
    btn.setAttribute("aria-label", s.titel + " abspielen");
    btn.addEventListener("click", function () { spiele(i); });
    cover.appendChild(btn);
    cover.addEventListener("dblclick", function () { spiele(i); });
    card.appendChild(cover);
    card.appendChild(el("h3", null, s.titel));
    var meta = el("p", "meta", [s.feat, s.jahr, s.dauer ? zeit(s.dauer) : ""].filter(Boolean).join(" · "));
    card.appendChild(meta);
    if (s.youtube) {
      var yt = el("a", "yt-link", "Auf YouTube ansehen ↗");
      yt.href = "https://www.youtube.com/watch?v=" + s.youtube; yt.target = "_blank"; yt.rel = "noopener";
      card.appendChild(yt);
    }
    $("tracks").appendChild(card);
    karten.push(card);
  });
  if (!SONGS.length) $("tracks").appendChild(el("p", "fine", "Bald gibt es hier Songs zum Anhören."));

  function knopf() {
    var an = !audio.paused;
    $("p-play").textContent = an ? "❚❚" : "▶";
    karten.forEach(function (c, i) {
      var spielt = i === aktuell && an;
      c.classList.toggle("playing", spielt);
      c.querySelector(".play").textContent = spielt ? "❚❚" : "▶";
    });
  }
  function spiele(i) {
    if (i === aktuell) { audio.paused ? audio.play() : audio.pause(); return; }
    aktuell = (i + SONGS.length) % SONGS.length;
    var s = SONGS[aktuell];
    audio.src = s.datei;
    $("p-title").textContent = s.titel + (s.feat ? " (" + s.feat + ")" : "") + " – " + name;
    $("p-cover").src = s.cover;
    $("player").hidden = false;
    verbindeAnalyse();
    audio.play().catch(function () {});
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: s.titel, artist: name + (s.feat ? " " + s.feat : ""),
        artwork: [{ src: new URL(s.cover, location.href).href, sizes: "800x800", type: "image/jpeg" }] });
      navigator.mediaSession.setActionHandler("previoustrack", function () { spiele(aktuell - 1); });
      navigator.mediaSession.setActionHandler("nexttrack", function () { spiele(aktuell + 1); });
    }
  }
  $("p-play").addEventListener("click", function () { if (aktuell >= 0) audio.paused ? audio.play() : audio.pause(); });
  $("p-prev").addEventListener("click", function () { if (aktuell >= 0) spiele(audio.currentTime > 3 ? aktuell : aktuell - 1); if (audio.currentTime > 3) audio.currentTime = 0; });
  $("p-next").addEventListener("click", function () { if (aktuell >= 0) spiele(aktuell + 1); });
  audio.addEventListener("play", knopf);
  audio.addEventListener("pause", knopf);
  audio.addEventListener("ended", function () { if (aktuell < SONGS.length - 1) spiele(aktuell + 1); else knopf(); });
  audio.addEventListener("timeupdate", function () {
    var d = audio.duration || 0;
    $("p-fill").style.width = d ? (audio.currentTime / d * 100) + "%" : "0";
    $("p-time").textContent = zeit(d - audio.currentTime);
  });
  /* ---------- Lautstärke (Regler + Stumm, gemerkt in diesem Browser) ----------
     Läuft die Musik über die Wellenform-Analyse (Web Audio), regelt ein Verstärker-Knoten die Lautstärke –
     das geht auch auf dem iPhone, wo audio.volume nicht verstellbar ist. */
  var gain = null, lautst = 0.8, stumm = false, vorher = 0.8;
  try { var gv = parseFloat(localStorage.getItem("ncMusikVol")); if (gv >= 0 && gv <= 1) lautst = gv; } catch (e) {}
  if (lautst > 0) vorher = lautst;
  var VOL_AN = "M4 9v6h4l5 4V5L8 9zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z";
  var VOL_AUS = "M4 9v6h4l5 4V5L8 9zm12.6 3 2.4-2.4-1.4-1.4-2.4 2.4-2.4-2.4-1.4 1.4 2.4 2.4-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4z";
  function setzeLautst() {
    var v = stumm ? 0 : lautst;
    if (gain) { gain.gain.value = v; audio.volume = 1; } else { try { audio.volume = v; } catch (e) {} }
    $("p-vol").value = stumm ? 0 : lautst;
    $("p-vol").style.setProperty("--p", ($("p-vol").value * 100) + "%");
    var aus = stumm || lautst === 0;
    $("p-vol-icon").setAttribute("d", aus ? VOL_AUS : VOL_AN);
    $("p-mute").setAttribute("aria-label", aus ? "Ton an" : "Stumm schalten");
  }
  $("p-vol").addEventListener("input", function () {
    lautst = +this.value; stumm = false;
    if (lautst > 0) vorher = lautst;
    try { localStorage.setItem("ncMusikVol", String(lautst)); } catch (e) {}
    setzeLautst();
  });
  $("p-mute").addEventListener("click", function () {
    if (stumm || lautst === 0) { stumm = false; if (lautst === 0) lautst = vorher; }
    else stumm = true;
    setzeLautst();
  });
  setzeLautst();

  $("p-bar").addEventListener("click", function (ev) {
    var r = this.getBoundingClientRect();
    if (audio.duration) audio.currentTime = (ev.clientX - r.left) / r.width * audio.duration;
  });

  /* ---------- Konto (Newcall-Konto, gleiches wie im Launcher) ---------- */
  var konto = null, token = "";
  try { token = localStorage.getItem("ncToken") || ""; } catch (e) {}
  var nachAnmeldung = null; // was nach dem Anmelden passieren soll (z. B. Buchen)
  function setKonto(k) {
    konto = k;
    if (k && k.token) { token = k.token; try { localStorage.setItem("ncToken", token); } catch (e) {} }
    $("account-btn").textContent = k ? (k.name || "Mein Konto") : "Anmelden";
    newsAnzeige();
  }
  function abmelden() { konto = null; token = ""; try { localStorage.removeItem("ncToken"); } catch (e) {} setKonto(null); }
  if (token) call({ action: "account_me", token: token }).then(function (k) { setKonto(k); })
    .catch(function (e) { if (e.status === 401 || e.status === 403) abmelden(); });

  var modus = "login";
  function zeigeTab(m) {
    modus = m;
    document.querySelectorAll("#dlg-login .tab").forEach(function (t) { t.classList.toggle("on", t.dataset.tab === m); });
    document.querySelectorAll("#dlg-login .reg-only").forEach(function (x) { x.hidden = m !== "register"; });
    $("login-go").textContent = m === "register" ? "Konto erstellen" : "Anmelden";
    $("l-pw").autocomplete = m === "register" ? "new-password" : "current-password";
    $("login-err").textContent = "";
  }
  document.querySelectorAll("#dlg-login .tab").forEach(function (t) { t.addEventListener("click", function () { zeigeTab(t.dataset.tab); }); });
  function oeffneLogin(warum, tab, danach) {
    nachAnmeldung = danach || null;
    $("login-why").textContent = warum || "Ein Konto für Musik und Apps. Damit buchst du Leistungen und siehst deine Aufträge.";
    zeigeTab(tab || "login");
    $("dlg-login").showModal();
  }
  $("login-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var mail = $("l-mail").value.trim(), pw = $("l-pw").value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(mail)) { $("login-err").textContent = "Bitte eine gültige E-Mail eingeben."; return; }
    if (pw.length < 8) { $("login-err").textContent = "Das Passwort braucht mindestens 8 Zeichen."; return; }
    var p = modus === "register"
      ? { action: "account_register", email: mail, password: pw, name: $("l-name").value.trim(), mnews: $("l-news").checked }
      : { action: "account_login", email: mail, password: pw };
    $("login-go").disabled = true; $("login-err").textContent = "";
    call(p).then(function (k) {
      setKonto(k);
      $("dlg-login").close();
      $("l-pw").value = "";
      if (k.mnews_mail === "gesendet") toast("Fast geschafft: Bitte bestätige den Newsletter in der E-Mail, die ich dir geschickt habe.");
      else toast(modus === "register" ? "Willkommen, dein Konto ist erstellt." : "Angemeldet.");
      var f = nachAnmeldung; nachAnmeldung = null;
      if (f) f();
    }).catch(function (e) { $("login-err").textContent = e.message; }).then(function () { $("login-go").disabled = false; });
  });
  $("account-btn").addEventListener("click", function () { konto ? oeffneKonto() : oeffneLogin(); });

  var STATUS = { neu: ["Eingegangen", "warn"], in_arbeit: ["In Arbeit", "free"], fertig: ["Fertig", "ok"] };
  function oeffneKonto() {
    $("acc-name").textContent = konto.name || "Mein Konto";
    $("acc-mail").textContent = konto.email;
    $("acc-err").textContent = "";
    newsAnzeige();
    $("acc-orders").innerHTML = '<p class="fine">Lädt …</p>';
    $("dlg-account").showModal();
    call({ action: "music_orders", token: token }).then(function (j) {
      var box = $("acc-orders"); box.innerHTML = "";
      if (!j.orders.length) { box.appendChild(el("p", "fine", "Noch keine Aufträge.")); return; }
      j.orders.forEach(function (o) {
        var row = el("div", "order");
        var l = el("div");
        l.appendChild(el("b", null, o.service + " – " + o.project));
        l.appendChild(el("p", "fine", new Date(o.created * 1000).toLocaleDateString("de-DE") + " · " + euro(o.amount) + (o.refunded ? " · erstattet" : "")));
        var st = STATUS[o.state] || STATUS.neu;
        row.appendChild(l); row.appendChild(el("span", "tag " + st[1], st[0]));
        box.appendChild(row);
      });
    }).catch(function (e) { $("acc-orders").innerHTML = ""; $("acc-err").textContent = e.message; if (e.status === 401) { abmelden(); $("dlg-account").close(); } });
  }
  $("acc-logout").addEventListener("click", function () { abmelden(); $("dlg-account").close(); toast("Abgemeldet."); });

  /* ---------- Newsletter (Musik-Verteiler, Double-Opt-in) ---------- */
  function newsAnzeige() {
    var st = konto ? konto.mnews : "";
    var text = { an: "Du bekommst E-Mails zu neuer Musik.", wartet: "Bitte bestätige den Link in deiner E-Mail.", aus: "Du bekommst keine E-Mails." }[st] || "";
    $("acc-news-text").textContent = text;
    $("acc-news").textContent = st === "an" || st === "wartet" ? "Abbestellen" : "Abonnieren";
    $("news-btn").textContent = st === "an" ? "Abonniert ✓" : st === "wartet" ? "Bestätigung ausstehend" : "Newsletter abonnieren";
    $("news-state").textContent = konto ? text : "Mit deinem kostenlosen Newcall-Konto – dauert 20 Sekunden.";
  }
  function setzeNews(an) {
    return call({ action: "account_news", token: token, list: "musik", on: an }).then(function (j) {
      konto.mnews = j.news; newsAnzeige();
      if (j.news_mail === "gesendet") toast("Schau in dein Postfach und bestätige den Newsletter.");
      else if (j.news_mail === "spaeter") toast("Die Bestätigungs-Mail ist schon unterwegs – schau auch im Spam-Ordner.");
      else if (j.news_mail === "nicht_eingerichtet" || j.news_mail === "fehler") toast("Die E-Mail konnte gerade nicht verschickt werden. Bitte versuch es später noch einmal.");
      else if (!an) toast("Abbestellt.");
    });
  }
  $("news-btn").addEventListener("click", function () {
    if (!konto) {
      oeffneLogin("Erstelle ein kostenloses Konto und setz den Haken beim Newsletter – oder melde dich an.", "register", function () {
        if (konto.mnews === "aus") setzeNews(true).catch(function (e) { toast(e.message); });
      });
      return;
    }
    if (konto.mnews === "an") { oeffneKonto(); return; }
    setzeNews(true).catch(function (e) { toast(e.message); });
  });
  $("acc-news").addEventListener("click", function () {
    var an = !(konto.mnews === "an" || konto.mnews === "wartet");
    $("acc-news").disabled = true;
    setzeNews(an).catch(function (e) { $("acc-err").textContent = e.message; }).then(function () { $("acc-news").disabled = false; });
  });

  /* ---------- Leistungen (Preise aus dem Admin) & Buchen ---------- */
  var gewaehlt = null;
  function zeigeLeistungen(list, annahme) {
    var box = $("services"); box.innerHTML = "";
    list.forEach(function (l, i) {
      var c = el("div", "service reveal show");
      c.appendChild(el("h3", null, l.title));
      c.appendChild(el("p", null, l.text));
      var unten = el("div", "service-foot");
      unten.appendChild(el("span", "preis", l.price ? euro(l.price) : "Preis auf Anfrage"));
      var b;
      if (l.price && annahme && l.id) {
        b = el("button", "btn btn-primary btn-s", "Buchen");
        b.type = "button";
        b.addEventListener("click", function () { buchen(l); });
      } else {
        b = el("a", "btn btn-ghost btn-s", "Anfragen");
        b.href = D.kommission || "#kontakt"; b.target = "_blank"; b.rel = "noopener";
      }
      unten.appendChild(b);
      c.appendChild(unten);
      box.appendChild(c);
    });
    if (!annahme) $("leistungen-hinweis").textContent = "Gerade nehme ich keine neuen Buchungen an. Schreib mir gern auf Instagram, dann melde ich mich, sobald wieder Platz ist.";
  }
  zeigeLeistungen((D.leistungen || []).map(function (l) { return { title: l.titel, text: l.text, price: 0 }; }), true);
  call({ action: "music_info" }).then(function (j) { if (j.services && j.services.length) zeigeLeistungen(j.services, j.accepting); }).catch(function () {});

  function buchen(l) {
    gewaehlt = l;
    if (!konto) { oeffneLogin("Zum Buchen brauchst du ein kostenloses Newcall-Konto. So siehst du später auch, wie weit dein Auftrag ist.", "register", function () { buchen(l); }); return; }
    $("book-title").textContent = l.title;
    $("book-price").textContent = euro(l.price) + " einmalig";
    $("book-err").textContent = "";
    $("dlg-book").showModal();
  }
  $("book-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var project = $("b-project").value.trim();
    if (!project) { $("book-err").textContent = "Bitte gib deinem Song oder Projekt einen Namen."; return; }
    $("book-go").disabled = true; $("book-err").textContent = "";
    call({ action: "music_checkout", token: token, service: gewaehlt.id, project: project, note: $("b-note").value.trim() })
      .then(function (j) { location.href = j.url; })
      .catch(function (e) {
        $("book-err").textContent = e.message; $("book-go").disabled = false;
        if (e.status === 401) { abmelden(); $("dlg-book").close(); oeffneLogin("Bitte melde dich neu an.", "login", function () { buchen(gewaehlt); }); }
      });
  });

  /* ---------- Über mich ---------- */
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
    }, { threshold: 0.08 });
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
      gain = ctx.createGain();
      src.connect(analyser); analyser.connect(gain); gain.connect(ctx.destination);
      setzeLautst();
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
    cx.fillStyle = "#ff4d6d";
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
