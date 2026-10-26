/* Reading battles. Legacy card rules remain available only for saved-data compatibility. */
(function(root){'use strict';
const G=root.KanaGame,W=root.KanaWorld;
const REWARDS=['recover','power','ward'];
const native={begin:G.beginTurn,resolve:G.resolveCard,next:G.continueAfterCard,reward:G.takeReward,rest:G.rest,event:G.event,buy:W.buy,worldReward:W.takeReward,worldRest:W.rest,worldEvent:W.event,end:G.endTurn};
function enabled(s){return s?.rules==='reading';}
function fourChoices(q,selected){if(!q?.choices||q.choices.length<=4)return;const distractors=G.shuffle(q.choices.filter(a=>a!==q.answer&&a!==selected));if(selected&&selected!==q.answer)distractors.unshift(selected);q.choices=G.shuffle([q.answer,...distractors.slice(0,3)]);}
function migrate(s){if(!s)return;s.rules='reading';s.readingPower=Math.min(6,Math.max(0,s.readingPower||0));s.readingWard=Math.min(4,Math.max(0,s.readingWard||0));s.fastCombo=s.fastCombo||0;s.bestFastCombo=s.bestFastCombo||0;s.reviewQueue=s.reviewQueue||[];s.readingCount=s.readingCount||0;if(s.pending){s.pending.cardId='strike';fourChoices(s.pending.question,s.pending.selected);}if(s.challenge)fourChoices(s.challenge.question,s.challenge.selected);s.hand=[];s.drawPile=[];s.discard=[];s.exhaust=[];if(s.phase==='reward')s.rewards=REWARDS.slice();}
G.beginTurn=function(s,rng){if(!enabled(s))return native.begin(s,rng);s.turn++;s.block=(s.heroId==='knight'?3:0)+(s.readingWard||0)+(s.blessings||0)+Math.min(4,s.gearStats?.block||0)+(s.turn===1?Math.min(6,s.gearStats?.shield||0):0)+(s.world?W.relicValue(s,'block'):s.relic?1:0);s.energy=1;s.hand=[];s.drawPile=[];s.discard=[];s.exhaust=[];s.phase='combat';s.enemy.intent=s.world?W.intent(s):G.intent?.(s)||{type:'attack',value:s.enemy.attack};};
function ask(s,q){if(!enabled(s)||s.phase!=='combat')return false;s.pending={index:0,cardId:'strike',question:q};s.phase='question';return true;}
G.resolveCard=function(s,answer,rng=Math.random){if(!enabled(s))return native.resolve(s,answer,rng);if(s.phase!=='question'||!s.pending)return false;const q=s.pending.question,ok=answer===q.answer,fast=ok&&q.fast===true;q.fast=fast;
s.total++;s.correct+=ok?1:0;s.combo=ok?s.combo+1:0;s.fastCombo=fast?s.fastCombo+1:0;s.bestFastCombo=Math.max(s.bestFastCombo||0,s.fastCombo);s.readingCount++;s.energy=0;s.readingRecent=(s.readingRecent||[]).concat({ok,fast}).slice(-12);if(s.autoLength&&s.readingCount%12===0&&s.readingRecent.length===12){const hits=s.readingRecent.filter(r=>r.ok).length,quick=s.readingRecent.filter(r=>r.fast).length;if(hits>=11&&quick>=8)s.length=Math.min(6,s.length+1);else if(hits<8)s.length=Math.max(1,s.length-1);}
const relicSpeed=s.world?Math.min(3,(s.relics||[]).filter(id=>root.KanaConfig.relics[id].draw||root.KanaConfig.relics[id].empower).length):0;
const bonus=Math.min(6,s.readingPower||0)+Math.min(5,s.gearStats?.attack||0)+Math.min(3,s.growth?.attack||0)+(s.world?Math.min(3,W.relicValue(s,'attack')):0);
const effects=[];let damage=ok?18+bonus+(s.heroId==='mage'?2:0)+(fast&&!s.disoriented?6+Math.min(8,s.fastCombo*2)+relicSpeed:0)+(s.heroId==='fox'&&fast?2:0):0;
if(ok){const eq=s.gearStats||{};damage+=Math.min(3,eq.extraDamage||0);if(s.combo%3===0)damage+=Math.min(3,eq.combo||0)+(eq.comboDraw?1:0);if(fast){damage+=Math.min(1,eq.draw||0);if(rng()<Math.min(.2,eq.crit||0)){damage=Math.floor(damage*1.3);effects.push('치명타');}if(rng()<Math.min(.15,eq.extra||0)){damage+=3;effects.push('추가타');}}}
s.disoriented=false;
const blocked=Math.min(s.enemy.block||0,damage);s.enemy.block=Math.max(0,(s.enemy.block||0)-damage);damage-=blocked;s.enemy.hp=Math.max(0,s.enemy.hp-damage);
const healing=ok?Math.min(s.maxHp-s.hp,(s.heroId==='witch'&&s.combo%3===0?2:0)+(s.combo%5===0?2:0)+Math.min(1,s.gearStats?.heal||0)):0;s.hp+=healing;
if(q.keys?.length&&(!ok||!fast)){s.reviewQueue.push({glyphs:q.keys.slice(),due:s.readingCount+3});s.reviewQueue=s.reviewQueue.slice(-30);}
if(s.world){s.enemy.intent=W.intent(s);if(s.enemy.hp<=0)W.enemyLoot(s,s.enemy);}
s.pending.result={ok,fast,damage,block:0,healing,gearEffects:(fast?['빠른 회상 + 연속 공격']:[]).concat(effects)};s.phase='feedback';return s.pending.result;};
G.continueAfterCard=function(s,rng){if(!enabled(s))return native.next(s,rng);if(s.phase!=='feedback'||!s.pending)return false;const ok=s.pending.result.ok;s.pending=null;
if(s.enemy.hp<=0){if(s.world)W.afterCard(s,rng);else if(s.floor===8)s.phase='victory';else{s.phase='reward';s.rewards=REWARDS.slice();}if(s.phase==='reward')s.rewards=REWARDS.slice();return true;}
if(!ok){s.phase='enemy';if(s.enemy.intent.type==='guard')s.enemy.intent={type:'attack',value:s.enemy.attack};return true;}
if(s.world&&W.afterEnemy(s)){s.rewards=REWARDS.slice();return true;}G.beginTurn(s,rng);return true;};
G.endTurn=function(s,rng){if(!enabled(s))return native.end(s,rng);if(!['combat','enemy'].includes(s.phase))return false;if(s.world&&W.beforeEnemy(s)){s.phase='defeated';return true;}
const i=s.enemy.intent||{type:'attack',value:s.enemy.attack},amount=s.enemy.weak>0?Math.floor(i.value*.7):i.value;if(s.enemy.weak>0)s.enemy.weak--;const loss=Math.max(0,amount-s.block-Math.min(3,s.gearStats?.reduce||0));s.hp=Math.max(0,s.hp-loss);s.enemy.block=0;s.notice=loss?`반격! 체력 ${loss} 감소`:'방어로 반격을 막았습니다.';
if(s.world){W.enemySpecial(s,i,loss);if(i.type==='confuse'){s.disoriented=true;s.nextDrawPenalty=0;}if(i.type==='seal')s.fastCombo=0;}
if(s.hp<=0){s.phase='defeated';return true;}if(s.world&&W.afterEnemy(s)){s.rewards=REWARDS.slice();return true;}G.beginTurn(s,rng);return true;};
function reward(s,id){if(s.phase!=='reward'||id!==null&&!REWARDS.includes(id))return false;if(id==='recover')s.hp=Math.min(s.maxHp,s.hp+Math.ceil(s.maxHp*.2));if(id==='power')s.readingPower=Math.min(6,(s.readingPower||0)+2);if(id==='ward')s.readingWard=Math.min(4,(s.readingWard||0)+1);return s.world?native.worldReward(s,null):(s.rewards=[],s.phase='map',true);}
G.takeReward=function(s,id){return enabled(s)?reward(s,id):native.reward(s,id);};
W.takeReward=function(s,id){return enabled(s)?reward(s,id):native.worldReward(s,id);};
// Reuse the validated world transition by mapping a cardless rest to its heal path.
G.rest=function(s,choice){if(!enabled(s))return native.rest(s,choice);if(choice==='power'&&s.phase==='rest'){const hp=s.hp;const done=s.world?native.worldRest(s,'heal'):native.rest(s,'heal');s.hp=hp;s.readingPower=Math.min(6,(s.readingPower||0)+2);s.notice='읽기 공격 +2 (최대 +6)';return done;}return s.world?native.worldRest(s,choice):native.rest(s,choice);};
G.event=function(s,choice){if(!enabled(s))return native.event(s,choice);if(choice==='card'){const before=s.deck.length;const done=s.world?native.worldEvent(s,'card'):false;if(done){s.deck.length=before;const pool=Object.keys(root.KanaConfig.relics).filter(id=>!s.relics.includes(id));if(pool.length)s.relics.push(pool[Math.floor(W.random(s)*pool.length)]);else s.gold+=30;}return done;}if(choice==='upgrade'){if(s.phase!=='event'||!root.KanaContent.events[s.eventId]?.choices.some(c=>c[0]===choice))return false;const before=s.readingPower||0;s.readingPower=Math.min(6,before+2);const done=s.world?native.worldEvent(s,'leave'):native.event(s,'tea');s.notice='읽기 공격 강화';return done;}return s.world?native.worldEvent(s,choice):native.event(s,choice);};
W.buy=function(s,id){if(enabled(s)&&id.startsWith('card:'))return false;return native.buy(s,id);};
root.KanaReading={enabled,migrate,ask,rewards:REWARDS};
})(globalThis);
