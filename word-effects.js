'use strict';
(function(root){
function glyphs(word){const chars=Array.from(String(word)).filter(c=>!/[・、\s]/.test(c)),size=Math.max(1,Math.ceil(chars.length/12)),out=[];for(let i=0;i<chars.length;i+=size)out.push(chars.slice(i,i+size).join(''));return out}
function sample(elapsed,index){const start=250+index*75;return{progress:Math.max(0,Math.min(1,(elapsed-start)/1000)),started:elapsed>=start,impact:elapsed-start-1000}}
function launch(field,word){if(!field||!root.requestAnimationFrame||!root.document.createElement)return false;const hero=field.querySelector('.hero-actor'),enemy=field.querySelector('.enemy-unit svg');if(!hero||!enemy)return false;
 const rect=field.getBoundingClientRect(),h=hero.getBoundingClientRect(),e=enemy.getBoundingClientRect(),canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');canvas.className='word-flight-canvas';Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'30',pointerEvents:'none'});const scale=Math.min(root.devicePixelRatio||1,2);canvas.width=Math.round(rect.width*scale);canvas.height=Math.round(rect.height*scale);const ctx=canvas.getContext('2d');if(!ctx)return false;ctx.scale(scale,scale);field.appendChild(canvas);
 const letters=glyphs(word),from=h.left+h.width*.7-rect.left,to=e.left+e.width*.5-rect.left,y=e.top+e.height*.5-rect.top,reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;let first;
 function frame(now){if(!canvas.isConnected)return;if(first===undefined)first=now;const time=now-first;ctx.clearRect(0,0,rect.width,rect.height);ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
 letters.forEach((letter,i)=>{const s=sample(time,i),bend=(i%3-1)*34;if(!s.started&&!reduced)return;ctx.save();
 if(reduced){ctx.font='bold 26px sans-serif';ctx.fillStyle='#efffff';ctx.fillText(letter,from+i*30,y-45)}
 else if(s.impact<0){const x=from+(to-from)*s.progress,py=y+Math.sin(s.progress*Math.PI)*bend;ctx.globalAlpha=Math.min(1,(time-(250+i*75))/100+.15);const trail=ctx.createLinearGradient(x-110,py,x,py);trail.addColorStop(0,'#55ccff00');trail.addColorStop(1,'#9cefffcc');ctx.fillStyle=trail;ctx.fillRect(x-110,py-4,100,8);ctx.font=`900 ${Math.min(52,rect.width*.075)}px "Noto Serif JP",serif`;ctx.shadowColor='#58d9ff';ctx.shadowBlur=18;ctx.lineWidth=5;ctx.strokeStyle='#15394f';ctx.strokeText(letter,x,py);ctx.fillStyle='#f5ffff';ctx.fillText(letter,x,py)}
 else if(s.impact<450){const p=s.impact/450;ctx.globalAlpha=1-p;ctx.strokeStyle='#bafaff';ctx.shadowColor='#6bdfff';ctx.shadowBlur=18;ctx.lineWidth=4*(1-p);ctx.beginPath();ctx.arc(to,y,12+60*p,0,Math.PI*2);ctx.stroke();for(let n=0;n<8;n++){const a=n*Math.PI/4;ctx.beginPath();ctx.moveTo(to+Math.cos(a)*15,y+Math.sin(a)*15);ctx.lineTo(to+Math.cos(a)*(28+65*p),y+Math.sin(a)*(28+65*p));ctx.stroke()}ctx.font='bold 38px serif';ctx.fillStyle='#fff';ctx.fillText(letter,to,y-50*p)}ctx.restore()});
 if(time<2600)root.requestAnimationFrame(frame);else canvas.remove()}
 root.requestAnimationFrame(frame);return true}
root.KanaWordFx={glyphs,sample,launch};
})(globalThis);
