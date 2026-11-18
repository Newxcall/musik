# Newcall – Musik-Website

Adresse: **https://newxcall.github.io/musik/** (eigenes Repo `Newxcall/musik`).
Wer auf https://newxcall.github.io/ geht, wählt zuerst zwischen „Newcall Apps“ und „Musik“.

## Was wo geändert wird

| Was | Wo |
|---|---|
| Texte, Links (YouTube, Instagram, Spotify …) | `inhalt.js` |
| Songs (MP3 + Cover aus deinem YouTube-Kanal) | `songs_aktualisieren.bat` – holt neue Videos, schreibt `songs.js` |
| Leistungen, Preise, Annahme pausieren | Admin: https://newxcall.github.io/admin.html → oben „Musik“ |
| Aufträge ansehen, Status setzen (neu → in Arbeit → fertig) | Admin → „Musik“ → Aufträge |
| Rundmail an Musik-Newsletter | Admin → „Musik“ → E-Mail-Verteiler – Musik |

Preis 0 = „Preis auf Anfrage“ (Knopf führt zu Instagram). Buchen geht nur mit Newcall-Konto, bezahlt wird über
dasselbe Stripe wie bei den Apps. Nach jeder Buchung bekommst du eine E-Mail „Neuer Auftrag“ (sobald der Gmail-Zugang
eingerichtet ist).

## Technik

- Logik im Lizenz-Dienst (`Kehrwerk/server/supabase/functions/kehrwerk-license`): `music_info`, `music_checkout`,
  `music_claim`, `music_orders`, `admin_music*`, Verteiler mit `list: "musik"`.
- Lokal testen: `node Kehrwerk/server/dev_server.mjs` (nachgestelltes Stripe) und diese Seite über `http://localhost:5173`
  ausliefern – dann spricht sie automatisch mit dem Test-Dienst.

## Hochladen

`veroeffentlichen.bat` doppelklicken. Beim ersten Mal legt es das Repository `Newxcall/musik` auf GitHub an und
schaltet GitHub Pages ein.
