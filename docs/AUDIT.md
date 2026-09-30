# CodeMasterLabs — audyt techniczny i pakiet poprawek 2.2.0

**Data opracowania: 29 września 2026 r.**  
**Materiał wejściowy:** `CodeMaster-VPS (1)(4).zip`  
**Rodzaj rezultatu:** poprawione źródła, instalator pojedynczego VPS, testy i dokumentacja operacyjna.  
**Status publikacji:** **ZABLOKOWANA / NIEZWERYFIKOWANA PRODUKCYJNIE**.  
**`COMMERCIAL_RELEASE_READY = false`**

## 1. Werdykt i granice odpowiedzialności

W paczce wykonano rzeczywiste zmiany w kodzie, a nie tylko zmianę nazwy ZIP-a, opisu czy flagi gotowości. Rozbudowano obsługę formularzy, dostarczanie powiadomień, politykę załączników, migracje SQLite, proces budowania i zabezpieczenia instalatora. Przygotowano konfigurację dla `codemasterlabs.pl` oraz `codemasterlabs.com`. Zachowano wszystkie 32 pliki katalogu `public/` bajt w bajt.

W dostępnym środowisku przechodzi **145 testów Node i 25 testów Python — razem 170; bez błędów i pominięć**. Zestaw wejściowy obejmował 89 testów Node i 10 testów Python. Dodano więc 71 testów. Wyniki te dotyczą komponentów, kontraktów i operacji na syntetycznej bazie SQLite. Nie są wynikiem uruchomienia całej strony na produkcyjnym stosie Next.js/Payload.

**Nie potwierdzono „zero Critical / High / Medium” w gotowej aplikacji.** Nie wykonano udanego pobrania zależności, pełnego builda, skanu faktycznie zainstalowanego drzewa npm ani obrazów Docker, pełnego E2E i wdrożenia na VPS. Liczniki podatności pozostają **nieznane**, a nie równe zero. Brak błędu w teście jednostkowym nie dowodzi nieobecności podatności w systemie.

Dodatkowo na 30 września 2026 r. zapowiedziano kolejną poprawkę bezpieczeństwa Next.js. W publicznym komunikacie producent podał planowane wersje i poziomy istotności; szczegółowe zakresy podatnych konfiguracji mają towarzyszyć wydaniu. Nie przypisuję automatycznie wszystkich zapowiedzianych podatności tej aplikacji. Stosuję zachowawczą blokadę jej publicznej publikacji do czasu aktualizacji i ponownej weryfikacji. [S1]

**To nie jest jeszcze bezwarunkowo gotowy, skompilowany i zaakceptowany release „wrzuć i działa”.** To wydanie źródłowe z poprawkami i bramkami kontrolnymi. Gdy brakuje dowodu lub wystąpi błąd, instalator ma przerwać operację, a nie udawać sukces. Nie obniżono progów bezpieczeństwa w celu uzyskania zielonego raportu.

## 2. Pochodzenie, kompletność i zakres przeglądu

Wejściowe archiwum ma 6 271 658 bajtów i 286 plików. Rozpakowywanie i pakowanie wykonano z kontrolą ścieżek. Sumy SHA-256 plików wejściowych zapisano w `reports/input-inventory.json`; zmiany plik po pliku znajdują się w `reports/change-inventory.json`. Lista różnic w czytelnej postaci to `docs/FILE-CHANGES.md`.

SHA-256 wejściowego ZIP-a:

`183f07132599b2341bab8e838bee6e5a439ae02513f831ec963595b8c537977c`

Nie uzyskano autoryzowanego dostępu do repozytorium zdalnego. Nie tworzono ani nie przedstawiano fikcyjnego identyfikatora commitu Git. Ta paczka jest identyfikowana przez pochodzenie archiwum, wersję i sumy plików. Kopia poprzednich deklaracji wydania znajduje się wyłącznie w `reports/historical-input/` i nie jest bieżącym dowodem testowym.

Przegląd odbył się wieloprzebiegowo: inwentaryzacja; analiza punktów wejścia i granic zaufania; porównanie schematu bazy z kolekcjami; przegląd powiadomień i ponowień; kontrola wdrożenia, kopii i odtwarzania; implementacja poprawek; regresja; ponowna kontrola artefaktu. Automatyczna analiza składni i lokalnych importów obejmuje pliki TypeScript/TSX w zakresie raportowanym przez `scripts/check-source.cjs`. Ścisłe sprawdzanie typów obejmuje osobny `tsconfig.domain.json`, nie pełny framework.

Ręczny przegląd był skoncentrowany na API kontaktu i opinii, tokenach, walidacji danych, załącznikach, ACL, schematach kolekcji, seeding/migracjach, powiadomieniach, kliencie formularzy oraz narzędziach VPS. **Nie oznaczono każdej linii aplikacji jako niezależnie ręcznie zweryfikowanej.** Inwentaryzacja lub transpile każdego pliku nie jest równoznaczne z audytem bezpieczeństwa każdej jego ścieżki wykonania. Nie wykonano niezależnego testu penetracyjnego.

### Czy usunięto grafiki lub screenshots?

W obecnym wejściowym ZIP-ie nie ma folderu `screenshots/`. W starszej dużej paczce znaleziono 83 pliki zrzutów. W obecnym `src/` nie znaleziono statycznych odwołań do `screenshots/`; wynik zapisano w `reports/screenshots-reference-check.json`. Nie było jednak produkcyjnej bazy CMS, dlatego nie można wykluczyć odwołań zapisanych w niewidocznych danych z innej instalacji.

W tym wydaniu nie usuwano żadnego z 32 plików `public/`: 29 obrazów rastrowych i 3 SVG. Zachowano również warianty obrazów, nawet gdy wyglądają na podobne. `reports/public-assets-comparison.json` dokumentuje zgodność bajtową. Nie przywrócono 83 zrzutów jako plików wykonywalnej aplikacji — nie były częścią badanego wejścia i nie stwierdzono ich statycznego użycia.

Rozmiaru ZIP-a nie należy traktować jako miary kompletności programu. W tej paczce nie ma `node_modules`, gotowych obrazów, `.next`, prywatnej bazy ani sekretów. Zależności i build mają powstać w kontrolowanym procesie na docelowym środowisku.

## 3. Metoda klasyfikowania ustaleń

Poniższe poziomy są oceną ryzyka dla tego projektu, a nie wyliczonym CVSS i nie stanowią automatycznie identyfikatorów CVE. **High** oznacza ryzyko utraty/ujawnienia danych, obejścia istotnej kontroli albo poważnej zawodności wdrożenia. **Medium** oznacza istotny problem niezawodności, ochrony danych, przeciążenia, konfiguracji lub integralności procesu. Uwagi jakościowe i organizacyjne są oznaczane osobno.

„Poprawiono w kodzie” znaczy, że zmiana istnieje i przeszła wskazaną kontrolę komponentową. **Nie oznacza „zamknięto produkcyjnie”**. Zamknięcie wymaga uruchomienia rzeczywistych zależności i scenariusza na środowisku docelowym. Obszary niezweryfikowane nie zostały uznane za ryzyka zaakceptowane przez właściciela.

## 4. Formularze, tokeny i ponowienia

### F01 — powtórny zapis zgłoszenia po utracie odpowiedzi — High

Problem: klient może nie otrzymać odpowiedzi mimo zapisu zgłoszenia. Wygenerowanie nowego klucza i automatyczne ponowienie może utworzyć drugi lead. Zmieniono zarówno klienta, jak i serwer. Token pozostaje ten sam po niejednoznacznym błędzie sieciowym; zapis jest identyfikowany unikalnym kluczem. Powtórzenie identycznej treści odsyła do istniejącego rezultatu. Zmiana treści lub załącznika dla użytego klucza kończy się konfliktem, zamiast nadpisywać wcześniejsze dane.

Pliki: `src/app/api/contact/route.ts`, `src/lib/submission-policy.ts`, komponenty formularza i chatu. Testy wykonują rzeczywisty handler z zastępczą implementacją CMS, w tym ponowienie i konflikt. Pełne zachowanie ograniczenia unikalności, transakcji oraz serializacji uploadu w zainstalowanym Payload wymaga E2E.

### F02 — duplikaty i prywatność opinii — Medium

Dodano unikalny `submissionKey`, rozpoznawanie powtórzonej treści i obsługę wyścigu przy zapisie opinii. Publiczne zgłoszenie nadal tworzy szkic, a nie natychmiast opublikowaną opinię. W publicznej odpowiedzi zwracane są tylko dozwolone pola; dowody zgody i klucz techniczny nie powinny być publicznymi danymi. Opinie redakcyjne bez klucza nadal mogą istnieć.

Potwierdzono kontrakt handlera, moderację i unikalność nullable w syntetycznym SQLite. Pozostaje test anonimowego odczytu i uprawnień w prawdziwym API Payload.

### F03 — rozdzielenie terminu nowego zgłoszenia i odzyskania potwierdzenia — Medium

Nowe zgłoszenie wymaga tokenu nie starszego niż 30 minut. Odzyskanie potwierdzenia wcześniej zapisanego, identycznego zgłoszenia dopuszcza token do 24 godzin. Starszy token nie otwiera nowej możliwości utworzenia rekordu. Nie zastosowano nieograniczonej ważności ani wyłączenia podpisu.

Klient odnawia token po jednoznacznym komunikacie o nieważności/wygaśnięciu, a nie po każdym błędzie połączenia. Testy obejmują granice ważności i brak zgody na nowy zapis z tokenem dopuszczonym tylko do odzyskania potwierdzenia.

### F04 — czytanie body przed kontrolą rozmiaru i czasu — High

Dodano `src/lib/http-body.ts`: ograniczanie rzeczywiście odczytanych bajtów, kontrolę `Content-Length`, ograniczenie czasu czytania i anulowanie strumienia. Kontakt ma limit żądania 6 MiB, pojedynczy załącznik 5 MiB, a JSON opinii 12 KiB. Odrzucane są zduplikowane i nieznane pola formularza.

Wyniki obejmują nadmiarowe body, niespójny nagłówek długości, wolny strumień i duplikaty pól. Nie wykonano sieciowego testu obciążeniowego ani pomiaru pamięci parsera multipart przy wielu równoczesnych żądaniach. Ograniczenia Nginx są dodatkową warstwą, nie substytutem kontroli aplikacji.

### F05 — błędna klasyfikacja wyjątków bazy — Medium

Rozpoznawanie konfliktu unikalności nie utożsamia już dowolnego błędu integralności z duplikatem. Błędy `CHECK` i kluczy obcych nie są zwracane jako udane ponowienie. Przejście po przyczynach wyjątku ma ograniczoną głębokość i wykrywa cykle.

Testy obejmują unikalność, błędy innego typu i cykliczny łańcuch przyczyn. Integracyjne mapowanie błędów konkretnej wersji adaptera jest nadal do potwierdzenia.

### F06 — zawieszenie lub niejednoznaczna obsługa formularza w przeglądarce — Medium

Pobranie tokenu ma własny timeout; wysłanie kontaktu i opinii ma ograniczony czas. Czas wysłania opinii zaczyna się po zakończeniu wyzwania antybotowego, aby samo oczekiwanie na człowieka nie zużyło całego limitu POST. Zabezpieczono ponowne kliknięcia. Zamknięcie i ponowne otwarcie chatu nie resetuje bez potrzeby tokenu niejednoznacznego wysłania.

Komunikaty dla znanych awarii sieci i challenge nie przekazują użytkownikowi surowych technicznych wyjątków. Pozostaje ręczny test słabego łącza, klawiatury, czytnika ekranu i powrotu do formularza na telefonie.

## 5. Wiadomości, moderacja i retencja

### F07 — zależność zapisu zgłoszenia od jednorazowej wysyłki SMTP — High

Zapis leada i dostarczenie powiadomienia są oddzielone. Nowy rekord jest zapisywany ze stanem powiadomienia `pending`. Osobny worker przetwarza kolejkę, zapisuje próby i ponawia z rosnącą przerwą. Po ośmiu próbach rekord otrzymuje stan `failed`; administrator nie traci samego zgłoszenia.

Pliki: `src/lib/lead-notification.ts`, `scripts/notifications.ts`, kolekcja Leads i migracja 003. Testy potwierdzają przejścia stanów, awarię SMTP, pomijanie wysłanych i starych rekordów oraz opóźnienie kolejnej próby. Nie potwierdzono doręczenia do rzeczywistej skrzynki.

### F08 — niekontrolowane ponowne powiadomienia po migracji — Medium

Stare leady otrzymują stan `legacy`. Migracja nie wysyła automatycznie wiadomości o całej historycznej bazie. Zwykły worker pomija `legacy` i `sent`. Dla świadomego ponowienia istnieje osobna komenda `retry-notification ID`, dopuszczająca jeden rekord w stanie `failed`.

Zapewniana semantyka e-mail jest **co najmniej jednokrotna**, nie „dokładnie raz”. Awaria po akceptacji SMTP, lecz przed utrwaleniem sukcesu może spowodować drugie powiadomienie. Nie powoduje to drugiego leada. Nie ukryto tej granicy gwarancji.

### F09 — zbyt dużo danych osobowych w powiadomieniach i alarmach — Medium

Powiadomienie dla operatora zawiera identyfikator i odsyłacz do CMS, zamiast kopiować pełną treść zgłoszenia i załącznik do kolejnych systemów. Kody błędów workerów i alertów mają charakter techniczny. Testy sprawdzają brak wybranych danych osobowych w budowanej wiadomości.

Nie wykonano pełnego audytu logów wszystkich zewnętrznych bibliotek, hostingu i SMTP. Podłączenie monitoringu błędów wymaga osobnej konfiguracji redakcji danych, cookies, tokenów i treści formularzy.

### F10 — niejawna lub niespójna retencja — Medium

`LEAD_RETENTION_DAYS` musi przed publikacją otrzymać rzeczywistą wartość zatwierdzoną przez właściciela. Mechanizm dotyczy zamkniętych zgłoszeń i czasu ich aktualizacji. Nie wymyślono biznesowego okresu retencji, nie włączono automatycznego kasowania całej bazy i nie zatwierdzono polityki prywatności za użytkownika.

Cleanup jest ograniczony liczbą partii, usuwa wygasłe próby formularza oraz stare osierocone pliki prywatne, które nie są przypisane do leada. Należy osobno uwzględnić opóźnienie usunięcia danych z kopii zapasowych. Nie wykonano testu retencji na rzeczywistych danych klienta.

## 6. Załączniki i kontrola dostępu

### F11 — powierzchowne uznawanie PDF za bezpieczny — High

Kontrola PDF została rozszerzona o strukturę odczytaną przez qpdf jako JSON v2. `src/lib/pdf-policy.ts` analizuje znormalizowane obiekty i odrzuca wybrane aktywne mechanizmy, m.in. JavaScript, akcje otwarcia, uruchamianie programów, osadzone pliki, formularze/XFA, akcje zdalne i szyfrowanie. Analiza ma limity liczby odwiedzanych obiektów, czasu procesu oraz wielkości jego wyjścia.

To **restrykcyjna polityka przyjmowania statycznych PDF**, a nie certyfikowany sanitizer ani gwarancja, że każdy zaakceptowany dokument jest nieszkodliwy. Część poprawnych biznesowo PDF z formularzami może zostać odrzucona. Testowano politykę na reprezentacjach obiektów; nie uruchomiono tutaj rzeczywistego qpdf i silnika antywirusowego na całym korpusie plików. Dokumentacja qpdf opisuje JSON jako reprezentację struktury dokumentu, nie jako automatyczne oczyszczenie. [S3]

### F12 — nieograniczona równoległość kosztownych skanów — Medium

W procesie aplikacji jednocześnie mogą działać najwyżej dwa skany załączników. Przekroczenie limitu jest jawną niedostępnością, a nie przyjęciem pliku bez skanowania. Zachowano kontrolę MIME i sygnatur, dekodowanie obrazów, limit pikseli oraz wymóg odpowiedzi `CLEAN` od antywirusa.

To ograniczenie jest lokalne dla procesu. Docelowa architektura ma pojedynczą instancję aplikacji. Nie wolno traktować tej blokady jako rozproszonego limitera dla wielu serwerów. Trzeba zmierzyć przepustowość i RAM na VPS.

### F13 — rozbieżność publicznych i prywatnych plików — High, obszar kontroli

Prywatne załączniki pozostają poza `public/`; nazwy serwerowe są losowe. Dostęp powinien następować przez chronioną trasę, a nie przez przewidywalny statyczny adres. Klucz zgłoszenia i hash pliku służą porównaniu identyczności ponowienia, nie zastępują autoryzacji odczytu.

Przejrzano granice dostępu i utrzymano odmowę publicznych operacji administracyjnych. Wymagany pozostaje rzeczywisty test anonimowego odczytu, pobrania załącznika po zalogowaniu, nagłówków odpowiedzi oraz dostępu do pliku po odtworzeniu kopii. Nie oznaczono tego obszaru jako zweryfikowanego pentestem.

### F14 — konta administratorów i wersje dokumentów — High, wzmocnienie ochrony

Dodano jawne `readVersions` w odpowiednich kontrolach dostępu. Zakładanie konta przez anonimowe żądanie jest blokowane poza lokalnym, świadomie oznaczonym bootstrapem. Walidacja hasła wymaga 14–128 znaków i odrzuca znaki sterujące. Zachowano ograniczenie prób logowania i czas blokady.

Jawne ACL wersji to wzmocnienie ochrony; samo jego dodanie nie stanowi dowodu, że poprzednia paczka ujawniała wszystkie wersje. Nie wykonano prawdziwego logowania, resetu hasła, enumeracji API ani audytu sesji na zainstalowanym Payload. Rekomendowana dodatkowa ochrona panelu i MFA zależy od świadomie wybranej integracji — nie dodano pozornej funkcji MFA.

### F15 — niebezpieczne linki redakcyjne i zaufanie do nagłówków — Medium

Wspólna walidacja linków odrzuca znaki sterujące, backslash, zakodowane nowe linie i dane logowania w URL. Wartości z CMS nie są dowolnie wykonywanym schematem linku. Walidacja IP używa mechanizmu parsera IP, nie liberalnego wyrażenia regularnego.

Nginx nadpisuje `X-Real-IP` i `X-Forwarded-For`; usuwa zaufanie do nagłówka Cloudflare przesłanego przez klienta. Ta konfiguracja zakłada bezpośredni reverse proxy na VPS. Dodanie CDN/proxy wymaga osobnej listy zaufanych adresów, nie prostego włączenia czyjegoś nagłówka IP.

### F16 — cache prywatnych odpowiedzi — Medium

Proxy aplikacji obejmuje `/api/` polityką prywatnego cache/no-store. Nadal chronione są panel i prywatne odpowiedzi; nie poluzowano CSP przez usunięcie nonce czy globalne dopuszczenie niebezpiecznych skryptów. Pozostaje walidacja nagłówków na rzeczywistym HTTPS, w przeglądarce i ewentualnym CDN.

## 7. Baza danych i zawartość CMS

### F17 — schema kolejek i opinii bez migracji — High

Dodano `20260929_003_submission_delivery.sql` oraz odpowiadającą jej migrację TypeScript, z rejestracją w indeksie. Powstały pola statusu/prób/terminów powiadomienia, klucz zgłoszenia opinii i pola dowodu zgody, w tym odpowiednie pola wersjonowanych opinii. Utworzono indeksy i unikalność klucza.

Testy rzeczywiście wykonują SQL na świeżym SQLite, sprawdzają przeniesienie wcześniejszych rekordów, brak historycznej wysyłki oraz nullable unikalność. Sprawdzają także zgodność list SQL i TypeScript. **Nie uruchomiono migratora Payload z docelowymi zależnościami**, dlatego nie jest to dowód zgodności całego schematu frameworka. Typy Payload są ponownie generowane podczas builda.

### F18 — pozorne wsparcie dwóch silników bazy — Medium

Usunięto deklarowane wsparcie PostgreSQL z tej ścieżki wdrożenia i zależność adaptera, zamiast zostawiać nieweryfikowalny drugi wariant. Produkcyjny instalator obsługuje jawnie **SQLite na jednym VPS**; inny URL bazy jest odrzucany. Produkcyjne automatyczne schema push i drop pozostają wyłączone.

To świadome ograniczenie zakresu, nie gwarancja dużej skali. Wiele instancji, wysoka dostępność, georeplikacja lub rozbudowane transakcje biznesowe wymagają osobnego projektu, migracji i testów.

### F19 — seeding częściowo edytowanego serwisu — Medium

Rozpoznawanie już edytowanej konfiguracji nie opiera się wyłącznie na liczbie rekordów. Uwzględnia znaczące pola globals, aby ograniczyć ryzyko nadpisania częściowo wypełnionej strony. Test regresyjny potwierdza zachowanie danych i brak oznaczenia zakończenia seeda po awarii.

ZIP nie zawiera produkcyjnej bazy, więc nie zaimportowano starych leadów, haseł ani redakcyjnych zmian z innej instalacji. Instalator odmawia bezrefleksyjnego nałożenia migracji początkowej na bazę bez zgodnej historii. Nie gwarantuje automatycznej migracji każdej starszej, niewersjonowanej bazy.

## 8. Zależności, build i pochodzenie obrazów

### F20 — brak aktualnego root lockfile — High, nadal blokuje akceptację

Wejście nie zawiera kompletnego, aktualnego `package-lock.json` w katalogu głównym. `release/package-lock.bootstrap.json` jest materiałem historycznym. Nie został podpisany jako zgodny z aktualnym zestawem Payload tylko dlatego, że zawiera listę pakietów.

Resolver pracuje w katalogu tymczasowym, odpytuje npm, kontroluje spójność root dependencies i integralność metadanych, a następnie atomowo zapisuje aktualny lock. Dopiero wtedy wolno wykonać `npm ci`. Bez dostępu do npm proces kończy się błędem. W tym środowisku nie udało się wykonać rzeczywistej instalacji — **lock nadal wymaga utworzenia i zatwierdzenia na środowisku z dostępem do rejestru**. Do czasu jego zapisania zależności zakresowe nie są zamrożonym, odtwarzalnym release'em.

### F21 — skany pomijające Medium i błędy narzędzia — High

Audyt npm obejmuje zarówno graf produkcyjny, jak i komplet zależności potrzebnych operatorowi/testom. Wymaga poprawnego JSON i spójnych liczników. Nieznany wynik, błąd sieci i niekompletna odpowiedź nie oznaczają czystego audytu. Próg blokujący obejmuje `moderate`, `high` i `critical`.

Obrazy aplikacji, operatora i ClamAV są skanowane przez Trivy z progiem `MEDIUM,HIGH,CRITICAL`, bez ukrycia niewyeliminowanych podatności. Dodano SBOM grafu npm oraz osobne CycloneDX SBOM finalnych obrazów. **Wykonano testy interpretacji raportu, ale nie rzeczywisty skan zainstalowanych zależności/obrazów.** W raporcie nie ma wymyślonego wyniku „0”.

### F22 — aktualizacja Next.js i właściwa kolejność wydania — High, blokada ostrożnościowa

Deklarowana wersja w źródle to Next.js `16.3.6`. Producent wskazuje ją jako poprawkę z 22 września; na 30 września zapowiedziano `16.3.7` / `15.5.27`. [S1, S2] `UPDATE-SECURITY.sh` pobiera wyłącznie już opublikowaną stabilną wersję patch z obecnej linii major/minor. Nie wpisuje nieistniejącej paczki i nie przeskakuje samowolnie na inny major.

Publiczne `publish` wymaga co najmniej `16.3.7` i ponownych testów. Od 30 września również start nowej instalacji blokuje starszą wersję. Sam updater zmienia źródło, nie buduje i nie udowadnia braku luk. Po aktualizacji wymagane są resolver, clean install, audyty, build i odbiór. Nie wolno usuwać bramki, aby obejść nieopublikowaną poprawkę.

Payload pozostaje przypięty do `3.90.2`. Poprawka bezpieczeństwa rodziny 3.x z 18 września zawierała także wymagania migracyjne; dlatego sam wyższy numer paczki nie zastępuje wykonania migracji. [S4]

### F23 — status „gotowe” bez kompilacji i odbioru — High, nadal niezamknięte produkcyjnie

Build Docker ma regenerować typy/importmapę, wykonywać audyt, lint, testy, sprawdzanie źródeł, build Next i pełny typecheck. Osobny obraz testowy ma wykonywać E2E na rzeczywistym obrazie aplikacji i jednorazowej bazie, nie na danych produkcyjnych.

Nie ma tu działającego Docker Engine ani pobranych zależności. Stąd pełny build, ESLint frameworka, rzeczywiste E2E, testy axe i pomiary przeglądarkowe są `NOT_RUN`. Dodanie tych kroków do skryptu nie zamienia ich w `PASS`. Błąd wykryty na tym etapie na VPS może wymagać kolejnej poprawki kodu.

## 9. Wdrożenie i dowody akceptacji

### F24 — źródła zależne od przypadkowego katalogu uploadu — Medium

Źródła po rozwiązaniu locka są odkładane pod `/opt/codemaster/releases/<SHA256>/`, z kontrolą treści i praw. Sekrety, cache i dowody nie stają się częścią identyfikatora kodu. Symbole i niebezpieczne ścieżki są odrzucane. Timery odwołują się do zachowanego wydania, nie do katalogu pobranych plików użytkownika.

Instalator nie służy do edycji zainstalowanego wydania w miejscu. Poprawkę należy przygotować w świeżo rozpakowanym źródle i ponownie przeprowadzić deployment. Aktualizacja starej instalacji bez zgodnego manifestu i historii migracji wymaga świadomego przeniesienia danych.

### F25 — akceptacja oparta na starym raporcie — High

Dowód akceptacji jest wiązany z wydaniem, hashem źródeł, konfiguracją oraz czasem. Publikacja odrzuca raporty starsze niż 24 godziny lub niedopasowane do obecnego kodu/konfiguracji/obrazu. Potwierdzenia właściciela zapisuje jako deklaracje, nie jako niezależne testy wykonane przez audytora.

Zmiana istotnego `.env` po teście unieważnia wcześniejszy odbiór. Trzeba ponowić odpowiednie kroki; nie wystarczy ręcznie dopisać `PASS` w pliku. Testy sprawdzają odrzucanie starych i niedopasowanych dowodów.

### F26 — niewłaściwy host, aliasy i ochrona prywatnego podglądu — Medium

Nginx ma jawny host główny, aliasy 308 i odrzucenie nieznanych nazw. Certyfikat ma obejmować wszystkie skonfigurowane nazwy. Pierwszy podgląd jest za dodatkowym hasłem Nginx i `noindex`; publiczna promocja jest osobną operacją. Dodano limity połączeń/żądań, ograniczenia API logowania i blokadę nieużywanych ścieżek GraphQL/rejestracji.

Wykonano testy generowanego tekstu konfiguracji, nie `nginx -t` na serwerze ani rzeczywisty handshake TLS. Zewnętrzny CDN i jego cache muszą być osobno sprawdzone. Hasło podglądu nie zastępuje poprawki bezpieczeństwa zależności.

### F27 — utrata zgodności bazy i plików w kopii — High

Backup zatrzymuje zapisy aplikacji, korzysta z API kopii SQLite, sprawdza integralność i kopiuje media/prywatne pliki. Archiwum najpierw powstaje jako ukryty plik częściowy; dopiero po ukończeniu pojawia się finalna nazwa i suma kontrolna. Operacje zapisujące korzystają ze wspólnej blokady.

To oznacza krótkie okno niedostępności podczas kopii, nie zero-downtime. Backup obejmuje bazę i pliki, ale nie jest kopią całego VPS ani kompletem sekretów. Testy komponentowe nie zastępują odtworzenia faktycznych danych z kontenerem.

### F28 — niebezpieczne lub niedopasowane archiwum odtwarzania — High

Odtwarzanie odrzuca traversal, linki, pliki urządzeń, zduplikowane nazwy, nieoczekiwane ścieżki i nadmierny rozmiar. Weryfikuje hash, SQLite i zgodność obrazu/źródła. Przywracane dane nie zastępują bieżących bez jawnego `--confirm-restore`. Dotychczasowe katalogi są zachowywane do kontroli.

Po odtworzeniu strona wraca do trybu prywatnego i wymaga ponownej akceptacji. Weryfikacja hash chroni przed przypadkowym uszkodzeniem, nie jest podpisem zaufanego wydawcy. Atakujący mający kontrolę nad backupem i plikiem hash nie jest powstrzymywany samą sumą SHA-256.

### F29 — kopia tylko na jednym VPS, brak pewności alarmowania — High, zależność zewnętrzna

Dodano/utrzymano obsługę szyfrowanego backupu off-site przez restic oraz alerty awarii usług. Monitor sprawdza m.in. stan aplikacji, dysk, pamięć, certyfikat, świeżość kopii i zaległą kolejkę powiadomień. Worker, cleanup, backup i monitor mają timery systemd.

**Repozytorium zewnętrzne, klucz szyfrowania i odbiorca alarmów nie zostały utworzone.** Śmierć całego VPS uniemożliwi lokalnemu monitorowi powiadomienie. Dlatego niezależny monitoring i bezpieczna kopia sekretów pozostają wymaganiem właściciela. Akceptacja HTTP webhooka nie jest dowodem przeczytania alarmu przez człowieka.

## 10. Domeny, treści, SEO i elementy komercyjne

### F30 — nieprawidłowy adres kontaktowy i identyfikacja marki — Medium

Dostarczone domeny to `codemasterlabs.pl` i `codemasterlabs.com`; nie są dowodem posiadania `codemaster.pl`. Usunięto użycie starego adresu jako produkcyjnego domyślnego kontaktu. Zastępczy `contact@example.invalid` ma nie udawać istniejącej skrzynki i jest blokowany przed publikacją.

Instalator pyta o istniejący publiczny adres kontaktowy i realne dane SMTP. Nie tworzy skrzynki, rekordów MX ani podpisu DKIM. Dane prawne i rzeczywiste kontakty trzeba zatwierdzić w CMS.

### F31 — niespójne canonical i alternatywy językowe — Medium

Za główną domenę przyjęto **`codemasterlabs.pl`**. `codemasterlabs.com`, `www.codemasterlabs.pl` i `www.codemasterlabs.com` mają przekierowanie 308 do tej samej ścieżki na domenie głównej. Obie domeny nie tworzą dwóch konkurujących kopii strony.

Poprawiono mapowanie ścieżek PL/EN, canonical i hreflang, a sitemapę rozszerzono o stronicowane pobieranie zawartości. Ma ona jawny limit ochronny; nie jest nieograniczonym generatorem milionów URL. Należy sprawdzić finalne nagłówki, robots, ścieżki i indeksowanie na działającym serwerze.

Podział `.pl` jako polska i `.com` jako angielska wersja **nie jest w tym wydaniu wdrożony**. Język EN pozostaje ścieżką w istniejącej architekturze. Inny wybór domeny głównej wymaga zmiany `release/deployment-defaults.json` przed pierwszą konfiguracją; po instalacji trzeba spójnie zmienić zapisane dane hosta, URL, certyfikat i odbiór.

### F32 — marketingowe demonstracje mylone z produktem biznesowym — uwaga zakresowa

Zachowano wygląd, sceny 3D, portfolio i demonstracyjne miniaplikacje. Nie przebudowano ich na system płatności, CRM, portal klienta, e-commerce lub aplikację wieloużytkownikową tylko dlatego, że całość trafi na VPS. Stan demonstracyjny zapisany w przeglądarce nie jest gwarantowaną trwałą bazą biznesową.

Przed sprzedażą określonego modułu jako produktu trzeba wskazać role, model danych, uprawnienia, historię zmian, usługi płatnicze, rozliczenia, SLA i rzeczywiste integracje. Ta paczka jest serwisem firmowym z CMS, formularzem, opiniami i demonstracjami — nie dowodem realizacji nieuzgodnionego systemu transakcyjnego.

## 11. Wyniki testów — co naprawdę wykonano

| Kontrola | Wynik w środowisku opracowania | Interpretacja |
|---|---|---|
| Testy Node | 145 PASS, 0 FAIL, 0 SKIP | Komponenty, kontrakty, handler z zastępczym CMS |
| Testy Python | 25 PASS | Operacje komponentowe, konfiguracja i rzeczywisty syntetyczny SQLite |
| Składnia TS/TSX i lokalne importy | PASS; liczba plików w `source-check.json` | Nie pełny typecheck frameworka |
| Ścisły typecheck domenowy | PASS | Tylko zakres `tsconfig.domain.json` |
| Składnia powłoki, Python, JS narzędzi | PASS | Nie wykonanie tych narzędzi na VPS |
| Wzorce sekretów bieżących źródeł | PASS, brak trafień zdefiniowanych wzorców | Nie pełna analiza entropii ani historii Git |
| Porównanie `public/` | 32/32 identyczne | Nie dowód praw autorskich |
| Instalacja npm offline | FAIL, diagnostyczna | Brak aktualnego root locka/zależności |
| Łączność z npm | FAIL w tym środowisku | Nie potwierdza awarii internetu użytkownika |
| Pełny lint/typecheck/build Next/Payload | NOT_RUN | Warunek dalszej akceptacji |
| Docker, skan obrazów, prawdziwy E2E | NOT_RUN | Brak silnika i zbudowanych obrazów |
| SMTP, Turnstile publiczny, TLS i DNS | NOT_RUN | Potrzebne rzeczywiste konta i VPS |
| Pełne restore, rollback, off-site | NOT_RUN | Nie zastępowano ich testem syntetycznej bazy |

Wszystkie aktualne logi znajdują się w `reports/verification/`. Zestaw bramek generowany na podstawie wykonania jest w `docs/RELEASE-GATES.md`. `scripts/verify-local.py` zwraca kod różny od zera, kiedy nie ma pełnej podstawy do stwierdzenia gotowości. Nie jest to sprzeczne z 170 zaliczonymi testami — inny jest zakres testu komponentu i kompletnej akceptacji systemu.

Nie wykonano benchmarku obciążeniowego, audytu wydajności na telefonie, pomiaru LCP/CLS/INP, ręcznej kontroli 320 px/zoom/klawiatury, wizualnego porównania wszystkich scen WebGL ani kompletnego audytu dostępności. Nie wpisano zmyślonego Lighthouse 100/100 czy zgodności WCAG.

## 12. Warunki domknięcia profesjonalnego wydania

Najpierw trzeba pobrać opublikowaną poprawkę Next, rozwiązać i zapisać lock, wykonać czyste pobranie zależności oraz wszystkie audyty i build. Każde trafienie Medium/High/Critical musi zostać rozpatrzone i usunięte albo projekt ma pozostać nieopublikowany; ta paczka nie akceptuje takich wyjątków za właściciela. Skaner może ujawnić zależność systemową bez dostępnej poprawki — nie wolno wtedy automatycznie wyłączać skanowania.

Następnie wymagane są prawdziwe migracje świeżej i wcześniejszej zgodnej bazy, E2E na dokładnym obrazie oraz testy anonimowych uprawnień, formularzy, opinii, resetu hasła, załączników i awarii dostawców. Testy muszą potwierdzić rzeczywistą konfigurację, nie jedynie środowisko z mockiem.

Kolejny etap to kompletne HTTPS dla czterech nazw, poprawne przekierowania, realny Turnstile, działający SMTP, odbiór wiadomości i uwierzytelnienie poczty. Następnie odtworzenie całej aplikacji wraz z prywatnym plikiem i sprawdzony rollback na staging, niezależne backupy, klucze ratunkowe oraz monitoring spoza VPS.

Właściciel musi zatwierdzić nazwę podmiotu, adres i kontakt, informacje o przetwarzaniu danych i dostawcach, okresy retencji, warunki prezentowania opinii, prawa do materiałów oraz prawdziwość portfolio. Nie udzielono opinii prawnej i nie zadeklarowano automatycznej zgodności prawnej. `ASSET-PROVENANCE.md` jest inwentarzem, nie kompletnym zestawem licencji.

Dla utrzymania przez software house potrzebne są ponadto: uzgodnione SLO/RPO/RTO, odpowiedzialny operator i zastępstwo, cykl aktualizacji zależności, kontrola repozytorium/PR, runbook incydentu, monitorowanie kosztów/dysku i plan pojemności. Repozytorium, branch protection, podpisy obrazów, zewnętrzny system błędów i proces organizacyjny nie zostały skonfigurowane w cudzym koncie.

## 13. Instalacja i przekazanie

Instrukcja dla użytkownika jest w `START-TUTAJ.md`. Instalacja jest interaktywna, wymaga sudo, dostępu do rejestrów, DNS wszystkich nazw, działającego SMTP i kluczy Turnstile. Jest przeznaczona na dedykowany Ubuntu VPS. Nie uruchamiaj jej bez przeglądu na serwerze z innymi aplikacjami: instaluje pakiety, modyfikuje Nginx i reguły sieciowe.

Konfiguracja produkcyjna trafia do `/etc/codemaster`, dane do `/var/lib/codemaster`, kopie do `/var/backups/codemaster`, a raporty odbioru do `/var/lib/codemaster-evidence`. Zainstalowane źródła są wersjonowane katalogiem o sumie treści. Nie wolno kasować tych katalogów i obrazów potrzebnych do odtworzenia.

Po konfiguracji off-site i rzeczywistej retencji należy ponowić odbiór zmienionej konfiguracji. `publish` jest odrębną, świadomą operacją. Nie uruchamia się automatycznie na końcu samego rozpakowania ZIP-a. Gdy instalator przerwie pracę, zachowaj log błędu bez haseł i danych osobowych; nie obchodź bramek i nie usuwaj bazy.

**Zakres ukończony:** poprawki źródeł i narzędzi, dodatkowe testy komponentowe, dowody lokalnego wykonania, obsługa podanych domen i dokumentacja. **Zakres nadal otwarty:** pełny, zbudowany i zweryfikowany runtime oraz usługi/akceptacja na rzeczywistym VPS. Ten podział jest częścią rezultatu, nie ukrytą adnotacją.

## 14. Źródła i dowody

**Dowody własne:** pliki w `reports/verification/`, `reports/input-inventory.json`, `reports/change-inventory.json`, `reports/public-assets-comparison.json`, `reports/screenshots-reference-check.json`; implementacja i testy wskazane powyżej. Dowody historyczne z wejścia nie są bieżącym wynikiem.

**S1.** Next.js, „Upcoming Next.js September Security Release”, 23.09.2026, zweryfikowano 29.09.2026:  
`https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026`

**S2.** Next.js, oficjalny wykaz komunikatów bezpieczeństwa, w tym wydanie z 22.09.2026, zweryfikowano 29.09.2026:  
`https://nextjs.org/blog/tag/security`

**S3.** qpdf, dokumentacja reprezentacji JSON, zweryfikowano 29.09.2026:  
`https://qpdf.readthedocs.io/en/stable/json.html`

**S4.** Payload, „Payload Security Update Available for 3.x and 4.0”, 18.09.2026, zweryfikowano 29.09.2026:  
`https://payloadcms.com/posts/blog/payload-security-update-available-for-3x-and-40`

Daty i zapowiedziane wydania nie są gwarancją przyszłej dostępności pakietu. Stan zależności trzeba ponownie sprawdzić w momencie rzeczywistego wdrożenia.
