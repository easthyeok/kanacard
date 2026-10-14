(function(root){'use strict';const C={
 layouts:[
 [['battle'],['battle','elite','challenge'],['survival','chain','guardian'],['shop','event','treasure'],['rest','event'],['boss','secret']],
 [['battle','challenge'],['event','treasure'],['survival','battle','event'],['shop','elite'],['event','guardian'],['rest','challenge'],['boss','secret']],
 [['battle','event'],['shop','treasure','event'],['chain','challenge','battle'],['rest','shop'],['boss','secret']],
 [['battle'],['survival','event'],['rest','elite','challenge'],['battle','treasure'],['survival','guardian'],['shop','rest'],['boss','secret']],
 [['elite','battle'],['event','treasure'],['guardian','battle'],['rest','challenge'],['chain','elite'],['shop','event'],['rest','guardian'],['boss','secret']],
 [['challenge','battle'],['event','shop','treasure'],['guardian','survival'],['challenge','chain'],['rest','event'],['elite','treasure'],['boss','secret']]
 ],
 hiddenReward:100,bossPatterns:[['attack','poison','guard','heavy'],['guard','drain','heavy'],['attack','confuse','guard','heavy'],['heavy','frost','guard'],['burn','heavy','attack'],['seal','guard','heavy']],status:{poisonDamage:2,poisonTurns:2,frostShield:6},hiddenCorrect:12,hiddenRelics:2,hiddenNames:['고대의 머쉬 퀸','봉인의 대요괴','황혼의 수호빈','빙하의 머쉬 퀸','심연의 발록','별을 삼킨 핑크빈'],
 eventPools:[['traveler','spring','spirit','armory','cave'],['altar','sealed','demon','spirit','cave'],['merchant','blacksmith','collector','traveler','spring'],['sealed','spirit','blacksmith','altar','cave'],['demon','armory','merchant','sealed','collector'],['library','altar','collector','cave','merchant']],
 prices:{forge:25,merchant:65,trade:20,damage:10,heal:18,materials:5},
 events:{
 traveler:{name:'길 잃은 여행자',choices:[['card','카드 교환','탐험 금화 30 · 무작위 고급/희귀 카드'],['work','짐 나르기','체력 8 소모 · 탐험 금화 30'],['leave','지나가기','변화 없음']]},
 spring:{name:'안개 속 샘물',choices:[['heal','샘물 마시기','체력 18 회복'],['gold','샘물 병에 담기','탐험 금화 30'],['leave','지나가기','변화 없음']]},
 blacksmith:{name:'떠돌이 대장장이',choices:[['forge','무기 연마','탐험 금화 25 · 장착 무기 +1, 없거나 +10이면 재료 3'],['materials','재료 줍기','강화 재료 5'],['leave','지나가기','변화 없음']]},
 merchant:{name:'수상한 상인',choices:[['rare','희귀 장비 구매','탐험 금화 65 · 지역 희귀 장비'],['materials','상인 돕기','강화 재료 5'],['leave','지나가기','변화 없음']]},
 sealed:{name:'봉인된 보물상자',choices:[['riskgear','봉인 부수기','체력 10 소모 · 희귀 장비'],['materials','겉의 결정 모으기','강화 재료 5'],['leave','지나가기','변화 없음']]},
 altar:{name:'고대 제단',choices:[['bless','피를 바치기','체력 10 소모 · 이번 탐험 매 턴 방어 +1'],['relic','금화 바치기','탐험 금화 30 · 무작위 유물'],['leave','지나가기','변화 없음']]},
 armory:{name:'버려진 무기고',choices:[['gear','쓸만한 장비 찾기','지역 무작위 장비'],['materials','잔해 분해하기','강화 재료 5'],['leave','지나가기','변화 없음']]},
 demon:{name:'요괴의 거래',choices:[['curse','계약하기','이번 탐험 적 공격 +1 · 전설 장비'],['gold','거절하고 길 묻기','탐험 금화 30'],['leave','지나가기','변화 없음']]},
 spirit:{name:'숲의 정령',choices:[['heal','정령의 샘','체력 18 회복'],['blessfree','정령의 축복','이번 탐험 매 턴 방어 +1'],['leave','지나가기','변화 없음']]},
 library:{name:'잊힌 서고',choices:[['upgrade','기본 공격 연구','문자의 칼날 +1, 최대 강화면 탐험 금화 30'],['card','희귀한 문장 필사','탐험 금화 30 · 무작위 고급/희귀 카드'],['leave','지나가기','변화 없음']]},
 cave:{name:'숨겨진 동굴',choices:[['cave','동굴 깊이 들어가기','비밀 보스 전투 · 희귀 이상 장비'],['unlock','통로 지도 그리기','이번 지역 숨겨진 보스 경로 개방'],['leave','지나가기','변화 없음']]},
 collector:{name:'장비 수집가',choices:[['exchange','보관 장비 교환','장착하지 않은 첫 장비 하나 · 희귀 장비로 교환'],['materials','수집 목록 정리','강화 재료 5'],['leave','지나가기','변화 없음']]}
 }
};root.KanaContent=C;if(typeof module!=='undefined')module.exports=C})(globalThis);
