/* Shared tuning: no DOM, assets, timers or paid services. */
(function(root){'use strict';
const config={
 cards:{strike:{damage:18},guard:{block:16,empower:8},focus:{block:8,empower:16,draw:0},flame:{damage:32},ice:{damage:14},barrier:{block:26,empower:12},flow:{damage:16},heal:{heal:12,block:8},spark:{damage:22},thunder:{damage:24},thorn:{damage:14,block:8},meteor:{damage:46},moon:{block:14},blossom:{heal:18,block:12},echo:{block:10,empower:18,draw:2}},
 world:{steps:6,startGold:55,hand:4,maxUpgrade:2,upgradeDamage:5,upgradeBlock:4,upgradeHeal:3,upgradeEmpower:4,survivalTurns:4,chainWaves:3,synergyDamage:8,synergyBlock:5,shopCard:45,shopRare:75,shopPotion:30,potionHeal:20,shopRelic:90,restHeal:.3,bossHeal:.35,challengeQuestions:3,challengeGold:20,challengePerfect:30,eventHeal:14,eventGold:30,eventDamage:8,treasureGold:35},
 enemies:{normalHp:46,regionHp:9,stepHp:3,eliteHp:85,bossHp:120,normalAttack:5,regionAttack:1,eliteAttack:8,bossAttack:10,heavyBonus:5,guard:8,bossPhaseAt:.5,bossPhasePower:1.2,guardianPower:1.15,waveHp:8},
 rewards:{battle:20,elite:45,boss:80,survival:35,chain:55,guardian:60,eliteRelicChance:.3},
 regions:[
 {id:'forest',name:'시작의 숲',theme:'숲과 초원',desc:'작은 글자부터 시작하는 길. 전투와 휴식의 균형을 익혀보세요.',colors:['#132c27','#557c45','#a8d08c'],skins:['slime','mushroom','snail'],boss:'머쉬맘',bossSkin:'mushmom',pattern:['attack','guard','heavy'],mood:'숲의 바람',notes:[60,64,67,71],tempo:900},
 {id:'shrine',name:'안개 낀 신사',theme:'달빛과 붉은 도리이',desc:'신사의 안개 너머에는 작은 선택과 긴 버티기의 시련이 기다립니다.',colors:['#211e38','#58486e','#c5addf'],skins:['stump','slime','snail'],boss:'신사의 발록',bossSkin:'balrog',pattern:['guard','heavy','attack'],mood:'신사의 종',notes:[57,62,64,69],tempo:1100},
 {id:'village',name:'황혼의 마을',theme:'등불과 전통 골목',desc:'상점에서 장비를 살피고 낯선 이의 제안을 살펴보세요.',colors:['#35222b','#986442','#f2c486'],skins:['snail','mushroom','stump'],boss:'등불의 핑크빈',bossSkin:'pinkbean',pattern:['attack','attack','guard','heavy'],mood:'저녁의 골목',notes:[60,65,69,72],tempo:800},
 {id:'mountain',name:'얼어붙은 산맥',theme:'눈보라와 얼음 계곡',desc:'차가운 바람을 견디고 빠른 읽기로 연속 공격을 이어가세요.',colors:['#162d44','#507e99','#c1ecff'],skins:['mushroom','stump','slime'],boss:'서리 머쉬맘',bossSkin:'mushmom',pattern:['heavy','guard','attack'],mood:'눈의 숨결',notes:[55,60,62,67],tempo:1250},
 {id:'castle',name:'붉은 요괴성',theme:'붉은 성벽과 화염',desc:'정예 전투의 위험을 감수하면 강력한 보상을 얻습니다.',colors:['#331b25','#864039','#f1a378'],skins:['stump','mushroom','slime'],boss:'성주의 발록',bossSkin:'balrog',pattern:['attack','heavy','heavy','guard'],mood:'성의 북소리',notes:[48,55,58,60],tempo:650},
 {id:'library',name:'천공의 서고',theme:'별빛과 마법 책장',desc:'쌓아온 카드와 기억으로 마지막 수호자에게 도전하세요.',colors:['#191e3d','#595984','#e0c5ff'],skins:['slime','snail','stump'],boss:'서고의 핑크빈',bossSkin:'pinkbean',pattern:['guard','heavy','attack','heavy'],mood:'별의 선율',notes:[60,67,71,76],tempo:1000}
 ],
 nodes:{battle:{icon:'戦',name:'일반 전투',risk:1,desc:'기본 카드 보상 · 금화 20'},elite:{icon:'鬼',name:'정예 전투',risk:3,desc:'강한 적 · 금화 45 · 유물 기회'},boss:{icon:'王',name:'지역 보스',risk:4,desc:'고유 패턴 · 희귀 카드 · 유물'},shop:{icon:'商',name:'상점',risk:0,desc:'금화로 카드·회복·유물 구매'},rest:{icon:'休',name:'휴식',risk:0,desc:'체력 회복 또는 카드 강화'},event:{icon:'縁',name:'랜덤 이벤트',risk:1,desc:'선택에 따라 바뀌는 보상'},treasure:{icon:'宝',name:'보물',risk:0,desc:'금화와 카드 또는 유물'},challenge:{icon:'学',name:'학습 도전',risk:1,desc:'일본어 3문제 · 정답별 금화'},survival:{icon:'耐',name:'생존 전투',risk:2,desc:'4턴 버티기 · 금화 35'},chain:{icon:'連',name:'연속 전투',risk:3,desc:'회복 없이 3연전 · 금화 55'},guardian:{icon:'護',name:'보물 수호자',risk:4,desc:'강력한 적 · 희귀 카드 확정'}},
 relics:{leaf:{name:'새싹 부적',icon:'葉',desc:'매 턴 방어 +2',block:2},ember:{name:'기억의 불씨',icon:'灯',desc:'정답 공격 피해 +3',attack:3},spring:{name:'샘물 병',icon:'泉',desc:'전투 승리 시 체력 6 회복',heal:6},feather:{name:'바람 깃털',icon:'羽',desc:'매 전투 첫 턴 카드 +1',draw:1},coin:{name:'여행자의 동전',icon:'銭',desc:'전투 승리 금화 +10',gold:10},book:{name:'별빛 책갈피',icon:'栞',desc:'정답 카드의 다음 공격 강화 +4',empower:4}}
};
root.KanaConfig=config;if(typeof module!=='undefined')module.exports=config;
})(globalThis);
