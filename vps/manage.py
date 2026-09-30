#!/usr/bin/env python3
"""Root-only, fail-closed single-host CodeMaster operations. No shell execution."""
from __future__ import annotations
import argparse, contextlib, datetime as dt, fcntl, getpass, hashlib, json, os, re, secrets
import shutil, socket, sqlite3, subprocess, sys, tarfile, tempfile, time, urllib.request, urllib.parse, stat
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = Path('/etc/codemaster')
DATA = Path('/var/lib/codemaster')
BACKUPS = Path('/var/backups/codemaster')
EVIDENCE = Path('/var/lib/codemaster-evidence')
ENV = CONFIG / '.env.production'
STATE = CONFIG / 'state.json'
RELEASES = Path('/opt/codemaster/releases')

def run(args, *, capture=False, input=None, cwd=None, check=True, env=None):
    result = subprocess.run([str(x) for x in args], cwd=cwd or ROOT, env=env,
                            input=input, text=True, capture_output=capture, check=False)
    if check and result.returncode:
        # Do not echo stdout/stderr from operator commands: a vendor may include PII.
        raise RuntimeError(f'Command failed ({result.returncode}): {args[0]} {args[1] if len(args)>1 else ""}. Inspect the preceding output or protected evidence.')
    return result

def atomic(path: Path, text: str, mode=0o600):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + '.tmp-' + secrets.token_hex(4))
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    with os.fdopen(fd, 'w') as out: out.write(text)
    os.replace(tmp, path)
    os.chmod(path, mode)

def read_env(path=None):
    path=path or ENV
    values = {}
    for line in path.read_text().splitlines():
        if not line or line.startswith('#'): continue
        key, separator, value = line.partition('=')
        if not separator or not re.fullmatch(r'[A-Z][A-Z0-9_]*', key) or key in values: raise ValueError('Invalid or duplicate raw environment key')
        values[key] = value
    return values

def env_text(values):
    for key, value in values.items():
        if not re.fullmatch(r'[A-Z][A-Z0-9_]*', key) or any(c in str(value) for c in '\r\n\0'): raise ValueError('Unsafe environment value')
    return ''.join(f'{key}={value}\n' for key, value in values.items())

def state(): return json.loads(STATE.read_text())
def save_state(value): atomic(STATE, json.dumps(value, indent=2)+'\n')
def domain_valid(value): return bool(re.fullmatch(r'(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}',value))
def email_valid(value): return bool(re.fullmatch(r'[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+',value))
def ask(label, default='', secret=False, validator=None, optional=False):
    while True:
        value = (getpass.getpass if secret else input)(label + (f' [{default}]' if default else '') + ': ').strip() or default
        if (optional and not value) or (value and (validator is None or validator(value))): return value
        print('Niepoprawna wartosc. Sprobuj ponownie.')


def normalize_domains(primary,aliases=()):
    domains=[]
    for value in [primary,*aliases]:
        normalized=value.strip().lower().rstrip('.')
        if not domain_valid(normalized):raise ValueError('Invalid DNS hostname')
        if normalized not in domains:domains.append(normalized)
    if len(domains)>8:raise ValueError('At most eight certificate names are supported')
    return domains

def security_floor(package,public=False,today=None):
    today=today or dt.date.today()
    value=package.get('dependencies',{}).get('next','')
    if not re.fullmatch(r'\d+\.\d+\.\d+',value):raise RuntimeError('Pin an exact stable Next.js version')
    version=tuple(map(int,value.split('.')))
    if version<(16,3,6):raise RuntimeError('Next.js is below the verified September 22 security floor')
    if (public or today>=dt.date(2026,9,30)) and version<(16,3,7):
        raise RuntimeError('Public release blocked: the September 30 Next.js security update must be available, installed and retested. Run UPDATE-SECURITY.sh when the patch is published. No unpublished version is fabricated in this ZIP.')

def runtime_stamp():
    current=state() if STATE.exists() else {}
    values=read_env() if ENV.exists() else {}
    digest=hashlib.sha256(json.dumps(values,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    return {'release':current.get('release'),'source':current.get('source_fingerprint'),'configurationSHA256':digest}

def require_evidence(name,maximum_age_hours=24):
    path=EVIDENCE/f'{name}.json'
    if not path.exists():raise RuntimeError(f'Publication blocked: missing {name}')
    value=json.loads(path.read_text())
    if value.get('status')!='PASS' or value.get('binding')!=runtime_stamp():raise RuntimeError(f'Publication blocked: stale or failed {name}')
    try:age=(dt.datetime.now(dt.timezone.utc)-dt.datetime.fromisoformat(value['utc'])).total_seconds()
    except (KeyError,TypeError,ValueError):raise RuntimeError(f'Invalid evidence timestamp: {name}')
    if age<0 or age>maximum_age_hours*3600:raise RuntimeError(f'Publication blocked: {name} is older than {maximum_age_hours} hours')
    return value

def stage_source():
    # Persistent, root-owned, space-free path for Compose and systemd, never /tmp or an upload folder.
    global ROOT
    source=ROOT;digest=fingerprint(source)
    RELEASES.mkdir(parents=True,exist_ok=True,mode=0o750)
    target=RELEASES/digest
    if target.exists():
        if fingerprint(target)!=digest:raise RuntimeError('Existing release directory changed; refusing to overwrite it')
    else:
        for path in source.rglob('*'):
            if path.is_symlink():raise RuntimeError('Source symlinks are not allowed in a root-operated release')
        def ignored(directory,names):
            return [name for name in names if name in {'node_modules','.git','.next','__pycache__','reports','test-results','media','private-uploads','.quarantine','.qa-release'} or (name.startswith('.env') and not name.endswith('.example')) or name.endswith(('.pyc','.tsbuildinfo','.zip','.db'))]
        temporary=Path(tempfile.mkdtemp(prefix='.stage-',dir=RELEASES))
        try:
            shutil.copytree(source,temporary,dirs_exist_ok=True,ignore=ignored)
            if fingerprint(temporary)!=digest:raise RuntimeError('Release copy does not match audited input')
            for path in [temporary,*temporary.rglob('*')]:
                os.chown(path,0,0);os.chmod(path,0o750 if path.is_dir() else 0o640)
            temporary.rename(target)
        except Exception:
            shutil.rmtree(temporary,ignore_errors=True);raise
    ROOT=target
    return digest


def configure():
    CONFIG.mkdir(mode=0o700, parents=True, exist_ok=True); os.chmod(CONFIG,0o700)
    if ENV.exists():
        if not (CONFIG/'contact.json').exists():raise RuntimeError('Existing environment has no host identity; reconcile /etc/codemaster/contact.json first')
        values=read_env();cfg=json.loads((CONFIG/'contact.json').read_text())
        domains=normalize_domains(cfg['domain'],cfg.get('aliases',[]))
        if urllib.parse.urlsplit(values.get('SERVER_URL','')).hostname!=domains[0]:raise RuntimeError('Canonical hostname differs from saved configuration')
        if not values.get('SITE_CONTACT_EMAIL'):
            values['SITE_CONTACT_EMAIL']=ask('Istniejacy publiczny adres e-mail strony',default=values.get('LEAD_NOTIFY_EMAIL',''),validator=email_valid)
            atomic(ENV,env_text(values))
        print('Zachowuje sekrety i ustawienia /etc/codemaster. Domeny:',', '.join(domains))
        return values
    defaults=json.loads((ROOT/'release/deployment-defaults.json').read_text())
    domain=defaults['primaryDomain'];aliases=defaults['aliases'];domains=normalize_domains(domain,aliases)
    print('Domena glowna:',domain,'; aliasy 308:',', '.join(aliases))
    print('Przed instalacja ustaw DNS wszystkich nazw na TEN VPS. Nie zmieniam DNS ani innych VPS automatycznie.')
    for hostname in domains:socket.getaddrinfo(hostname,None)
    admin=ask('E-mail administratora CMS / certyfikatu',validator=email_valid)
    name=ask('Nazwa administratora CMS',default='Administrator',validator=lambda x:2<=len(x)<=100)
    public_email=ask('Istniejacy publiczny adres kontaktowy na stronie',default=admin,validator=email_valid)
    if ask('Czy akceptujesz warunki Let\'s Encrypt i instalacje na dedykowanym VPS? Wpisz TAK')!='TAK':raise RuntimeError('Installation not authorized')
    values={
        'NODE_ENV':'production','NEXT_PUBLIC_SERVER_URL':f'https://{domain}','SERVER_URL':f'https://{domain}',
        'PAYLOAD_SECRET':secrets.token_hex(48),'DATABASE_URL':'file:/data/codemaster.db',
        'ALLOW_SQLITE_PRODUCTION':'single-node','SEED_CONTENT':'false','PAYLOAD_DROP_DATABASE':'false',
        'TRUSTED_CLIENT_IP_HEADER':'x-real-ip','SITE_CONTACT_EMAIL':public_email,'SMTP_HOST':ask('Serwer SMTP'),
        'SMTP_PORT':ask('Port SMTP',default='587',validator=lambda x:x in ('465','587')),
        'SMTP_USER':ask('Login SMTP'),'SMTP_PASS':ask('Haslo SMTP',secret=True),
        'SMTP_FROM':ask('Adres nadawcy SMTP',default=admin,validator=email_valid),'LEAD_NOTIFY_EMAIL':admin,
        'TURNSTILE_SITE_KEY':ask('Turnstile SITE KEY'),'TURNSTILE_SECRET_KEY':ask('Turnstile SECRET KEY',secret=True),
        'CLAMAV_HOST':'clamav','CLAMAV_PORT':'3310','LEAD_RETENTION_DAYS':'',
        'ALERT_WEBHOOK_URL':ask('Webhook alertow HTTPS (opcjonalnie teraz; wymagany przed publikacja)',secret=True,optional=True,validator=lambda x:x.startswith('https://')),
    }
    if any(re.match(r'^[123]x0{8}',values[k]) for k in ('TURNSTILE_SITE_KEY','TURNSTILE_SECRET_KEY')):raise ValueError('Public deployment cannot use Cloudflare test keys')
    atomic(ENV,env_text(values))
    operator=CONFIG/'operator';operator.mkdir(mode=0o700,exist_ok=True);os.chown(operator,10001,10001)
    atomic(operator/'admin.json',json.dumps({'email':admin,'name':name}));os.chown(operator/'admin.json',10001,10001)
    atomic(CONFIG/'contact.json',json.dumps({'domain':domains[0],'aliases':domains[1:],'email':admin}))
    return values

def compose(s=None):
    s=s or state()
    return ['docker','compose','--project-name','codemaster','--env-file',CONFIG/'deploy.env','-f',Path(s['root'])/'compose.production.yml']

def write_deploy(s):
    atomic(CONFIG/'deploy.env',env_text({'APP_IMAGE':s['app_image'],'OPS_IMAGE':s['ops_image'],'NODE_IMAGE':s['node_image'],
        'PLAYWRIGHT_IMAGE':s.get('playwright_image',''),'CLAMAV_IMAGE':s['clamav_image'],'NEXT_PUBLIC_SERVER_URL':read_env()['NEXT_PUBLIC_SERVER_URL'],
        'CM_ENV_FILE':str(ENV),'CM_DATA_ROOT':str(DATA)}))

def image_id(image): return run(['docker','image','inspect',image,'--format','{{.Id}}'],capture=True).stdout.strip()

def lock_package_version(path, package_path):
    value = (
        json.loads(Path(path).read_text())
        .get('packages', {})
        .get(package_path, {})
        .get('version', '')
    )

    if not re.fullmatch(
        r'\d+\.\d+\.\d+',
        value,
    ):
        raise RuntimeError(
            f'Exact package version missing from lock: '
            f'{package_path}'
        )

    return value


def rollback_candidate(value):
    if not isinstance(value, dict):
        return False

    try:
        root = Path(
            value.get('root', '')
        ).resolve()

        if not root.is_relative_to(
            RELEASES.resolve()
        ):
            return False

        if not root.exists():
            return False

        if (
            fingerprint(root)
            != value.get('source_fingerprint')
        ):
            return False

        db = DATA / 'data/codemaster.db'

        if not db.is_file():
            return False

        for kind in ['app', 'ops']:
            image = value.get(
                f'{kind}_image'
            )

            expected = value.get(
                f'{kind}_id'
            )

            if not image or not expected:
                return False

            if image_id(image) != expected:
                return False

        health_path = (
            EVIDENCE
            / 'container-health.json'
        )

        if not health_path.is_file():
            return False

        health = json.loads(
            health_path.read_text()
        )

        if health.get('status') != 'PASS':
            return False

        binding = (
            health.get('binding')
            or {}
        )

        details = (
            health.get('details')
            or {}
        )

        if (
            binding.get('release')
            != value.get('release')
        ):
            return False

        if (
            binding.get('source')
            != value.get(
                'source_fingerprint'
            )
        ):
            return False

        if (
            details.get('app')
            != value.get('app_id')
        ):
            return False

        return True

    except Exception:
        return False

def pinned_image(tag):
    run(['docker','pull',tag])
    values=json.loads(run(['docker','image','inspect',tag,'--format','{{json .RepoDigests}}'],capture=True).stdout)
    if not values or '@sha256:' not in values[0]:raise RuntimeError('Image digest could not be resolved')
    return values[0]

def fingerprint(root=None):
    root=root or ROOT
    digest=hashlib.sha256()
    files=[]
    for directory in ['src','scripts','vps','docker','tests','public','release']:
        files.extend(f for f in (root/directory).rglob('*') if f.is_file() and '__pycache__' not in f.parts)
    for name in ['package.json','package-lock.json','next.config.mjs','Dockerfile.production','compose.production.yml','tsconfig.json','tsconfig.domain.json','eslint.config.mjs','playwright.config.ts','.npmrc','.dockerignore','INSTALL-VPS.sh','UPDATE-SECURITY.sh']:
        if (root/name).exists():files.append(root/name)
    for file in sorted(files): digest.update(str(file.relative_to(root)).encode()+b'\0'+file.read_bytes()+b'\0')
    return digest.hexdigest()

def prepare_host():
    info=dict(line.split('=',1) for line in Path('/etc/os-release').read_text().splitlines() if '=' in line)
    version=info.get('VERSION_ID','').strip('"')
    if info.get('ID','').strip('"')!='ubuntu' or version not in ('22.04','24.04','26.04'):raise RuntimeError('Supported dedicated host: Ubuntu 22.04, 24.04 or 26.04')
    unknown=[x.name for x in Path('/etc/nginx/sites-enabled').glob('*') if x.name not in {'default','codemaster.conf'}]
    if unknown:raise RuntimeError('Existing Nginx applications detected; use a separate dedicated VPS or reviewed manual deployment')
    if shutil.disk_usage(ROOT).free<12*1024**3:raise RuntimeError('At least 12 GiB free disk space is required before building')
    apt_env={**os.environ,'DEBIAN_FRONTEND':'noninteractive'}
    run(['apt-get','update'],env=apt_env)
    run(['apt-get','install','-y','ca-certificates','curl','gnupg','nginx','certbot','python3-certbot-nginx','ufw','fail2ban','unattended-upgrades','sqlite3','openssl','restic'],env=apt_env)
    if not shutil.which('docker'):
        Path('/etc/apt/keyrings').mkdir(mode=0o755,exist_ok=True)
        run(['curl','--fail','--show-error','--silent','--location','https://download.docker.com/linux/ubuntu/gpg','-o','/etc/apt/keyrings/docker.asc'])
        os.chmod('/etc/apt/keyrings/docker.asc',0o644)
        codename=info.get('UBUNTU_CODENAME',info.get('VERSION_CODENAME','')).strip('"')
        if not re.fullmatch('[a-z]+',codename):raise ValueError('Invalid Ubuntu codename')
        arch=run(['dpkg','--print-architecture'],capture=True).stdout.strip()
        atomic(Path('/etc/apt/sources.list.d/docker.sources'),f'Types: deb\nURIs: https://download.docker.com/linux/ubuntu\nSuites: {codename}\nComponents: stable\nArchitectures: {arch}\nSigned-By: /etc/apt/keyrings/docker.asc\n',0o644)
        run(['apt-get','update'],env=apt_env)
        run(['apt-get','install','-y','docker-ce','docker-ce-cli','containerd.io','docker-buildx-plugin','docker-compose-plugin'],env=apt_env)
    run(['systemctl','enable','--now','docker','nginx','fail2ban'])
    version=run(['docker','compose','version','--short'],capture=True).stdout.strip().lstrip('v')
    parts=tuple(map(int,re.match(r'(\d+)\.(\d+)\.(\d+)',version).groups()))
    if parts<(2,30,0):raise RuntimeError('Compose >= 2.30 is required for raw env_file values. Update Docker Compose.')
    ssh=run(['sshd','-T'],capture=True).stdout
    ports=re.findall(r'^port (\d+)$',ssh,re.M) or ['22']
    for port in ports:run(['ufw','allow',f'{port}/tcp'])
    run(['ufw','allow','80/tcp']);run(['ufw','allow','443/tcp']);run(['ufw','--force','enable'])
    atomic(Path('/etc/apt/apt.conf.d/20auto-upgrades'),'APT::Periodic::Update-Package-Lists "1";\nAPT::Periodic::Unattended-Upgrade "1";\n',0o644)
    # Preserve current SSH access. Key provisioning/login changes are deliberately not automated.
    if len(Path('/proc/swaps').read_text().splitlines())==1 and not Path('/swapfile').exists():
        run(['fallocate','-l','2G','/swapfile']);os.chmod('/swapfile',0o600);run(['mkswap','/swapfile']);run(['swapon','/swapfile'])
        with Path('/etc/fstab').open('a') as out:out.write('\n/swapfile none swap sw 0 0\n')
    for name in ['data','media','private','quarantine']:
        directory=DATA/name;directory.mkdir(parents=True,exist_ok=True);os.chown(directory,10001,10001);os.chmod(directory,0o700)
    BACKUPS.mkdir(mode=0o700,parents=True,exist_ok=True);EVIDENCE.mkdir(mode=0o700,parents=True,exist_ok=True)

def evidence(name,status,details=None):
    atomic(EVIDENCE/f'{name}.json',json.dumps({'check':name,'status':status,'utc':dt.datetime.now(dt.timezone.utc).isoformat(),'binding':runtime_stamp(),'details':details or {}},indent=2)+'\n')

def nginx_config(domain,tls=False,public=False,aliases=()):
    domains=normalize_domains(domain,aliases);domain=domains[0];alias_names=' '.join(domains[1:]);all_names=' '.join(domains)
    acme='location ^~ /.well-known/acme-challenge/ { root /var/www/letsencrypt; auth_basic off; }'
    reject='server { listen 80 default_server; listen [::]:80 default_server; server_name _; return 444; }\n'
    if not tls:return reject+f'server {{ listen 80; listen [::]:80; server_name {all_names}; {acme} location / {{ return 503; }} }}\n'
    auth='' if public else 'auth_basic "CodeMaster private acceptance"; auth_basic_user_file /etc/nginx/codemaster.htpasswd;\n add_header X-Robots-Tag "noindex, nofollow" always;'
    cert=f'ssl_certificate /etc/letsencrypt/live/{domain}/fullchain.pem; ssl_certificate_key /etc/letsencrypt/live/{domain}/privkey.pem; ssl_protocols TLSv1.2 TLSv1.3;'
    proxy='proxy_pass http://127.0.0.1:3000; include /etc/nginx/snippets/codemaster-proxy.conf;'
    redirects=f'server {{ listen 443 ssl; listen [::]:443 ssl; server_name {alias_names}; {cert} return 308 https://{domain}$request_uri; }}\n' if alias_names else ''
    return reject+f'''server {{ listen 80; listen [::]:80; server_name {all_names}; {acme} location / {{ return 308 https://{domain}$request_uri; }} }}
server {{ listen 443 ssl default_server; listen [::]:443 ssl default_server; server_name _; {cert} return 444; }}
{redirects}server {{
 listen 443 ssl; listen [::]:443 ssl; http2 on;
 server_name {domain};
 {cert}
 add_header Strict-Transport-Security "max-age=31536000" always;
 add_header X-Content-Type-Options nosniff always;
 client_max_body_size 6m; client_body_timeout 20s; send_timeout 30s;
 limit_conn cm_ip 20; limit_conn cm_server 80;
 {auth}
 {acme}
 location = /api/health {{ auth_basic off; limit_req zone=cm_health burst=10 nodelay; {proxy} }}
 location ~ ^/api/graphql/?$ {{ return 404; }}
 location ~ ^/api/users/first-register/?$ {{ return 403; }}
 location ~ /\\.(?!well-known/) {{ deny all; }}
 location = /api/contact {{ limit_req zone=cm_contact burst=3 nodelay; {proxy} }}
 location = /api/contact-token {{ limit_req zone=cm_token burst=10 nodelay; {proxy} }}
 location = /api/reviews {{ limit_req zone=cm_reviews burst=10 nodelay; {proxy} }}
 location ~ ^/api/users/(login|forgot-password|reset-password)/?$ {{ limit_req zone=cm_auth burst=3 nodelay; {proxy} }}
 location / {{ {proxy} }}
}}
'''

def nginx_setup():
    cfg=json.loads((CONFIG/'contact.json').read_text());domain=cfg['domain'];domains=normalize_domains(domain,cfg.get('aliases',[]))
    webroot=Path('/var/www/letsencrypt')
    webroot.mkdir(parents=True,exist_ok=True)
    os.chmod(webroot,0o755)

    challenge=webroot/'.well-known'/'acme-challenge'
    challenge.mkdir(parents=True,exist_ok=True)
    os.chmod(webroot/'.well-known',0o755)
    os.chmod(challenge,0o755)
    default=Path('/etc/nginx/sites-enabled/default')
    if default.is_symlink() and default.resolve()==Path('/etc/nginx/sites-available/default'):default.unlink()
    atomic(Path('/etc/nginx/snippets/codemaster-proxy.conf'),'''proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header CF-Connecting-IP "";
proxy_hide_header Strict-Transport-Security;
proxy_hide_header X-Content-Type-Options;
proxy_set_header Connection "";
proxy_connect_timeout 5s;
proxy_read_timeout 60s;
proxy_send_timeout 30s;
''',0o644)
    # Ubuntu releases may already define server_tokens
    # in the main http{} context. A second http-level
    # directive in conf.d is invalid, so harden the
    # existing directive when present and only use the
    # conf.d fallback when nginx.conf has no active one.
    nginx_main=Path('/etc/nginx/nginx.conf')
    nginx_text=nginx_main.read_text()

    token_re=re.compile(
        r'(?m)^([ \t]*)server_tokens[ \t]+'
        r'[^;\n]+;[^\n]*$'
    )

    token_matches=list(
        token_re.finditer(nginx_text)
    )

    if len(token_matches)>1:
        raise RuntimeError(
            'Multiple active server_tokens directives '
            'already exist in nginx.conf'
        )

    server_tokens_fallback=''

    if len(token_matches)==1:
        hardened=token_re.sub(
            lambda match:
                f'{match.group(1)}server_tokens off;',
            nginx_text,
            count=1,
        )

        if hardened!=nginx_text:
            nginx_backup=(
                CONFIG
                / 'nginx.main.before-codemaster.conf'
            )

            if not nginx_backup.exists():
                shutil.copy2(
                    nginx_main,
                    nginx_backup,
                )

            mode=nginx_main.stat().st_mode & 0o777

            atomic(
                nginx_main,
                hardened,
                mode,
            )
    else:
        server_tokens_fallback=(
            'server_tokens off;\n'
        )

    atomic(
        Path(
            '/etc/nginx/conf.d/'
            'codemaster-zones.conf'
        ),
        server_tokens_fallback+'''limit_req_status 429;
limit_conn_status 429;
limit_conn_zone $binary_remote_addr zone=cm_ip:10m;
limit_conn_zone $server_name zone=cm_server:1m;
limit_req_zone $binary_remote_addr zone=cm_health:10m rate=60r/m;
limit_req_zone $binary_remote_addr zone=cm_contact:10m rate=8r/m;
limit_req_zone $binary_remote_addr zone=cm_token:10m rate=40r/m;
limit_req_zone $binary_remote_addr zone=cm_reviews:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=cm_auth:10m rate=6r/m;
''',0o644)
    conf=Path('/etc/nginx/sites-available/codemaster.conf')
    link=Path('/etc/nginx/sites-enabled/codemaster.conf')
    if conf.exists():shutil.copy2(conf,CONFIG/'nginx.previous.conf')
    atomic(conf,nginx_config(domain,aliases=domains[1:]),0o644)
    if not link.exists():link.symlink_to(conf)
    run(['nginx','-t']);run(['systemctl','reload','nginx'])
    run(['certbot','certonly','--webroot','-w','/var/www/letsencrypt','--cert-name',domain,'--email',cfg['email'],'--agree-tos','--non-interactive','--expand']+[item for hostname in domains for item in ['-d',hostname]])
    if not (CONFIG/'preview-credentials.txt').exists():
        password=secrets.token_urlsafe(30)
        digest=run(['openssl','passwd','-6','-stdin'],capture=True,input=password+'\n').stdout.strip()
        atomic(Path('/etc/nginx/codemaster.htpasswd'),'preview:'+digest+'\n',0o640)
        import grp
        os.chown('/etc/nginx/codemaster.htpasswd',0,grp.getgrnam('www-data').gr_gid)
        atomic(CONFIG/'preview-credentials.txt',f'URL: https://{domain}\nUsername: preview\nPassword: {password}\n')
    text=nginx_config(domain,tls=True,aliases=domains[1:])
    # Ubuntu 22.04 packages use the older HTTP/2 directive form.
    nginx_version=run(['nginx','-v'],capture=True).stderr
    match=re.search(r'nginx/(\d+)\.(\d+)',nginx_version)
    if match and tuple(map(int,match.groups()))<(1,25):text=text.replace('listen 443 ssl; listen [::]:443 ssl; http2 on;','listen 443 ssl http2; listen [::]:443 ssl http2;')
    atomic(conf,text,0o644);run(['nginx','-t']);run(['systemctl','reload','nginx'])
    hook=Path('/etc/letsencrypt/renewal-hooks/deploy/codemaster-nginx.sh')
    atomic(hook,'#!/bin/sh\nset -eu\n/usr/sbin/nginx -t\n/bin/systemctl reload nginx\n',0o755)
    run(['systemctl','enable','--now','certbot.timer'])
    evidence('nginx-tls','PASS',{'certificate':'issued','site':'private preview','external reachability':'requires external check'})

def health(url='http://127.0.0.1:3000/api/health',seconds=120):
    deadline=time.monotonic()+seconds
    while time.monotonic()<deadline:
        try:
            with urllib.request.urlopen(url,timeout=5) as response:
                if response.status==200 and json.load(response).get('status')=='ok':return
        except (OSError,ValueError):pass
        time.sleep(2)
    raise RuntimeError('Application readiness failed')

def ops(args,extra=None): return run(compose()+['run','--rm','-T']+(extra or [])+['ops']+args)

def scan_image(s):
    scanner=pinned_image('aquasec/trivy:latest')
    scan_dir=EVIDENCE/'image-scan';scan_dir.mkdir(mode=0o700,exist_ok=True)
    for kind in ['app','ops','clamav']:
        archive=scan_dir/f'{kind}.tar'
        try:
            run(['docker','image','save','-o',archive,s[f'{kind}_image']])
            run(['docker','run','--rm','-v',f'{scan_dir}:/scan',scanner,'image','--input',f'/scan/{kind}.tar','--scanners','vuln','--severity','MEDIUM,HIGH,CRITICAL','--exit-code','1','--format','json','--output',f'/scan/{kind}.json'])
            run(['docker','run','--rm','-v',f'{scan_dir}:/scan',scanner,'image','--input',f'/scan/{kind}.tar','--format','cyclonedx','--output',f'/scan/{kind}.cyclonedx.json'])
        finally:
            archive.unlink(missing_ok=True)
    evidence('image-scan','PASS',{'scanner':scanner,'images':[s['app_id'],s['ops_id'],s['clamav_image']]})

def install():
    global ROOT
    security_floor(json.loads((ROOT/'package.json').read_text()))
    configure();prepare_host()

    candidate=state() if STATE.exists() else None
    old=candidate if rollback_candidate(candidate) else None

    if candidate and not old:
        print('INFO: Existing state is not a verified rollback-capable runtime; treating this as a fresh deployment.')

    prior_backup=backup() if old and (DATA/'data/codemaster.db').exists() else None
    migration_started=False

    resolver=pinned_image(
        'node:22-bookworm-slim'
    )

    run([
        'docker','run','--rm',
        '-v',f'{ROOT}:/app',
        '-w','/app',
        resolver,
        'node',
        'scripts/resolve-lock.mjs'
    ])

    playwright_version=lock_package_version(
        ROOT/'package-lock.json',
        'node_modules/@playwright/test',
    )

    node=pinned_image(
        'cgr.dev/chainguard/wolfi-base:latest'
    )

    playwright=pinned_image(
        f'mcr.microsoft.com/playwright:v{playwright_version}-noble'
    )

    source_fingerprint=stage_source()

    clamav=pinned_image(
        'clamav/clamav:stable'
    )

    identifier=hashlib.sha256(
        (
            source_fingerprint
            + node
            + resolver
            + clamav
            + playwright
            + playwright_version
        ).encode()
    ).hexdigest()[:20]

    s={
        'root':str(ROOT),
        'release':identifier,
        'source_fingerprint':source_fingerprint,
        'node_image':node,
        'resolver_image':resolver,
        'clamav_image':clamav,
        'playwright_image':playwright,
        'playwright_version':playwright_version,
        'app_image':f'codemaster:app-{identifier}',
        'ops_image':f'codemaster:ops-{identifier}',
        'commercial_release_ready':False,
    }

    if old:
        s['previous']=old

    save_state(s)
    write_deploy(s)
    try:
        run(compose(s)+['build','ops','codemaster'])
        s.update(app_id=image_id(s['app_image']),ops_id=image_id(s['ops_image']));save_state(s)
        evidence('docker-build','PASS',{'release':identifier,'app':s['app_id'],'ops':s['ops_id'],'runtimeBase':s['node_image'],'resolver':s['resolver_image'],'playwright':s['playwright_image'],'playwrightVersion':s['playwright_version'],'includes':'npm ci, audit, lint, unit, source syntax, build and typecheck'})
        sbom=run(['docker','run','--rm',s['ops_image'],'npm','sbom','--omit=dev','--sbom-format=cyclonedx'],capture=True).stdout
        atomic(EVIDENCE/'sbom.npm.cyclonedx.json',sbom)
        scan_image(s)
        run(compose()+['up','-d','--wait','--wait-timeout','600','clamav'])
        db=DATA/'data/codemaster.db'
        if db.exists():
            with sqlite3.connect(f'file:{db}?mode=ro',uri=True) as con:
                versioned=con.execute("SELECT 1 FROM sqlite_master WHERE name='payload_migrations'").fetchone()
                if not versioned or not con.execute("SELECT 1 FROM payload_migrations WHERE name='20260928_001_initial'").fetchone():raise RuntimeError('Existing database has no compatible migration history. Do not apply the new initial migration. Export public content to a fresh database or reconcile explicitly.')
        # Stop the old app before schema changes; rollback can restore the matched snapshot.
        if old:run(compose()+['stop','codemaster'])
        migration_started=True
        ops(['npm','run','migrate'])
        ops(['npm','run','seed'])
        ops(['node','node_modules/tsx/dist/cli.mjs','scripts/provision-admin.ts'],['-v',f'{CONFIG}/operator:/run/operator'])
        run(compose()+['up','-d','--wait','--wait-timeout','180','codemaster']);health()
        evidence('container-health','PASS',{'app':s['app_id']})
        nginx_setup();timers();backup();restore_test()
        ops(['node','node_modules/tsx/dist/cli.mjs','scripts/smtp-test.ts'])
        evidence('smtp-server-accepted','PASS',{'mailboxReceipt':'NOT_RUN','SPF_DKIM_DMARC':'NOT_RUN'})
        print('\nPrywatny podglad uruchomiony. Hasla: /etc/codemaster/preview-credentials.txt oraz /etc/codemaster/operator/admin-credentials.txt')
        print('Teraz uruchamiam acceptance na osobnej, jednorazowej bazie; produkcyjne dane nie sa baza testowa.')
        acceptance()
        evidence(
            'install',
            'PASS',
            {
                'release':identifier,
                'publicRelease':False,
                'mode':'private-preview',
            },
        )
        print('Automatyczne testy zakonczone. Publiczna publikacja wymaga zatwierdzen opisanych w docs/DEPLOY.md.')
    except Exception:
        evidence('install','FAIL',{'release':identifier,'publicRelease':False})
        if old:
            try:
                if migration_started and prior_backup:
                    restore(prior_backup,confirmed=True)
                else:
                    save_state(old);write_deploy(old)
                    run(compose()+['up','-d','--wait','--wait-timeout','180','codemaster']);health()
                previous_nginx=CONFIG/'nginx.previous.conf'
                if previous_nginx.exists():
                    shutil.copy2(previous_nginx,'/etc/nginx/sites-available/codemaster.conf')
                    run(['nginx','-t']);run(['systemctl','reload','nginx'])
                timers()
                evidence('automatic-rollback','PASS',{'target':old['release'],'backup':str(prior_backup) if migration_started else None})
            except Exception:
                evidence('automatic-rollback','FAIL',{'target':old['release']})
                print('Automatyczne przywrocenie nie powiodlo sie. Zachowaj dane i uzyj docs/ROLLBACK.md.')
        print('STOP: wdrozenie nie ma statusu komercyjnego. Nie usuwaj wolumenow ani kopii zapasowych.')
        raise

def snapshot_manifest(s):
    return {
        'utc':dt.datetime.now(dt.timezone.utc).isoformat(),
        'release':s['release'],
        'root':s['root'],
        'source_fingerprint':s.get('source_fingerprint'),
        'app_image':s['app_image'],
        'app_id':s.get('app_id'),
        'ops_image':s['ops_image'],
        'ops_id':s.get('ops_id'),
        'node_image':s['node_image'],
        'resolver_image':s.get('resolver_image'),
        'clamav_image':s['clamav_image'],
        'playwright_image':s.get('playwright_image'),
        'playwright_version':s.get('playwright_version'),
        'secretsIncluded':False,
    }

def backup():
    s=state();BACKUPS.mkdir(mode=0o700,parents=True,exist_ok=True)
    name=dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%S')+'-'+secrets.token_hex(3)
    archive=BACKUPS/f'{name}.tar.gz'
    partial=BACKUPS/f'.{name}.partial'
    if shutil.disk_usage(BACKUPS).free<sum(f.stat().st_size for d in ['data','media','private'] for f in (DATA/d).rglob('*') if f.is_file())*2+512*1024**2:raise RuntimeError('Insufficient free disk for a consistent backup')
    running=bool(run(compose()+['ps','--status','running','-q','codemaster'],capture=True).stdout.strip())
    try:
        if running:run(compose()+['stop','codemaster'])
        with tempfile.TemporaryDirectory(dir=BACKUPS,prefix='.snapshot-') as temporary:
            stage=Path(temporary);(stage/'data').mkdir()
            db=DATA/'data/codemaster.db'
            with sqlite3.connect(f'file:{db}?mode=ro',uri=True) as source,sqlite3.connect(stage/'data/codemaster.db') as target:
                source.backup(target)
                if target.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise RuntimeError('SQLite backup integrity failed')
            for directory in ['media','private']:shutil.copytree(DATA/directory,stage/directory)
            atomic(stage/'manifest.json',json.dumps(snapshot_manifest(s),indent=2)+'\n')
            with tarfile.open(partial,'w:gz') as tar:
                for directory in ['data','media','private','manifest.json']:tar.add(stage/directory,arcname=directory,recursive=True)
        os.chmod(partial,0o600)
        digest=file_hash(partial);atomic(Path(str(archive)+'.sha256'),f'{digest}  {archive.name}\n')
        os.replace(partial,archive)
        evidence('backup','PASS',{'path':str(archive),'sha256':digest,'scope':'consistent database and files; secrets excluded'})
    finally:
        partial.unlink(missing_ok=True)
        if running:run(compose()+['start','codemaster']);health()
    restic_config=CONFIG/'restic.env'
    if restic_config.exists():
        restic_env={**os.environ,**read_env(restic_config)}
        run(['restic','backup',archive,Path(str(archive)+'.sha256'),'--tag','codemaster'],env=restic_env)
        run(['restic','forget','--tag','codemaster','--keep-daily','7','--keep-weekly','4','--keep-monthly','6','--prune'],env=restic_env)
        evidence('offsite-backup','PASS',{'tool':'restic','repository':'configured; not logged'})
    else:evidence('offsite-backup','NOT_RUN',{'reason':'Configure /etc/codemaster/restic.env; local backups alone do not protect against VPS loss.'})
    # Only prune local copies after a successful snapshot, and keep at least seven.
    archives=sorted(BACKUPS.glob('*.tar.gz'),reverse=True)
    for old in archives[14:]:
        if old.stat().st_mtime<time.time()-30*86400:old.unlink();Path(str(old)+'.sha256').unlink(missing_ok=True)
    print(f'Backup: {archive}');return archive

def file_hash(path):
    h=hashlib.sha256()
    with open(path,'rb') as file:
        for block in iter(lambda:file.read(1024*1024),b''):h.update(block)
    return h.hexdigest()

def unpack_backup(archive:Path,destination:Path):
    expected=Path(str(archive)+'.sha256').read_text().split()[0]
    if not re.fullmatch('[a-f0-9]{64}',expected) or file_hash(archive)!=expected:raise RuntimeError('Backup checksum mismatch')
    with tarfile.open(archive,'r:gz') as tar:
        total=0;seen=set()
        members=tar.getmembers()
        if len(members)>250000:raise RuntimeError('Too many archive members')
        for member in members:
            path=Path(member.name)
            if path.is_absolute() or '..' in path.parts or not path.parts or path.parts[0] not in ['data','media','private','manifest.json'] or (not member.isfile() and not member.isdir()):raise RuntimeError('Unsafe archive member')
            if str(path) in seen:raise RuntimeError('Duplicate archive path')
            seen.add(str(path))
            if member.size<0:raise RuntimeError('Invalid member size')
            total+=member.size
            if total>60*1024**3:raise RuntimeError('Backup exceeds maximum restore size')
        # Validated paths, no links/devices; supports Ubuntu Python 3.10 as well.
        if hasattr(tarfile,'data_filter'):tar.extractall(destination,filter='data')
        else:tar.extractall(destination)
    db=destination/'data/codemaster.db'
    with sqlite3.connect(f'file:{db}?mode=ro',uri=True) as connection:
        if connection.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise RuntimeError('Restored database integrity failed')
    return json.loads((destination/'manifest.json').read_text())

def latest_backup():
    items=sorted(p for p in BACKUPS.glob('*.tar.gz') if Path(str(p)+'.sha256').is_file())
    if not items:raise RuntimeError('No application backup exists')
    return items[-1]

def app_run(s,folder,envfile,name,port=3001):
    args=['docker','run','-d','--name',name,'--network','codemaster_default','--user','10001:10001','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges','--init','--pids-limit','256','--memory','2300m',
          '--tmpfs','/tmp:rw,nosuid,noexec,size=128m,uid=10001,gid=10001','--tmpfs','/app/.next/cache:rw,nosuid,noexec,size=128m,uid=10001,gid=10001','--env-file',envfile,'-e','MEDIA_DIR=/app/media','-e','PRIVATE_UPLOAD_DIR=/app/private-uploads','-e','QUARANTINE_DIR=/app/quarantine','-p',f'127.0.0.1:{port}:3000']
    for local,remote in [('data','/data'),('media','/app/media'),('private','/app/private-uploads'),('quarantine','/app/quarantine')]:
        d=folder/local;d.mkdir(exist_ok=True);os.chown(d,10001,10001)
        for child in d.rglob('*'):os.chown(child,10001,10001)
        args+=['-v',f'{d}:{remote}']
    run(args+[s['app_image']])

def restore_test(archive=None):
    s=state();archive=Path(archive) if archive else latest_backup()
    with tempfile.TemporaryDirectory(dir=DATA,prefix='.restore-test-') as temporary:
        stage=Path(temporary);manifest=unpack_backup(archive,stage)
        if image_id(manifest['app_image'])!=manifest['app_id']:raise RuntimeError('Matching restore image is missing or changed')
        values=read_env();values.update(SERVER_URL='http://127.0.0.1:3002',NEXT_PUBLIC_SERVER_URL='http://127.0.0.1:3002',ALLOW_HTTP_LOCAL='true',SMTP_HOST='',SMTP_USER='',SMTP_PASS='',LEAD_NOTIFY_EMAIL='')
        envfile=stage/'runtime.env';atomic(envfile,env_text(values))
        name='codemaster-restore-'+secrets.token_hex(4)
        try:
            app_run({**s,'app_image':manifest['app_image']},stage,envfile,name,3002)
            health('http://127.0.0.1:3002/api/health')
            for route in ['/','/en','/robots.txt','/sitemap.xml']:
                with urllib.request.urlopen('http://127.0.0.1:3002'+route,timeout=30) as response:
                    if response.status!=200:raise RuntimeError('Restored HTTP smoke failed')
            evidence('restore-runtime','PASS',{'backup':str(archive),'app':manifest['app_id'],'privateAttachmentAfterLogin':'NOT_RUN'})
        finally:run(['docker','rm','-f',name],check=False,capture=True)

def restore(archive,confirmed=False):
    if not confirmed:raise RuntimeError('Destructive restore requires --confirm-restore. Take a fresh backup first.')
    archive=Path(archive).resolve();s=state()
    with tempfile.TemporaryDirectory(dir=DATA,prefix='.restore-') as temporary:
        stage=Path(temporary);manifest=unpack_backup(archive,stage)
        for kind in ['app','ops']:
            if image_id(manifest[f'{kind}_image'])!=manifest[f'{kind}_id']:raise RuntimeError('Matching immutable image unavailable')
        trusted=Path(manifest['root']).resolve()
        if not trusted.is_relative_to(RELEASES.resolve()) or fingerprint(trusted)!=manifest.get('source_fingerprint'):raise RuntimeError('Restore source is missing, untrusted or changed. Restore the exact root-owned release directory first.')
        # Validation is complete before touching the current data directories.
        run(compose()+['stop','codemaster'])
        retained=DATA/('pre-restore-'+dt.datetime.now().strftime('%Y%m%d%H%M%S'));retained.mkdir(mode=0o700)
        for directory in ['data','media','private']:
            (DATA/directory).rename(retained/directory);(stage/directory).rename(DATA/directory)
            for path in [DATA/directory,*list((DATA/directory).rglob('*'))]:os.chown(path,10001,10001)
        s.update({key:manifest[key] for key in ['root','release','app_image','ops_image','app_id','ops_id','node_image','clamav_image']})
        for key in ['resolver_image','playwright_image','playwright_version']:
            if manifest.get(key):
                s[key]=manifest[key]
            else:
                s.pop(key,None)
        s['source_fingerprint']=manifest.get('source_fingerprint')
        s['commercial_release_ready']=False
        cfg=json.loads((CONFIG/'contact.json').read_text())
        conf=Path('/etc/nginx/sites-available/codemaster.conf')
        text=nginx_config(cfg['domain'],tls=True,aliases=cfg.get('aliases',[]))
        # Portable HTTP/2 syntax is accepted by supported Nginx versions.
        text=text.replace('listen 443 ssl; listen [::]:443 ssl; http2 on;','listen 443 ssl http2; listen [::]:443 ssl http2;')
        atomic(conf,text,0o644);run(['nginx','-t']);run(['systemctl','reload','nginx'])
        save_state(s);write_deploy(s)
        run(compose()+['up','-d','--wait','--wait-timeout','180','codemaster']);health()
        evidence('restore-production','PASS',{'backup':str(archive),'retainedPreviousData':str(retained)})

def acceptance():
    s=state();name='codemaster-acceptance-'+secrets.token_hex(4)
    if image_id(s['app_image'])!=s['app_id']:raise RuntimeError('App image changed since build')
    playwright_image=s.get('playwright_image')
    playwright_version=s.get('playwright_version')

    if not playwright_image or '@sha256:' not in playwright_image:
        raise RuntimeError('Pinned Playwright image missing from release state')

    if not re.fullmatch(r'\d+\.\d+\.\d+',playwright_version or ''):
        raise RuntimeError('Exact Playwright version missing from release state')

    test_image=f'codemaster:test-{s["release"]}'

    run([
        'docker','build',
        '-f','Dockerfile.production',
        '--target','test',
        '--build-arg',f'NODE_IMAGE={s["node_image"]}',
        '--build-arg',f'PLAYWRIGHT_IMAGE={playwright_image}',
        '--build-arg',f'PLAYWRIGHT_VERSION={playwright_version}',
        '--build-arg',f'NEXT_PUBLIC_SERVER_URL={read_env()["NEXT_PUBLIC_SERVER_URL"]}',
        '-t',test_image,
        '.'
    ])

    test_id=image_id(test_image)
    with tempfile.TemporaryDirectory(dir=DATA,prefix='.acceptance-') as temporary:
        stage=Path(temporary)
        for directory in ['data','media','private','quarantine','evidence']:
            (stage/directory).mkdir();os.chown(stage/directory,10001,10001)
        values=read_env();password=secrets.token_urlsafe(32)
        values.update(PAYLOAD_SECRET=secrets.token_hex(48),SERVER_URL='http://127.0.0.1:3001',NEXT_PUBLIC_SERVER_URL='http://127.0.0.1:3001',ALLOW_HTTP_LOCAL='true',
            SMTP_HOST='',SMTP_USER='',SMTP_PASS='',SMTP_FROM='',LEAD_NOTIFY_EMAIL='',TURNSTILE_SITE_KEY='1x00000000000000000000AA',TURNSTILE_SECRET_KEY='1x0000000000000000000000000000000AA',
            E2E_BASE_URL='http://127.0.0.1:3001',E2E_DATABASE_IS_DISPOSABLE='true',E2E_REQUIRE_PERSISTENCE='true',E2E_ADMIN_EMAIL='acceptance@example.test',E2E_ADMIN_PASSWORD=password,
            CODEMASTER_ADMIN_EMAIL='acceptance@example.test',CODEMASTER_ADMIN_NAME='Acceptance',CODEMASTER_ADMIN_PASSWORD=password,
            PLAYWRIGHT_JSON_OUTPUT_NAME='/evidence/e2e.json',MEDIA_DIR='/app/media',PRIVATE_UPLOAD_DIR='/app/private-uploads',QUARANTINE_DIR='/app/quarantine')
        envfile=stage/'runtime.env';atomic(envfile,env_text(values))
        base=['docker','run','--rm','--network','codemaster_default','--env-file',envfile]
        for local,remote in [('data','/data'),('media','/app/media'),('private','/app/private-uploads'),('quarantine','/app/quarantine')]:base+=['-v',f'{stage/local}:{remote}']
        try:
            run(base+[s['ops_image'],'npm','run','migrate'])
            run(base+[s['ops_image'],'npm','run','seed'])
            run(base+[s['ops_image'],'node','node_modules/tsx/dist/cli.mjs','scripts/docker-bootstrap.ts'])
            app_run(s,stage,envfile,name);health('http://127.0.0.1:3001/api/health')
            run(['docker','run','--rm','--network','host','--ipc','host','--env-file',envfile,'-v',f'{stage}/evidence:/evidence',test_image])
            report=json.loads((stage/'evidence/e2e.json').read_text());stats=report.get('stats',{})
            atomic(EVIDENCE/'e2e.json',json.dumps(report,indent=2)+'\n')
            if stats.get('unexpected',0) or stats.get('skipped',0) or stats.get('flaky',0) or not stats.get('expected',0):raise RuntimeError('Full E2E gate failed or skipped tests')
            evidence('exact-image-e2e','PASS',{'app':s['app_id'],'test':test_id,'tests':stats['expected'],'release':s['release'],'playwright':s['playwright_image'],'playwrightVersion':s['playwright_version']})
        except Exception:
            evidence('exact-image-e2e','FAIL',{'app':s['app_id']})
            if (stage/'evidence/e2e.json').exists():shutil.copy2(stage/'evidence/e2e.json',EVIDENCE/'e2e.json')
            raise
        finally:
            logs=run(['docker','logs',name],capture=True,check=False)
            atomic(EVIDENCE/'acceptance-container.log',logs.stdout+logs.stderr)
            run(['docker','rm','-f',name],check=False,capture=True)

def timers():
    active_root=state().get('root',str(ROOT))
    for action,schedule in [('notifications','*-*-* *:*:00'),('cleanup','*-*-* *:10:00'),('backup','*-*-* 03:40:00'),('monitor','*:0/5')]:
        service=f'''[Unit]\nDescription=CodeMaster {action}\nAfter=docker.service network-online.target\nOnFailure=codemaster-failure-alert.service\n[Service]\nType=oneshot\nUMask=0077\nExecStart=/usr/bin/python3 {active_root}/vps/manage.py {action}\n'''
        timer=f'''[Unit]\nDescription=CodeMaster {action} schedule\n[Timer]\nOnCalendar={schedule}\nPersistent=true\nRandomizedDelaySec=30\n[Install]\nWantedBy=timers.target\n'''
        atomic(Path(f'/etc/systemd/system/codemaster-{action}.service'),service,0o644)
        atomic(Path(f'/etc/systemd/system/codemaster-{action}.timer'),timer,0o644)
    atomic(Path('/etc/systemd/system/codemaster-failure-alert.service'),f'[Unit]\nDescription=CodeMaster failed timer alert\n[Service]\nType=oneshot\nUMask=0077\nExecStart=/usr/bin/python3 {active_root}/vps/manage.py failure-alert\n',0o644)
    run(['systemctl','daemon-reload'])
    for action in ['notifications','cleanup','backup','monitor']:run(['systemctl','enable','--now',f'codemaster-{action}.timer'])

def alert(codes):
    values=read_env();url=values.get('ALERT_WEBHOOK_URL')
    if not url:return False
    if not url.startswith('https://'):raise ValueError('Alert webhook must use HTTPS')
    request=urllib.request.Request(url,data=json.dumps({'component':'codemaster','codes':codes,'utc':dt.datetime.now(dt.timezone.utc).isoformat()}).encode(),headers={'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(request,timeout=10) as response:return 200<=response.status<300

def monitor():
    problems=[]
    try:health(seconds=8)
    except Exception:problems.append('APP_UNAVAILABLE')
    disk=shutil.disk_usage(DATA)
    if disk.free/disk.total<.15:problems.append('DISK_LOW')
    memory={line.split(':')[0]:int(line.split()[1]) for line in Path('/proc/meminfo').read_text().splitlines()}
    if memory['MemAvailable']/memory['MemTotal']<.08:problems.append('MEMORY_LOW')
    if os.getloadavg()[0]>(os.cpu_count() or 1)*1.5:problems.append('CPU_LOAD_HIGH')
    try:
        if latest_backup().stat().st_mtime<time.time()-36*3600:problems.append('BACKUP_OLD')
    except Exception:problems.append('BACKUP_MISSING')
    cfg=json.loads((CONFIG/'contact.json').read_text());certificate=Path('/etc/letsencrypt/live')/cfg['domain']/'cert.pem'
    if run(['openssl','x509','-checkend',str(14*86400),'-noout','-in',certificate],capture=True,check=False).returncode:problems.append('CERT_EXPIRING')
    containers=run(compose()+['ps','-q'],capture=True).stdout.split()
    counters={container:int(run(['docker','inspect',container,'--format','{{.RestartCount}}'],capture=True).stdout) for container in containers}
    previous=CONFIG/'restart-counts.json';old=json.loads(previous.read_text()) if previous.exists() else {}
    if any(count>old.get(container,0) for container,count in counters.items()):problems.append('CONTAINER_RESTARTED')
    atomic(previous,json.dumps(counters))
    try:
        with sqlite3.connect(f'file:{DATA}/data/codemaster.db?mode=ro',uri=True) as db:
            cutoff=(dt.datetime.now(dt.timezone.utc)-dt.timedelta(minutes=15)).isoformat()
            if db.execute("SELECT COUNT(*) FROM leads WHERE notification_status='failed' OR (notification_status='pending' AND created_at<?)",(cutoff,)).fetchone()[0]:problems.append('NOTIFICATION_BACKLOG')
    except sqlite3.Error:problems.append('NOTIFICATION_CHECK_FAILED')
    if problems:
        delivered=alert(problems);evidence('monitor','FAIL',{'codes':problems,'webhookAccepted':delivered})
        raise RuntimeError('Monitoring detected a problem; inspect protected evidence')
    evidence('monitor','PASS',{'scope':'host-local checks only; external uptime service still required'})

def publish():
    s=state();security_floor(json.loads((Path(s['root'])/'package.json').read_text()),public=True)
    required=['image-scan','container-health','exact-image-e2e','restore-runtime','backup','offsite-backup','smtp-server-accepted','alert-test']
    for name in required:
        require_evidence(name)
    result=json.loads((EVIDENCE/'exact-image-e2e.json').read_text())
    if result['details']['app']!=image_id(s['app_image']) or s.get('source_fingerprint')!=fingerprint(Path(s['root'])) or result['details']['release']!=s['release'] or result['details'].get('playwright')!=s.get('playwright_image') or result['details'].get('playwrightVersion')!=s.get('playwright_version'):raise RuntimeError('Runtime/source/test provenance changed after acceptance')
    ops(['npm','run','check:deployment'])
    confirmations={}
    for question,key in [('Odebrales SMTP i reset hasla, a SPF/DKIM/DMARC sa poprawne?','smtpMailboxAndReset'),('Odebrales testowy alert i ustawiles zewnetrzny uptime monitor?','externalMonitoring'),('Sprawdziles dane prawne, retencje oraz licencje wszystkich zdjec?','legalAndAssets'),('Przetestowales rollback na staging i prywatny zalacznik po restore?','rollbackAndPrivateRestore')]:
        confirmations[key]=ask(question+' Wpisz TAK')=='TAK'
    if not all(confirmations.values()):raise RuntimeError('Publication not authorized')
    conf=Path('/etc/nginx/sites-available/codemaster.conf');previous=conf.read_text()
    text=previous.replace('auth_basic "CodeMaster private acceptance"; auth_basic_user_file /etc/nginx/codemaster.htpasswd;','').replace('add_header X-Robots-Tag "noindex, nofollow" always;','')
    atomic(conf,text,0o644)
    try:run(['nginx','-t']);run(['systemctl','reload','nginx'])
    except Exception:atomic(conf,previous,0o644);raise
    atomic(EVIDENCE/'owner-publication-approval.json',json.dumps({'utc':dt.datetime.now(dt.timezone.utc).isoformat(),'confirmations':confirmations,'scope':'Owner declarations, not independently performed assistant tests.'},indent=2))
    s['commercial_release_ready']=True;s['publishedAtUTC']=dt.datetime.now(dt.timezone.utc).isoformat();save_state(s)
    evidence('public-promotion','PASS',{'scope':'Local acceptance gates and owner declarations, not a security guarantee'})
    print('Opublikowano strone. Zachowaj raporty i stale monitorowanie. Deklaracje wlasciciela nie sa automatycznymi wynikami testow.')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action',choices=['install','status','backup','restore-test','restore','rollback','acceptance','cleanup','monitor','alert-test','publish','smtp-test','notifications','failure-alert','retry-notification'])
    parser.add_argument('archive',nargs='?');parser.add_argument('--confirm-restore',action='store_true')
    args=parser.parse_args()
    if os.geteuid()!=0:raise SystemExit('Use sudo. These commands administer Docker and protected host storage.')
    lock=open('/run/lock/codemaster-operations.lock','w')
    if args.action not in ['monitor','status','alert-test','failure-alert']:fcntl.flock(lock,fcntl.LOCK_EX)
    try:
        if args.action=='install':install()
        elif args.action=='status':run(compose()+['ps']);print('Evidence:',EVIDENCE)
        elif args.action=='backup':backup()
        elif args.action=='restore-test':restore_test(args.archive)
        elif args.action in ['restore','rollback']:
            if not args.archive:raise ValueError('Provide a compatible backup archive explicitly')
            restore(args.archive,args.confirm_restore)
        elif args.action=='acceptance':acceptance()
        elif args.action=='notifications':ops(['npm','run','notifications'])
        elif args.action=='retry-notification':
            if not args.archive or not re.fullmatch(r'[1-9][0-9]{0,14}',args.archive):raise ValueError('Provide one failed lead ID, e.g. retry-notification 123')
            ops(['node','node_modules/tsx/dist/cli.mjs','scripts/retry-notification.ts',args.archive])
        elif args.action=='failure-alert':
            if not alert(['SYSTEMD_SERVICE_FAILED']):raise RuntimeError('Failure alert was not delivered')
        elif args.action=='cleanup':ops(['npm','run','cleanup'])
        elif args.action=='smtp-test':ops(['node','node_modules/tsx/dist/cli.mjs','scripts/smtp-test.ts'])
        elif args.action=='monitor':monitor()
        elif args.action=='alert-test':
            if not alert(['TEST_ALERT']):raise RuntimeError('Alert webhook is not configured or did not accept the test')
            evidence('alert-test','PASS',{'scope':'webhook HTTP acceptance; recipient must confirm delivery'})
        elif args.action=='publish':publish()
    except Exception as exc:
        print(f'FAIL: {exc}',file=sys.stderr)
        if ENV.exists():
            with contextlib.suppress(Exception):alert(['OPERATION_FAILED',args.action.upper()])
        raise SystemExit(1)
    finally:lock.close()

if __name__=='__main__':main()
