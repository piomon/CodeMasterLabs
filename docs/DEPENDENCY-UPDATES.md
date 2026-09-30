# Aktualizacje zależności — stan 29.09.2026

Źródło deklaruje Next 16.3.6, Payload/@payloadcms 3.90.2 i React/React DOM 19.2.8. To deklaracje paczek, **nie wynik ich udanego pobrania**. Nie ma aktualnego root locka ani wykonanego tutaj skanu zainstalowanych zależności.

Next zapowiedział na 30.09.2026 kolejną poprawkę. Podstawy i źródła są w `AUDIT.md`, S1/S2. Publiczna promocja wymaga co najmniej 16.3.7; od 30.09 także instalacja blokuje starszy numer. Trzeba sprawdzić rzeczywiste wydanie/advisory, nie polegać jedynie na dacie.

Z nowego, zapisywalnego katalogu uploadu, po opublikowaniu poprawki:

```bash
bash UPDATE-SECURITY.sh
sudo bash INSTALL-VPS.sh
```

Aktualizator wybiera wyłącznie opublikowany stabilny patch w tej samej linii major/minor i atomowo zmienia package.json. Nie podnosi samodzielnie Payload/React ani nie uznaje źródła za przetestowane. Błąd sieci lub brak wymaganej wersji oznacza STOP.

`release/package-lock.bootstrap.json` jest historycznym bootstrapem. Resolver w katalogu tymczasowym rozwiązuje rzeczywiste zależności, sprawdza metadane i dopiero wtedy zapisuje root lock. Po udanym rozwiązaniu trzeba zatwierdzić go w repozytorium wraz z typami/importmapą, a CI ma używać `npm ci`. Nie kopiuj historycznego pliku jako rzekomo aktualnego locka.

Na izolowanym środowisku z siecią i wymaganymi narzędziami dalsza kontrola obejmuje:

```bash
node scripts/resolve-lock.mjs
npm ci
node scripts/audit-dependencies.mjs
npm run generate:types
npm run generate:importmap
npm run release:verify
```

`release:verify` wymaga rzeczywistego ClamAV, qpdf, Chromium i dostępu do usług testowych. Uruchamia jednorazową bazę; nigdy nie wskazuj produkcyjnych danych. Migrację upgrade i finalny obraz testuj osobno.

Każdy install ponownie pobiera tagi baz Node/ClamAV i zapisuje ich konkretne digesty dla wydania. Nowy digest wymaga nowych skanów i odbioru. Trivy również rozwiązywany jest do digestu. Nie zrealizowano podpisywania i promocji obrazów w zewnętrznym rejestrze.

`audit-dependencies.mjs` wymaga raportów dla grafu produkcyjnego i pełnego. Progi blokujące: Moderate/High/Critical. `vps/manage.py` skanuje obrazy z progiem Medium/High/Critical. Błąd narzędzia lub niedostępna baza skanera nie jest czystym wynikiem. Nie używaj `--ignore-unfixed`, usuwania bibliotek z raportu czy `|| true`, aby wymusić publikację.
