const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let queue=[],draws=[],removed=false;
const ctx={scale(){},clearRect(){},save(){},restore(){},fillRect(){},beginPath(){},arc(){},stroke(){},moveTo(){},lineTo(){},strokeText(){},fillText:(text,x,y)=>draws.push({text,x,y}),createLinearGradient:()=>({addColorStop(){}})};
const canvas={style:{},setAttribute(){},getContext:()=>ctx,isConnected:true,remove(){removed=true;this.isConnected=false}};
const env={document:{createElement:()=>canvas},requestAnimationFrame:fn=>queue.push(fn),matchMedia:()=>({matches:false})};env.globalThis=env;vm.createContext(env);vm.runInContext(fs.readFileSync(path.join(__dirname,'../word-effects.js'),'utf8'),env);
const fx=env.KanaWordFx;
assert.equal(fx.glyphs('あ・い・う').join(''),'あいう');assert.equal(fx.sample(405,0).progress,.5);
const field={getBoundingClientRect:()=>({left:0,top:0,width:1000,height:450}),querySelector:s=>({getBoundingClientRect:()=>s==='.hero-actor'?{left:100,width:100}:{left:700,top:100,width:100,height:100}}),appendChild(){}};
assert(fx.launch(field,'あいう'));
function frame(time){draws=[];queue.shift()(time);return draws}
frame(0);const halfway=frame(405);assert.equal(halfway.length,1);assert.equal(halfway[0].text,'あいう');assert.equal(halfway[0].x,460);assert(halfway[0].x>170&&halfway[0].x<750);
assert.equal(frame(730)[0].x,750);frame(2601);assert(removed);assert.equal(canvas.style.zIndex,'30');
console.log('PASS: real canvas rendering calls, three learned glyphs, midpoint, enemy contact, overlay priority and cleanup');
