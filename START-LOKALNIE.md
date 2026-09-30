# CodeMasterLabs 2.3.0 — uruchomienie i odbiór lokalny

## Co otrzymujesz

To komplet źródeł z poprawkami funkcjonalnymi i testami. Nie jest to prekompilowany program ani potwierdzony build całej aplikacji. Nie uruchamiaj INSTALL-VPS.sh do tego odbioru. Domeny .pl i .com nie są potrzebne do lokalnych testów.

Pełne wyniki i ograniczenia: docs/FUNCTIONAL-AUDIT.html. Bieżący status: RELEASE.json. Wykonane tutaj testy nie wymagają od Ciebie ich ponownego udawania; logi są w reports/functional/.

## Osobna, pusta kopia testowa

Rozpakuj ZIP do nowego katalogu, np. CodeMasterLabs-test. Nie kopiuj do niego prawdziwej bazy klientów, prywatnych plików ani produkcyjnego .env. Testy CMS tworzą, zmieniają i usuwają dane testowe. Wymagane są Node.js 22.16+ oraz npm 10+ zgodnie z package.json.

Poniższe polecenia są sekwencją do wykonania lokalnie, nie listą czynności już tutaj zaliczonych. Potrzebne jest działające połączenie z rejestrem npm. Po niepowodzeniu zatrzymaj się; nie usuwaj walidacji wersji ani testów.

```text
npm run resolve:lock
npm ci
npm run setup
npm run db:init
npm run create-admin
npm run seed
npx playwright install chromium
```

resolve:lock jest jawnym rozwiązaniem zależności. Nie ma tu aktualnego package-lock.json, ponieważ w środowisku przygotowania npm był niedostępny. release/package-lock.bootstrap.json jest wyłącznie historycznym materiałem wejściowym, nie dowodem bieżącego grafu.

setup generuje unikalny lokalny sekret i plik .env. db:init odmawia pracy na już istniejącej bazie. create-admin pyta o e-mail i nazwę oraz pokazuje losowe hasło; zapisz je prywatnie. Nie publikuj zrzutu hasła. seed wypełnia przykładowe treści tylko w przeznaczonej do tego kopii.

## Obejrzenie aplikacji

```text
npm run dev
```

Otwórz http://localhost:3000 oraz http://localhost:3000/admin. Ten serwer trzeba zatrzymać przed uruchomieniem całego odbioru poniżej; runner uruchomi własną instancję i nie powinien przejmować innego procesu na tym porcie.

## Ustawienia odbioru

W tej samej lokalnej kopii dopisz do .env:

```text
E2E_DATABASE_IS_DISPOSABLE=true
E2E_ADMIN_EMAIL=ADRES_LOKALNEGO_ADMINISTRATORA
E2E_ADMIN_PASSWORD=HASLO_WYGENEROWANE_LOKALNIE
```

Zastąp dwa ostatnie wpisy rzeczywistymi danymi konta z create-admin. Nie zmieniaj PAYLOAD_SECRET na przykładowy tekst. Pozostaw lokalny DATABASE_URL=file:./codemaster.db. Nie ustawiaj E2E_BASE_URL ani NODE_ENV=production do uruchamiania tego runnera. .env nie może wejść do repozytorium, publicznego archiwum ani raportu dla osób trzecich.

## Automatyczny odbiór całej aplikacji

```text
npm run verify:functional
```

Na Windows możesz uruchomić TEST-FUNCTIONAL.cmd z terminala. To ten sam runner, bez Dockera. Etapy obejmują generatory Payload, lint, typy, testy Node, build, Playwright i audyt zależności. Skrypt nie pomija nieudanych testów i nie oznacza BLOCKED jako PASS. Raport: reports/functional-local/acceptance.json oraz log każdego wykonanego etapu.

Pełny zestaw przeglądarkowy nie jest całkowicie offline. Weryfikacja Turnstile wymaga prawdziwego kontaktu z usługą, nawet z oficjalnymi kluczami testowymi z .env.example. Testy rzeczywistego załącznika wymagają odpowiednio dostępnego ClamAV i qpdf oraz zależności przetwarzania plików. Zainstaluj/skonfiguruj je w lokalnym środowisku testowym zgodnie z istniejącą polityką plików. Brak tych usług jest niezaliczeniem integracji, a nie powodem do wyłączenia skanowania w aplikacji.

Przy kopiowaniu raportów usuń z nich ewentualne dane testowe i nie udostępniaj .env. Testowe konto administratora służy tylko tej kopii. Nie uruchamiaj testów modyfikujących CMS przeciwko stronie produkcyjnej.

## Weryfikacja manualna przed uznaniem funkcjonalności za odebraną

Sprawdź strony PL i EN, menu na telefonie, klawiaturę i powiększenie, każdą prezentację oraz stan pusty i błąd. Zapisz prawdziwy testowy kontakt z załącznikiem, odczytaj go w CMS, potwierdź niedostępność pliku anonimowo i odbiór e-maila w przeznaczonej do testów skrzynce. Sprawdź reset hasła, moderację opinii, publikację szkicu oraz działanie podglądu po edycji treści.

Te operacje nie wszystkie są dowodzone samym automatycznym runnerem. Szczególnie odbiór poczty przez zewnętrzną skrzynkę, ocena treści, prawa do materiałów i komfort interakcji wymagają osobnego potwierdzenia. Nie wpisuj tych punktów jako zaliczonych, zanim je wykonasz.

## Wersje i publikacja

Na 29.09.2026 istnieje oficjalna zapowiedź poprawki Next.js na 30.09.2026. Nie wpisano do package.json fikcyjnej dostępnej wersji. Po rzeczywistym wydaniu trzeba zaktualizować zależność, ponownie wygenerować lock i powtórzyć cały odbiór. Nie przenoś wyniku testów jednego zestawu zależności na inny.

Pomyślny wynik runnera dotyczy jego wymienionych kontroli. Nie ustawia automatycznie COMMERCIAL_RELEASE_READY=true i nie stanowi gwarancji braku wszystkich wad. Główna paczka pozostaje poprawionym wydaniem źródłowym przed pełnym odbiorem.
