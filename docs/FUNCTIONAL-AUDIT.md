# CodeMasterLabs 2.3.0-functional

Audyt funkcjonalny i przekazanie kodu | 29.09.2026

## 01. Wynik i granice odbioru

Przygotowano wydanie 2.3.0-functional na podstawie dostarczonego archiwum 2.2.0. Prace dotyczą logiki aplikacji, formularzy, CMS, podstron, nawigacji, demonstracji i testów. Nie wykonano wdrożenia ani zmian DNS, konfiguracji serwera, kont pocztowych czy usług Docker.

Wynik to poprawione źródła z nowymi testami, a nie potwierdzenie bezbłędnego działania całego produktu. Zaliczone testy dotyczą jawnie opisanych warstw. Nadal brakuje uruchomienia prawdziwego Next.js, React i Payload, pełnej kompilacji oraz sprawdzenia aplikacji w przeglądarce z rzeczywistym CMS. Te kontrole można przeprowadzić lokalnie, przed jakimkolwiek VPS.

**COMMERCIAL_RELEASE_READY=false. FULL_APP_FUNCTIONALLY_ACCEPTED=false.** Liczba podatności w zainstalowanych zależnościach jest nieznana. Wartości null w metadanych nie oznaczają zera. Nie przyjęto ryzyk w imieniu właściciela ani nie wystawiono certyfikatu zgodności.

Paczka zachowuje dotychczasową aplikację i wszystkie 32 pliki public/. Nie przebudowano jej w okrojoną atrapę, nie usunięto demonstracji i nie zastąpiono niedostępnego CMS pozorowanym produkcyjnym API. Adaptery testowe znajdują się wyłącznie w testach.

## 02. Co jest produktem, a co demonstracją

Aplikacja jest dwujęzyczną stroną software house z panelem edycyjnym, publikacją treści, portfolio, formularzem kontaktowym, kreatorem briefu i opiniami. Istnieją również demonstracyjne interfejsy branżowe i stanowiska robocze.

Sześć prezentacji marek oraz pięć obszarów demonstracyjnych zachowano. Koszyk demo, przykładowa rezerwacja hotelowa, plan podróży, workflow akceptacji czy klient demonstracyjnego portalu nie są podłączone do prawdziwych płatności, operatora rezerwacji ani kont klientów. Kreator briefu prowadzi przez ustalone pytania; nie dodano fikcyjnego silnika AI.

W tej iteracji dopracowano działanie tych demonstracji, walidację i odtwarzanie ich danych. Nie należy oferować samej obecności tych ekranów jako gotowego wielofirmowego SaaS, sklepu obsługującego realne zamówienia lub systemu hotelowego. To osobny zakres produktu.

## 03. Formularz: jedna operacja, jeden zapis

Dodano ReliableSubmission, wspólny mechanizm formularza, kreatora briefu i opinii. Jedno wysłanie otrzymuje token oraz kopie danych. Równoległe kliknięcia w obrębie tej instancji współdzielą tę samą operację. Dane nie zmieniają się w trakcie niepewnego wyniku.

Po zerwaniu połączenia klient nie zakłada automatycznie, że zapis się nie udał. Ponowienie najpierw odpytuje /api/submission-status. Odnaleziony zapis daje potwierdzenie bez ponownego POST formularza, ponownego pliku i dodatkowego wyzwania antybotowego. Gdy zapisu jeszcze nie ma, ponawiana jest ta sama treść i ten sam klucz.

Negatywna odpowiedź na ponowienie nie dowodzi, że poprzednie żądanie nigdy nie zapisało danych. Dlatego po niepewnym wyniku zachowywana jest blokada edycji także po odpowiedziach 4xx. Jeśli weryfikacja antybotowa nie dopuściła jeszcze do pierwszego POST, dane można poprawiać bez tego ograniczenia.

Dowód: tests/functional-submission.test.cjs oraz tests/functional-http-sqlite.test.cjs. W teście rzeczywistego HTTP klient utracił odpowiedź po zapisie w SQLite; odtworzył potwierdzenie i w bazie pozostał jeden lead. Test wykorzystuje prawdziwe funkcje aplikacji, natywne HTTP i SQLite, ale adapter Payload i dostawcy zewnętrzni są zastąpieni jawnie opisanymi implementacjami testowymi.

Ograniczenie: stan operacji jest przechowywany w pamięci otwartej strony, a nie jako dane osobowe w localStorage. Ostrzeżenie przed opuszczeniem strony nie jest gwarancją zachowania szkicu po awarii przeglądarki. Nie zadeklarowano globalnego exactly-once po zamknięciu strony, otwarciu innej karty lub upływie okna ważności tokenu.

## 04. Endpoint potwierdzenia bez danych osobowych

Nowy endpoint przyjmuje tylko znany rodzaj operacji: contact albo review. Wymaga podpisanego tokenu, prawidłowego pochodzenia żądania, JSON i ograniczonego rozmiaru body. Nie przyjmuje dowolnego identyfikatora rekordu wskazanego przez klienta. Ma osobny limit wywołań.

Odpowiedź zawiera wyłącznie stan missing/saved i numer potwierdzenia. Nie zawiera nazwiska, e-maila, treści wiadomości, pliku ani wpisanej opinii. Ustawiono prywatną odpowiedź bez cache. Podpisany token jest poufnym uprawnieniem do sprawdzenia tej konkretnej operacji i nie powinien być zapisywany w publicznych logach.

W API rozdzielono limit prób od limitu nowych zapisów. Odzyskanie wcześniejszego potwierdzenia nie powinno zużywać limitu tak, jak tworzenie kolejnego leada. Ograniczenia nadużyć pozostają aktywne; nie usunięto ich w celu zaliczenia testów.

## 05. Kreator briefu i wspólna walidacja

Walidacja pól w kreatorze jest teraz wspólna z końcową walidacją zgłoszenia. Błędny adres e-mail zostaje odrzucony na odpowiednim kroku, zamiast dopiero po przejściu całej rozmowy. Limity długości i dopuszczalne znaki są wspólne; wiadomość może zawierać akapity, pola jednowierszowe nie przyjmują znaków sterujących.

Poprawianie odpowiedzi nie kasuje wcześniej wpisanego imienia czy adresu. Błąd końcowy może skierować do właściwego kroku. Niepewna wysyłka blokuje zmianę briefu, ale pozostawia możliwość ponowienia. Uporządkowano powiązanie błędu z polem i fokus.

W przeglądzie znaleziono i usunięto też pozostałość po zmianie mechanizmu tokenu, która odwoływała się do nieistniejącej zmiennej. Automatyczne sprawdzenie niezwiązanych nazw zostało powtórzone. Nie zastępuje ono pełnego sprawdzania typów React/Payload.

## 06. Opinie, moderacja i błędne odpowiedzi API

Dodano wspólną walidację opinii: imię/nazwa, treść, liczba całkowita od 1 do 5, jawna zgoda oraz obsługiwany język. Dane zwrócone przez publiczne API są sprawdzane przed renderowaniem. Ujemna, ułamkowa lub nieprawidłowa ocena nie trafia do wyświetlania gwiazdek jako niebezpieczny argument.

Lista opinii ma timeout, anulowanie po odmontowaniu i kontrolę spójności stron. Zbyt wysoki numer strony jest normalizowany. Stan błędu API nie staje się sukcesem. Nowe zgłoszenie opinii nadal przechodzi dotychczasową moderację; nie dodano publikacji anonimowych wpisów bez akceptacji.

Mechanizm odzyskiwania potwierdzenia dotyczy również opinii. Nie oznacza to natychmiastowej publikacji: zapis i zatwierdzenie do publicznego wyświetlenia to odrębne stany.

## 07. Weryfikacja antybotowa w prawdziwym DOM

Usprawniono ładowanie skryptu, limity czasu, usuwanie elementów po błędzie, reakcję na Escape, zamknięcie okna i przywracanie fokusu. Wyjątek dostawcy podczas renderowania lub usuwania widżetu nie powinien pozostawiać niezakończonej obietnicy ani osieroconego okna.

Jednorazowy dowód weryfikacji nie jest współdzielony przez niezależne formularze. Równoległe drugie wywołanie jest odrzucane, zamiast wysyłać jeden dowód dwa razy. Wielokrotny callback rozstrzyga operację tylko raz. Identyfikator elementu korzysta z natywnego generatora przeglądarki, z alternatywą opartą na getRandomValues tam, gdzie randomUUID nie jest dostępne.

Wykonano 14 scenariuszy w trzech szerokościach: 1440, 390 i 320 px, łącznie 42 zaliczenia. To prawdziwy Chromium 144, natywny dialog, zdarzenia i DOM, ale dostawca antybotowy jest testowy. Przeglądarka działała na pustej stronie z wstrzykniętym modułem aplikacji; nie uruchomiono Next/React/Payload ani prawdziwej usługi Cloudflare. Polityka środowiska blokuje nawigację URL; nie zmieniano jej.

## 08. Daty i zapisane rezerwacje demonstracyjne

Dodano sprawdzanie rzeczywistych dat kalendarzowych zamiast samego wzorca tekstu. Odrzucane są m.in. 31 lutego, nieprawidłowy miesiąc i obiekt w miejscu daty. Przeliczanie liczby noclegów korzysta z dat kalendarzowych, a nie z przypadkowej długości lokalnej doby przy zmianie czasu.

Odtwarzanie hotelu i podróży sprawdza strukturę zapisu, katalog, liczbę osób i dopuszczalny przedział. Kwoty i czas pobytu są przeliczane z danych katalogowych. Nie ufa się cenie, którą ktoś sam wpisał w localStorage. Błędna data nie powinna wywołać wyjątku formatowania całego widoku.

Są to nadal plany demonstracyjne. Walidacja lokalna nie potwierdza dostępności pokoi, miejsc ani prawdziwej ceny operatora. Nie dopisano fikcyjnego połączenia z zewnętrznym systemem rezerwacji.

## 09. Stan demo, błędny JSON i historia zmian

Odtwarzanie stanowisk demo odrzuca niedozwolone identyfikatory, w tym nazwy właściwości prototypu. Nieznane akcje nie modyfikują stanu. Powtórna akceptacja, zmiana statusu na identyczny czy korekta koszyka bez rzeczywistej zmiany nie powinna tworzyć nowego zdarzenia historii.

Uszkodzony zapis w przeglądarce nie jest już automatycznie nadpisywany stanem początkowym. Użytkownik otrzymuje informację o problemie i może jawnie przywrócić dane. Gdy zapis lokalny jest niedostępny, pozostaje tryb pamięciowy zamiast nieustannych nieudanych zapisów. Interakcje podczas pierwszego odczytu nie powinny nadpisywać odtwarzanego stanu.

Testy obejmują przejścia stanów i deterministyczny ciąg 2000 operacji. Ten ciąg jest jednym testem w zestawie, a nie dodatkowym licznikiem 2000 zaliczonych testów. Jedną wcześniejszą asercję dostosowano do nowego kontraktu: brak wpisu w pustym koszyku oznacza zero, a nie obowiązek zapisania sztucznego wpisu zero. Dodano osobny test niezmienności stanu dla pustej operacji.

## 10. CMS, którego ustawienia wpływają na stronę

Lista projektów wyróżnionych filtruje featured przed zastosowaniem limitu. Na stronie głównej dodano prezentację opublikowanych opisów z CMS obok zachowanych demonstracji. Wyłączenie wyróżnienia powinno usuwać wpis z tej listy, a nie pozostawiać niewykorzystywane ustawienie administracyjne.

Powinny być wykorzystywane ustawione nagłówki i opisy procesu oraz etapy współpracy. Uzupełniono wyświetlanie opisu case study, rezultatu, technologii, tagów, powiązanych artykułów i okładek. Projekty oznaczone jako koncepcyjne nie są przez tę zmianę przedstawiane jako rzeczywiste wdrożenia dla klienta.

Publiczne zapytania zachowują overrideAccess:false. Nie uzupełnia się pustych kolekcji fikcyjnymi opublikowanymi rekordami. Wbudowane teksty domyślne mogą uzupełnić brakujący tekst globalny, ale nie zastępują decyzji publikacyjnej dotyczącej dokumentu.

Dowody tutaj obejmują testy kontraktu zapytań, nie rzeczywisty silnik uprawnień Payload. Dodano test przeglądarkowy tworzący i wyłączający wyróżniony projekt w prawdziwym CMS; jest dostarczony, ale w tym środowisku nie został wykonany.

## 11. Podstrony, stronicowanie i języki

Blog i opisy projektów otrzymały stronicowanie w PL i EN. Dokumenty powyżej dawnego limitu 100 nie są z definicji nieosiągalne. Pojedyncza strona zawiera najwyżej 12 rekordów, a wartość page jest normalizowana. Pusty zbór nadal ma prawidłowy pierwszy widok, a zbyt wysoki numer jest ograniczany do ostatniej strony.

Adres kanoniczny listy wskazuje stronę rzeczywiście pokazaną po normalizacji, a nie dowolny numer wpisany w URL. Metadane alternatywnych języków zachowują parametr stronicowania. Główne strony PL i EN pobierają ustawienia SEO z odpowiedniego języka CMS; własny obraz udostępniania jest dopuszczany tylko z własnego pochodzenia URL.

Przełącznik języka zachowuje rozpoznaną ścieżkę projektu, artykułu i demonstracji, zamiast zawsze przenosić na początek serwisu. Nie deklaruje to synchronizacji dowolnych filtrów czy nieznanych parametrów zapytania. Przywrócono możliwość pokazania linków nawigacji skonfigurowanych w CMS, zamiast ich arbitralnego odfiltrowywania.

## 12. Podgląd CMS i rozróżnienie celów

Podgląd dokumentu wymaga zalogowanego administratora, obsługiwanej kolekcji i dodatniego bezpiecznego identyfikatora liczbowego. Błędny lub nieistniejący dokument prowadzi do notFound zamiast nieobsłużonego odczytu. Zapytanie wersji roboczej przekazuje kontekst użytkownika i respektuje kontrolę dostępu.

Globalny podgląd strony głównej jest odróżniony od podglądu rekordu kolekcji. Generator nie dokleja do globalnego podglądu mylącego identyfikatora dokumentu. Zachowano zgodność ze starszym linkiem z pustą kolekcją. Tę regresję wykryto podczas ponownego przeglądu zmian i dodano trzy testy.

Globalne ustawienia w obecnym modelu mają historię wersji, ale nie odrębny pełny workflow nieopublikowanych wariantów strony. Odświeżanie podglądu po zapisie nie jest dowodem rozbudowanego edytora live draft dla całego layoutu.

## 13. Wyniki testów i ich rzeczywisty zakres

**203/203 testy Node: PASS, 0 błędów, 0 pominięć.** To cały bieżący zestaw plików tests/*.test.cjs, a nie dodawanie do siebie kolejnych uruchomień tego samego zestawu. Nowych scenariuszy Node względem wejścia jest 58. Część wcześniejszych testów dotyczy mechanizmów pomocniczych, ale nie uruchamia VPS.

**42/42 wykonania w Chromium: PASS.** 14 scenariuszy izolowanego DOM i dat w trzech szerokościach. Nie są to 42 kompletne ścieżki użytkownika w uruchomionej witrynie.

**17 jawnie wybranych plików domenowych: ścisły TypeScript PASS.** Konfiguracja tsconfig.domain.json nie obejmuje pełnego frameworka, JSX ani wszystkich typów Payload. **161 plików TS/TSX: poprawna transpile-składnia i lokalne importy.** Ta liczba obejmuje kod, narzędzia i testy. Nie należy nazywać jej pełną kompilacją aplikacji.

Sprawdzanie niezwiązanych nazw nie znalazło takich odwołań. Pełna próba analizy bez zależności generuje wiele diagnostyk brakujących modułów i typów. Nie filtrowano ich po to, aby wystawić fałszywy wynik pełnego typechecka. Ten etap pozostaje niewykonany z rzeczywistymi zależnościami.

Skan wybranych silnych wzorców tokenów i kluczy nie znalazł trafień. To nie jest kompleksowy audyt historii sekretów, analiza entropii ani sprawdzenie ważności wszystkich możliwych poświadczeń. Historycznych 25 testów Python dotyczących operacji serwerowych nie doliczono do bieżących 203+42.

## 14. Co rzeczywiście pozostaje niewykonane

Nie pobrano i nie uruchomiono rzeczywistych zależności Next/React/Payload. Rejestr npm nie rozwiązuje się w DNS tego środowiska; jest zachowany log rzeczywistej próby. Nie ma aktualnego głównego package-lock.json. Historyczny bootstrap nie został przemianowany na rzekomo poprawny lock.

Brakuje: pełnego lintowania z zależnościami, generowania typów i mapy importów przez Payload, pełnego sprawdzenia typów, produkcyjnej kompilacji Next, uruchomienia wszystkich stron oraz testów pełnego UI i CMS. Drobne uzupełnienia pliku typów w źródle nie są przedstawiane jako wynik uruchomionego generatora.

Nie zweryfikowano z rzeczywistym CMS: logowania, resetu hasła, prywatnych plików, moderacji, zapisu i migracji schematu, publikacji i edycji z poziomu panelu. Nie wykonano prawdziwych przepływów Cloudflare, SMTP, Sharp/qpdf i ClamAV. Dostarczenie testów dla tych mechanizmów nie zastępuje ich wykonania.

Nie przeprowadzono pełnego przeglądu dostępności całej aplikacji, pomiarów wydajności, testów obciążenia ani kompletnej kontroli mobilnego WebGL. Nie potwierdzono treści prawnych, praw do wszystkich materiałów ani rzeczywistych referencji biznesowych. Nie wpisano fikcyjnych danych firmy i nie zaznaczono za właściciela privacyReviewed.

## 15. Model uprawnień: ważne ograniczenie produktu

Obecny CMS zakłada, że każde konto administracyjne należy do zaufanego administratora. Nie dodano podziału na redaktora, handlowca, klienta i właściciela ani izolacji wielu firm. Nie wdrożono w tej iteracji MFA. Kontrola dostępu oparta na obecności zalogowanego administratora nie może być reklamowana jako rozbudowany model enterprise RBAC.

Dla strony zarządzanej przez właściciela jest to jawny model. Nadawanie kont osobom, które nie powinny widzieć leadów, zmienia wymagania i wymaga osobnego projektu uprawnień, testów negatywnych oraz prawdziwego odbioru na CMS. Nie zaakceptowano tego ryzyka w imieniu właściciela.

W dokumentacji Payload zaznaczono, że Local API domyślnie omija kontrolę dostępu. Z tego względu publiczne zapytania tej aplikacji jawnie zachowują overrideAccess:false, a podgląd dokumentu przekazuje użytkownika. Jest to wybrana kontrola, nie dowód pełnej zgodności całego systemu.

## 16. Lokalny odbiór bez Dockera i VPS

Dodano npm run verify:functional oraz TEST-FUNCTIONAL.cmd. Uruchomienie jest przeznaczone wyłącznie dla osobnej lokalnej kopii z bazą testową. Wymaga jawnego E2E_DATABASE_IS_DISPOSABLE=true, konta testowego administratora, rzeczywistych zależności, locka i lokalnej konfiguracji.

Runner nie naprawia wyników przez wyłączanie testów. Zatrzymuje się na błędzie, zapisuje log etapu i rozróżnia PASS, FAIL oraz BLOCKED. W tym środowisku rzeczywiście uruchomiono jego wstępną kontrolę: otrzymała BLOCKED z kodem 2, a nie PASS.

Etapy: kontrola składni/importów, generator typów, generator mapy importów, lint, pełny typecheck, domenowy typecheck, testy Node, build, pełne testy Playwright i audyt zależności. Wyniki są w reports/functional-local/. Runner nie łączy się z Twoim VPS i nie konfiguruje usług serwerowych.

Wywołania npm w narzędziach lokalnych poprawiono tak, aby korzystały z wejścia JavaScript npm również na Windows, bez niepotrzebnego sklejania komend powłoki. Cztery testy sprawdzają konstrukcję wywołania i odrzucanie nieprawidłowych argumentów. Sam skrypt .cmd nie był uruchamiany na systemie Windows w tym środowisku.

## 17. Zależności i aktualizacja bez wymyślania wersji

W kodzie pozostaje Next 16.3.6 oraz rodzina Payload 3.90.2. Na 29 września 2026 oficjalny komunikat Next.js zapowiada na 30 września poprawki 16.3.7 i 15.5.27. Zapowiedź nie stanowi dowodu, że pakiet jest już dostępny, ani nie opisuje jeszcze pełnego wpływu na ten konkretny produkt.

Nie podstawiono niezweryfikowanej przyszłej wersji i nie usunięto istniejącej blokady publicznej publikacji. Przed publikacją wymagane są faktycznie wydana poprawka, odtworzony lock, pełny audyt zainstalowanego grafu zależności oraz powtórzenie testów. Brak CVE w samym kodzie źródłowym nie oznacza braku podatności w całym stosie.

OWASP ASVS jest użyteczną podstawą do określania wymagań i planu kontroli. W tym wydaniu nie wykonano pełnego mapowania wszystkich wymagań ASVS, niezależnego pentestu ani certyfikacji. Nie zastosowano etykiety „zgodne z najlepszym software house na świecie” jako zamiennika tych dowodów.

## 18. Pliki dowodowe, historia i integralność

Aktualne dowody: reports/functional/final-node.tap, browser-isolated.json, final-source.log, domain-typecheck.log, unbound-symbols.json oraz evidence.json. Pełny diff zmian w tekstowych plikach wykonawczych i testach: reports/functional/code-changes.patch. Pełny spis zmian względem archiwum wejściowego: reports/functional/file-changes.json.

Pusty domain-typecheck.log oznacza brak komunikatów narzędzia; rzeczywisty kod wyjścia zapisano dodatkowo w evidence.json. Wcześniejsze logi iteracji pozostawiono dla przejrzystości. Nie należy sumować ich wyników. Log full-node-pass-2.tap dokumentuje wcześniejszą jedną niezgodność asercji kontraktu koszyka, naprawioną i ponownie przetestowaną przed final-node.tap.

Dokumenty poprzedniego wydania oraz reports/verification/ są materiałem historycznym; nie poświadczają odbioru obecnego wydania. Bieżący status opisują RELEASE.json i ten raport. Bieżący skan sekretów ma osobny aktualny wynik.

Pochodzenie to dostarczony ZIP, nie zweryfikowany zdalny branch GitHub. Lokalnego commita pomocniczego do porównań nie uznano za autoryzowany commit repozytorium. Do ZIP-a nie dołączono .git, bazy, prywatnych załączników, .env ani node_modules. Suma wejścia, sumy poszczególnych plików i porównanie 32 publicznych zasobów są zachowane.

## 19. Wniosek odbiorowy

W tej iteracji usunięto konkretne błędy i niespójności oraz zwiększono zakres dowodów wykonawczych. Jest rzeczywista poprawa klienta formularza, odzyskiwania zapisu, walidacji, demonstracji, CMS i podstron. Łącznie uzyskano 203 zaliczenia testów Node i 42 zaliczenia izolowanej przeglądarki.

Warunek „mam pewność, że cała aplikacja funkcjonalnie działa przed VPS” pozostaje otwarty do czasu pełnego uruchomienia i odbioru lokalnego. Nie jest do tego potrzebny VPS; potrzebne są rzeczywiste zależności, lokalny CMS, dane testowe i wykonanie scenariuszy całej aplikacji. Nowa paczka zawiera narzędzia i instrukcję do takiego odbioru, ale nie fikcyjny protokół jego zaliczenia.

## Źródła zewnętrzne

- [OWASP ASVS: zakres i cel standardu](https://owasp.org/projects/asvs)
- [Payload: Local API i kontrola dostępu](https://payloadcms.com/docs/local-api/access-control)
- [Next.js: oficjalna zapowiedź wydania 30.09.2026](https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026)
