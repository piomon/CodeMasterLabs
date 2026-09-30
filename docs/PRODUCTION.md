# Architektura i eksploatacja — 2.2.0

Docelowy wariant to jedna instancja aplikacji na dedykowanym Ubuntu VPS, SQLite WAL i trwałe katalogi hosta. Nie ma wsparcia dla równoległych replik aplikacji, HA ani PostgreSQL w tym instalatorze. Limity zasobów i mechanizmy kolejkowania nie są wynikami benchmarków.

Aplikacja korzysta z Next standalone i użytkownika UID/GID 10001, read-only root filesystem oraz wybranych katalogów zapisu. Osobny obraz ops zawiera narzędzia administracyjne; test dodaje Chromium. Skanowane mają być obrazy app/ops/ClamAV. ClamAV ma limit 4 GiB, aplikacja 2300 MiB; build i przeglądarka mogą dodatkowo obciążyć host. Swap nie zastępuje RAM ani pomiaru wydajności.

Publiczne są porty Nginx 80/443. Aplikacja wiąże port hosta 127.0.0.1:3000. SQLite nie ma portu sieciowego. Endpoint zdrowia jest dostępny do monitoringu również przy prywatnym podglądzie, bez ujawniania sekretów. Nie udostępniaj portów operatora, bazy i ClamAV do internetu.

Domyślne nazwy i przekierowania opisuje START-TUTAJ.md. Pierwsze wdrożenie zakłada DNS bez CDN/proxy. Instaluje UFW, zachowując wykryty port SSH, fail2ban, aktualizacje bezpieczeństwa i opcjonalny swap 2 GiB. Nie prowadzono testu aktualnego firewalla dostawcy ani automatycznego hardeningu kluczy SSH. Przed wyłączeniem metody logowania sprawdź drugą sesję.

Źródła wydań są w `/opt/codemaster/releases/<SHA256>`, nie w katalogu zależnym od nazwy uploadu. Sekrety i operator są w `/etc/codemaster`, dane w `/var/lib/codemaster`. Zachowuj stare obrazy i źródła potrzebne do odtworzenia.

Timery uruchamiają powiadomienia co minutę, cleanup co godzinę około minuty 10, backup około 03:40 czasu serwera, monitoring co 5 minut, z losowym przesunięciem do 30 sekund. Backup zatrzymuje aplikację na czas spójnej kopii; to rozwiązanie z oknem niedostępności, nie zero-downtime. Monitor lokalny nie wykryje dla Ciebie własnej całkowitej utraty zasilania/sieci — potrzebny niezależny dostawca uptime.

Migrations 001 i 002 pochodzą z wejścia; dodano 003. Syntetyczny SQLite przechodzi testy, ale rzeczywisty runner Payload i zgodność generowanego schematu nadal wymagają odbioru. Nie wykonano pomiaru LCP/CLS/INP, pełnej dostępności, wizualnego WebGL, testu cache CMS ani obciążeniowego.
