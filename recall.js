/* Persistent recall priorities. Bundle mistakes are clues, not confirmed letter errors. */
(function(root){'use strict';
function priority(r,now=Date.now()){
 if(!r||(r.fastStreak||0)>=5)return 0;
 const misses=r.misses||0,slow=r.slow||0,suspect=r.bundleMisses||0;
 if(!misses&&!slow&&!suspect)return 0;
 const last=Math.max(r.lastMissAt||0,r.lastSlowAt||0,r.lastBundleMissAt||0),age=last?Math.max(0,now-last):Infinity;
 const recency=.5+1.5*Math.exp(-age/(7*86400000));
 return Math.min(30,(2*Math.sqrt(misses)+.6*Math.sqrt(slow)+.35*Math.sqrt(suspect)+3*(r.errorHeat||0))*recency/(1+(r.fastStreak||0)**2));
}
function pick(pool,records,rng=Math.random,now=Date.now()){
 const weighted=pool.map(c=>[c,priority(records?.[c.key],now)]).filter(([,w])=>w>0),total=weighted.reduce((sum,[,w])=>sum+w,0);if(!total)return null;
 let n=rng()*total;for(const [c,w]of weighted){n-=w;if(n<0)return c;}return weighted[weighted.length-1][0];
}
function pairs(stats,pool,now=Date.now()){
 const byKey=new Map(pool.map(c=>[c.key,c]));
 return Object.entries(stats.confusions||{}).map(([id,r])=>({id,...r,items:(r.keys||[]).map(k=>byKey.get(k)),weight:priority(r,now)})).filter(r=>r.items.length===2&&r.items.every(Boolean)&&r.items[0].reading!==r.items[1].reading).sort((a,b)=>b.weight-a.weight||b.misses-a.misses);
}
function pickPair(stats,pool,rng=Math.random,now=Date.now()){
 const list=pairs(stats,pool,now).filter(r=>r.weight>0),total=list.reduce((n,r)=>n+r.weight,0);if(!total)return null;
 let n=rng()*total;for(const r of list){n-=r.weight;if(n<0)return r;}return list[list.length-1];
}
function recordPair(stats,q,ok,selected,now){
 if(q.timedOut||selected==null)return;
 if(ok){const r=stats.confusions?.[q.confusionPair];if(r&&q.keys?.length===1&&r.keys.includes(q.keys[0])){r.hits=(r.hits||0)+1;r.fastStreak=q.fast?(r.fastStreak||0)+1:0;}return;}
 const alternative=q.choiceKeys?.[selected];if(!alternative||alternative.length!==q.keys?.length)return;
 const changed=q.keys.map((key,i)=>key===alternative[i]?null:[key,alternative[i]]).filter(Boolean);if(changed.length!==1)return;
 const keys=changed[0].sort(),id=keys.join('|');stats.confusions||={};const r=stats.confusions[id]||{keys,misses:0,hits:0};r.misses++;r.lastMissAt=now;r.fastStreak=0;stats.confusions[id]=r;
}
function record(stats,q,ok,now=Date.now(),selected=null){
 recordPair(stats,q,ok,selected,now);
 const keys=[...new Set(q.keys||[])];if(!keys.length)return;stats.recall||={};stats.kanaAnswered=(stats.kanaAnswered||0)+1;
 for(const key of keys){const r=stats.recall[key]||{streak:0,hits:0,misses:0};r.streak=ok?(r.streak||0)+1:0;r.errorHeat=(r.errorHeat||0)*.85;
  if(Number.isFinite(q.elapsed)){r.fastStreak=ok&&q.fast?(r.fastStreak||0)+1:0;r.lastMs=q.elapsed/(q.keys.length||1);if(ok&&!q.fast){r.slow=(r.slow||0)+1;r.lastSlowAt=now;r.errorHeat+=.4;}}
  if(ok){r.hits=(r.hits||0)+1;if(q.fast)r.errorHeat*=.45;}else if(keys.length===1){r.misses=(r.misses||0)+1;r.lastMissAt=now;r.errorHeat+=2;r.fastStreak=0;}else{r.bundleMisses=(r.bundleMisses||0)+1;r.lastBundleMissAt=now;r.errorHeat+=.35;r.fastStreak=0;}
  stats.recall[key]=r;
 }
 if(!ok&&keys.length>1){stats.kanaChecks||=[];keys.forEach((key,i)=>{if(!stats.kanaChecks.some(c=>c.key===key))stats.kanaChecks.push({key,due:stats.kanaAnswered+3+i*2});});stats.kanaChecks=stats.kanaChecks.slice(-64);}
}
function takeCheck(stats,pool){
 if((stats.kanaAnswered||0)-(stats.lastKanaCheckAt??-3)<3)return null;
 const checks=stats.kanaChecks||[],index=checks.findIndex(c=>c.due<=(stats.kanaAnswered||0)&&pool.some(p=>p.key===c.key));if(index<0)return null;
 const [check]=checks.splice(index,1);stats.lastKanaCheckAt=stats.kanaAnswered||0;return pool.find(c=>c.key===check.key);
}
const api={priority,pick,record,takeCheck,pairs,pickPair};root.KanaRecall=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
