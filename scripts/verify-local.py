#!/usr/bin/env python3
"""Run the locally available checks and record exact outcomes; no runtime claims."""
from pathlib import Path
import datetime,json,os,re,shutil,subprocess,sys,time
root=Path(__file__).resolve().parents[1]
report=root/'reports/verification';report.mkdir(parents=True,exist_ok=True)
env=dict(os.environ)
if not (root/'node_modules/typescript').exists():
    module=Path('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')
    if module.exists():env['TYPESCRIPT_PATH']=str(module)
checks=[]
def run(name,command,scope,timeout=40):
    started=time.monotonic();path=report/(name+'.log')
    try:
        result=subprocess.run(command,cwd=root,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=timeout)
        text=result.stdout;code=result.returncode
    except (OSError,subprocess.TimeoutExpired) as error:
        text=str(error);code=None
    path.write_text(text)
    check={'check':name,'status':'PASS' if code==0 else 'FAIL','command':command,'exitCode':code,'seconds':round(time.monotonic()-started,3),'scope':scope,'report':str(path.relative_to(root))}
    checks.append(check);print(name,check['status'])
    return text
units=run('unit-tests',['node','--test',*[str(p.relative_to(root)) for p in sorted((root/'tests').glob('*.test.cjs'))]],'All existing and new dependency-independent Node tests, using TypeScript transpilation; mocks are not live providers.')
python_units=run('python-tests',[sys.executable,'-m','unittest','discover','-s','tests/vps','-v'],'Host-operation component tests and actual synthetic SQLite schema/backup extraction; no Docker/VPS operations.')
run('source-syntax',['node','scripts/check-source.cjs'],'TypeScript syntax transpilation/local imports, not dependency-aware typechecking.')
cmd=['tsc','--project','tsconfig.domain.json']
types=Path('/opt/nvm/versions/node/v22.16.0/lib/node_modules/ts-node/node_modules/@types')
if not (root/'node_modules/@types').exists() and types.exists():cmd+=['--typeRoots',str(types)]
run('domain-typecheck',cmd,'Strict domain-only tsconfig; this is NOT the complete Next/Payload app typecheck.')
run('shell-syntax',['bash','-c','for file in INSTALL-VPS.sh UPDATE-SECURITY.sh; do bash -n "$file" || exit; done'],'Installer POSIX shell syntax only.')
run('python-syntax',[sys.executable,'-m','py_compile','vps/manage.py','vps/update_security.py','scripts/secret-scan.py','scripts/verify-local.py'],'Python source compilation only.')
for path in sorted([*(root/'docker').glob('*.mjs'),*(root/'scripts').glob('*.mjs'),*(root/'scripts').glob('*.cjs')]):
    run('node-syntax-'+path.stem,['node','--check',str(path.relative_to(root))],'JavaScript parse only.')
run('secret-pattern-scan',[sys.executable,'scripts/secret-scan.py'],'Current-source strong token/private-key patterns, no comprehensive history or entropy audit.')
run('npm-ci-offline-attempt',['npm','ci','--offline','--ignore-scripts','--no-fund','--audit=false'],'Diagnostic only: there is no resolved updated root lock or cached dependencies. Failure blocks commercial release.')
run('npm-registry-connectivity',['curl','--head','--max-time','5','https://registry.npmjs.org/'],'Actual environment network reachability; not an npm install test.',10)
checks.append({'check':'docker-engine','status':'NOT_RUN' if not shutil.which('docker') else 'NOT_RUN','command':['docker','version'],'scope':'Docker executable/daemon unavailable in preparation environment.' if not shutil.which('docker') else 'Use target-host integration runner.'})
counts={name:int(match.group(1)) if (match:=re.search(r'^# '+name+r' (\d+)',units,re.M)) else None for name in ['tests','pass','fail','skipped']}
result={'generatedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'node':subprocess.run(['node','--version'],capture_output=True,text=True).stdout.strip(),'npm':subprocess.run(['npm','--version'],capture_output=True,text=True).stdout.strip(),'unitCounts':counts,'pythonTestCount':int(re.search(r'Ran (\d+) tests?',python_units).group(1)) if re.search(r'Ran (\d+) tests?',python_units) else None,'checks':checks,'COMMERCIAL_RELEASE_READY':False,'reason':'Mandatory dependency installation, real Payload migrations, complete app typecheck/build, final image and external-service acceptance were not completed.'}
(report/'local-verification.json').write_text(json.dumps(result,indent=2)+'\n')
# Local tests may pass while mandatory production gates are not run.
mandatory=[
('repository-provenance','NOT_RUN','Uploaded archive hash recorded. No authorized repository fetch or commit created; repository alignment is an owner handoff task.'),
('independent-full-manual-audit','NOT_RUN','Multi-pass focused review and automated full-source checks performed. Not an independently certified line-by-line security audit.'),
('updated-root-lockfile','FAIL','No honest Payload 3.90.2 resolved lock could be generated without npm access; explicit bootstrap supplied.'),
('clean-linux-npm-ci','NOT_RUN','Offline diagnostic failed; no successful clean installation.'),
('installed-dependency-security-audit','NOT_RUN','Both production and complete dependency graphs must be audited after actual resolution. Critical/High/Moderate block acceptance; counts are unknown, not zero.'),
('generated-payload-types-importmap','NOT_RUN','Build regenerates both; framework dependencies unavailable here.'),
('actual-payload-fresh-migration','NOT_RUN','Raw SQLite component tests are not the Payload runner.'),
('actual-payload-upgrade-migration','NOT_RUN','Previous real installation upgrade/schema comparison not executed.'),
('failed-payload-migration-release-stop','NOT_RUN','SQLite transaction unit test only; no real runner failure injection.'),
('eslint','NOT_RUN','npm run lint is required during Docker build.'),
('full-app-typecheck','NOT_RUN','Domain-only result does not establish Next/Payload type correctness.'),
('production-build','NOT_RUN','Next/Payload npm dependencies unavailable.'),
('full-source-release-verify','NOT_RUN','Requires dependencies, ClamAV, qpdf, browser and remote challenge test service.'),
('docker-build','NOT_RUN','No Docker engine.'),
('final-image-vulnerability-scan','NOT_RUN','App, ops and ClamAV scanning implemented, not executed.'),
('sbom-final-image','NOT_RUN','Installer generates dependency SBOM and per-image CycloneDX SBOM for app, ops and ClamAV only after actual builds/scans.'),
('exact-container-health','NOT_RUN','No Docker engine.'),
('exact-container-full-e2e','NOT_RUN','No Docker engine; no skipped/flaky tests are accepted by installer.'),
('admin-auth-and-registration','NOT_RUN','Source controls and test definitions present; runtime auth not executed.'),
('private-data-draft-access','NOT_RUN','Requires real CMS API and authenticated/anonymous sessions.'),
('real-contact-ui-and-idempotency','NOT_RUN','Browser integration not executed.'),
('real-turnstile','NOT_RUN','Contract tests do not prove Cloudflare/browser/domain integration.'),
('real-attachment-validation','NOT_RUN','Requires full live upload endpoint, qpdf, Sharp and malware engine.'),
('real-clamav-malware-scan','NOT_RUN','Protocol peers tested; real ClamAV/EICAR not run.'),
('smtp-reset-delivery','NOT_RUN','Real account, inbox receipt and reset link are missing.'),
('lead-email-delivery','NOT_RUN','Implementation exists; real mail flow not verified.'),
('spf-dkim-dmarc','NOT_RUN','Real domain mail authentication not inspected.'),
('nginx-tls-public-network','NOT_RUN','No actual domain/VPS configuration here.'),
('browser-csp-security-headers','NOT_RUN','Source configuration only, no browser enforcement test.'),
('sitemap-robots-canonical-pl-en','NOT_RUN','Real production-like HTTP acceptance required.'),
('mobile-webgl-regression','NOT_RUN','Existing full suite retained; prior WebGL flake not reproduced or proven fixed.'),
('axe-critical-serious','NOT_RUN','Axe tests added but not executed in browser.'),
('manual-keyboard-zoom-320px','NOT_RUN','Manual browser accessibility checks not executed.'),
('performance-lcp-cls-inp','NOT_RUN','No real production-like performance measurements.'),
('editorial-cache-preview-freshness','NOT_RUN','No newly proven cache invalidation or preview freshness optimization.'),
('full-app-backup','NOT_RUN','Synthetic SQLite archive tests pass; actual host backup not executed.'),
('full-app-restore','NOT_RUN','Matching image/database/media/private authenticated restore not executed.'),
('staging-rollback','NOT_RUN','Automatic recovery code not tested on staging.'),
('encrypted-offsite-backup','NOT_RUN','Actual remote storage account/repository not configured.'),
('separate-secret-recovery','NOT_RUN','No owner secrets manager/recovery bundle exists in this environment.'),
('external-uptime-alert','NOT_RUN','Requires independent provider and confirmed notification.'),
('error-monitoring-pii-redaction','NOT_RUN','Generic host alerts do not implement verified application error monitoring/redaction.'),
('cleanup-retention-live','NOT_RUN','Timers and opt-in closed-lead retention implemented, not executed on host.'),
('ci-execution','NOT_RUN','YAML supplied but no GitHub workflow run.'),
('branch-protection','NOT_RUN','No authorized repository administration was performed.'),
('signed-image-promotion','NOT_RUN','No registry signing/promotion integration configured.'),
('original-git-history-secret-scan','NOT_RUN','Current uploaded VPS ZIP has no Git history. Token reported in the earlier large archive requires owner revocation and a separate historical audit.'),
('privacy-owner-legal-review','NOT_RUN','No fabricated company data or privacyReviewed approval.'),
('asset-rights-clearance','NOT_RUN','Complete path/hash inventory provided; source/license proofs incomplete.')]
reportlines=['# Release gates - generated from actual local execution','',f'Generated UTC: {result["generatedAtUTC"]}','', '**COMMERCIAL_RELEASE_READY = FALSE**','', 'No PASS below represents an unexecuted provider, Docker or full-framework test. Command output is retained in the indicated file. Local component test scope is intentionally narrower than mandatory production acceptance.','', '| CHECK | STATUS | COMMAND / EVIDENCE | REPORT FILE |','|---|---|---|---|']
for c in checks:reportlines.append('| '+c['check']+' | '+c['status']+' | `'+ ' '.join(c['command']).replace('|','\\|')+'` - '+c['scope']+' | '+c.get('report','local-verification.json')+' |')
for name,status,reason in mandatory:reportlines.append(f'| {name} | {status} | {reason} | reports/verification/local-verification.json / docs/AUDIT.md |')
reportlines+=['','Archive/input SHA256 and file hashes are recorded in RELEASE.json and SHA256SUMS.txt. No Git packaging commit or remote-main verification is claimed. Docker image digest: NOT_RUN. Last complete application restore date: NOT_RUN. Synthetic SQLite extraction tests are not substituted for it.','', 'Accepted residual risks: none accepted on the owner\'s behalf. Unresolved requirements remain blockers or unverified gates.']
(root/'docs/RELEASE-GATES.md').write_text('\n'.join(reportlines)+'\n')
print(json.dumps({'unitCounts':counts,'checks':len(checks),'requiredOutstanding':len(mandatory),'COMMERCIAL_RELEASE_READY':False},indent=2))

# A diagnostic or missing mandatory integration gate must never return a release-success exit code.
sys.exit(2 if any(c['status']!='PASS' for c in checks) or any(status!='PASS' for _,status,_ in mandatory) else 0)
