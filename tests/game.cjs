const assert=require('node:assert/strict');
const G=require('../core.js');
const fixed=()=>.37;
for(const hero of G.HEROES){
 const s=G.createRun(hero.id,0,46,3);assert.equal(G.enter(s,'boss'),false);assert(G.enter(s,'battle',fixed));
 assert.equal(s.energy,1);assert.equal(s.hand.length,4+(hero.extraDraw||0)+(hero.firstDraw||0));assert.equal(s.block,hero.startBlock||0);
 s.hand=['strike','guard'];assert(G.selectCard(s,0,{answer:'a'}));assert(G.cancelQuestion(s));assert.equal(s.energy,1);
 G.selectCard(s,0,{answer:'a'});const before=s.enemy.hp;G.resolveCard(s,'a',fixed);assert.equal(before-s.enemy.hp,18+(hero.bonus||0));assert.equal(s.energy,0);assert.equal(G.resolveCard(s,'a'),false);
 G.continueAfterCard(s);assert.equal(s.phase,'enemy');assert.equal(G.selectCard(s,0,{answer:'a'}),false);G.endTurn(s,fixed);assert.equal(s.turn,2);assert.equal(s.energy,1);
 s.hand=['guard'];G.selectCard(s,0,{answer:'a'});G.resolveCard(s,'wrong');assert.equal(s.block,(hero.startBlock||0)+8);assert.equal(s.empower,4);G.continueAfterCard(s);G.endTurn(s,fixed);assert.equal(s.turn,3);assert.equal(s.block,hero.startBlock||0);
}
for(const lesson of [0,1,2,3,4]){
 const s=G.createRun('knight',lesson,46,3);
 while(s.phase!=='victory'){
  if(s.phase==='map'){const routes=G.route(s);G.enter(s,routes.includes('rest')?'rest':routes.includes('event')?'event':routes[0],fixed)}
  else if(s.phase==='rest')G.rest(s,'heal');else if(s.phase==='event')G.event(s,'charm');else if(s.phase==='reward')G.takeReward(s,s.rewards[0]);
  else if(s.phase==='enemy')G.endTurn(s,fixed);
  else if(s.phase==='combat'){s.hand=['flame'];s.energy=3;G.selectCard(s,0,{answer:'ok'});G.resolveCard(s,'ok',fixed);G.continueAfterCard(s,fixed)}
  else throw Error(s.phase);
 }
 assert.equal(s.floor,8);assert.equal(s.history.length,8);assert.equal(s.correct,s.total);
}
const dead=G.createRun('mage',0,46,3);G.enter(dead,'battle');dead.hp=1;G.endTurn(dead);assert.equal(dead.phase,'defeated');assert.equal(G.endTurn(dead),false);
const exhausted=G.createRun('mage',0,46,3);G.enter(exhausted,'battle');exhausted.hand=['heal'];exhausted.hp=50;G.selectCard(exhausted,0,{answer:'a'});G.resolveCard(exhausted,'a');assert.equal(exhausted.hp,60);assert.deepEqual(exhausted.exhaust,['heal']);
console.log('PASS: hero passives, answers, cancel, turn reset, rewards, all 5 chapters through 8F victory, defeat, healing/exhaust');

// Permanent growth is separate from runs and changes only newly prepared runs.
const profile={};
assert.equal(G.growth().level,1);
assert.equal(G.gainExperience(profile,'mage',60).level,2);
assert.equal(G.gainExperience(profile,'mage',80).level,3);
const grown=G.createRun('mage',0,5,2);G.applyGrowth(grown,profile.mage);
assert.equal(grown.maxHp,64);assert(grown.deck.includes('spark'));
assert.equal(G.growth(profile.fox).level,1);
assert.equal(G.gainExperience(profile,'missing',10),null);
assert.equal(G.growth(NaN).level,1);
const veteran=G.createRun('knight',0,5,2);G.applyGrowth(veteran,600);G.enter(veteran,'battle');
assert(veteran.deck.includes('flame'));assert(veteran.block>2);
veteran.hand=['strike'];G.selectCard(veteran,0,{answer:'yes'});
assert.equal(G.resolveCard(veteran,'yes').damage,18+veteran.growth.attack);
console.log('PASS: permanent XP thresholds, hero isolation, growth stats, starter unlocks and combat bonuses');
const collected={};assert.deepEqual(G.discoverCards(collected,['strike','moon','unknown','moon']),['strike','moon']);assert.deepEqual(G.discoverCards(collected,['moon']),[]);
for(const [id,c] of Object.entries(G.CARDS)){
 assert(['common','uncommon','rare'].includes(c.rarity));assert(c.element);
 for(const correct of [true,false]){
  const s=G.createRun('fox',0,5,2);G.enter(s,'battle');s.hp-=10;s.hand=[id];s.energy=3;
  assert(G.selectCard(s,0,{answer:'ok'}));const result=G.resolveCard(s,correct?'ok':'no');
  assert.equal(result.damage,c.damage?Math.floor(c.damage*(correct?1:.5)):0);
  assert.equal(result.block,c.block?Math.floor(c.block*(correct?1:.5)):0);
  assert.equal(result.healing,c.heal?Math.min(10,Math.floor(c.heal*(correct?1:.5))):0);
 }
}
console.log('PASS: all 15 cards, correct/incorrect mixed effects, metadata and idempotent discovery');
// Preparation effects carry across the automatic enemy turn, then are consumed once.
const prepared=G.createRun('knight',0,5,2);G.enter(prepared,'battle');prepared.hand=['focus'];G.selectCard(prepared,0,{answer:'ok'});G.resolveCard(prepared,'ok');assert.equal(prepared.energy,0);assert.equal(prepared.empower,16);G.continueAfterCard(prepared);assert.equal(prepared.phase,'enemy');assert(!G.canPlay(prepared,0));G.endTurn(prepared);prepared.hand=['strike'];G.selectCard(prepared,0,{answer:'ok'});assert.equal(G.resolveCard(prepared,'ok').damage,34);assert.equal(prepared.empower,0);
const nextCards=G.createRun('mage',0,5,2);G.enter(nextCards,'battle');nextCards.hand=['flow'];G.selectCard(nextCards,0,{answer:'ok'});G.resolveCard(nextCards,'ok');assert.equal(nextCards.hand.length,0);assert.equal(nextCards.nextDraw,1);G.continueAfterCard(nextCards);G.endTurn(nextCards);assert.equal(nextCards.hand.length,5);assert.equal(nextCards.nextDraw,0);
for(let lesson=0;lesson<3;lesson++){const s=G.createRun('knight',lesson,5,2);s.floor=7;G.enter(s,'boss');assert.equal(s.enemy.skin,['mushmom','balrog','pinkbean'][lesson])}
console.log('PASS: preparation/next-turn draw, one-action lock and all three boss variants');
