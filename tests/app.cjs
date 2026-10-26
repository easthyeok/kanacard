const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map(),storage=new Map(),timers=[];
function element(){return{dataset:{},disabled:false,innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){},contains(){return true}},setAttribute(){},querySelector(){return null},querySelectorAll(){return[]},focus(){}}}
const document={activeElement:null,getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelectorAll(){return[]},addEventListener(){}};
const ctx={setTimeout:fn=>{timers.push(fn);return timers.length},document,console,SpeechSynthesisUtterance:function(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const name of ['lessons.js','portraits.js','gear-config.js','gear.js','gear-view.js','world-config.js','core.js','content-config.js','world.js','world-view.js','world-art.js','monsters.js','combat-actor.js','word-effects.js','app.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8'),ctx,{filename:name});
assert(elements.get('screen').innerHTML.includes('새 탐험 시작'));
vm.runInContext(`
for(stage=0;stage<5;stage++){
 run=G.createRun('mage',stage,46,3);menu=false;G.enter(run,'battle');render();
 for(let n=0;n<60;n++){
  const q=makeQuestion();if(new Set(q.choices).size!==4||!q.choices.includes(q.answer))throw Error('invalid question');
 }
 run.hand=['strike'];G.selectCard(run,0,makeQuestion());render();const q=run.pending.question;answer(q.choices.indexOf(q.answer));if(run.phase!=='feedback'||!run.pending.result.ok)throw Error('answer flow');G.continueAfterCard(run);if(run.phase==='enemy')G.endTurn(run);persist();render();
}
for(const range of [5,15,46])for(const length of [2,3,4]){stage=0;run=G.createRun('mage',stage,range,length);const seen=Array.from({length:range},nextKana);if(new Set(seen).size!==range)throw Error('coverage');for(let i=0;i<100;i++){const q=makeQuestion();if(q.keys.length!==length||new Set(q.choices).size!==4)throw Error('kana question')}}
`,ctx);
assert(storage.has('kotoba-run-v2'));
console.log('PASS: real script load order, setup/combat/feedback rendering, 5 chapters, 900 kana questions, full kana coverage, persistence');
const restored={...ctx,window:null,globalThis:null};restored.window=restored;restored.globalThis=restored;vm.createContext(restored);
for(const name of ['lessons.js','portraits.js','gear-config.js','gear.js','gear-view.js','world-config.js','core.js','content-config.js','world.js','world-view.js','world-art.js','monsters.js','combat-actor.js','word-effects.js','app.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8'),restored,{filename:name});
assert(elements.get('screen').innerHTML.includes('저장한 탐험 계속'));
vm.runInContext(`menu=false;stage=run.lesson;G.enter(run,'battle');run.hand=['strike'];G.selectCard(run,0,makeQuestion());persist();`,restored);
const reload={document,console,localStorage:ctx.localStorage};reload.window=reload;reload.globalThis=reload;vm.createContext(reload);
for(const name of ['lessons.js','portraits.js','gear-config.js','gear.js','gear-view.js','world-config.js','core.js','content-config.js','world.js','world-view.js','world-art.js','monsters.js','combat-actor.js','word-effects.js','app.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8'),reload,{filename:name});
vm.runInContext(`menu=false;render();if(run.phase!=='question'||modalKind!=='question')throw Error('question restore');answer(run.pending.question.choices.indexOf(run.pending.question.answer));if(run.phase!=='feedback')throw Error('restored answer');`,reload);
console.log('PASS: reload saved run, restore pending question and answer');

// Exercise animation lifecycle without real timers or a browser.
vm.runInContext(`
 menu=false;stage=0;run=G.createRun('mage',0,5,2);G.enter(run,'battle');
 run.hand=['strike'];run.enemy.hp=1;G.selectCard(run,0,makeQuestion());
 answer(run.pending.question.choices.indexOf(run.pending.question.answer));continueCard();
 if(!battleFx?.kill||run.phase!=='feedback'||modalKind!==null)throw Error('kill animation missing');
 if(!document.getElementById('screen').innerHTML.includes('fx-slash'))throw Error('effect markup missing');
 const energy=run.energy;enemyTurn();continueCard();if(run.energy!==energy)throw Error('animation input lock');
`,ctx);
assert.equal(timers.length,1);timers.shift()();
vm.runInContext(`
 if(battleFx||run.phase!=='reward')throw Error('kill transition');
 run=G.createRun('mage',0,5,2);G.enter(run,'battle');run.block=99;
 enemyTurn();if(battleFx.kind!=='parry'||run.turn!==2)throw Error('blocked attack animation');
`,ctx);
timers.shift()();
vm.runInContext(`
 run.hp=1;run.block=0;run.enemy.intent={type:'heavy',value:99};enemyTurn();
 if(run.phase!=='defeated'||battleFx.kind!=='enemy-hit'||!document.getElementById('screen').innerHTML.includes('battlefield'))throw Error('lethal hit animation');
`,ctx);
timers.shift()();
vm.runInContext(`if(battleFx||!document.getElementById('screen').innerHTML.includes('다음 탐험을 위한 한 걸음'))throw Error('defeat transition')`,ctx);
console.log('PASS: combat effects, duplicate input lock, kill/reward transition, full block and lethal enemy attack');
vm.runInContext(`
 menu=false;run=G.createRun('fox',0,5,2);G.enter(run,'battle');run.hand=['strike'];
 G.selectCard(run,0,makeQuestion());const xpBefore=growthProfile.fox||0;
 answer(run.pending.question.choices.indexOf(run.pending.question.answer));
 if(growthProfile.fox!==xpBefore+10)throw Error('XP award');
 answer(0);if(growthProfile.fox!==xpBefore+10)throw Error('duplicate XP');
 if(JSON.parse(localStorage.getItem('kotoba-growth-v1')).fox!==growthProfile.fox)throw Error('XP save');
 selectedHero='fox';if(!growthPanel().includes('경험치'))throw Error('growth UI');
`,ctx);
console.log('PASS: XP awarded once per answer, permanent profile saved, growth panel rendering');
vm.runInContext(`
 const measured={};document.querySelector=selector=>({
 '.battlefield':{getBoundingClientRect:()=>({left:10}),style:{setProperty:(k,v)=>measured[k]=v}},
 '.hero-actor':{getBoundingClientRect:()=>({right:210})},
 '.enemy-unit svg':{getBoundingClientRect:()=>({left:510,top:100,width:160,height:170})}
 })[selector];
 positionBattleFx();
 if(measured['--dash-distance']!=='338px'||measured['--impact-x']!=='580px')throw Error('contact geometry');
 delete document.querySelector;
 render();if(!document.getElementById('screen').innerHTML.includes('fighter-rig'))throw Error('attack pose missing');
`,ctx);
console.log('PASS: measured dash/contact coordinates and attack pose rendering');
vm.runInContext(`
 collection={strike:true,guard:true,focus:true};run=G.createRun('fox',0,5,2);run.phase='reward';run.rewards=['thunder','moon','meteor'];
 if(!card('thunder',0,true).includes('NEW'))throw Error('discovery badge');
 G.takeReward(run,'thunder');persist();
 if(!collection.thunder||!JSON.parse(localStorage.getItem('kotoba-collection-v1')).thunder)throw Error('collection persistence');
 collectionFilter='owned';showCollection();if(!document.getElementById('modal-body').innerHTML.includes('벼락의 한마디'))throw Error('owned filter');
 collectionFilter='rare';showCollection();if(!document.getElementById('modal-body').innerHTML.includes('미발견 카드'))throw Error('locked entries');
 keepsake='thunder';selectedHero='fox';start();if(run.deck[0]!=='thunder'||run.deck.length!==10)throw Error('keepsake starter replacement');
 keepsake=null;collectionFilter='all';modalKind=null;
`,ctx);
console.log('PASS: collection badges, persisted discoveries, filters, locked cards and starter selection');
vm.runInContext(`for(const h of G.HEROES){const svg=window.combatActor(h);for(const joint of ['rig-torso','rig-arm','rig-wrist','rig-head','rig-leg','rig-cape','rig-weapon'])if(!svg.includes(joint))throw Error('missing joint '+joint)}`,ctx);
console.log('PASS: all four characters render separate animated body joints and weapons');
ctx.finishEffect=()=>{timers.shift()();if(timers.length)timers.shift()()};
vm.runInContext(`
 for(const hero of G.HEROES){const rig=window.combatActor(hero);if(rig.includes('pose-strike')||rig.includes('pose-windup'))throw Error('legacy hidden pose class')}
 if(learnedWord({speech:'あ、い、う',prompt:'unused'})!=='あいう')throw Error('kana projectile text');
 if(learnedWord({speech:'こんにちは',prompt:'어떻게 말할까요?'})!=='こんにちは')throw Error('expression projectile text');
 for(const ok of [true,false]){
  menu=false;stage=0;run=G.createRun('mage',0,5,2);G.enter(run,'battle');run.hand=['strike'];
  G.selectCard(run,0,{prompt:'水',speech:'水',answer:'물',choices:['물','불']});
  answer(ok?0:1);continueCard();
  if((battleFx.word==='水')!==ok)throw Error('correct-answer projectile');
  if(fxMarkup().includes('word-volley')!==ok)throw Error('projectile rendering');
  finishEffect();
 }
`,ctx);

console.log('PASS: visible rig without hidden pose classes, learned kana/expressions and correct-only word projectiles');

vm.runInContext(`
const volley=wordProjectile('あ・い・う');if((volley.match(/class="letter-shot"/g)||[]).length!==1)throw Error('whole reading');
if(!volley.includes('--shot:0')||!volley.includes('letter-impact'))throw Error('staggered impacts');
const long=wordProjectile('ありがとうございます。よろしくお願いします。');if((long.match(/class="letter-shot"/g)||[]).length>12)throw Error('bounded volley');
`,ctx);
console.log('PASS: individual glyph volley, staggered contacts and bounded long expressions');
vm.runInContext(`
 const flights=[];const shots=Array.from({length:3},()=>({style:{},animate:(frames,options)=>flights.push({frames,options})}));
 const actor={getBoundingClientRect:()=>({left:100,width:100})},target={getBoundingClientRect:()=>({left:600,top:100,width:100,height:100})};
 const layer={querySelectorAll:()=>shots};const field={getBoundingClientRect:()=>({left:0,top:0}),querySelector:s=>s==='.word-volley'?layer:s==='.hero-actor'?actor:target};
 document.querySelector=()=>field;battleFx={word:'あいう'};animateWordVolley();
 if(flights.length!==3||flights[0].options.duration!==650||flights[2].options.delay!==170)throw Error('native glyph animation timing');
 if(!flights[0].frames[3].transform.includes('478px'))throw Error('native glyph destination');
 battleFx=null;delete document.querySelector;
`,ctx);
console.log('PASS: native per-letter animations travel to measured enemy position with staggered timing');
vm.runInContext(`
 if(KanaLessons.korean.length!==46||KanaLessons.korean[KanaLessons.roma.indexOf('nu')]!=='누')throw Error('Korean reading table');
 for(stage=0;stage<2;stage++){run=G.createRun('mage',stage,46,3);for(let n=0;n<100;n++){const q=makeQuestion();if(/[a-z]/i.test(q.answer+q.choices.join('')+q.explain))throw Error('romanization remains');if(new Set(q.choices).size!==4)throw Error('duplicate Korean choices')}}
 const modes=[];document.body={classList:{toggle:(name,active)=>modes.push(active)}};
 menu=false;run=G.createRun('mage',0,5,2);G.enter(run,'battle');render();if(!modes.at(-1))throw Error('battle viewport missing');
 menu=true;render();if(modes.at(-1))throw Error('setup still in battle viewport');delete document.body;
`,ctx);
console.log('PASS: Korean kana readings and unique choices, viewport mode on combat and off in menu');
vm.runInContext(`
 menu=false;stage=0;run=G.createRun('mage',0,5,2);G.enter(run,'battle');run.notice='적의 공격! 체력 6 감소';render();
 if(!document.getElementById('screen').innerHTML.includes('적의 공격! 체력 6 감소'))throw Error('battle notice missing');
 run.hand=['strike'];G.selectCard(run,0,makeQuestion());render();
 if(document.getElementById('screen').innerHTML.includes('적의 공격! 체력 6 감소')||run.notice!=='')throw Error('notice obscures quiz');
 G.cancelQuestion(run);modalKind=null;render();if(document.getElementById('screen').innerHTML.includes('적의 공격! 체력 6 감소'))throw Error('stale notice returned');
`,ctx);
console.log('PASS: battle notice removed when quiz opens and does not return afterward');
vm.runInContext(`
 menu=false;modalKind=null;run=G.createRun('mage',0,5,2);G.enter(run,'battle');run.hand=['strike'];
 const hpBefore=run.hp;G.selectCard(run,0,{answer:'ok',speech:'あ',prompt:'あ',choices:['ok','no']});answer(0);continueCard();
 if(run.turn!==1||run.energy!==0||!battleFx.word)throw Error('single action attack');
`,ctx);
timers.shift()();
vm.runInContext(`if(run.turn!==2||!battleFx||run.hp!==run.maxHp-6)throw Error('automatic enemy turn')`,ctx);
timers.shift()();
vm.runInContext(`if(battleFx||run.phase!=='combat'||run.energy!==1)throw Error('new player turn');for(const skin of ['slime','mushroom','snail','stump','mushmom','balrog','pinkbean'])if(!drawKanaMonster({skin}).includes('monster-'+skin))throw Error('monster rendering')`,ctx);
console.log('PASS: player animation → one enemy action → next player turn, all seven monster illustrations');
vm.runInContext(`
 for(const portrait of [true,false]){window.matchMedia=()=>({matches:portrait});menu=false;modalKind=null;run=G.createRun('mage',0,5,2);G.enter(run,'battle');run.hand=['strike'];chooseCard(0);if(run.phase!=='question')throw Error('direct card selection');G.cancelQuestion(run)}delete window.matchMedia;
`,ctx);
console.log('PASS: restored direct card selection in portrait and landscape');
vm.runInContext(`
 function worldFixture(kind){menu=false;modalKind=null;run=G.createExpedition('knight',0,46,3,123);W.beginRegion(run);const n=run.world.map.flat().find(n=>n.kind===kind);if(n.row){const prev=run.world.map[n.row-1].find(p=>p.next.includes(n.id));run.world.current=prev.id;run.world.step=n.row;run.floor=n.row}G.enter(run,n.id);render()}
 for(const [kind,text] of [['shop','황혼 상인'],['rest','모닥불 곁에서'],['event','지역의 특별한 만남'],['treasure','보물 열기'],['challenge','기억의 시험']]){worldFixture(kind);if(!document.getElementById('screen').innerHTML.includes(text))throw Error('missing world scene '+kind)}
 const q=run.challenge.question,oldCorrect=stats.correct,oldTotal=run.total;answerChallenge(q.choices.indexOf(q.answer));if(stats.correct!==oldCorrect+1||run.total!==oldTotal+1)throw Error('challenge learning stats');answerChallenge(0);if(run.total!==oldTotal+1)throw Error('duplicate challenge');
 persist();
`,ctx);
const worldReload={document,console,setTimeout:ctx.setTimeout,localStorage:ctx.localStorage};worldReload.window=worldReload;worldReload.globalThis=worldReload;vm.createContext(worldReload);
for(const name of ['lessons.js','portraits.js','gear-config.js','gear.js','gear-view.js','world-config.js','core.js','content-config.js','world.js','world-view.js','world-art.js','monsters.js','combat-actor.js','word-effects.js','app.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8'),worldReload,{filename:name});
vm.runInContext(`menu=false;render();if(run.version!==3||run.phase!=='challenge'||!run.challenge.result.ok)throw Error('challenge save restore');worldAction('challenge-next');if(run.challenge.result||!run.challenge.question)throw Error('next challenge question');menu=true;start();if(run.version!==3||run.phase!=='region-intro')throw Error('new expedition');worldAction('begin');if(!document.getElementById('screen').innerHTML.includes('branch-map'))throw Error('branch map UI');G.enter(run,G.route(run)[0]);render();if(!document.getElementById('screen').innerHTML.includes('region-sky'))throw Error('regional backdrop');`,worldReload);
console.log('PASS: five expedition scenes, challenge learning/persistence, v3 reload, region entry, branching map and regional battle background');
vm.runInContext(`
 menu=true;modalKind=null;selectedHero='knight';gearHero='knight';
 const item=Q.add(gearProfile,{slot:'armor',grade:'rare',region:0,level:0,roll:3,options:{}});Q.equip(gearProfile,'knight',item.id);start();const initialMax=run.maxHp;persist();
 const weapon=Q.add(gearProfile,{slot:'weapon',grade:'rare',region:4,level:0,roll:3,options:{}});Q.equip(gearProfile,'knight',weapon.id);Q.apply(run,gearProfile);persist();
 showGear();if(!document.getElementById('modal-body').innerHTML.includes('장비와 인벤토리'))throw Error('gear inventory UI');showGearItem(weapon.id);if(!document.getElementById('modal-body').innerHTML.includes('교체 후'))throw Error('gear comparison UI');
 modalKind=null;run.phase='map';G.enter(run,G.route(run)[0]);run.enemy.hp=1;run.hand=['strike'];G.selectCard(run,0,{answer:'ok',speech:'あ',prompt:'あ',choices:['ok','no']});answer(0);persist();
 const saved=JSON.parse(localStorage.getItem('kanacard-save-v4'));if(!saved.gear||!saved.run.gearStats||saved.run.phase!=='feedback')throw Error('atomic gear/run save');
 const materials=gearProfile.materials;collectGearLoot();if(gearProfile.materials!==materials)throw Error('duplicate loot collect');
 if(!window.combatActor(G.HEROES[3],run.gearVisual).includes('equipped-weapon'))throw Error('equipped weapon SVG');
`,ctx);
const gearReload={document,console,setTimeout:ctx.setTimeout,localStorage:ctx.localStorage};gearReload.window=gearReload;gearReload.globalThis=gearReload;vm.createContext(gearReload);
for(const name of ['lessons.js','portraits.js','gear-config.js','gear.js','gear-view.js','world-config.js','core.js','content-config.js','world.js','world-view.js','world-art.js','monsters.js','combat-actor.js','word-effects.js','app.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8'),gearReload,{filename:name});
vm.runInContext(`const before=run.maxHp,m=gearProfile.materials;Q.apply(run,gearProfile);if(run.maxHp!==before)throw Error('HP duplicated on reload');if(run.phase!=='feedback'||!run.pending.result.ok)throw Error('gear battle feedback restore');collectGearLoot();if(gearProfile.materials!==m)throw Error('loot repeated on reload');G.continueAfterCard(run);persist();if(gearProfile.materials!==m)throw Error('reward repeated loot');`,gearReload);
console.log('PASS: inventory/detail UI, equip visuals, unified equipment/run save, feedback reload, no duplicated HP or loot');
const validEnvelope=storage.get('kanacard-save-v4'),backupEnvelope=JSON.parse(storage.get('kanacard-save-v4-backup'));storage.set('kanacard-save-v4','{broken-json');
const backupReload={document,console,setTimeout:ctx.setTimeout,localStorage:ctx.localStorage};backupReload.window=backupReload;backupReload.globalThis=backupReload;vm.createContext(backupReload);
for(const name of ['lessons.js','portraits.js','gear-config.js','gear.js','gear-view.js','world-config.js','core.js','content-config.js','world.js','world-view.js','world-art.js','monsters.js','combat-actor.js','word-effects.js','app.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',name),'utf8'),backupReload,{filename:name});
assert.equal(vm.runInContext('run.phase',backupReload),backupEnvelope.run.phase);assert.equal(vm.runInContext('gearProfile.items.length',backupReload),backupEnvelope.gear.items.length);storage.set('kanacard-save-v4',validEnvelope);
vm.runInContext(`const mirrorBefore=localStorage.getItem('kotoba-run-v2'),canonicalBefore=localStorage.getItem('kanacard-save-v4'),oldSet=localStorage.setItem;localStorage.setItem=(key,value)=>{if(key==='kanacard-save-v4')throw Error('quota');oldSet(key,value)};persist();localStorage.setItem=oldSet;if(localStorage.getItem('kotoba-run-v2')!==mirrorBefore||localStorage.getItem('kanacard-save-v4')!==canonicalBefore)throw Error('partial save after quota failure')`,gearReload);
console.log('PASS: corrupted primary save restores equipment/run backup and failed canonical write leaves previous saves intact');

vm.runInContext(`
for(stage=5;stage<=6;stage++)for(const difficulty of ['normal','hard','master']){
 run=G.createRun('mage',stage,46,6);run.difficulty=difficulty;
 for(let n=0;n<150;n++){const q=makeQuestion();if(q.choices.length!==4||new Set(q.choices).size!==q.choices.length||!q.choices.includes(q.answer))throw Error('mixed choices');if(!q.keys.some(k=>k.startsWith('0-'))||!q.keys.some(k=>k.startsWith('1-')))throw Error('both scripts required');if(/[・、]/.test(q.speech))throw Error('speech pauses');}
}
recordRecall({keys:['0-0','0-0']},false);if(stats.recall['0-0'].streak!==0)throw Error('reset mastery');
for(let n=0;n<5;n++)recordRecall({keys:['0-0']},true);if(stats.recall['0-0'].streak!==5)throw Error('mastery streak');
if(KanaLessons.extendedHira.length!==104||KanaLessons.extendedKorean.length!==104)throw Error('extended table');
`,ctx);
console.log('PASS: 900 mixed/extended questions, difficulty choice counts, both scripts, continuous speech and mastery reset');

ctx.speechSynthesis={cancel(){},speak(u){ctx.spoken=(ctx.spoken||[]).concat(u.text)}};
ctx.SpeechSynthesisUtterance=function(text){this.text=text};
vm.runInContext(`
menu=false;stage=5;run=G.createRun('mage',5,46,3);G.enter(run,'battle');run.hand=['strike'];
G.selectCard(run,0,makeQuestion());answer(run.pending.question.choices.indexOf(run.pending.question.answer));
if(window.spoken?.length)throw Error('attack speech too early');
const spell=run.pending.question.speech;continueCard();if(window.spoken.at(-1)!==spell)throw Error('attack speech missing');
`,ctx);
console.log('PASS: continuous pronunciation begins with attack, not answer feedback');

vm.runInContext(`
menu=true;stage=0;run=null;header();
const stageButtons=document.getElementById('stages').innerHTML;
if((stageButtons.match(/data-stage=/g)||[]).length!==4||/data-stage="(?:1|5|6)"/.test(stageButtons))throw Error('duplicate kana stages');
if(setup().includes('id="range"')||!setup().includes('value="1"'))throw Error('unified setup');
for(stage of [0,1,5,6]){
 run=G.createRun('mage',stage,5,1);
 const pool=kanaPool();if(pool.length!==208||!pool.some(c=>c.glyph==='ぱ')||!pool.some(c=>c.glyph==='パ'))throw Error('full pool');
 run.studyBag=pool.map(c=>c.key);const seen=new Set();
 for(let i=0;i<208;i++){const q=makeQuestion();if(q.reverse||q.prompt!==q.speech||q.keys.length!==1)throw Error('reading direction');q.keys.forEach(k=>seen.add(k));}
 // Missed items may be reinserted; verify exact bag coverage without review records.
 stats.recall={};run.studyBag=pool.map(c=>c.key);seen.clear();
 for(let i=0;i<208;i++)makeQuestion().keys.forEach(k=>seen.add(k));
 if(seen.size!==208)throw Error('single character coverage');
 run.length=6;for(let i=0;i<50;i++){const q=makeQuestion();if(!q.keys.some(k=>k.startsWith('0-'))||!q.keys.some(k=>k.startsWith('1-')))throw Error('mixed script reading');}
}
`,ctx);
console.log('PASS: single kana stage, full 208-item pool, one-character coverage, reading-only prompts and mixed bundles');

// Use a controlled clock so deadline boundaries do not depend on machine speed.
ctx.Date={now:()=>100000};
vm.runInContext(`
menu=false;stage=0;battleFx=null;modalKind=null;stats.recall={};
function timedFixture(){run=G.createRun('mage',0,104,3);run.difficulty='hard';G.enter(run,'battle');run.hand=['strike'];chooseCard(0);return run.pending.question;}
let tq=timedFixture();if(tq.budget!==3000||tq.startedAt!==100000)throw Error('visible question clock');
render();if(tq.startedAt!==100000)throw Error('render reset deadline');
tq.startedAt=99000;answer(tq.choices.indexOf(tq.answer));if(!run.pending.result.ok||!tq.fast||stats.recall[tq.keys[0]].fastStreak!==1)throw Error('fast recall');
tq=timedFixture();tq.startedAt=97500;answer(tq.choices.indexOf(tq.answer));if(!run.pending.result.ok||tq.fast||!stats.recall[tq.keys[0]].slow)throw Error('slow correct');
tq=timedFixture();tq.hinted=true;answer(tq.choices.indexOf(tq.answer));if(tq.fast||stats.recall[tq.keys[0]].fastStreak)throw Error('hint mastered');
tq=timedFixture();tq.startedAt=97000;answer(tq.choices.indexOf(tq.answer));if(run.pending.result.ok||!tq.timedOut)throw Error('late correct accepted');
tq=timedFixture();tq.startedAt=96000;updateReadingClock();if(run.phase!=='feedback'||!tq.timedOut||run.pending.result.ok)throw Error('automatic timeout');
const total=run.total;updateReadingClock();answer(-1);if(run.total!==total)throw Error('duplicate timeout');
tq=timedFixture();persist();if(JSON.parse(localStorage.getItem('kanacard-save-v4')).run.pending.question.startedAt!==100000)throw Error('deadline persistence');
run.phase='challenge';run.challenge={question:makeQuestion(),answered:0,correct:0};run.gold=0;render();run.challenge.question.startedAt=96000;updateReadingClock();if(!run.challenge.question.timedOut||run.challenge.result.ok||run.challenge.answered!==1)throw Error('challenge deadline');
`,ctx);
console.log('PASS: visible clock, preserved deadline, fast/slow/hinted recall, late clicks, automatic timeout, exactly-once grading and timed challenge');
