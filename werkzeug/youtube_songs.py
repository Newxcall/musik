"""Holt alle Videos des YouTube-Kanals als MP3 + quadratisches Cover und schreibt songs.js.

Aufruf (oder songs_aktualisieren.bat):  .venv\\Scripts\\python werkzeug\\youtube_songs.py
Schon geladene Songs werden übersprungen, neue Videos kommen oben dazu.
"""
import io
import json
import os
import subprocess
import sys
import urllib.request

from PIL import Image

KANAL = "https://www.youtube.com/@newcall3843/videos"
HIER = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIK = os.path.join(HIER, "musik")
COVER = os.path.join(HIER, "bilder", "cover")
AUSGABE = os.path.join(HIER, "songs.js")
YTDLP = [sys.executable, "-m", "yt_dlp"]


def titel_aufteilen(t):
    """'Pille - Newcall' -> ('Pille', ''), 'X - Newcall feat. Y' -> ('X', 'feat. Y')."""
    if " - " in t:
        name, rest = t.rsplit(" - ", 1)
        rest = rest.strip()
        feat = rest[len("Newcall"):].strip() if rest.lower().startswith("newcall") else rest
        return name.strip(), feat
    return t.strip(), ""


def videos():
    out = subprocess.run(YTDLP + ["--flat-playlist", "--encoding", "utf-8", "--print", "%(id)s\t%(title)s\t%(duration)s", KANAL],
                         capture_output=True, check=True)
    liste = []
    for zeile in out.stdout.decode("utf-8").splitlines():
        teile = zeile.split("\t")
        if len(teile) == 3:
            liste.append({"id": teile[0], "titel": teile[1], "dauer": int(float(teile[2] or 0))})
    return liste


def info(vid):
    out = subprocess.run(YTDLP + ["-J", "--encoding", "utf-8", f"https://www.youtube.com/watch?v={vid}"], capture_output=True, check=True)
    return json.loads(out.stdout.decode("utf-8"))


def cover(vid, ziel):
    for name in ("maxresdefault", "sddefault", "hqdefault"):
        try:
            with urllib.request.urlopen(f"https://i.ytimg.com/vi/{vid}/{name}.jpg", timeout=20) as r:
                bild = Image.open(io.BytesIO(r.read())).convert("RGB")
            break
        except Exception:
            continue
    else:
        return False
    w, h = bild.size
    s = min(w, h)
    bild = bild.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2)).resize((800, 800), Image.LANCZOS)
    bild.save(ziel, "JPEG", quality=86, optimize=True, progressive=True)
    return True


def mp3(vid, ziel):
    vorlage = ziel[:-4] + ".%(ext)s"
    subprocess.run(YTDLP + ["-x", "--audio-format", "mp3", "--audio-quality", "192K", "--no-playlist", "-q", "--no-warnings",
                            "-o", vorlage, f"https://www.youtube.com/watch?v={vid}"], check=True)
    return os.path.exists(ziel)


def main():
    os.makedirs(MUSIK, exist_ok=True)
    os.makedirs(COVER, exist_ok=True)
    alt = {}
    if os.path.exists(AUSGABE):
        text = open(AUSGABE, encoding="utf-8").read()
        try:
            for s in json.loads(text[text.index("["):text.rindex("]") + 1]):
                alt[s["youtube"]] = s
        except ValueError:
            pass
    songs = []
    for v in videos():
        vid = v["id"]
        datei, bild = f"musik/{vid}.mp3", f"bilder/cover/{vid}.jpg"
        eintrag = alt.get(vid)
        if not eintrag:
            name, feat = titel_aufteilen(v["titel"])
            jahr = ""
            try:
                jahr = str(info(vid).get("upload_date", ""))[:4]
            except Exception:
                pass
            eintrag = {"titel": name, "feat": feat, "jahr": jahr, "dauer": v["dauer"], "youtube": vid, "datei": datei, "cover": bild}
        if not os.path.exists(os.path.join(HIER, bild)):
            print("Cover", eintrag["titel"]); cover(vid, os.path.join(HIER, bild))
        if not os.path.exists(os.path.join(HIER, datei)):
            print("MP3  ", eintrag["titel"]); mp3(vid, os.path.join(HIER, datei))
        songs.append(eintrag)
    with open(AUSGABE, "w", encoding="utf-8", newline="\n") as f:
        f.write("// Automatisch erzeugt von werkzeug/youtube_songs.py – nicht von Hand ändern.\n")
        f.write("window.SONGS = " + json.dumps(songs, ensure_ascii=False, indent=2) + ";\n")
    print(f"Fertig: {len(songs)} Songs in songs.js")


if __name__ == "__main__":
    main()
