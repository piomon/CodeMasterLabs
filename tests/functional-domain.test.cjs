const {test} = require('node:test');
const assert = require('node:assert/strict');
const {loader} = require('./helpers/load-ts.cjs');
const load = loader();
const dates = load('src/lib/civil-date.ts');
const plans = load('src/lib/showcase-validation.ts');
const lead = load('src/lib/lead-validation.ts');
const review = load('src/lib/review-validation.ts');
const {languagePaths} = load('src/lib/i18n.ts');
const demo = load('src/lib/demo-state.ts');
const estate = load('src/lib/estate-state.ts');

test('civil dates: strict calendar validation and leap-century rules', () => {
  for (const d of ['2026-09-29','2028-02-29','2000-02-29','9999-12-31']) assert.equal(dates.isCivilDate(d), true, d);
  for (const d of ['2026-02-29','1900-02-29','2026-02-31','2026-04-31','2026-13-01','2026-00-01','2026-01-00','2026-9-1','2026-01-01T00:00Z','invalid',null,1,{},'0000-01-01']) assert.equal(dates.isCivilDate(d), false, String(d));
});
test('civil dates: nights are independent of daylight-saving transitions', () => {
  assert.equal(dates.calendarDays('2026-03-28','2026-03-30'),2);
  assert.equal(dates.calendarDays('2026-10-24','2026-10-26'),2);
  assert.equal(dates.calendarDays('2028-02-28','2028-03-01'),2);
  assert.ok(Number.isNaN(dates.calendarDays('2026-02-31','2026-03-02')));
});
test('civil dates: corrupted values never crash Intl rendering', () => {
  for (const v of [null,'bad',{},'2026-13-03']) assert.equal(dates.formatCivilDate(v,'pl'),'\u2014');
  assert.match(dates.formatCivilDate('2026-09-29','en'),/29.*September.*2026/);
});
const stay = {arrival:'2026-10-01',departure:'2026-10-04',suite:'garden',guests:2,nights:999,rate:-10,total:1};
test('hotel restore: recalculate prices, duration and omit unknown stored fields', () => {
  assert.deepEqual(plans.parseStayPlan(JSON.stringify({...stay,extra:'not retained'})), {...stay,nights:3,rate:185,total:555});
});
test('hotel restore: malformed dates, impossible occupancy and excessive duration rejected', () => {
  for(const patch of [{arrival:'bad'},{departure:'2026-02-31'},{departure:'2026-10-01'},{departure:'2026-11-01'},{guests:3},{guests:0},{guests:'2'},{suite:'__proto__'}]) assert.equal(plans.parseStayPlan(JSON.stringify({...stay,...patch})),null,JSON.stringify(patch));
  for(const raw of [null,'{','[]','null','x'.repeat(5000)]) assert.equal(plans.parseStayPlan(raw),null);
});
test('journey restore: invalid date cannot reach render; pricing comes from catalogue', () => {
  const catalog = [{id:'alps',price:100}];
  const input = {journeyId:'alps',date:'2026-10-01',travelers:3,total:-900};
  assert.equal(plans.parseJourneyPlan(JSON.stringify(input),catalog).total,300);
  for(const patch of [{date:'banana'},{date:99},{date:'2026-02-31'},{travelers:9},{travelers:1.5},{journeyId:'toString'}]) assert.equal(plans.parseJourneyPlan(JSON.stringify({...input,...patch}),catalog),null);
});
test('brief steps and final form reject exactly the same invalid email', () => {
  const input = {name:'Ada',email:'a@b.c',message:'A sufficiently long project description.',topic:'system',privacyAccepted:true,locale:'en'};
  assert.equal(lead.validateLeadField('email',input.email,'en'),lead.validateLead(input).errors.email);
  for(const email of ['a@b..com','a@b.com.','a@b.c','a\r\n@b.com']) assert.equal(typeof lead.validateLeadField('email',email,'en'),'string');
  assert.equal(lead.validateLeadField('email','ada+project@example.com','en'),undefined);
});
test('lead validation: control characters, size boundaries and unsupported source/locale', () => {
  const input={name:'Ada',email:'ada@example.test',message:'A sufficiently long project description.',topic:'system',privacyAccepted:true};
  assert.equal(lead.validateLead(input).ok,true);
  for(const field of ['name','company','timeline','budget']) assert.equal(lead.validateLead({...input,[field]:'line1\nline2'}).ok,false);
  assert.equal(lead.validateLead({...input,message:'A long description\nwith a new paragraph.'}).ok,true);
  assert.equal(lead.validateLead({...input,source:'admin'}).ok,false);
  assert.equal(lead.validateLead({...input,locale:'de'}).ok,false);
  for(const [field,max] of Object.entries(lead.LEAD_LIMITS)) assert.equal(typeof lead.validateLeadField(field,'x'.repeat(max+1)),'string');
});
test('reviews: one shared validation for server and UI, consent must be boolean true', () => {
  const input={name:' Ada ',quote:' A long, honest review of a completed project. ',rating:5,consent:true,locale:'en'};
  const valid=review.validateReview(input); assert.equal(valid.ok,true); assert.equal(valid.data.name,'Ada');
  for(const patch of [{rating:6},{rating:2.5},{rating:'5'},{consent:'true'},{quote:'short'},{name:'A\nB'},{locale:'de'}]) assert.equal(review.validateReview({...input,...patch}).ok,false);
});
test('review API data: invalid ratings cannot throw String.repeat during rendering', () => {
  for(const value of [-1,6,Infinity,1.5,'5',{},null]) assert.equal(review.publicRating(value),null);
  for(const value of [1,2,3,4,5]) assert.equal(review.publicRating(value),value);
  assert.equal(review.reviewPage({reviews:[{id:1,name:'Ada',quote:'Good',rating:-3}],total:1,pages:1,page:1}).reviews[0].rating,null);
  for(const raw of [null,{}, {reviews:'oops',total:0,pages:1},{reviews:[],total:-1,pages:1},{reviews:[{}],total:1,pages:1}]) assert.equal(review.reviewPage(raw),null);
});
test('language routes: keep project/article slugs and all five functional demos', () => {
  for(const kind of ['operations','approval','commerce','client-portal','real-estate']) assert.deepEqual(languagePaths('/en/demos/'+kind),{pl:'/demos/'+kind,en:'/en/demos/'+kind});
  assert.deepEqual(languagePaths('/blog/first-note'),{pl:'/blog/first-note',en:'/en/blog/first-note'});
  assert.deepEqual(languagePaths('/en/projects/sample'),{pl:'/realizacje/sample',en:'/en/projects/sample'});
  assert.deepEqual(languagePaths('/showcase/en/maison'),{pl:'/showcase/pl/maison',en:'/showcase/en/maison'});
  assert.equal(languagePaths('/en/demos/not-an-app'),undefined);
});
test('demo storage: prototype property names are not valid IDs', () => {
  for(const id of ['__proto__','constructor','toString','', 'bad\nID']){
    const s=demo.initialDemo();s.products[0].id=id;
    assert.equal(demo.parseDemo(JSON.stringify(s)),null,id);
  }
});
test('demo reducers: unknown actions are no-ops; repeated approval is not a new audit event', () => {
  const s=demo.initialDemo();assert.equal(demo.demoReducer(s,{type:'unknown'}),s);assert.equal(demo.demoReducer(s,null),s);
  assert.equal(demo.demoReducer(s,{type:'task.add',id:'__proto__',title:'New task'}),s);
  const accepted=demo.demoReducer(s,{type:'portal.approve'});assert.equal(demo.demoReducer(accepted,{type:'portal.approve'}),accepted);
  assert.equal(demo.demoReducer(s,{type:'order.ship',id:'missing'}),s);
  const e=estate.initialEstate();assert.equal(estate.estateReducer(e,{type:'unknown',id:'A-01'}),e);assert.equal(estate.estateReducer(e,null),e);
});
test('commerce simulation: stock and cart invariants across 2000 deterministic actions', () => {
  let s=demo.initialDemo();let seed=123456;
  for(let n=0;n<2000;n++){
    seed=(1664525*seed+1013904223)>>>0;const p=s.products[seed%s.products.length];
    const action=n%13===0?{type:'order.create',id:'order-'+n}:n%17===0?{type:'stock.add',id:p.id}:{type:'cart.change',id:p.id,delta:(seed%7)-3};
    s=demo.demoReducer(s,action);
    assert.ok(s.products.every(p=>Number.isInteger(p.stock)&&p.stock>=0&&p.stock<=999));
    assert.ok(s.products.every(p=>(s.cart[p.id]||0)>=0&&(s.cart[p.id]||0)<=p.stock));
    assert.ok(Number.isSafeInteger(demo.cartSummary(s).total));
    assert.notEqual(demo.parseDemo(JSON.stringify(s)),null);
  }
});
