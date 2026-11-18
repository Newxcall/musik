# Musik-Website

Adresse nach dem Hochladen: **https://newxcall.github.io/musik/**

## Inhalte ändern

Alles steht in **`inhalt.js`** (mit dem Editor öffnen):

- Künstlername, Untertitel, Kurztext
- `socials`: Links zu Instagram, TikTok, YouTube, Spotify … – leere Links werden nicht angezeigt
- `songs`: pro Song entweder
  - `datei: "musik/song.mp3"` → MP3 in den Ordner `musik` legen, spielt direkt auf der Seite, oder
  - `link: "https://open.spotify.com/track/..."` → Spotify/SoundCloud/YouTube/Apple-Music-Player
    (wird erst nach Klick geladen, wegen Datenschutz)
  - `cover: "bilder/cover1.jpg"` → Cover-Bild (quadratisch, ca. 800×800) in den Ordner `bilder`
- `leistungen`: Titel, Text, Preis (leer = „Preis auf Anfrage“)
- `email`: Kontaktadresse für den Anfrage-Knopf (leer = Knopf führt zu deinem ersten Social-Profil)

## Ansehen auf dem PC

`index.html` doppelklicken.

## Hochladen

`veroeffentlichen.bat` doppelklicken. Beim ersten Mal legt es das Repository `Newxcall/musik`
auf GitHub an und schaltet GitHub Pages ein.

Impressum und ausführlicher Datenschutz verweisen auf https://newxcall.github.io/.
