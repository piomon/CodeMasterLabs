# Incident response

1. Preserve evidence and backups; do not delete the database or run volume-removal commands. Record UTC incident time, affected release and container IDs, but never paste secrets/customer content into a public issue.
2. Stop public traffic at Nginx/provider firewall if necessary. Keep SSH through the verified operator path. If a compromise is suspected, preserve disk evidence before changes and use a clean machine to rotate secrets.
3. Read root-only `/var/lib/codemaster-evidence`, systemd service status and container logs. Review unexpected users, auth attempts, private access, resource exhaustion, outbound traffic and image changes. Local process logs alone do not establish the attack timeline.
4. Revoke leaked GitHub/SMTP/Turnstile/SSH/restic credentials as applicable. Changing Payload's secret can invalidate sessions and affect encrypted values; take and protect a compatible backup first. Decide whether the exposure warrants personal-data incident handling with the actual controller/legal adviser.
5. Restore only from a verified compatible snapshot and image on an isolated clean environment; confirm admin login, customer records, public media and authenticated private downloads. Patch the root cause before reopening.
6. Test notification and monitoring after recovery. Keep an incident record of impact, recovery point, lost/reconciled changes and preventive work.

No incident email address, legal deadline or responsible party was invented. Fill in the owner's real on-call contacts, hosting escalation and data-controller procedure before release.
