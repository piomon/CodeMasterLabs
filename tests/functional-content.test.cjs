const test=require('node:test'),assert=require('node:assert/strict');
const {loader}=require('./helpers/load-ts.cjs');
const {pageNumber,pagedPath}=loader()('src/lib/pagination.ts');
function contentFixture({total=0}={}){
 const calls=[];
 const cms={findGlobal:async options=>{calls.push(options);return options.slug==='seo'?{title:'CMS title',description:'CMS description',ogImage:{id:2,url:'/api/media/file/share.png'}}:{}},find:async options=>{calls.push(options);const page=options.page||1,limit=options.limit||10;return{docs:options.collection==='projects'?Array.from({length:Math.max(0,Math.min(limit,total-(page-1)*limit))},(_,i)=>({id:(page-1)*limit+i+1,slug:'project-'+i,title:'Synthetic project',featured:true})):[],totalDocs:total,totalPages:Math.ceil(total/limit)}}};
 const load=loader({'server-only':{},react:{cache:fn=>fn},payload:{getPayload:async()=>cms},'@payload-config':{}});
 return {api:load('src/lib/site-data.ts'),calls};
}
test('pagination: invalid and repeated query values cannot become offsets',()=>{
 for(const value of [undefined,null,[],['2'],{},NaN,Infinity,-1,0,1.2,'1e3','1.5','-4','0002','<script>','1 OR 1=1'])assert.equal(pageNumber(value),1);
 assert.equal(pageNumber('2'),2);assert.equal(pageNumber(9999999),100000);assert.equal(pagedPath('/blog',1),'/blog');assert.equal(pagedPath('/en/blog',2),'/en/blog?page=2');
});
test('CMS query contract: page beyond document 100 is actually reachable',async()=>{
 const f=contentFixture({total:150}),result=await f.api.getProjectPage('en',10);assert.equal(result.docs[0].id,109);assert.equal(result.docs.length,12);assert.equal(result.page,10);assert.equal(result.totalPages,13);
 assert.equal(f.calls[0].overrideAccess,false);assert.equal(f.calls[0].locale,'en');assert.equal(f.calls[0].depth,1);
});
test('CMS query contract: out-of-range page clamps to real last page',async()=>{
 const f=contentFixture({total:25}),r=await f.api.getProjectPage('pl',9999);assert.equal(r.page,3);assert.equal(r.docs.length,1);assert.deepEqual(f.calls.map(x=>x.page),[9999,3]);
});
test('CMS query contract: empty list has a valid first page',async()=>{
 const f=contentFixture(),r=await f.api.getProjectPage('pl',2);assert.deepEqual(r,{docs:[],page:1,totalPages:1,totalDocs:0});
});
test('CMS query contract: all public data calls explicitly preserve ACL checks',async()=>{
 const f=contentFixture();await f.api.getSiteData('pl');assert.ok(f.calls.length>10);assert.ok(f.calls.every(c=>c.overrideAccess===false));
});
test('CMS query contract: featured filtering occurs before result limit',async()=>{
 const f=contentFixture();await f.api.getSiteData('en');const q=f.calls.find(c=>c.collection==='projects');assert.deepEqual(q.where,{featured:{equals:true}});assert.equal(q.limit,12);
});
test('CMS query contract: missing collections never fall back to published demo records',async()=>{
 const f=contentFixture(),data=await f.api.getSiteData('en');assert.deepEqual(data.projects,[]);assert.deepEqual(data.services,[]);assert.deepEqual(data.articles,[]);
 assert.equal(data.settings.seoTitle,'CMS title');assert.equal(data.settings.seoDescription,'CMS description');assert.equal(data.settings.seoImage.url,'/api/media/file/share.png');
});
test('metadata: page canonical and language alternates preserve pagination',()=>{
 process.env.SERVER_URL='https://codemasterlabs.pl';const {pageMetadata}=loader()('src/lib/metadata.ts');
 const m=pageMetadata('Title','Description','/en/blog?page=2','en');assert.equal(m.alternates.canonical,'https://codemasterlabs.pl/en/blog?page=2');assert.equal(m.alternates.languages.pl,'https://codemasterlabs.pl/blog?page=2');
});
test('metadata: own uploaded image is used; untrusted remote URL falls back',()=>{
 process.env.SERVER_URL='https://codemasterlabs.pl';const {pageMetadata}=loader()('src/lib/metadata.ts');
 for(const url of ['/api/media/file/share.png','https://codemasterlabs.pl/api/media/file/share.png'])assert.equal(pageMetadata('T','D','/','pl',{id:1,url}).openGraph.images[0].url,'https://codemasterlabs.pl/api/media/file/share.png');
 for(const url of ['javascript:alert(1)','data:text/html,x','https://remote.invalid/a.png','//remote.invalid/a.png'])assert.equal(pageMetadata('T','D','/','pl',{id:1,url}).openGraph.images[0].url,'/og-codemaster.png');
});
test('demo: no-op interactions preserve state and cannot create fake audit changes',()=>{
 const {demoReducer,initialDemo}=loader()('src/lib/demo-state.ts');const state=initialDemo('en');
 for(const action of [{type:'cart.change',id:'p1',delta:0},{type:'cart.change',id:'p1',delta:-2},{type:'task.status',id:state.tasks[0].id,status:state.tasks[0].status},{type:'stock.add',id:'missing'},{type:'order.ship',id:'missing'}])assert.equal(demoReducer(state,action),state);
});
test('CMS preview: global preview URLs do not become a false 404',()=>{
 const {previewTarget,previewURL}=loader()('src/lib/preview-target.ts');
 assert.deepEqual(previewTarget({}),{kind:'home',locale:'pl'});
 assert.deepEqual(previewTarget({collection:'',id:'1',locale:'en'}),{kind:'home',locale:'en'});
 assert.equal(previewURL(undefined,1,'en'),'/preview?locale=en');
});
test('CMS preview: malformed, repeated or excessive document IDs are rejected',()=>{
 const {previewTarget}=loader()('src/lib/preview-target.ts');
 for(const id of ['',undefined,'0','-1','01','1.2','1e2','9007199254740992',['1'],{},'1 OR 1=1'])assert.equal(previewTarget({collection:'projects',id}),null);
 for(const collection of ['leads','users','private-files',['projects']])assert.equal(previewTarget({collection,id:'1'}),null);
});
test('CMS preview: valid collection targets preserve identity and locale',()=>{
 const {previewTarget,previewURL}=loader()('src/lib/preview-target.ts');
 assert.deepEqual(previewTarget({collection:'projects',id:'42',locale:'en'}),{kind:'project',id:42,locale:'en'});
 assert.deepEqual(previewTarget({collection:'blog-posts',id:'42'}),{kind:'article',id:42,locale:'pl'});
 assert.equal(previewURL('projects',42,'en'),'/preview?collection=projects&id=42&locale=en');
 assert.equal(previewURL('users',1,'en'),null);assert.equal(previewURL('projects',undefined,'en'),null);
});
