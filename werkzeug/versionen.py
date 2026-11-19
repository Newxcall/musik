"""Hängt an style.css, app.js, inhalt.js und songs.js in allen Seiten eine Versionsnummer an (?v=…).

Die Nummer ist eine Prüfsumme des Dateiinhalts: Ändert sich eine Datei, ändert sich die Nummer, und jeder
Browser lädt sie neu, statt eine alte Fassung aus seinem Zwischenspeicher zu nehmen (sonst passen neue Seite
und alte Stil-Datei nicht zusammen). Läuft automatisch in veroeffentlichen.bat.
"""
import hashlib
import os
import re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = ["style.css", "app.js", "inhalt.js", "songs.js"]


def main():
    ver = {}
    for name in ASSETS:
        p = os.path.join(HERE, name)
        if os.path.exists(p):
            with open(p, "rb") as f:
                ver[name] = hashlib.sha1(f.read()).hexdigest()[:8]
    changed = 0
    for page in sorted(os.listdir(HERE)):
        if not page.endswith(".html"):
            continue
        p = os.path.join(HERE, page)
        with open(p, encoding="utf-8") as f:
            s = f.read()
        neu = s
        for name, v in ver.items():
            neu = re.sub(r'((?:href|src)=")' + re.escape(name) + r'(?:\?v=[0-9a-f]+)?(")', lambda m: f"{m.group(1)}{name}?v={v}{m.group(2)}", neu)
        if neu != s:
            with open(p, "w", encoding="utf-8", newline="") as f:
                f.write(neu)
            changed += 1
    print(f"Versionsnummern aktualisiert ({changed} Seite(n) geaendert).")


if __name__ == "__main__":
    main()
