#!/usr/bin/env python3
"""Resolve only already-published stable patches in the current Next minor.
Does not install dependencies, declare a clean security scan, or promote production.
"""
import datetime, json, re, sys, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def choose_patch(current,versions):
    if not re.fullmatch(r'\d+\.\d+\.\d+',current):raise ValueError('Exact stable current version required')
    major,minor,patch=map(int,current.split('.'))
    candidates=[tuple(map(int,v.split('.'))) for v in versions if re.fullmatch(r'\d+\.\d+\.\d+',v) and tuple(map(int,v.split('.')))[:2]==(major,minor)]
    chosen=max(candidates,default=(major,minor,patch))
    if chosen<(16,3,7):raise RuntimeError('Required Next security patch has not been found in the registry; no nonexistent version is written.')
    if chosen<(major,minor,patch):raise RuntimeError('Downgrades are forbidden')
    return '.'.join(map(str,chosen))
def main():
    if ROOT.parent==Path('/opt/codemaster/releases'):raise RuntimeError('Never edit an immutable installed release. Extract a fresh upload and update that source instead.')
    file=ROOT/'package.json';package=json.loads(file.read_text())
    request=urllib.request.Request('https://registry.npmjs.org/next',headers={'Accept':'application/vnd.npm.install-v1+json','User-Agent':'CodeMaster-Security-Update/2.2'})
    with urllib.request.urlopen(request,timeout=30) as response:
        if not response.url.startswith('https://registry.npmjs.org/'):raise RuntimeError('Unexpected registry redirect')
        raw=response.read(32*1024*1024+1)
    if len(raw)>32*1024*1024:raise RuntimeError('Registry response exceeds maximum size')
    metadata=json.loads(raw);old=package['dependencies']['next'];new=choose_patch(old,metadata.get('versions',{}))
    if metadata.get('versions',{}).get(new,{}).get('version')!=new:raise RuntimeError('Published package metadata inconsistent')
    if new==old:print('Current Next minor already uses the latest published stable patch. Rebuild and rescan; this is not a security certificate.');return
    package['dependencies']['next']=new
    stage=file.with_suffix('.json.next');stage.write_text(json.dumps(package,indent=2)+'\n');stage.replace(file)
    (ROOT/'reports/runtime').mkdir(parents=True,exist_ok=True)
    (ROOT/'reports/runtime/security-version-update.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'from':old,'to':new,'status':'SOURCE_UPDATED_NOT_TESTED','next':'Run INSTALL-VPS.sh: regenerate lock, clean build, audit, migrations and acceptance.'},indent=2)+'\n')
    print('Source Next version:',old,'->',new,'; run INSTALL-VPS.sh. No production promotion performed.')
if __name__=='__main__':
    try:main()
    except Exception as error:print('STOP:',str(error),file=sys.stderr);sys.exit(1)
