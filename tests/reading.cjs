const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const elements=new Map(),storage=new Map(),timers=[],listeners={};
function element(){const classes=new Set(['hidden']);return{dataset:{},disabled:false,innerHTML:'',textContent:'',classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle(c,on){on?classes.add(c):classes.delete(c)},contains:c=>classes.has(c)},setAttribute(){},querySelector(){return null},querySelectorAll(){return[]},focus(){}};}
const document={activeElement:null,getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelectorAll(){return[]},addEventListener(type,handler){listeners[type]=handler;}};
const ctx={document,console,Date:{now:()=>100000},setTimeout:fn=>{timers.push(fn);return timers.length},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
const scripts=['lessons.js','portraits.js','gear-config.js','gear.js','gear-view.js','world-config.js','core.js','content-config.js','world.js','world-view.js','world-art.js','monsters.js','combat-actor.js','word-effects.js','reading-combat.js','recall.js','app.js'];
for(const file of scripts)vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx,{filename:file});
function check(code){vm.runInContext(code,ctx);}
check(`
$('length').value='auto';selectedHero='fox';start();if(run.heroId!=='mage')throw Error('single fixed hero');if(setup().includes('data-hero-choice')||setup().includes('hero-grid'))throw Error('hero selection remains');if(window.KanaGearView.inventory(gearProfile,'mage','all','grade',false).includes('data-gear-hero'))throw Error('gear hero selector remains');if(run.rules!=='reading'||!run.autoLength||run.length!==2)throw Error('new run');
if(setup().includes('collection-entry')||!$('deck-button').hidden||!$('collection-button').hidden)throw Error('card entry visible');
W.beginRegion(run);G.enter(run,W.route(run)[0]);render();if(run.phase!=='question'||modalKind!==null||!$('modal').classList.contains('hidden'))throw Error('automatic question');
if($('screen').innerHTML.includes('hand-slot')||$('screen').innerHTML.includes('data-card=')||$('modal-body').innerHTML.includes('이번 턴의 한 장'))throw Error('card combat visible');
if(!$('screen').innerHTML.includes('reading-panel')||!$('screen').innerHTML.includes('data-answer='))throw Error('inline question absent');
const firstPrompt=run.pending.question.prompt;const firstHp=run.hp;answer(run.pending.question.choices.indexOf(run.pending.question.answer));if(!battleFx||!run.pending.result.fast)throw Error('automatic fast attack');if(!$('screen').innerHTML.includes('reading-panel')||!$('screen').innerHTML.includes(firstPrompt)||!$('screen').innerHTML.includes('word-volley')||!$('modal').classList.contains('hidden'))throw Error('prompt and attack must stay together');
`);
assert.equal(timers.length,1);timers.shift()();
check(`if(run.phase!=='question'||run.hp!==firstHp||run.fastCombo!==1)throw Error('next question without counter');
const wrong=run.pending.question.choices.findIndex(a=>a!==run.pending.question.answer);answer(wrong);if(run.phase!=='feedback'||battleFx||run.pending.result.damage!==0||run.fastCombo!==0)throw Error('wrong feedback');
if(!run.reviewQueue.length)throw Error('review queue');continueCard();if(!battleFx)throw Error('counter animation');if(!$('screen').innerHTML.includes('reading-panel')||!$('screen').innerHTML.includes('정답을 확인'))throw Error('counter hides review');`);
timers.shift()();
check(`if(run.hp>=firstHp||run.phase!=='question')throw Error('counter and resume');
run.reviewQueue=[{glyphs:['0-0','1-1'],due:run.readingCount}];const review=makeQuestion();if(review.keys.join(',')!=='0-0,1-1'||run.reviewQueue.length)throw Error('due exact review');
// Slow answers still deal basic damage, reset fast combos, and enter review.
run.phase='combat';run.enemy.hp=999;run.enemy.block=0;R.ask(run,{answer:'a',keys:['0-1'],fast:false});const slow=G.resolveCard(run,'a');if(!slow.ok||slow.fast||slow.damage<18||run.fastCombo!==0)throw Error('slow correct');
G.continueAfterCard(run);if(run.phase!=='combat')throw Error('slow counter');
// Gear cannot turn wrong answers into damage, or provide unbounded attack strength.
run.gearStats={attack:999,reduce:999,block:999};run.phase='combat';R.ask(run,{answer:'a',keys:['0-1'],fast:true});const miss=G.resolveCard(run,'b');if(miss.damage||miss.fast)throw Error('gear on wrong');G.continueAfterCard(run);G.endTurn(run);if(run.hand.length||run.block>20)throw Error('card draw or uncapped gear');
run.phase='reward';run.rewards=R.rewards.slice();const deckBefore=run.deck.length;G.takeReward(run,'power');if(run.readingPower!==2||run.deck.length!==deckBefore||run.phase!=='map')throw Error('power reward');
run.phase='reward';const lowHp=run.hp=10;G.takeReward(run,'recover');if(run.hp<=lowHp)throw Error('heal reward');
run.phase='reward';if(G.takeReward(run,'flame')!==false)throw Error('card reward accepted');
run.phase='rest';const oldPower=run.readingPower;G.rest(run,'power');if(run.readingPower!==oldPower+2)throw Error('rest power');
run.phase='event';run.eventId='traveler';run.gold=100;const oldRelics=run.relics.length;G.event(run,'card');if(run.relics.length!==oldRelics+1||run.gold!==70||run.deck.length!==deckBefore)throw Error('traveler relic');
run.phase='shop';run.shop={cards:['flame'],sold:[]};if(W.buy(run,'card:flame'))throw Error('card purchase accepted');
for(const phase of ['reward','rest','shop','event']){run.phase=phase;run.eventId='traveler';run.shop={cards:[],sold:[]};const view=WV.scene(run,{esc,card});if(/카드|data-card|data-buy="card:/.test(view))throw Error('card scene '+phase);}
// Adaptive lengths respond to sustained performance, and stay within 1..6.
run.phase='combat';run.autoLength=true;run.length=2;run.readingCount=0;run.readingRecent=[];run.enemy.hp=99999;
for(let i=0;i<12;i++){R.ask(run,{answer:'a',fast:true});G.resolveCard(run,'a');G.continueAfterCard(run);}if(run.length!==3)throw Error('length progression');
for(let i=0;i<12;i++){R.ask(run,{answer:'a',fast:false});G.resolveCard(run,'b');G.continueAfterCard(run);run.phase='combat';}if(run.length!==2)throw Error('length recovery');
// Migrate pending legacy saves without dropping progress, gold or equipment.
const saved=G.createExpedition('mage',0,46,3,98);saved.gold=123;saved.pending={cardId:'guard',question:{answer:'a'},result:{ok:true,damage:0}};saved.phase='feedback';R.migrate(saved);if(saved.gold!==123||saved.pending.question.answer!=='a'||saved.rules!=='reading'||saved.pending.cardId!=='strike')throw Error('migration');
`);
// Run complete campaigns with all character types through every world transition.
check(`
for(const hero of ['mage','fox','witch','knight']){
 run=G.createExpedition(hero,0,104,3,123);R.migrate(run);run.difficulty='hard';let steps=0;
 while(!['victory','defeated'].includes(run.phase)&&steps++<2000){
  if(run.phase==='region-intro')W.beginRegion(run);
  else if(run.phase==='map'){const nodes=W.available(run);G.enter(run,(nodes.find(n=>n.kind==='battle')||nodes[0]).id);}
  else if(run.phase==='combat'){R.ask(run,{answer:'a',fast:true,keys:['0-0','1-0']});G.resolveCard(run,'a');G.continueAfterCard(run);}
  else if(run.phase==='reward')G.takeReward(run,'recover');
  else if(run.phase==='rest')G.rest(run,'heal');
  else if(run.phase==='event')G.event(run,'leave');
  else if(run.phase==='treasure')W.treasure(run);
  else if(run.phase==='shop')W.leaveShop(run);
  else if(run.phase==='challenge'){if(!run.challenge.question)W.challengeQuestion(run,{answer:'a'});W.challengeAnswer(run,'a');W.challengeContinue(run);}
  else throw Error('stuck '+run.phase);
 }
 if(run.phase!=='victory'||run.world.cleared!==6)throw Error('campaign '+hero+' '+run.phase);
}
`);
console.log('PASS: cardless UI, automatic attacks, fast combos, counters, exact delayed review, capped gear, rewards/rest/shop/events, adaptive lengths, legacy migration and four complete campaigns');
check(`
run=G.createExpedition('mage',0,104,3,123);R.migrate(run);W.beginRegion(run);G.enter(run,W.route(run)[0]);menu=false;render();
`);
let chosen=vm.runInContext('run.pending.question.choices.indexOf(run.pending.question.answer)+1',ctx);
listeners.keydown({key:String(chosen),preventDefault(){}});
check(`if(!battleFx||!run.pending.result.ok)throw Error('inline keyboard answer');`);
timers.shift()();
chosen=vm.runInContext('run.pending.question.choices.findIndex(a=>a!==run.pending.question.answer)+1',ctx);
listeners.keydown({key:String(chosen),preventDefault(){}});
check(`if(run.phase!=='feedback'||modalKind)throw Error('inline wrong keyboard');`);
listeners.keydown({key:'Enter',preventDefault(){}});
check(`if(!battleFx)throw Error('inline Enter continue');`);
timers.shift()();
console.log('PASS: inline numeric answers and Enter review controls without a quiz dialog');
check(`
// A saved timed question resumes with the same deadline in the production script order.
run=G.createExpedition('mage',0,104,3,123);R.migrate(run);W.beginRegion(run);G.enter(run,W.route(run)[0]);menu=false;render();persist();
`);
const reloaded={...ctx,window:null,globalThis:null};reloaded.window=reloaded;reloaded.globalThis=reloaded;vm.createContext(reloaded);
for(const file of scripts)vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),reloaded,{filename:file});
vm.runInContext(`
if(run.rules!=='reading'||run.phase!=='question'||run.pending.question.startedAt!==100000)throw Error('production reload');
menu=false;render();run.pending.question.startedAt=94000;updateReadingClock();if(run.phase!=='feedback'||run.pending.result.ok||!run.pending.question.timedOut)throw Error('production timeout');
const missed=run.total;updateReadingClock();if(run.total!==missed)throw Error('duplicate timeout');
run=G.createRun('mage',0,46,3);R.migrate(run);for(const phase of ['reward','rest','event']){run.phase=phase;if(/카드|덱|data-card/.test(scene()))throw Error('legacy card scene');}
`,reloaded);
console.log('PASS: production save/reload keeps timed reading battle, timeout grades once, legacy eight-floor scenes have no cards');

check(`
for(const difficulty of ['normal','hard','master']){stage=0;run=G.createExpedition('mage',0,104,3,44);R.migrate(run);run.difficulty=difficulty;for(let i=0;i<100;i++){const q=makeQuestion();if(q.choices.length!==4||new Set(q.choices).size!==4||!q.choices.includes(q.answer))throw Error('four choices '+difficulty);}}
const oldRun=G.createExpedition('mage',0,104,3,12);oldRun.pending={question:{answer:'a',choices:['a','b','c','d','e','f','g','h'],startedAt:123},selected:'h'};oldRun.challenge={question:{answer:'b',choices:['a','b','c','d','e','f']}};R.migrate(oldRun);if(oldRun.pending.question.choices.length!==4||!oldRun.pending.question.choices.includes('a')||!oldRun.pending.question.choices.includes('h')||oldRun.pending.question.startedAt!==123||oldRun.challenge.question.choices.length!==4)throw Error('saved question reduction');
`,ctx);
console.log('PASS: fixed mage, no hero selectors, four choices at every difficulty, saved questions reduced without losing answers or deadlines');

check(`
// Character reset is atomic with the normal save bundle and runs only once.
const resetStats={correct:42},resetGrowth={mage:999,fox:300},resetGear=Q.fresh();resetGear.equipped.mage.weapon='kept-item';resetGear.items=[{id:'kept-item'}];
const resetRun=G.createExpedition('mage',0,104,3,42);R.migrate(resetRun);resetRun.hp=250;resetRun.maxHp=400;resetRun.readingPower=6;resetRun.readingWard=4;resetRun.relics=['leaf'];resetRun.blessings=8;
if(!R.resetCharacter(resetStats,resetGrowth,resetGear,resetRun)||resetGrowth.mage!==0||resetRun.hp!==60||resetRun.maxHp!==60||resetRun.readingPower||resetRun.blessings||resetGear.equipped.mage.weapon||resetGear.items.length!==1||resetStats.correct!==42)throw Error('character reset');
resetGrowth.mage=100;resetGear.equipped.mage.weapon='kept-item';if(R.resetCharacter(resetStats,resetGrowth,resetGear,resetRun)||resetGrowth.mage!==100||!resetGear.equipped.mage.weapon)throw Error('repeat reset');
// Upgraded characters cannot become immune to mistakes.
for(const maxHp of [60,200,1000]){
 run=G.createExpedition('mage',0,104,3,31);R.migrate(run);W.beginRegion(run);G.enter(run,W.route(run)[0]);run.hp=run.maxHp=maxHp;run.block=999;run.gearStats={block:999,reduce:999};run.blessings=999;run.enemy.hp=99999;let misses=0;
 while(run.phase!=='defeated'&&misses<10){R.ask(run,{answer:'a',fast:false});G.resolveCard(run,'wrong');const before=run.hp;G.continueAfterCard(run);G.endTurn(run);misses++;if(before-run.hp<Math.min(before,Math.ceil(maxHp*.08)))throw Error('immune to mistakes');}
 if(run.phase!=='defeated'||misses>7)throw Error('immortal upgraded character');
}
// Correct answers break the mistake streak; only fast streaks recover HP.
run=G.createExpedition('mage',0,104,3,16);R.migrate(run);W.beginRegion(run);G.enter(run,W.route(run)[0]);run.enemy.hp=99999;run.hp=20;run.gearStats={heal:3};run.mistakeStreak=4;
R.ask(run,{answer:'a',fast:false});G.resolveCard(run,'a');if(run.hp!==20||run.mistakeStreak!==0)throw Error('slow healing/streak reset');G.continueAfterCard(run);
let restored=0;for(let i=0;i<30;i++){R.ask(run,{answer:'a',fast:true});restored+=G.resolveCard(run,'a').healing;G.continueAfterCard(run);}if(restored!==6||run.battleHealing!==6)throw Error('healing cap');
// Separate answer deadline from fast-recall target.
run.difficulty='hard';const timeQ={keys:['0-0','0-1','0-2'],startedAt:96000,budget:5000,fastBudget:3000};if(readingBudget(timeQ)!==5000||readingFastBudget(timeQ)!==3000||finishReading(timeQ)||timeQ.fast)throw Error('slow allowed answer');
timeQ.startedAt=97000;if(finishReading(timeQ)||!timeQ.fast)throw Error('fast boundary');timeQ.startedAt=95000;if(!finishReading(timeQ))throw Error('deadline boundary');
const warrior=G.HEROES.find(h=>h.id==='mage');if(warrior.archetype!=='warrior'||!combatActor(warrior).includes('warrior-plate')||!combatActor(warrior).includes('warrior-blade'))throw Error('warrior appearance');
const item=Q.add(gearProfile,{slot:'weapon',origin:'field',grade:'rare',region:0,roll:3,options:{}});const detail=KanaGearView.detail(gearProfile,'mage',item.id,false),inventory=KanaGearView.inventory(gearProfile,'mage','all','grade',false);if(!inventory.includes('equipment-preview')||!inventory.includes('equipment-art')||!detail.includes('equipment-tryon')||!detail.includes('장착 미리보기'))throw Error('visual gear');
`,ctx);
console.log('PASS: one-time reset preserves learning/inventory, seven-mistake limit at every HP level, fast-only capped healing, separate 5s/3s targets, warrior art and visual gear try-on');

check(`
// Never replace all ordinary practice with targeted reviews.
stage=0;run=G.createExpedition('mage',0,104,3,44);R.migrate(run);stats.recall={'0-0':{misses:9,lastMissAt:Date.now()}};stats.kanaAnswered=20;stats.kanaChecks=[{key:'1-1',due:0}];stats.lastKanaCheckAt=0;run.reviewQueue=[{glyphs:['0-0','1-0'],due:0}];
const diagnosis=makeQuestion();if(!diagnosis.diagnostic||diagnosis.keys.length!==1||diagnosis.keys[0]!=='1-1'||diagnosis.choices.length!==4)throw Error('single-letter diagnosis');
const delayed=makeQuestion();if(!delayed.targeted||delayed.keys.join(',')!=='0-0,1-0')throw Error('bundle review after diagnosis');
const ordinary=makeQuestion();if(ordinary.targeted||ordinary.keys.length!==3)throw Error('ordinary practice guarantee');
recordRecall({keys:['0-0','1-1'],elapsed:6000,fast:false},false);persist();const recallSave=JSON.parse(localStorage.getItem('kanacard-save-v4')).stats;
if(!recallSave.kanaChecks.some(c=>c.key==='0-0')||!recallSave.recall['0-0'].bundleMisses)throw Error('persistent diagnosis');
run=G.createExpedition('mage',0,104,3,45);R.migrate(run);stats.kanaAnswered+=10;stats.lastKanaCheckAt=0;const nextSession=makeQuestion();if(!nextSession.diagnostic||nextSession.keys.length!==1)throw Error('next run diagnosis');
`,ctx);
console.log('PASS: diagnosis uses one letter and four choices, original bundle review follows, ordinary practice is guaranteed, priorities and checks survive a new expedition');
check(`
run=G.createExpedition('mage',0,104,2,12);R.migrate(run);W.beginRegion(run);G.enter(run,W.route(run)[0]);run.autoLength=true;run.enemy.hp=99999;
for(let i=0;i<12;i++){R.ask(run,{answer:'a',keys:['0-0'],fast:true,diagnostic:true});G.resolveCard(run,'a');G.continueAfterCard(run);}
if(run.length!==2||(run.readingRecent||[]).length)throw Error('diagnosis inflated adaptive length');
`,ctx);
console.log('PASS: single-letter checks do not inflate automatic bundle difficulty');
