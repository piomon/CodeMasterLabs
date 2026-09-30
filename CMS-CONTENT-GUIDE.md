# CMS / redakcja treści

Panel znajduje się pod `/admin` w uruchomionej aplikacji Next.js, nie w podglądzie offline. Pierwszego administratora tworzy `npm run create-admin` po inicjalizacji bazy. Hasło powstaje lokalnie; nie ma domyślnych danych logowania.

Site settings i Homepage sterują tożsamością, hero, wybranymi treściami, procesem i opisem autora. Navigation, Footer, Contact settings, Social links i SEO są osobnymi ustawieniami. Kolekcje obejmują projekty, usługi, artykuły, media, FAQ, technologie, branże, opinie oraz leady i prywatne pliki. Wybieraj locale PL lub EN, publikuj materiały po sprawdzeniu. Draft nie oznacza publikacji. Preview wymaga uwierzytelnionej sesji.

Projekty przykładowe oznaczono jako demonstracje. Nie zmieniaj ich na wdrożenia klientów bez prawdziwych materiałów i uprawnień do publikacji. Opinie pokazuj tylko jako rzeczywiste, zweryfikowane i opublikowane. Brak danych klienta nie jest podstawą do wymyślenia nazwy, logotypu czy wyniku.

Dane początkowe są inicjalizowane jeden raz. Ukryty `installation-state` chroni przed odtworzeniem celowo usuniętych treści. Ponowne `seed` nie jest poleceniem resetu serwisu i nie nadpisuje istniejących treści.

Przed uruchomieniem publicznego formularza uzupełnij Contact settings: administrator, adres, hosting i retencja oraz rzeczywisty opis przetwarzania. Zatwierdź przegląd dopiero po sprawdzeniu. Leady i prywatne załączniki wymagają uprawnień administratora. SMTP służy dostarczaniu wiadomości resetu hasła; nie skonfigurowano automatycznych alertów mailowych o leadzie.

Nie wykonywano logowania, edycji i zapisu formularza na prawdziwej bazie w sesji przekazania. Ich testy znajdują się w `tests/e2e/`; uruchamia je `npm run release:verify` w izolowanym środowisku. Stan weryfikacji: `reports/QA.md`.
