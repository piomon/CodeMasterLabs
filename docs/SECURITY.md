# Model bezpieczeństwa i granice — 2.2.0

**Brak certyfikatu „zero luk”.** Bieżące ustalenia i 32 obszary przeglądu opisano w `AUDIT.md`; wykonane testy i niewykonane bramki w `RELEASE-GATES.md`.

Kontrole aplikacji obejmują HMAC i Origin, rzeczywiste limity body/czasu, rate limit, Turnstile, honeypot, idempotencję identycznego zgłoszenia i prywatne pliki. Kolejka SMTP nie usuwa zapisanego leada po awarii poczty. Powiadomienia są co najmniej jednokrotne, nie „dokładnie raz”. Wersje i konta podlegają jawnym ACL; bootstrap kont jest lokalny.

Załączniki wymagają zgodnej sygnatury/MIME, rozmiaru i wyniku CLEAN. Obrazy są dekodowane; PDF przechodzi qpdf i restrykcyjną analizę reprezentacji JSON. Jest limit równoczesnych skanów. To nie gwarancja nieszkodliwości wszystkich dokumentów ani certyfikowany sanitizer. Rzeczywisty qpdf, Sharp i ClamAV/EICAR wymagają testu w finalnym obrazie.

Publiczny runtime odrzuca brak wymaganych sekretów/usług, testowe klucze Turnstile, niewłaściwy URL, niejawny wariant bazy oraz niebezpieczne flagi seed/drop. Akceptacja localhost jest oddzielona od publicznego hosta. Nginx nadpisuje zaufane nagłówki IP i nie ufa dostarczonemu przez klienta CF-Connecting-IP. CDN wymaga dodatkowego projektu zaufanych proxy.

CSP nie została wyłączona ani zastąpiona globalnym unsafe-eval. Zachowano wymagane przez istniejącą aplikację reguły stylów; nie zadeklarowano, że wyeliminowano wszystkie inline styles. Rzeczywistą skuteczność CSP, cookies i cache trzeba sprawdzić w przeglądarce/HTTPS.

Sekrety są przechowywane poza źródłami, z ograniczonymi prawami. Na VPS źródło root-owned nie może być zapisywalne przez nieuprawnionych. Uprawnienia do Docker i operatora są administracyjne. Nie kopiuj `/etc/codemaster` do publicznego repozytorium ani do zwykłego ZIP-a.

Bieżący wejściowy VPS ZIP nie zawiera historii Git. Token opisany we wcześniejszej dużej paczce wymaga unieważnienia przez właściciela. Lokalny skan wykrywa tylko określone silne wzorce tokenów/kluczy. Nie jest kompletną analizą entropii, całego repozytorium ani ważności poświadczeń.

Nie wykonano produkcyjnego audytu zależności, pełnej autoryzacji CMS, resetu, prywatnych pobrań i testów przeciążenia. Nie skonfigurowano gotowego systemu MFA, niezależnego monitoringu błędów z udowodnioną redakcją danych ani podpisanych wydań. Nie przyjęto ryzyka za właściciela.
