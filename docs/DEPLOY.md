# Instalacja i publikacja — 2.2.0

Pełna instrukcja krok po kroku jest w `../START-TUTAJ.md`. Przeczytaj ją przed uruchomieniem `sudo bash INSTALL-VPS.sh`.

Instalator jest interaktywny, dla dedykowanego Ubuntu. Po rozwiązaniu zależności tworzy kontrolowany katalog źródła pod `/opt/codemaster/releases/<SHA256>/`. Kod operatora ma uprawnienia root; na docelowym serwerze nie może być zapisywalny przez zwykłych użytkowników. Plik `state.json` w `/etc/codemaster` wskazuje aktywne wydanie. Nie używaj starych instrukcji zakładających `/opt/CodeMaster-VPS`.

Na etapie budowania instalator wykonuje rzeczywisty resolver/npm ci, regenerację typów/importmapy, audyt, lint, testy, build i pełny typecheck. Potem skanuje obrazy app/ops/ClamAV, uruchamia migracje i seed bez importu danych z cudzej bazy, tworzy konto operatora, sprawdza zdrowie, konfiguruje prywatny HTTPS i timery. Wykonuje kopię, próbę restore, wysyłkę testową SMTP i E2E na osobnej bazie. Te kroki są kodem do wykonania, **nie zaliczonymi tutaj testami**.

Publiczne `publish` wymaga wersji Next spełniającej próg, aktualnych dowodów dotyczących tego samego kodu/konfiguracji/obrazu i zatwierdzenia danych CMS. Akceptuje tylko dowody do 24 godzin. Właściciel osobno potwierdza odbiór maili, reset hasła, DNS poczty, monitoring, prawa do materiałów i rehearsal odzyskiwania. Deklaracje zapisane są jako deklaracje.

Po zmianie środowiska powtórz instalację z przygotowanego katalogu uploadu, a następnie ponów wymagane kontrole. Nie edytuj opublikowanej kopii pod `/opt/codemaster/releases`. Nie uruchamiaj aktualizatora bezpieczeństwa bezpośrednio w takim katalogu.

Przy błędzie zachowaj chronione `/var/lib/codemaster-evidence`, log właściwej usługi i stan kontenerów. Nie usuwaj danych, wolumenów ani nie wyłączaj skanów. Awaria przed buildem nie oznacza, że aplikacja została uruchomiona. Awaria późniejsza może pozostawić prywatny podgląd — nie jest to zgoda na publikację.

Polecenia operatora uruchamiaj z zachowanego źródła:

```bash
sudo python3 vps/manage.py status
sudo python3 vps/manage.py acceptance
sudo python3 vps/manage.py backup
sudo python3 vps/manage.py restore-test
sudo python3 vps/manage.py smtp-test
sudo python3 vps/manage.py alert-test
sudo python3 vps/manage.py publish
```

Aktualna konfiguracja Compose jest wybierana przez `state.json`; ręczne wpisanie ścieżki starego pliku Compose może użyć niewłaściwego wydania. Instalator nie konfiguruje panelu rejestratora, poczty, CDN ani innego VPS.
