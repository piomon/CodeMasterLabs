# Backup and restore

```bash
sudo python3 vps/manage.py backup
sudo python3 vps/manage.py restore-test
```

`backup` briefly stops the app (a maintenance window), uses SQLite's backup API, checks integrity, copies public media and private uploads while writes are stopped, creates `/var/backups/codemaster/TIMESTAMP-RANDOM.tar.gz` and a SHA-256 sidecar, then restarts the app. The manifest contains release/image IDs, source directory and base-image identifiers; it excludes secrets. `quarantine` is transient and excluded. The archive is 0600 but not locally encrypted: protect the VPS and backup disk. Do not copy the active database alone as a backup.

Daily timer: `codemaster-backup.timer` around 03:40 server local time; expired form-attempt cleanup runs hourly around minute 10. Timers may add up to 30 seconds of randomized delay. Local retention retains at least 14 copies and removes older extras only after 30 days. The preferred off-site retention is 7 daily / 4 weekly / 6 monthly through restic.

Create an independent off-site repository. Example configuration keys for root-only `/etc/codemaster/restic.env`:

```text
RESTIC_REPOSITORY=sftp:backup-user@backup-host:/independent/path
RESTIC_PASSWORD=YOUR_UNIQUE_BACKUP_ENCRYPTION_PASSWORD
```

Use your actual endpoint/credentials. SFTP additionally requires a protected SSH key and verified known_hosts entry for root; never disable host-key checking. S3 repositories require the provider's actual credentials. Initialize the repository once using restic with those variables exported by a trusted process, not by running arbitrary raw env text as shell code. Record/recover the encryption password off the VPS. The installer deliberately does not invent a remote storage hostname or initialize someone else's repository.

After configuration, `backup` invokes restic backup/forget and records the result. Configure your provider's VM snapshot/Automated Backup separately. A local snapshot and an off-site archive are distinct layers.

`restore-test` verifies SHA-256, rejects links/devices/traversal/unexpected paths, extracts to a fresh directory, checks SQLite integrity and starts the matching app image on loopback port 3002. It checks health and selected public routes. It does NOT automatically prove admin login and private attachment recovery; perform that on isolated staging. This script has not been run against a real container here. Local component tests restored a synthetic SQLite archive; do not confuse that with full application restore.

Destructive actual restore, only after a new backup and matching image availability:

```bash
sudo python3 vps/manage.py restore /var/backups/codemaster/CHOSEN.tar.gz --confirm-restore
```

The checksum sidecar must accompany the archive. The command validates first, preserves replaced directories as `/var/lib/codemaster/pre-restore-TIMESTAMP`, restores compatible data/image state and checks health. `--confirm-restore` is explicit authorization to replace current data. Any data newer than the selected backup is not in the restored database. Retain the old directories for reconciliation.

Disaster recovery on a new VPS additionally needs the protected original configuration/secret, compatible images or their reproducible release sources, domain/DNS, and encryption/SSH credentials. Those secrets are intentionally absent from the plain application archive. Store an encrypted separate secret recovery bundle in your chosen secrets manager; this was NOT performed. A known SHA-256 is corruption detection, not an attacker-authenticated signature.

Manual restore also requires a trusted retained source release under `/opt/codemaster/releases/<SHA256>/` matching the archive manifest. Older unversioned installations need an explicit migration/adoption plan; automatic compatibility is not claimed. After a manual restore, Nginx is returned to private preview and publication must be reaccepted.
