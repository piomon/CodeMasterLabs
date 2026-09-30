import datetime as dt, importlib.util, io, json, sqlite3, tarfile, tempfile, unittest
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[2]
def module(name,file):
    spec=importlib.util.spec_from_file_location(name,ROOT/file);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
ops=module('audit_operations','vps/manage.py');upgrade=module('security_update','vps/update_security.py')
class HardenedOperations(unittest.TestCase):
    def test_default_domains_and_primary_are_explicit(self):
        c=json.loads((ROOT/'release/deployment-defaults.json').read_text());self.assertEqual(c['primaryDomain'],'codemasterlabs.pl');self.assertIn('codemasterlabs.com',c['aliases'])
    def test_domain_normalization_deduplicates_and_rejects_injection(self):
        self.assertEqual(ops.normalize_domains('CodeMasterLabs.PL.',['codemasterlabs.pl','www.codemasterlabs.pl']),['codemasterlabs.pl','www.codemasterlabs.pl'])
        with self.assertRaises(ValueError):ops.normalize_domains('example.com',['evil.com; return 200;'])
    def test_nginx_both_domains_https_canonical_and_unknown_host(self):
        config=ops.nginx_config('codemasterlabs.pl',tls=True,aliases=['codemasterlabs.com','www.codemasterlabs.pl'])
        self.assertIn('server_name codemasterlabs.com www.codemasterlabs.pl;',config);self.assertIn('return 308 https://codemasterlabs.pl$request_uri',config);self.assertIn('return 444',config);self.assertIn('noindex, nofollow',config);self.assertIn('limit_conn cm_ip 20',config)
    def test_nginx_public_mode_only_removes_private_guard(self):
        private=ops.nginx_config('studio.example',tls=True);public=ops.nginx_config('studio.example',tls=True,public=True)
        self.assertIn('auth_basic "CodeMaster private acceptance"',private);self.assertNotIn('auth_basic "',public);self.assertIn('Strict-Transport-Security',public);self.assertIn('first-register',public)
    def test_security_floor_blocks_future_patch_before_public_release(self):
        pkg={'dependencies':{'next':'16.3.6'}};ops.security_floor(pkg,today=dt.date(2026,9,29))
        with self.assertRaises(RuntimeError):ops.security_floor(pkg,public=True,today=dt.date(2026,9,29))
        with self.assertRaises(RuntimeError):ops.security_floor(pkg,today=dt.date(2026,9,30))
        ops.security_floor({'dependencies':{'next':'16.3.7'}},public=True,today=dt.date(2026,9,30))
    def test_security_floor_rejects_unpinned_or_old_framework(self):
        for version in ['^16.3.6','16.3.5','latest','16.3.7-canary']:
            with self.assertRaises(RuntimeError):ops.security_floor({'dependencies':{'next':version}},today=dt.date(2026,9,29))
    def test_patch_selector_never_invents_or_crosses_major_minor(self):
        self.assertEqual(upgrade.choose_patch('16.3.6',['16.3.7','16.3.8','17.0.0','16.4.0','16.3.9-canary.1']),'16.3.8')
        with self.assertRaises(RuntimeError):upgrade.choose_patch('16.3.6',['16.3.6','17.0.0'])
    def test_env_duplicate_key_is_not_last_write_wins(self):
        with tempfile.TemporaryDirectory() as t:
            p=Path(t)/'env';p.write_text('SMTP_HOST=first\nSMTP_HOST=second\n')
            with self.assertRaises(ValueError):ops.read_env(p)
    def test_evidence_is_bound_to_config_and_expires(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);stamp={'release':'test','source':'source','configurationSHA256':'config'}
            with patch.object(ops,'EVIDENCE',root),patch.object(ops,'runtime_stamp',return_value=stamp):
                ops.evidence('component','PASS');self.assertEqual(ops.require_evidence('component')['status'],'PASS')
                path=root/'component.json';v=json.loads(path.read_text());v['binding']['source']='changed';path.write_text(json.dumps(v))
                with self.assertRaises(RuntimeError):ops.require_evidence('component')
                ops.evidence('component','PASS');v=json.loads(path.read_text());v['utc']=(dt.datetime.now(dt.timezone.utc)-dt.timedelta(hours=25)).isoformat();path.write_text(json.dumps(v))
                with self.assertRaises(RuntimeError):ops.require_evidence('component')
    def test_latest_backup_ignores_partial_and_unchecksummed_archive(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'20260101.tar.gz').write_bytes(b'ok');(root/'20260101.tar.gz.sha256').write_text('hash');(root/'20261231.tar.gz').write_bytes(b'incomplete');(root/'.20270101.partial').write_bytes(b'partial')
            with patch.object(ops,'BACKUPS',root):self.assertEqual(ops.latest_backup().name,'20260101.tar.gz')
    def test_duplicate_tar_members_rejected_before_extraction(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);archive=root/'bad.tar.gz'
            with tarfile.open(archive,'w:gz') as tar:
                for _ in range(2):
                    data=b'x';m=tarfile.TarInfo('data/codemaster.db');m.size=len(data);tar.addfile(m,io.BytesIO(data))
            Path(str(archive)+'.sha256').write_text(ops.file_hash(archive)+'  bad.tar.gz\n')
            with self.assertRaisesRegex(RuntimeError,'Duplicate'):ops.unpack_backup(archive,root/'extract')
            self.assertFalse((root/'extract').exists())
    def test_full_schema_upgrade_preserves_data_and_does_not_send_legacy_leads(self):
        with sqlite3.connect(':memory:') as db:
            for name in ['20260928_001_initial','20260928_002_password_reset']:db.executescript((ROOT/f'src/migrations/sqlite/{name}.sql').read_text())
            db.execute("INSERT INTO leads(submission_key,name,email,topic,message,privacy_accepted) VALUES('legacy-key','Existing','old@example.test','web','Existing lead',1)")
            db.executescript((ROOT/'src/migrations/sqlite/20260929_003_submission_delivery.sql').read_text())
            self.assertEqual(db.execute('SELECT name,notification_status FROM leads').fetchone(),('Existing','legacy'))
            db.execute("INSERT INTO leads(submission_key,name,email,topic,message,privacy_accepted) VALUES('new-key','New','new@example.test','web','New lead',1)")
            self.assertEqual(db.execute("SELECT notification_status,notification_attempts FROM leads WHERE submission_key='new-key'").fetchone(),('pending',0))
            self.assertIn('version_consent_accepted_at',[x[1] for x in db.execute('PRAGMA table_info(_testimonials_v)')]);self.assertEqual(db.execute('PRAGMA integrity_check').fetchone()[0],'ok')
    def test_review_submission_key_unique_but_manual_testimonials_allowed(self):
        with sqlite3.connect(':memory:') as db:
            for sql in sorted((ROOT/'src/migrations/sqlite').glob('*.sql')):db.executescript(sql.read_text())
            db.execute("INSERT INTO testimonials(name,submission_key) VALUES('First','key')")
            with self.assertRaises(sqlite3.IntegrityError):db.execute("INSERT INTO testimonials(name,submission_key) VALUES('Retry','key')")
            db.execute("INSERT INTO testimonials(name) VALUES('Editorial1')");db.execute("INSERT INTO testimonials(name) VALUES('Editorial2')")
            self.assertEqual(db.execute('SELECT count(*) FROM testimonials').fetchone()[0],3)
    def test_source_fingerprint_ignores_python_cache_but_detects_runtime_files(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'vps/__pycache__').mkdir(parents=True);(root/'vps/manage.py').write_text('A');first=ops.fingerprint(root);(root/'vps/__pycache__/cache.pyc').write_bytes(b'cache');self.assertEqual(ops.fingerprint(root),first);(root/'vps/manage.py').write_text('B');self.assertNotEqual(ops.fingerprint(root),first)
    def test_staged_copy_is_persistent_and_secrets_are_excluded(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);source=root/'user upload';source.mkdir();(source/'src').mkdir();(source/'src/test.ts').write_text('export const test=1');(source/'package.json').write_text('{}');(source/'.env').write_text('DO_NOT_COPY=value')
            with patch.object(ops,'ROOT',source),patch.object(ops,'RELEASES',root/'releases'),patch.object(ops.os,'chown'):
                digest=ops.stage_source();self.assertEqual(ops.ROOT,root/'releases'/digest);self.assertTrue((ops.ROOT/'src/test.ts').exists());self.assertFalse((ops.ROOT/'.env').exists());self.assertEqual(ops.fingerprint(ops.ROOT),digest)
if __name__=='__main__':unittest.main()
