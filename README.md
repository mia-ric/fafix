FaFiX - Tampermonkey Script
===========================

_Work in Progress_

## Funktionen
- Erweiterte Leser-Statistiken mithilfe von ApexCharts mit sämtlichen Ereignissen.
- TipTap WYSIWYG Editor, mit Unterstützung sämtlicher BBCodes.

## Requirements
- Moderner Browser (Google Chrome, Mozilla Firefox)
- Tampermonkey Extension ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox](https://addons.mozilla.org/de/firefox/addon/tampermonkey/))

## Installation
1. **Tampermonkey öffnen** - Klicke auf das Tampermonkey-Icon in deiner Browser-Toolbar und wähle 
   **Dashboard** oder **Übersicht** aus dem Menü.
2. **Hilfsmittel aufrufen** - Wechsle im Dashboard zur Registerkarte **Hilfsmittel** (Tools).
3. **Script-URL importieren** - Gib die folgende URL in das Feld **Von URL importieren** ein und 
   klicke anschließend auf **Installieren** oder **Enter**, um fortzufahren.
   - `https://mia-ric.github.io/fafix.js`  
4. **Script-Installation bestätigen** - Eine Vorschau des Scripts wird angezeigt. Klicke auf 
   **Installieren**, um das Script zu übernehmen.
5. **Fertig** - Das Script ist nun aktiv. Du kannst es jederzeit im Dashboard aktivieren, 
   deaktivieren oder bearbeiten.

## Speicherung der Daten
Alle Daten werden ausschließlich in deinem Browser gespeichert – entweder in der **IndexedDB**, im 
**localStorage** oder im **sessionStorage**. Das bedeutet: Deine Daten bleiben lokal auf deinem Gerät 
und werden **weder an mich**, **noch an GitHub**, **noch an FanFiktion.de** übermittelt.

Das heißt, damit die Statistik korrekt funktioniert, musst du die **Statistik-Seite auf FanFiktion.de**
**täglich aufrufen**. Beachte bitte, dass die angezeigten Werte natürlich nicht zu 100 % exakt sind 
da sie unter anderem davon abhängen, **zu welcher Uhrzeit** du die Seite aufrufst.

Nichtsdestotrotz erhältst du einen deutlich besseren Überblick über deine Bücher und deren Entwicklung.

Um die gespeicherten Daten direkt einsehen zu können und gegebenfalls auch zu löschen, kannst du wie 
folgt vorgehen:

### Chrome / Chromium-based
1. Öffne die Entwickler-Tools (F12 oder Rechtsklick → "Untersuchen").
2. Wechsle zum Tab "Application".
3. Wähle in der linken Seitenleiste unter "Storage" die gewünschte Speicherart (IndexedDB, Local Storage, Session Storage).
4. Klicke auf die entsprechende Datenbank und lösche die Einträge manuell oder über den "Clear"-Button.
5. Alternativ kannst du auf "Clear site data" klicken, um alle Daten dieser Seite zu entfernen.

### Mozilla Firefox
1. Öffne die Entwicklerwerkzeuge (F12 oder Rechtsklick → "Untersuchen").
2. Klicke auf den Reiter "Speicher" (Storage).
3. Wähle die gewünschte Kategorie (z. B. IndexedDB, Lokaler Speicher).
4. Mit Rechtsklick auf die Einträge kannst du diese gezielt löschen.
5. Über den Button "Website-Daten löschen" kannst du alles auf einmal entfernen.
