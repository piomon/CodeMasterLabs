# Aktualizacja, rollback i starsze bazy

Zachowaj poprzednie root-owned źródło, obrazy app/ops i zgodną kopię danych. Rozpakowuj nową paczkę do nowego katalogu uploadu. Aktualizacja wersji odbywa się w tym źródle; `INSTALL-VPS.sh` tworzy własny trwały katalog wydania. Nie nadpisuj `/opt/codemaster/releases/<SHA256>/`.

Instalator przed podmianą wykonuje kopię i zapisuje wcześniejszy stan. Przed zmianą schematu zatrzymuje starą aplikację. Po awarii próbuje wrócić do poprzedniego obrazu/stanu, a po rozpoczęciu migracji również do dopasowanej kopii. Ta gałąź nie została wykonana na prawdziwym Docker/VPS w tym opracowaniu. Nie obiecuje skutecznego automatycznego recovery każdej awarii.

Ręczne odtworzenie dopasowanego archiwum:

```bash
sudo python3 vps/manage.py rollback /var/backups/codemaster/CHOSEN-COMPATIBLE.tar.gz --confirm-restore
```

Podaj rzeczywistą ścieżkę. To jawna zgoda na zastąpienie bieżących danych. Zmiany nowsze niż backup mogą zostać utracone. Wymagane są checksum sidecar, zgodne obrazy i źródło z kontrolowanego katalogu wydań. Po ręcznym restore/rollback strona wymaga prywatnego odbioru przed ponowną publikacją.

Starsza instalacja bez zgodnej historii migracji, manifestu obrazu i kontrolowanego źródła NIE jest automatycznie kompatybilna. Nie stosuj migracji początkowej do dowolnej starej bazy. Potrzebny jest świadomy eksport/import lub osobna migracja przejściowa i test na kopii. Zachowaj oryginał przed pracami.

Nie używaj destrukcyjnych down-migrations ani `docker image prune -a` bez analizy konsekwencji. Zmiana samego tagu aplikacji nie cofa niekompatybilnej bazy. Archiwum danych nie zawiera warstw obrazów, konfiguracji całego hosta ani sekretów; przechowuj je osobno w kontrolowany sposób.

Przećwicz na osobnym stagingu logowanie, publiczne media, prywatny plik, dane leada i zachowanie nieudanej migracji. Nie wywołuj celowo awarii na produkcji. Zachowane katalogi `pre-restore-*` usuwaj dopiero po potwierdzeniu odzyskania i uwzględnieniu retencji.
