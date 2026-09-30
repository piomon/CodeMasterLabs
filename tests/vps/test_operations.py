import importlib.util, io, json, sqlite3, tarfile, tempfile, unittest, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('operations',ROOT/'vps/manage.py');ops=importlib.util.module_from_spec(spec);spec.loader.exec_module(ops)

class OperationsTests(unittest.TestCase):
    def test_env_roundtrip_preserves_password_punctuation(self):
        values={'SMTP_PASS':'a$B#C"d\'e\\f=ghi','SMTP_PORT':'587'}
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'env';path.write_text(ops.env_text(values));self.assertEqual(ops.read_env(path),values)
    def test_env_rejects_newlines_and_invalid_keys(self):
        for values in [{'SMTP_PASS':'abc\nNODE_ENV=test'},{'bad-key':'value'}]:
            with self.assertRaises(ValueError):ops.env_text(values)
    def test_domain_validation_prevents_nginx_injection(self):
        for value in ['example.com','www.example.pl','test-stage.example.co.uk']:self.assertTrue(ops.domain_valid(value))
        for value in ['example.com; return 200;','https://example.com','-a.example','example.com\nserver','localhost']:self.assertFalse(ops.domain_valid(value))
    def test_nginx_overwrites_ip_headers_and_private_preview(self):
        conf=ops.nginx_config('studio.example',tls=True)
        self.assertIn('auth_basic',conf);self.assertIn('127.0.0.1:3000',conf);self.assertIn('client_max_body_size 6m',conf)
        self.assertNotIn('auth_basic "',ops.nginx_config('studio.example',tls=True,public=True))
    def test_migrations_fresh_and_upgrade_without_records(self):
        initial=(ROOT/'src/migrations/sqlite/20260928_001_initial.sql').read_text()
        upgrade=(ROOT/'src/migrations/sqlite/20260928_002_password_reset.sql').read_text()
        with sqlite3.connect(':memory:') as db:
            db.executescript(initial)
            self.assertNotIn('reset_password_requested_at',[x[1] for x in db.execute('PRAGMA table_info(users)')])
            db.executescript(upgrade)
            self.assertIn('reset_password_requested_at',[x[1] for x in db.execute('PRAGMA table_info(users)')])
            self.assertEqual(db.execute('SELECT count(*) FROM users').fetchone()[0],0)
            self.assertEqual(db.execute('SELECT count(*) FROM leads').fetchone()[0],0)
            self.assertEqual(db.execute('PRAGMA integrity_check').fetchone()[0],'ok')
    def test_transaction_failure_rolls_back_sqlite(self):
        with sqlite3.connect(':memory:') as db:
            db.execute('CREATE TABLE test(id INTEGER PRIMARY KEY)');db.commit()
            try:
                db.execute('BEGIN');db.execute('INSERT INTO test VALUES(1)');db.execute('invalid migration SQL')
            except sqlite3.Error:db.rollback()
            self.assertEqual(db.execute('SELECT count(*) FROM test').fetchone()[0],0)
    def make_archive(self,tmp,member='data/codemaster.db',symlink=False):
        root=Path(tmp);db=root/'source.db'
        with sqlite3.connect(db) as con:con.execute('CREATE TABLE sample(id INTEGER)');con.execute('INSERT INTO sample VALUES(7)')
        archive=root/'sample.tar.gz'
        with tarfile.open(archive,'w:gz') as tar:
            if symlink:
                info=tarfile.TarInfo(member);info.type=tarfile.SYMTYPE;info.linkname='/etc/passwd';tar.addfile(info)
            else:tar.add(db,arcname=member)
            content=json.dumps({'release':'synthetic'}).encode();info=tarfile.TarInfo('manifest.json');info.size=len(content);tar.addfile(info,io.BytesIO(content))
        Path(str(archive)+'.sha256').write_text(ops.file_hash(archive)+'  sample.tar.gz\n');return archive
    def test_real_backup_extract_and_sqlite_read(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive=self.make_archive(tmp);dest=Path(tmp)/'restore';dest.mkdir();result=ops.unpack_backup(archive,dest)
            self.assertEqual(result['release'],'synthetic')
            with sqlite3.connect(dest/'data/codemaster.db') as db:self.assertEqual(db.execute('SELECT id FROM sample').fetchone()[0],7)
    def test_backup_checksum_corruption_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive=self.make_archive(tmp);archive.write_bytes(archive.read_bytes()+b'corrupt')
            with self.assertRaises(RuntimeError):ops.unpack_backup(archive,Path(tmp)/'out')
    def test_backup_path_traversal_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive=self.make_archive(tmp,'../escape.db')
            with self.assertRaises(RuntimeError):ops.unpack_backup(archive,Path(tmp)/'out')
    def test_backup_symlink_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive=self.make_archive(tmp,'data/codemaster.db',True)
            with self.assertRaises(RuntimeError):ops.unpack_backup(archive,Path(tmp)/'out')

if __name__=='__main__':unittest.main(verbosity=2)
