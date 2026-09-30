# CodeMasterLabs — START TUTAJ

## Najpierw status

To wydanie **2.2.0: źródła po poprawkach + instalator**, nie gotowy obraz po odbiorze produkcyjnym. `COMMERCIAL_RELEASE_READY=false`. Wyniki lokalne: 145 testów Node + 25 Python, wszystkie zaliczone. Pełny build, skan zależności i Docker oraz wdrożenie na Twoim VPS nie zostały tutaj wykonane. Szczegółowy raport: `docs/AUDIT.md`.

**Dnia 29.09.2026 publiczne wdrożenie blokuje dodatkowo oczekiwanie na zapowiedzianą poprawkę Next.js.** Nie usuwaj blokady. Aktualizator zadziała dopiero po faktycznym opublikowaniu odpowiedniej wersji w npm. Sam upływ daty 30.09 nie dowodzi jej dostępności ani bezpieczeństwa.

## 1. Domeny i serwer

Domyślnie główna strona działa na **codemasterlabs.pl**. Pozostałe nazwy przekierowują kodem 308 do tej samej ścieżki na domenie głównej:

| Nazwa | Przeznaczenie |
|---|---|
| `codemasterlabs.pl` | Główna domena, PL/EN w istniejących ścieżkach |
| `codemasterlabs.com` | Przekierowanie do `.pl` |
| `www.codemasterlabs.pl` | Przekierowanie do `.pl` |
| `www.codemasterlabs.com` | Przekierowanie do `.pl` |

W panelu DNS ustaw dla obu domen rekord A `@` na **IP właściwego VPS tej strony** oraz `www` jako CNAME do domeny bazowej albo rekord A na ten sam IP. Nie używaj automatycznie adresu innego serwera z wcześniejszych rozmów. Dla wszystkich czterech nazw musi być możliwe wystawienie certyfikatu.

Rekord AAAA pozostaw tylko wtedy, gdy ten VPS faktycznie obsługuje wskazany IPv6 i porty 80/443. Na pierwsze wdrożenie założono bezpośrednie DNS → VPS, bez dodatkowego proxy/CDN. Nie zmieniaj MX, SPF, DKIM czy DMARC na przypadkowe wartości — pochodzą z konfiguracji rzeczywistego dostawcy poczty.

Nie sprawdzono publicznego stanu Twoich DNS ani nie zmieniono ich w panelu rejestratora. Rejestracja domeny nie tworzy automatycznie skrzynki SMTP i działającej strony.

Serwer ma być **dedykowanym Ubuntu 22.04 / 24.04 / 26.04 z sudo**. Instalator modyfikuje pakiety, Nginx, UFW i usługi. Wykrycie innych witryn Nginx powoduje odmowę. Dostępność pakietów i zgodność całego stosu z konkretnym VPS muszą zostać potwierdzone podczas instalacji. Wymagane jest co najmniej 12 GiB wolnego dysku na etap budowania. Parametry RAM/CPU nie są gwarancją przepustowości.

## 2. Dane, które trzeba przygotować

Potrzebny jest istniejący e-mail administratora, rzeczywisty publiczny adres kontaktowy, serwer/login/hasło SMTP, adres nadawcy i port 465 lub 587. Potrzebna jest para kluczy Cloudflare Turnstile z dozwoloną domeną główną; dla późniejszych zmian domen konfigurację challenge trzeba aktualizować. Nie używaj kluczy testowych w publicznej instalacji.

Przed publikacją potrzebne są również niezależny backup off-site, hasło szyfrowania przechowane poza VPS, HTTPS webhook alarmów, zewnętrzny monitor dostępności, rzeczywiste dane prawne i świadoma decyzja o retencji zamkniętych zgłoszeń. Żadnego z tych kont nie utworzono automatycznie.

## 3. Rozpakowanie i instalacja

Prześlij `CodeMasterLabs-VPS-2.2.0-audit.zip` przez SFTP/scp do katalogu domowego użytkownika VPS. Otwórz terminal w tym katalogu. Nie uruchamiaj instalatora na komputerze Windows ani na innym serwerze.

Po opublikowaniu wymaganej poprawki Next.js:

```bash
sudo apt-get update
sudo apt-get install -y unzip
unzip CodeMasterLabs-VPS-2.2.0-audit.zip
cd CodeMasterLabs-VPS
sha256sum -c SHA256SUMS.txt
bash UPDATE-SECURITY.sh && sudo bash INSTALL-VPS.sh
```

`&&` jest celowe: gdy aktualizacja nie znajduje opublikowanej poprawki lub nie ma łączności, instalacja w tej sekwencji nie jest kontynuowana. Nie dopisuj `|| true`.

Sumy kontrolne sprawdzaj **przed** aktualizatorem. Zmiana `package.json`, wygenerowanie locka i raportów naturalnie zmieniają stan źródła względem oryginalnego ZIP-a. Instalator tworzy osobny identyfikator treści rzeczywistego wydania. Zachowaj bazową paczkę i jej sumę jako materiał odniesienia.

Zestaw zawiera historyczny lock bootstrap, ale nie aktualny root lock. Instalator najpierw rozwiązuje rzeczywiste zależności w npm, potem wykonuje `npm ci`, audyt, lint, testy, build i typecheck. Bez sieci albo przy trafieniu Medium/High/Critical lub błędzie kompilacji **ma się zatrzymać**. Może być potrzebna dalsza poprawka ujawniona przez pełny build — ten etap nie został wcześniej zaliczony.

Po pozytywnych etapach instalator ma zbudować obrazy, sprawdzić je, uruchomić migracje i prywatny podgląd HTTPS, wykonać kopię, próbę odtworzenia i testy dokładnego obrazu na osobnej bazie. Nie wykonuje na końcu bezwarunkowego `publish`.

## 4. Gdzie są dane po wdrożeniu

| Zawartość | Ścieżka |
|---|---|
| Źródła faktycznie zainstalowanego wydania | `/opt/codemaster/releases/<SHA256>/` |
| Sekrety, stan i konfiguracja hosta | `/etc/codemaster/` |
| Baza SQLite | `/var/lib/codemaster/data/codemaster.db` |
| Media i prywatne załączniki | `/var/lib/codemaster/media/`, `/var/lib/codemaster/private/` |
| Kopie lokalne | `/var/backups/codemaster/` |
| Rzeczywiste raporty z VPS | `/var/lib/codemaster-evidence/` |

Dane prywatnego podglądu będą w `/etc/codemaster/preview-credentials.txt`, a początkowe dane CMS w `/etc/codemaster/operator/admin-credentials.txt`. Odczytuj je wyłącznie lokalnie przez sudo. Nie wklejaj tych plików, pełnego `.env`, cookies ani danych klientów do czatu, zgłoszeń czy repozytorium. Zmień wygenerowane hasło administratora po pierwszym logowaniu.

## 5. Odbiór i publikacja

W CMS uzupełnij prawdziwy kontakt, dane podmiotu, informacje o hostingu/poczcie/przetwarzaniu i retencji. Nie zaznaczaj `privacyReviewed`, dopóki treść nie jest rzeczywiście przejrzana. Sprawdź polską i angielską wersję. Potwierdź prawa do zdjęć i prawdziwość opisów portfolio/opinii.

Skonfiguruj `/etc/codemaster/restic.env` według `docs/BACKUP-RESTORE.md`. W chronionym `/etc/codemaster/.env.production` ustaw rzeczywisty `ALERT_WEBHOOK_URL` i `LEAD_RETENTION_DAYS` (liczba dni 1–36500; mechanizm dotyczy zamkniętych zgłoszeń). Plik ma format **surowy `KLUCZ=wartość`**, bez shellowego `source`, `eval` i bez cudzysłowów dodawanych jako część wartości.

Jeżeli konfiguracja została zmieniona po testach, uruchom ponownie instalację z tego samego, przygotowanego źródła uploadu. Zostanie stworzony/wybrany kontrolowany release i ponowione testy. Nie edytuj ręcznie root-owned katalogu `/opt/codemaster/releases/<SHA256>/`.

Z katalogu źródeł:

```bash
sudo python3 vps/manage.py status
sudo python3 vps/manage.py backup
sudo python3 vps/manage.py restore-test
sudo python3 vps/manage.py acceptance
sudo python3 vps/manage.py smtp-test
sudo python3 vps/manage.py alert-test
sudo python3 vps/manage.py monitor
```

Samo „SMTP przyjęło” nie oznacza, że wiadomość dotarła do skrzynki. Sprawdź faktyczny odbiór powiadomienia i resetu hasła, SPF/DKIM/DMARC oraz alarm. Przećwicz na osobnym stagingu rollback i odczyt prywatnego pliku po odtworzeniu. Nie wprowadzaj awarii do produkcji, aby udowodnić recovery.

Wymagane raporty muszą dotyczyć aktualnego kodu/konfiguracji i mieć najwyżej 24 godziny. Po ich przejściu oraz świadomym zatwierdzeniu pozostałych warunków:

```bash
sudo python3 vps/manage.py publish
```

Komenda nadal odmawia publikacji przy starej wersji Next, brakującym dowodzie, błędzie testów lub brakach CMS. Deklaracje operatora nie stają się niezależnym audytem prawnym lub penetracyjnym.

## 6. Eksploatacja i awaria

Timery: powiadomienia co minutę, cleanup co godzinę około minuty 10, kopia około 03:40 **w strefie czasowej serwera**, monitoring co 5 minut. Występuje losowe przesunięcie do 30 sekund. Strefa serwera nie musi być Europe/Warsaw; sprawdź ją zamiast zakładać.

Zwykły worker nie wysyła ponownie historycznych i już wysłanych powiadomień. Po usunięciu przyczyny awarii można ręcznie ponowić pojedynczy rekord `failed`:

```bash
sudo python3 vps/manage.py retry-notification 123
```

Zastąp `123` rzeczywistym ID leada. Nie kasuj zgłoszenia tylko dlatego, że e-mail nie dotarł — dane są w CMS.

Przy błędzie zobacz chronione raporty i `journalctl` właściwej usługi. Nie odblokowuj portu 3000 publicznie, nie usuwaj CSP/Turnstile, nie wykonuj `docker compose down -v`, nie włączaj schema push/drop i nie zastępuj FAIL przez PASS.

Przywrócenie z backupu jest operacją zastępującą aktualne dane i może utracić zmiany nowsze od kopii. Dokładna procedura: `docs/BACKUP-RESTORE.md` i `docs/ROLLBACK.md`.

## 7. Co ta paczka zawiera, a czego nie

Jest kompletnym źródłowym zestawem poprawianego serwisu, testów, instalatora i dokumentacji. Nie zawiera `node_modules`, gotowego obrazu, produkcyjnej bazy, haseł ani cudzych prywatnych danych. Nie tworzy w zewnętrznym panelu DNS/skrzynki SMTP/backupów. Nie jest certyfikatem „zero podatności”.

Szczegółowe ograniczenia i dowody nie są ukryte: `docs/AUDIT.md`, `docs/RELEASE-GATES.md`, `reports/verification/local-verification.json`, `RELEASE.json`.
