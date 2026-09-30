# CI — dostarczona konfiguracja, nie wykonany pipeline

`.github/workflows/verify.yml` zawiera przypięte SHA akcji, minimalne uprawnienia do odczytu repozytorium i wyłączone zapisywanie poświadczeń checkout. Wymaga rzeczywistego root locka i zatwierdzonych digestów `NODE_IMAGE` / `CLAMAV_IMAGE`. Wykonuje źródłową integrację z ClamAV, build i zapis raportów.

Ten workflow nie został uruchomiony w repozytorium użytkownika. Nie skonfigurowano branch protection, approvals, podpisów obrazów, rejestru wydań ani automatycznej promocji. Test dokładnego obrazu i skany VPS są odrębną ścieżką. Sam YAML nie jest kompletnym udowodnionym CI/CD.

Po rozwiązaniu zależności zatwierdź root lock, wygenerowane typy/importmapę i kontrolowany diff. Ustaw zatwierdzone immutable digests w zmiennych repozytorium. Nie przekazuj produkcyjnych danych/sekretów do pull-request jobs. Wymagaj bramek repozytorium i świadomego review zmian w kodzie uprzywilejowanego operatora.
