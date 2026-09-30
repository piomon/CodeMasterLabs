const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loader}=require('./helpers/load-ts.cjs');
const {ReliableSubmission,RequestNotSentError}=loader()('src/lib/reliable-submission.ts');
function fixture(changes={}){
 const calls={tokens:0,sent:[],recovered:[]};
 const io={token:async()=>`token-${++calls.tokens}`,clone:value=>({...value}),wait:async()=>{},send:async(value,token)=>{calls.sent.push({value:{...value},token});return {ok:true,status:200}},recover:async token=>{calls.recovered.push(token);return {state:'missing'}},...changes};
 return {session:new ReliableSubmission(io),calls,io};
}
test('submission: rapid double click shares one in-flight request',async()=>{
 let finish;const f=fixture({send:()=>new Promise(resolve=>{finish=resolve})});
 const a=f.session.submit({message:'original'}),b=f.session.submit({message:'changed'});assert.equal(a,b);
 await new Promise(r=>setImmediate(r));finish({ok:true,status:200});await a;assert.equal(f.calls.tokens,1);assert.equal(f.session.pending,false);
});
test('submission: caller mutation cannot modify the in-flight snapshot',async()=>{
 const f=fixture();const input={message:'original'};const result=f.session.submit(input);input.message='mutated';await result;assert.equal(f.calls.sent[0].value.message,'original');
});
test('submission: lost success response is recovered without resending or CAPTCHA',async()=>{
 let sends=0,receipts=0;const f=fixture({send:async()=>{sends++;throw Error('lost response')},recover:async()=>{receipts++;return {state:'saved',reference:'51'}}});
 await assert.rejects(f.session.submit({message:'original'}));assert.equal(f.session.pending,true);
 assert.deepEqual(await f.session.submit({message:'different'}),{ok:true,reference:'51'});assert.equal(sends,1);assert.equal(receipts,1);assert.equal(f.calls.tokens,1);assert.equal(f.session.pending,false);
});
test('submission: missing receipt retries exact original content and the same token',async()=>{
 let sends=0;const seen=[];const f=fixture({send:async(value,token)=>{seen.push({value:{...value},token});if(++sends===1)throw Error('offline');return {ok:true,status:200}}});
 await assert.rejects(f.session.submit({message:'original'}));await f.session.submit({message:'different'});
 assert.deepEqual(seen[0],seen[1]);assert.deepEqual(f.calls.recovered,['token-1']);
});
test('submission: unavailable receipt keeps the original operation locked',async()=>{
 let sends=0;const f=fixture({send:async()=>{sends++;throw Error('offline')},recover:async()=>{throw Error('receipt unavailable')}});
 await assert.rejects(f.session.submit({message:'one'}));await assert.rejects(f.session.submit({message:'two'}));assert.equal(sends,1);assert.equal(f.session.pending,true);assert.equal(f.calls.tokens,1);
});
test('submission: server 503 is an unknown outcome, not permission to make a new operation',async()=>{
 const f=fixture({send:async()=>({ok:false,status:503,code:'UNAVAILABLE'})});await f.session.submit({message:'one'});assert.equal(f.session.pending,true);
});
test('submission: validation errors allow editing without a false saved status',async()=>{
 const seen=[];const f=fixture({send:async(value)=>{seen.push({...value});return {ok:false,status:422,code:'VALIDATION'}}});
 await f.session.submit({message:'one'});assert.equal(f.session.pending,false);await f.session.submit({message:'two'});assert.equal(seen[1].message,'two');
});
test('submission: cancelled challenge has not sent a POST; editing remains possible',async()=>{
 const seen=[];const f=fixture({send:async(value)=>{seen.push({...value});if(seen.length===1)throw new RequestNotSentError();return {ok:true,status:200}}});
 await assert.rejects(f.session.submit({message:'one'}));assert.equal(f.session.pending,false);await f.session.submit({message:'two'});assert.equal(seen[1].message,'two');assert.equal(f.calls.recovered.length,0);
});
test('submission: token fetch failure does not retain stale input',async()=>{
 let attempts=0;const f=fixture({token:async()=>{if(++attempts===1)throw Error('offline');return 'valid'}});
 await assert.rejects(f.session.submit({message:'one'}));assert.equal(f.session.pending,false);await f.session.submit({message:'two'});assert.equal(f.calls.sent[0].value.message,'two');
});
test('submission: invalid initial token gets replaced, but never on an uncertain write',async()=>{
 let attempts=0;const f=fixture({send:async()=>++attempts===1?{ok:false,status:403,code:'TOKEN_INVALID'}:{ok:true,status:200}});
 await f.session.submit({message:'one'});assert.equal(f.session.pending,false);await f.session.submit({message:'two'});assert.equal(f.calls.tokens,2);
 const g=fixture({send:async()=>{throw Error('offline')}});await assert.rejects(g.session.submit({message:'one'}));g.io.send=async()=>({ok:false,status:403,code:'TOKEN_EXPIRED'});await g.session.submit({message:'two'});assert.equal(g.session.pending,true);assert.equal(g.calls.tokens,1);
});
test('submission: completed operation releases state; next operation obtains a new token',async()=>{
 const f=fixture();await f.session.submit({message:'one'});await f.session.submit({message:'two'});assert.deepEqual(f.calls.sent.map(v=>v.token),['token-1','token-2']);assert.equal(f.calls.sent[1].value.message,'two');
});

test('submission: negative retry cannot prove the earlier timed-out request did not commit',async()=>{
 for(const status of [400,403,413,422,429]){
  const f=fixture({send:async()=>{throw Error('response lost')}});await assert.rejects(f.session.submit({message:'original'}));
  f.io.send=async()=>({ok:false,status,code:'VALIDATION'});await f.session.submit({message:'different'});assert.equal(f.session.pending,true);assert.equal(f.calls.tokens,1);
 }
});
