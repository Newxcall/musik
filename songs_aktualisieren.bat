@echo off
chcp 65001 >nul
rem Holt neue YouTube-Videos als MP3 + Cover in die Website (songs.js). Danach veroeffentlichen.bat starten.
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
  echo Richte einmalig die Werkzeuge ein ...
  python -m venv .venv && .venv\Scripts\python -m pip install -q yt-dlp pillow || (echo Fehler beim Einrichten & pause & exit /b 1)
)
.venv\Scripts\python -m pip install -q -U yt-dlp
.venv\Scripts\python werkzeug\youtube_songs.py || (echo Fehler & pause & exit /b 1)
echo.
echo Fertig. Zum Hochladen jetzt veroeffentlichen.bat starten.
if not "%1"=="--nopause" pause
