#!/usr/bin/env python3
"""Pattern scan of delivered source; not a complete historical secret audit."""
from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1]
patterns={'github_token':re.compile(rb'(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})'),
          'private_key':re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
          'aws_access_key':re.compile(rb'AKIA[0-9A-Z]{16}')}
findings=[];scanned=0
for file in sorted(root.rglob('*')):
    if not file.is_file() or any(x in file.parts for x in ['.git','node_modules','.next','__pycache__']):continue
    if file.suffix.lower() in ['.png','.jpg','.jpeg','.webp','.pyc']:continue
    if file.name in ['SHA256SUMS.txt'] or 'reports' in file.relative_to(root).parts:continue
    data=file.read_bytes();scanned+=1
    for kind,pattern in patterns.items():
        for match in pattern.finditer(data):findings.append({'file':str(file.relative_to(root)),'line':data[:match.start()].count(b'\n')+1,'kind':kind})
report={'status':'FAIL' if findings else 'PASS','files':scanned,'scope':'Strong token/key patterns in current deliverable source only; not high-entropy analysis, Git history scan or credential validity check. Values omitted.','findings':findings}
(root/'reports/verification').mkdir(parents=True,exist_ok=True)
(root/'reports/verification/secret-pattern-scan.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2));sys.exit(bool(findings))
