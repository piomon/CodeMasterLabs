const test=require('node:test'),assert=require('node:assert/strict');
test('local npm helper uses the JS entry without a shell on Windows',async()=>{
 const {npmInvocation}=await import('../scripts/lib/run-npm.mjs');
 assert.deepEqual(npmInvocation(['run','test'],{npm_execpath:__filename},'win32'),{command:process.execPath,args:[__filename,'run','test']});
});
test('local npm helper refuses an unsafe Windows shell fallback',async()=>{
 const {npmInvocation}=await import('../scripts/lib/run-npm.mjs');assert.throws(()=>npmInvocation(['run','test'],{},'win32'),/npm run/);
});
test('local npm helper uses a POSIX executable when not launched through npm',async()=>{
 const {npmInvocation}=await import('../scripts/lib/run-npm.mjs');assert.deepEqual(npmInvocation(['audit','--json'],{},'linux'),{command:'npm',args:['audit','--json']});
});
test('local npm helper rejects malformed arguments',async()=>{
 const {npmInvocation}=await import('../scripts/lib/run-npm.mjs');for(const args of [null,'test',[undefined],['test\nother'],['test\0other']])assert.throws(()=>npmInvocation(args,{},'linux'),TypeError);
});
