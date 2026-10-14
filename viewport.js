'use strict';
(function(){
 function resize(){const height=window.visualViewport?window.visualViewport.height:window.innerHeight;document.documentElement.style.setProperty('--app-height',Math.round(height)+'px')}
 resize();window.addEventListener('resize',resize);window.addEventListener('orientationchange',resize);if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
})();
