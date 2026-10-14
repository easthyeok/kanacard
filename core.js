/* Turn-based combat and run rules. No DOM, timers or network dependencies. */
(function(root){
'use strict';
const CARDS={
 strike:{name:'문자의 칼날',type:'attack',cost:1,damage:7,icon:'斬',text:'피해 7',flavor:'한 글자가 하나의 검이 된다.'},
 guard:{name:'종이 방패',type:'skill',cost:1,block:6,icon:'守',text:'방어도 6',flavor:'천천히 읽어도 괜찮아.'},
 focus:{name:'깊은 호흡',type:'skill',cost:0,draw:2,icon:'息',text:'카드 2장 뽑기',flavor:'숨을 고르고, 다음 한 수.'},
 flame:{name:'불꽃 문장',type:'attack',cost:2,damage:17,icon:'炎',text:'피해 17',flavor:'기억 속에서 타오르는 문장.'},
 ice:{name:'겨울의 인사',type:'attack',cost:1,damage:6,weak:1,icon:'雪',text:'피해 6 · 다음 적 공격 30% 감소',flavor:'부드러운 한마디로 기세를 꺾는다.'},
 barrier:{name:'고요한 결계',type:'skill',cost:2,block:15,icon:'結',text:'방어도 15',flavor:'고요 속에 쌓아 올린 힘.'},
 flow:{name:'흐르는 말',type:'attack',cost:1,damage:5,draw:1,icon:'流',text:'피해 5 · 카드 1장 뽑기',flavor:'대화는 물처럼 이어진다.'},
 heal:{name:'봄의 편지',type:'skill',cost:1,heal:4,exhaust:true,icon:'春',text:'체력 4 회복 · 소멸',flavor:'오늘 배운 말이 내일의 위로가 된다.'},
 spark:{name:'작은 번뜩임',type:'attack',cost:0,damage:3,exhaust:true,icon:'光',text:'피해 3 · 소멸',flavor:'짧은 깨달음, 선명한 빛.'}
};
Object.assign(CARDS,{
 thunder:{name:'벼락의 한마디',type:'attack',cost:2,damage:14,draw:1,icon:'雷',text:'피해 14 · 카드 1장 뽑기',flavor:'잊었던 말이 번개처럼 돌아온다.'},
 thorn:{name:'가시 문장',type:'attack',cost:1,damage:5,block:4,icon:'棘',text:'피해 5 · 방어도 4',flavor:'부드러운 말에도 단단한 심지가 있다.'},
 meteor:{name:'별을 부르는 말',type:'attack',cost:3,damage:26,exhaust:true,icon:'星',text:'피해 26 · 소멸',flavor:'단 한 번, 밤하늘을 가르는 한마디.'},
 moon:{name:'달빛 서약',type:'skill',cost:1,block:5,draw:1,icon:'月',text:'방어도 5 · 카드 1장 뽑기',flavor:'달이 차오르듯 기억도 돌아온다.'},
 blossom:{name:'꽃피는 기억',type:'skill',cost:2,heal:7,block:5,exhaust:true,icon:'花',text:'체력 7 회복 · 방어도 5 · 소멸',flavor:'기억의 가지 끝에 봄이 열린다.'},
 echo:{name:'메아리의 서',type:'skill',cost:1,draw:3,icon:'響',text:'카드 3장 뽑기',flavor:'한마디가 다음 세 문장을 깨운다.'}
});
const CARD_STYLES={strike:['common','steel'],guard:['common','paper'],focus:['common','wind'],flame:['rare','fire'],ice:['uncommon','frost'],barrier:['rare','arcane'],flow:['uncommon','water'],heal:['uncommon','nature'],spark:['uncommon','light'],thunder:['rare','storm'],thorn:['uncommon','thorn'],meteor:['rare','cosmic'],moon:['uncommon','moon'],blossom:['rare','bloom'],echo:['uncommon','ink']};
for(const [id,[rarity,element]] of Object.entries(CARD_STYLES))Object.assign(CARDS[id],{rarity,element});
function discoverCards(collection,deck){const added=[];for(const id of deck){if(CARDS[id]&&!collection[id]){collection[id]=true;added.push(id)}}return added}
const HEROES=[
{id:'mage',name:'숲의 마법사',color:'#b9d993',dark:'#43635b',maxHp:60,passive:'정답 공격 피해 +2',desc:'균형 잡힌 공격과 방어',bonus:2},
{id:'fox',name:'여우 길잡이',color:'#edb779',dark:'#b86c47',maxHp:54,passive:'매 전투 첫 턴 에너지 +1',desc:'첫 턴을 빠르게 전개',firstEnergy:1},
{id:'witch',name:'달빛 마녀',color:'#c6ace2',dark:'#796095',maxHp:52,passive:'매 턴 카드 1장 더 뽑기',desc:'많은 선택지로 만드는 전략',extraDraw:1},
{id:'knight',name:'잉크 기사',color:'#9dbed4',dark:'#4b708f',maxHp:70,passive:'매 턴 방어도 2로 시작',desc:'여유 있게 버티는 단단함',startBlock:2}
];
function shuffle(a,rng=Math.random){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function growth(xp=0){xp=Number.isFinite(xp)?Math.max(0,Math.floor(xp)):0;let level=1,needed=60;while(xp>=needed){xp-=needed;level++;needed=60+(level-1)*20}return{level,xp,needed,hp:(level-1)*2,attack:Math.floor((level-1)/3),block:Math.floor((level-1)/4)}}
function gainExperience(profile,heroId,amount){if(!HEROES.some(h=>h.id===heroId)||!Number.isFinite(amount)||amount<=0)return null;const before=growth(profile[heroId]);profile[heroId]=(Number.isFinite(profile[heroId])?Math.max(0,profile[heroId]):0)+Math.floor(amount);return{...growth(profile[heroId]),gained:Math.floor(amount),levels:growth(profile[heroId]).level-before.level}}
function applyGrowth(s,xp){const g=growth(xp);s.growth=g;s.maxHp+=g.hp;s.hp+=g.hp;if(g.level>=3)s.deck.push('spark');if(g.level>=6)s.deck.push('flame');return g}
function createRun(heroId,lesson,range,length){const hero=HEROES.find(h=>h.id===heroId)||HEROES[0];return{version:2,heroId:hero.id,lesson,range,length,hp:hero.maxHp,maxHp:hero.maxHp,deck:[...Array(5).fill('strike'),...Array(4).fill('guard'),'focus'],floor:0,phase:'map',history:[],correct:0,total:0,combo:0,block:0,energy:0,hand:[],drawPile:[],discard:[],exhaust:[],turn:0,enemy:null,relic:false,pending:null,rewards:[],kanaBag:[],recentKana:[]}}
function hero(s){return HEROES.find(h=>h.id===s.heroId)}
function route(s){const f=s.floor+1;if(f===8)return['boss'];if(f===1)return['battle'];if(f===3||f===5||f===7)return['rest',f===7?'elite':'battle'];return f===4?['elite','event']:['battle','event']}
function draw(s,count,rng=Math.random){for(let i=0;i<count;i++){if(!s.drawPile.length){s.drawPile=shuffle(s.discard,rng);s.discard=[]}if(!s.drawPile.length||s.hand.length>=10)break;s.hand.push(s.drawPile.pop())}}
function intent(s){const e=s.enemy;const cycle=e.kind==='boss'?['attack','guard','heavy']:e.kind==='elite'?['attack','heavy','guard']:['attack','guard','attack'];const type=cycle[(s.turn-1)%cycle.length];return{type,value:type==='guard'?5+Math.floor(s.floor/2):e.attack+(type==='heavy'?5:0)}}
function beginTurn(s,rng=Math.random){s.turn++;s.block=(hero(s).startBlock||0)+(s.relic?1:0)+(s.growth?.block||0);s.energy=3+(s.turn===1?(hero(s).firstEnergy||0):0);draw(s,5+(hero(s).extraDraw||0),rng);s.enemy.intent=intent(s);s.phase='combat'}
function enter(s,kind,rng=Math.random){if(s.phase!=='map'||!route(s).includes(kind))return false;s.floor++;s.history.push(kind);s.pending=null;s.notice='';if(kind==='rest'){s.phase='rest';return true}if(kind==='event'){s.phase='event';return true}
const boss=kind==='boss',elite=kind==='elite';const hp=boss?98:elite?47+s.floor*3:24+s.floor*4;
s.enemy={name:boss?'忘却の司書':elite?'문지기 도깨비':s.floor%2?'안개 정령':'잉크 슬라임',subtitle:boss?'망각의 사서 · 최종 보스':elite?'ELITE · 잊힌 말의 수호자':'기억을 먹고 자라는 작은 정령',kind,maxHp:hp,hp,attack:boss?13:elite?10:5+s.floor,block:0,weak:0};
s.drawPile=shuffle(s.deck,rng);s.discard=[];s.exhaust=[];s.hand=[];s.turn=0;beginTurn(s,rng);return true}
function canPlay(s,index){return s.phase==='combat'&&Number.isInteger(index)&&index>=0&&index<s.hand.length&&CARDS[s.hand[index]].cost<=s.energy}
function selectCard(s,index,question){if(!canPlay(s,index))return false;s.pending={index,cardId:s.hand[index],question};s.phase='question';return true}
function cancelQuestion(s){if(s.phase!=='question')return false;s.phase='combat';s.pending=null;return true}
function cardDescription(id){const c=CARDS[id];return c.text}
function resolveCard(s,answer,rng=Math.random){if(s.phase!=='question'||!s.pending)return false;const p=s.pending,c=CARDS[p.cardId],ok=answer===p.question.answer;s.total++;s.correct+=ok?1:0;s.combo=ok?s.combo+1:0;s.energy-=c.cost;s.hand.splice(p.index,1);(c.exhaust?s.exhaust:s.discard).push(p.cardId);const factor=ok?1:.5;let damage=0,block=0,healing=0;
if(c.damage){damage=Math.floor(c.damage*factor)+(ok?(hero(s).bonus||0):0)+(s.growth?.attack||0);const absorbed=Math.min(s.enemy.block,damage);s.enemy.block-=absorbed;s.enemy.hp=Math.max(0,s.enemy.hp-damage+absorbed)}
if(c.block){block=Math.floor(c.block*factor);s.block+=block}if(c.heal){healing=Math.min(s.maxHp-s.hp,Math.floor(c.heal*factor));s.hp+=healing}if(c.weak&&ok)s.enemy.weak+=c.weak;if(c.draw)draw(s,ok?c.draw:Math.max(0,c.draw-1),rng);
s.pending.result={ok,damage,block,healing};s.phase='feedback';return s.pending.result}
function continueAfterCard(s,rng=Math.random){if(s.phase!=='feedback')return false;s.pending=null;if(s.enemy.hp<=0){if(s.floor===8){s.phase='victory';return true}s.phase='reward';s.rewards=shuffle(Object.keys(CARDS).filter(k=>!['strike','guard'].includes(k)),rng).slice(0,3)}else s.phase='combat';return true}
function endTurn(s,rng=Math.random){if(s.phase!=='combat')return false;const e=s.enemy,i=e.intent;let loss=0;if(i.type==='guard'){e.block=i.value;s.notice=`${e.name}이 방어도 ${i.value}을 얻었습니다.`}else{const amount=e.weak>0?Math.floor(i.value*.7):i.value;if(e.weak>0)e.weak--;loss=Math.max(0,amount-s.block);s.hp=Math.max(0,s.hp-loss);s.notice=loss?`적의 공격! 체력 ${loss} 감소`:'완벽한 방어! 피해를 막았습니다.';e.block=0}
s.discard.push(...s.hand);s.hand=[];if(s.hp<=0){s.phase='defeated';return true}beginTurn(s,rng);return true}
function takeReward(s,id){if(s.phase!=='reward'||(id!==null&&!s.rewards.includes(id)))return false;if(id)s.deck.push(id);s.rewards=[];s.phase='map';return true}
function rest(s,choice){if(s.phase!=='rest')return false;if(choice==='heal'){const n=Math.ceil(s.maxHp*.3);s.hp=Math.min(s.maxHp,s.hp+n);s.notice=`모닥불에서 체력을 ${n} 회복했습니다.`}else if(choice==='study'){s.deck.push('focus');s.notice='깊은 호흡 카드를 얻었습니다.'}else return false;s.phase='map';return true}
function event(s,choice){if(s.phase!=='event')return false;if(choice==='tea'){s.hp=Math.min(s.maxHp,s.hp+12);s.notice='따뜻한 차로 체력을 12 회복했습니다.'}else if(choice==='charm'){if(s.relic){s.maxHp+=4;s.hp=Math.min(s.maxHp,s.hp+4);s.notice='부적의 힘으로 최대 체력이 4 증가했습니다.'}else{s.relic=true;s.notice='종이 부적 획득: 매 턴 방어도 +1'}}else return false;s.phase='map';return true}
const api={discoverCards,growth,gainExperience,applyGrowth,CARDS,HEROES,shuffle,createRun,route,draw,enter,canPlay,selectCard,cancelQuestion,resolveCard,continueAfterCard,endTurn,takeReward,rest,event,cardDescription};root.KanaGame=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
