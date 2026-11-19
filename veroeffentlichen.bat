@echo off
chcp 65001 >nul
rem Lädt die Musik-Website auf GitHub hoch: https://newxcall.github.io/musik/
cd /d "%~dp0"

rem Beim ersten Mal: Repository "musik" auf GitHub anlegen
gh repo view Newxcall/musik >nul 2>&1
if errorlevel 1 (
  echo Lege das Repository Newxcall/musik an ...
  gh repo create Newxcall/musik --public --description "Meine Musik-Website" || (echo Fehler beim Anlegen & pause & exit /b 1)
)
git remote get-url origin >nul 2>&1 || git remote add origin https://github.com/Newxcall/musik.git

rem Versionsnummern an CSS/JS, damit Browser geaenderte Dateien sofort neu laden
python werkzeugersionen.py

git add -A
git commit -m "Website aktualisiert"
git push -u origin main || (echo Fehler beim Hochladen & pause & exit /b 1)

rem GitHub Pages einschalten (meldet einen Fehler, wenn es schon an ist - das ist ok)
gh api repos/Newxcall/musik/pages -X POST -f "source[branch]=main" -f "source[path]=/" >nul 2>&1

echo.
echo Fertig. Nach 1-2 Minuten ist alles auf https://newxcall.github.io/musik/ zu sehen.
if not "%1"=="--nopause" pause
