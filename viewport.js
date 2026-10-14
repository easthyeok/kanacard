'use strict';
(function(){
 function resize(){const view=window.visualViewport,height=view?view.height:window.innerHeight;document.documentElement.style.setProperty('--app-height',Math.round(height)+'px');fit()}
 function fit(){const layout=document.querySelector?.('.combat-layout'),screen=document.getElementById?.('screen');if(!layout||!screen)return;const height=window.visualViewport?.height||window.innerHeight,width=window.visualViewport?.width||window.innerWidth;const landscape=width>height&&height<600;document.body.classList.toggle('fit-layout',landscape);if(!landscape){screen.style.height='';return}const header=document.querySelector('body>header'),main=document.querySelector('main'),style=window.getComputedStyle(main);const available=Math.max(100,height-(header?.getBoundingClientRect().height||44)-parseFloat(style.paddingTop||0)-parseFloat(style.paddingBottom||0)-8);const space=screen.clientWidth||width;const scale=Math.min(1,available/480,space/720);screen.style.setProperty('--fit-scale',scale);screen.style.setProperty('--fit-width',(space/scale)+'px');screen.style.setProperty('--fit-height','480px');screen.style.height=(480*scale)+'px'}
 window.KanaFitLayout=fit;
 // A previously installed landscape manifest may have left an orientation lock.
 try{window.screen?.orientation?.unlock()}catch(e){}
 resize();window.addEventListener('resize',resize);window.addEventListener('orientationchange',resize);if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
})();
