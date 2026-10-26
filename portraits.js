'use strict';
function drawCharacter(c,x,y,h,alpha=1,pose='idle'){
if(h.archetype==='warrior')h={...h,id:'knight'};c.save();c.translate(x,y);c.globalAlpha=alpha;if(pose==='windup')c.rotate(-.15);if(pose==='strike')c.rotate(.2);c.lineJoin='round';c.lineCap='round';
const ellipse=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
const shape=(points,color,stroke='#172726')=>{c.beginPath();points.forEach(([a,b],i)=>i?c.lineTo(a,b):c.moveTo(a,b));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke()}};
const line=(a,b,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke()};
ellipse(0,20,18,5,'#07181388');
// Cape, boots and shaded tunic give the silhouette depth at a small size.
shape([[-10,-7],[-17,17],[0,13],[17,17],[10,-7]],h.dark);ellipse(pose==='strike'?-12:-6,17,5,4,'#192b30');ellipse(pose==='strike'?14:6,17,5,4,'#192b30');
const cloth=c.createLinearGradient(-12,0,12,15);cloth.addColorStop(0,h.color);cloth.addColorStop(1,h.dark);shape([[-9,-6],[9,-6],[12,13],[-12,13]],cloth);line([-8,7],[8,7],'#d5b477',3);ellipse(0,7,2,2,'#fae3a1');line([-13,-2],[-16,7],h.color,6);line([13,-2],pose==='strike'?[28,-8]:pose==='windup'?[8,-19]:[17,4],h.color,6);ellipse(-16,8,3,3,'#edc6a1');ellipse(pose==='strike'?29:pose==='windup'?8:17,pose==='strike'?-8:pose==='windup'?-19:5,3,3,'#edc6a1');
ellipse(0,-16,12,13,'#3a2d2b');ellipse(0,-13,10,10,'#edc6a1');ellipse(-7,-11,2.6,1.5,'#e69d8e');ellipse(7,-11,2.6,1.5,'#e69d8e');ellipse(-4,-14,1.7,2.5,'#263336');ellipse(4,-14,1.7,2.5,'#263336');ellipse(-4.4,-15,0.6,0.8,'#fff2d9');ellipse(3.6,-15,0.6,0.8,'#fff2d9');line([-2,-7],[2,-7],'#a16a55',1);
shape([[-10,-20],[-5,-27],[5,-27],[10,-20],[5,-18],[2,-22],[-1,-18],[-5,-20],[-9,-16]],h.id==='fox'?'#b76139':'#4d3d42',null);
if(h.id==='fox'){
shape([[-12,-19],[-13,-35],[-3,-25]],h.dark);shape([[12,-19],[13,-35],[3,-25]],h.dark);shape([[-10,-24],[-11,-31],[-6,-26]],'#f4d2a6',null);shape([[10,-24],[11,-31],[6,-26]],'#f4d2a6',null);shape([[11,10],[20,2],[27,5],[25,14],[16,18]],h.dark);shape([[21,3],[27,5],[25,11],[21,9]],'#fff0cf',null);line([-6,-2],[5,3],'#f7ddab',3);line([18,-4],[22,-15],'#d6e2d5',3);
}else if(h.id==='knight'){
shape([[-12,-15],[-12,-26],[0,-32],[12,-26],[12,-15],[8,-17],[7,-23],[-7,-23],[-8,-17]],h.dark);line([-8,-25],[7,-25],h.color,3);shape([[-2,-31],[-3,-39],[4,-37],[5,-30]],'#e2b279');ellipse(-12,-2,5,4,h.color);ellipse(12,-2,5,4,h.color);shape([[16,-3],[21,-29],[25,-3]],'#e0edf0');line([16,-2],[26,-2],'#edc77f',3);line([21,0],[21,10],'#6e4e39',3);shape([[-21,1],[-12,-1],[-11,11],[-17,17],[-23,10]],h.dark);line([-17,3],[-17,11],h.color,2);
}else{
ellipse(0,-23,18,5,h.dark);shape([[-12,-24],[-8,-34],[2,-43],[6,-32],[12,-24]],h.dark);line([-10,-26],[9,-26],h.color,3);ellipse(0,-28,2.7,2.7,'#f3d08d');line([20,15],[20,-20],'#b88b57',3);ellipse(20,-22,6,7,h.color);ellipse(19,-24,2,3,'#f1ffe0');line([16,-15],[24,-15],'#f3d08d',2);if(h.id==='witch'){shape([[-2,-37],[2,-39],[4,-35],[1,-32]],'#f5d99c',null)}
}if(pose==='strike'){line([28,-8],[45,-17],'#fff1bf',4);line([36,-14],[39,-7],'#e6bd74',3)}c.restore();
}

window.drawKanaCharacter=drawCharacter;
