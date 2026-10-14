(function(root){'use strict';const C={
 slots:{weapon:'무기',armor:'방어구',charm:'장신구'},
 grades:[{id:'common',name:'일반',color:'#a8acb3',min:1,max:2,options:0,cost:12},{id:'uncommon',name:'고급',color:'#78b8f5',min:2,max:3,options:1,cost:20},{id:'rare',name:'희귀',color:'#c398f2',min:3,max:4,options:2,cost:30},{id:'legendary',name:'전설',color:'#ffb365',min:4,max:5,options:3,cost:45},{id:'mythic',name:'신화',color:'#fb7a84',min:5,max:6,options:4,cost:65}],
 maxEnhance:10,enhanceScale:.06,enhanceFlat:{attack:1,hp:1,blockEvery:4},enhanceCostScale:.35,materialBase:1,materialStep:3,sellBase:12,dismantleBase:2,
 caps:{attack:12,hp:36,block:6,crit:.2,extra:.15,extraDamage:7,reduce:3,heal:3,draw:1,combo:4,shield:12},critMultiplier:1.5,extraDamage:4,
 dropChance:{battle:.38,elite:.85,guardian:1,boss:1,secret:1,treasure:1,event:1},
 weights:{battle:[76,23,1,0,0],elite:[5,55,37,3,0],guardian:[0,10,78,11,1],boss:[0,0,76,22,2],secret:[0,0,55,38,7],treasure:[35,40,22,3,0],event:[10,40,42,7,1]},
 bossNames:['머쉬맘의','신사 발록의','황혼 핑크빈의','서리 머쉬맘의','성주 발록의','서고 핑크빈의'],bossStatBonus:1,monsterChance:{slime:.45,snail:.35,stump:.5,mushroom:.4},
 monsterSlots:{slime:[1,1,3],snail:[1,3,1],stump:[1,3,1],mushroom:[2,1,1],mushmom:[2,2,1],balrog:[3,2,1],pinkbean:[1,1,3]},
 materials:{battle:1,elite:3,guardian:4,boss:7,secret:10,treasure:3,event:2},forgeGold:{battle:6,elite:15,guardian:20,boss:30,secret:45,treasure:12,event:8},
 regionNames:['새싹','안개','황혼','서리','홍련','별빛'],regionSets:['forest','forest','red','sky','red','sky'],
 sets:{forest:{name:'숲의 수호자',two:{block:1},three:{shield:6},desc:['2세트: 매 턴 방어 +1','3세트: 전투 시작 보호막 +6']},red:{name:'붉은 요괴',two:{attack:2},three:{extraDamage:3},desc:['2세트: 공격 +2','3세트: 정답 공격 추가 피해 +3']},sky:{name:'천공의 마도사',two:{hp:8},three:{comboDraw:1},desc:['2세트: 최대 체력 +8','3세트: 3연속 정답마다 다음 턴 카드 +1']}},
 options:{crit:{name:'치명타',value:.04,slot:'weapon'},extra:{name:'추가 공격 확률',value:.04,slot:'weapon'},reduce:{name:'피해 감소',value:1,slot:'armor'},shield:{name:'시작 보호막',value:2,slot:'armor'},heal:{name:'정답 회복',value:1,slot:'charm'},draw:{name:'첫 턴 추가 카드',value:1,slot:'charm'},combo:{name:'3연속 정답 피해',value:1,slot:'any'},hp:{name:'체력',value:3,slot:'any'}},
 firstBossGrade:'legendary',shopPrice:65
};root.KanaGearConfig=C;if(typeof module!=='undefined')module.exports=C})(globalThis);
