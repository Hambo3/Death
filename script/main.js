var rf = (function(){
  return window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(cb){
          window.setTimeout(cb, 1000 / 60);
      };
})();

var lastTime;
var now;
var dt = 0;
var fps = 60;
var slowMo = 1;
var step = 1 / fps;
var sStep = slowMo * step;


var gameAsset;
var Renderer;
var Sound;
var level = 0;

var map = {
	size:{
		tile:{width:32, height:32},
		iso:{width:40, height:32},
		screen:{width:25, height:19}			
	},
	colliders:{
		hit:[12,13,14],
		over:[5,6,7,8,15,16]
	},
	levels:[
		{
			dim:{width:116, height:137},data:"1,1179|12,84|1,32|12|1,82|12|1,32|12|1,24|19,49|1,9|12|1,32|12|1,24|19|24,11|19|24,11|19|24,11|19|24,11|19|1,9|12|1,32|12|1,24|19|24,11|19|24,11|19|24,11|19|24,11|19|1,9|12|1,32|12|1,24|19|24,11|19|24,11|19|24,11|19|24,11|19|1,9|12|1,32|12|1,24|24,24|19|24,11|19|24,11|19|1,9|12|1,32|12|1,24|24,24|19|24,11|19|24,11|19|1,9|12|1,32|12|1,12|16|15|1,10|19|24,11|19|24,11|19|24,11|19|24,11|19|1,9|12|1,32|12|1,24|19|24,11|19|24,11|19|24,11|19|24,11|19|1,9|12|1,32|12|1,24|19|24,11|19|24,11|19|24,11|19|24,11|19|1,9|12|1,13|6,12|1,7|12|1,24|19,17|24,3|19,9|24,3|19,9|24,3|19,5|1,9|12|1,18|6,14|12|1,36|19|24,11|19|24,11|19|24,11|19|1,9|12|1,21|6,3|5,3|6,5|14|6|1,34|25|19|24,11|19|24,11|19|24,11|19|1,9|12|1,25|6,7|14|6,2|1,32|25,2|19|24,11|19|24,11|19|24,11|19|1,9|12|1,29|6,3|14|5,2|6|1,32|25|24,36|19|1,9|12|1,30|6,2|14|6|5,2|6|1,20|15,2|1,10|24,36|19|1,9|12|1,32|12|6,2|5,2|6,3|1,9|15,3|1,6|16|1,10|19|24,11|19|24,11|19|24,11|19|1,9|12|1,32|12|1|6,7|1,8|16|15,3|1,16|19|24,11|19|24,11|19|24,11|19|1,9|12|1,32|12|1,3|6,6|1,9|16|15,3|1,14|19|24,11|19|24,11|19|24,11|19|1,9|12|1,32|12|1,4|6,6|1,26|19,29|24,3|19,5|1,9|12|1,32|12|1,4|9,2|6,5|1,37|19|24,11|19|24,11|19|1,9|12|1,32|13|3,2|1,3|9|6,5|1,37|19|24,11|19|24,11|19|1,9|12|1,30|3,2|13|3,3|1,2|9,2|6,4|1,37|19|24,11|19|24,11|19|1,9|12|1,30|3,2|13|1|3,3|1|9,2|6,5|1,5|0|1,30|19|24,23|19|1,9|12|1,18|3|1,11|3,2|13|3,4|1,2|9|6,5|1,36|19|24,23|19|1,9|12|1,19|3|1,10|3,2|13|3,3|1,4|6,5|1|0|1,3|4|1,2|0|1,27|19|24,11|19|24,11|19|1,9|12|1,30|3,2|13|3,3|1,4|6,5|1|0|1,3|4|1,2|0|1,27|19|24,11|19|24,11|19|1,9|12|1,32|13|3,3|1,4|6,5|1,4|25,2|1,30|19|24,11|19|24,11|19|1,9|12|1,32|12|1,7|6|5|6,3|1|2|1|25,2|4|1|2|1|0|1,3|15,3|1,20|19,5|24,3|19,17|1,9|12|1,17|3|1,14|12|1,7|8|5|6,3|1,3|4|25|4,2|1|2|1,2|16|15,3|1,8|16|15,3|1,13|19|24,3|19|1,25|12|1,17|3|1,14|12|1,8|6|5|6,2|1,2|4,6|2|1,3|16|15,4|1,7|16|15,5|1,13|25,3|1,24|12|1,17|3|1,14|12|1,8|6|5,2|6,2|0|1|4,4|1,7|16|15|1,10|16|15|1,16|25|1,25|12|1,32|12|1,8|8|6|5|6|1|6|1,3|4|1|0|1,62|12|1,32|12|1,9|8|6,4|1|2,3|1,41|15,2|1,21|12|1,32|12|1,10|6,7|7|6|25,3|1,8|0|1,26|15,5|1,20|12|1,32|12|1,10|8|6,8|18,3|1,35|16|15,4|1,20|12|1,32|12|1,13|6|5|6,4|17,3|6,3|1,2|0|1,2|2|1,3|0|1,23|16|15,2|1,21|12|1,32|12|1,14|5,3|6,2|18,3|6,5|1|2|1,25|0|1,27|12|1,32|12|1,2|3,2|6,3|1,10|5,2|17,3|6,5|2|1,2|4|1,4|0|1,16|0|1,29|12|1,32|12|1,2|3|1,2|6,2|1,12|18,3|9,2|6,4|1|4,3|1,2|2|1,16|0,2|1|2|1,2|0|1,24|12|1,32|12|1|3|1,3|6,2|1,12|25,3|9,2|5|6,3|4,6|2|1,5|6|1,11|2|1,29|12|1,32|12|1,5|6|1,17|9|5,2|6|7|1|4,3|1,5|6|5,2|6,2|1,9|2|1,2|4|1|2|1|0|1,23|12|1,32|12|1,4|6|1,10|6,3|1,5|9|6|5|1|6|1,2|4|1|0,2|1,2|6|5,3|6,2|1,11|4,3|1|2|1,24|12|1,32|12|1,4|8|1,10|6,3|1,5|9|6|5|1|6|1,2|4|1|0,2|1,2|6|5,3|6,2|1,11|4,3|1|2|1,24|12|1,32|12|1,11|3,3|1|6,2|1,5|9,2|6|5|6,2|2,3|1,4|6,2|5,2|6,3|1,10|4,5|2|1,20|6,4|14|6,13|1,19|12|1,11|3,2|1,2|6,2|1,7|6|5,2|6|1,2|0|1|2,2|1|6|5,3|6,3|1,9|0|1|4,3|1,13|25,2|1,3|6,8|14|6,7|1,12|3|1,12|12|1,11|3|1,3|6,2|1,7|6|5,2|6|1,4|6,3|5,2|6,5|1,7|2,2|1,3|4|1|0|1,11|25,3|6,8|1,3|12|1,32|12|1|6|1,9|3|1,2|6,4|1,6|6,2|5|6,2|1,2|6,6|9,2|6|5|6|1,10|2,3|1,13|25|17,2|6,4|1,7|12|1,16|3|1,15|12|6,3|1,11|6,5|1|23|1,3|6,5|1|6,5|9,4|6|5|6|1,12|0|1|2,2|1,7|6,4|18,2|6,2|1,9|12|1,31|6|14|6,4|1,10|8|6,5|1,4|8|6,9|7|9,4|5,2|6|1,21|6,6|17,2|25|1,10|12|1,32|12|6,3|1,12|8|6,3|1,2|23|1,4|6,5|7|6,2|1,3|9,2|5|6,2|1,20|6,6|25,4|1,10|12|1,32|12|1|8|1,15|8|1,3|23|1,4|6,4|7,2|1,2|2|1,2|0|9|5|6,2|1,14|9,3|6,5|1,9|4,2|1,7|12|1,32|12|1,20|23|1,5|8|6,4|2|1,6|9|6,4|1,12|9,3|6,5|1,10|4|1,8|12|1,32|12|1,13|0|1,6|23,2|1|15,2|1,2|8|6,2|2|1,3|4|1|2|1|0|1|6,9|1,4|9,3|6,5|1,12|0,2|1|2|1,5|12|1,32|12|1,11|0|1,5|15,2|1|23,2|1|15,2|1,7|4,4|1|2|1,2|8|6,2|5,3|6,6|9,3|6,4|1,2|4,2|1,7|4,2|1,2|4|1,7|12|1,32|12|1,10|0,2|1|2|1,3|16|15,2|23,2|1|15,2|1,6|4,6|2|1,3|8|7|6,2|9,2|6,5|9,2|6,4|1,2|4,2|1,8|4,2|1|4|1,2|4|1|2|1|0|1|12|1,26|3|1,5|12|1,11|2|1,6|16|15|23,2|1|15,2|1,5|0,2|4,4|1|0|1,2|0|9,6|6,9|1,3|4,2|1,14|4,3|1|4|1,2|12|1,32|12|1,10|2|1,2|4|1|2,2|1|0|15|23,2|1|16|1,5|2|1|2|1,2|4|0,2|1,2|0,2|1|2|1|9|10|9|6|7|6,6|1,19|4,5|2|1,2|12|1,32|12|1,12|4,3|1,2|2|1|16|15|23|1,8|2,4|4|0|2,2|0|1|2|1,5|10|8|6,6|1,14|4|1|4|1|4|0|1|4,3|1,4|12|1,32|12|1,11|4,6|2|1,2|23,2|1,10|4,4|2|4|1|2|1,2|4|1|2|0,3|1|6,3|7|6|1,9|4,2|1,3|4|1,2|4,2|1,3|4|1,5|12|1,32|12|1,11|4,6|2|1,3|23|1,10|4,4|2|4|25|2|1,2|4|1|2|0,3|1|8|6,2|7|6|1,9|4,2|1,3|4|1,2|4,2|1,3|4|1,5|12|1,32|12|1,10|0|1|4,3|1,5|23,2|1,9|4,6|25,3|1|4,3|1|2,2|1,4|8|6,5|1,6|4,2|1|2,2|4|1|4|1|4|1|2|4,2|1,5|12|1,32|12|1,9|2|1,3|4|1|0,2|1|25|1|23,5|1,3|23|1|0|1|4,6|25,2|4,6|1|2|4|1,3|8|7|6,3|1,12|4,3|1|2|1,4|4,2|1,2|12|1,32|12|1,11|2,2|4|1,4|25|23,8|1,2|2|0|1|2,2|4,6|2|4,3|0|2|1|4,4|0|1|6,7|1|6,2|1,5|4,6|1,8|12|1,32|12|1,13|0|1|2,3|25|23,2|1,2|23,3|1,4|2,4|4|1|4,4|2,2|4|1|2|0|4,6|2|8|1|6,9|1,4|4,4|1,2|4,2|1,6|12|1,32|12|1,18|23,2|1,9|2|1,2|4,2|2,2|4,3|2|4,2|2|4|1,2|4,6|2|0,3|1,3|6,6|2|1,4|4|1|0|1,9|12|1,32|12|1,18|23,2|1,11|4,4|2|4|2|4|2|4,3|2|4,7|2|1,10|8|6,2|1,3|2|4,2|1|4,2|1,8|12|1,32|12|1,17|23,2|1,11|4,8|2|4,14|2,2|0,2|1,6|6,2|1,7|4,2|1,8|12|1,32|12|1,17|23,2|1,6|0|1,3|0|1|4,14|2,2|4,5|1|4|2,2|1,6|6,3|1,17|12|1,32|12|1,16|23,2|1,6|0,2|1|2,2|1|0|1|4,12|2|4,10|2|1,3|9,3|6,2|1,18|12|1,32|12|1,16|23,2|1,7|2|1,4|2|4,3|2|4,10|1|4,7|25,3|1,2|9,2|6,4|1,6|4,3|1,9|12|1,32|12|1,5|19,2|1|24|1|19,3|1,2|23,2|1,7|2|1,2|4|1|2,6|4,2|1|2|4,14|25,2|18|9,3|6,4|1,8|4|1,10|12|1,32|12|1,5|19|24,2|1,2|24,2|19|1,2|23,2|1,9|4,3|0|2|1,3|2|4,3|2|4,13|2|25|18,2|17|9|6,3|1,8|23|1,12|12|1,32|12|1,5|25,2|1,2|24,3|19|1,2|23,2|1,8|4,5|2,2|1,2|4,19|18,2|17|18,2|6,2|1,8|23|1,13|12|1,32|12|1,5|25,2|24,5|19|1,2|23,2|1,7|0|1|4,3|2|1,2|0,2|1|4,3|1,3|4|2|1|4,4|0|9,5|17|18,2|17,2|25,8|1|23|1|23|1,11|12|1,32|12|1,8|19,5|1,11|0|1|4,3|2|1,2|0,2|1|4,3|1,3|4|2|1|4,4|0|9,6|18|17,2|18,2|1|25,8|23|25|1,11|12|1,32|12|1,7|24|1|24,3|19|1,2|23|1,7|2|1|0|1|4|2|0|1|4|1,2|2|1|4|1|0|2,2|4,2|1|2|4,2|0,2|9,5|6,2|17|18|25|23,2|25,7|23,2|25,2|1,10|12|1,32|12|1,5|24|1,5|24,2|1,11|0|2,2|4|1,2|4,4|2|4|2|1,4|0|1|4,3|1|9|1,3|6,5|25,2|23,4|25,5|23,2|25,4|1,9|12|1,32|12|1,6|24|1,9|23|1,8|2|1|0|1|4,6|2|0|1|2,2|1,5|10,2|1|4|1,2|6|5|6,2|1,3|25|23,4|25,4|23,2|25,4|1,9|12|1,32|12|1,9|24,3|19|1,11|2|1,2|4|0|2|4,4|1,10|11|9,2|6,4|5,2|6|1,3|25,3|23,4|25,3|23,2|25,4|1,9|12|1,32|12|1,10|19,3|1,13|4,3|1|2|4|1,2|0|1,8|11|9,2|6|5,5|6|9|1,2|25,5|23,4|1|23,2|25,6|1,8|12|1,32|12|1,3|2|1,2|0|1,18|4,6|2|1,8|9,2|11|6,4|5|1|6|5|6|9,2|1,2|25,6|23,6|25,6|1,8|12|1,32|12|1|2|1,22|0|1|4,3|1,2|0|1,2|2,2|1,2|9,3|6,6|1|6,2|5|6|9|1,3|25,7|23,4|25,7|1,8|12|1,32|12|4|1,2|4|1|2|1|0|1,2|23,2|1,11|2|1,3|4|1|0|1,7|9,2|6,5|1,3|3,2|6|5|9|1,4|25,8|23,5|25,5|1,8|12|1,32|12|1,2|4,3|1|2|1,3|23,2|1,13|2,3|1,6|9,3|6,5|1,2|3,4|6,3|9|1,4|25,7|23,2|25,2|23,3|25,4|1,8|12|1,32|12|1|4,5|2|1,3|23,2|1,15|0|1|2,2|9,4|6,5|1|3,4|1|3,2|6,3|9|1,4|25,6|23,3|25,3|23,3|25,3|1,7|0|12|1,32|12|1,2|4,3|1,5|23,2|1,18|9,5|6,3|1|3,3|1,3|3,2|6,2|9,3|1,4|25,6|23,2|25,7|23|25,2|1,5|0|1,2|12|1,31|2|12|1,3|4|1|0|1,4|23,2|1,16|9,3|6,5|1|3,3|1,5|3|6,3|9,2|1,5|25,5|23,2|25,9|23|25|1,5|0|1|2|12|1,32|12|1|2|1,8|23|1,14|9,5|6,5|3,3|1,7|3|1|6|9,3|1,6|25,3|23,3|25,8|23|25|23|1,5|2|1,2|12|1,32|12|1,5|4|2|1,3|23|1,13|9,5|6,3|1,2|3,2|1,8|3,2|6,2|9,3|1,6|25,2|23,3|25,10|1,6|2|1,2|4|13|1,32|12|1,9|23,3|1,11|9,5|6,3|1|3,3|1,9|3|1|6,2|9,3|1,6|25,2|23,2|25,11|0|1|2|1,2|0,2|1|4,2|13|1,32|12|1,9|23,2|1,12|9,4|6,3|1|3,3|1,10|3|6,2|9,2|1,8|23|25|23|25,11|1|2|1,6|4,3|13|1,32|12|1,9|23,2|1,12|9,4|6,3|1|3,3|1,10|3|6,2|9,2|1,7|23|25|23|25,10|1,3|2|1,6|4,3|13|1,32|12|1,9|23,2|1,9|9,7|6,2|3,3|1,2|0|1,9|3|6,2|9,2|1,13|25,4|1,8|4|1|2|1|2|1|4,2|13|1,32|12|1,9|23|1,10|9,6|6,3|3|1|0|1,12|3|6,2|9,2|1,6|23|1|23|1,15|4,3|2|4|1,3|4|13|1,32|12|1,8|23,2|1,9|9,6|6,3|3|1|0,2|1,2|2|1,9|3|6,2|9,2|1,23|4,5|2|4|2|4|2|12|1,32|12|1,8|23|1,6|9,10|6,2|3,2|1,2|2|1,12|3|6,2|9|1,18|0,2|1,2|0,2|1|4,3|0|4,3|1|2|12|1,32|12|1,8|23,2|1,4|9,10|6,3|3|1,2|2|25,2|1|4|1|2|1,7|3|6,2|9|1,16|0|1,4|0|2|1|2|0|4|2|4,5|2|12|1,32|12|1,9|23|1,3|9,10|6,3|1|3|1,2|25,2|4,4|1|2|0|1,5|3|6,2|9|1,16|0|1|2,2|1,2|2|1|2|4,2|1|2|4,3|0|1|12|1,32|12|1,13|9,8|6,3|1|3,3|1,3|25|4,5|2|1,5|25|3|6,2|25,2|1,10|0|1,4|2|1,4|2|1,2|4|1|4,2|2|4,2|0|1,2|12|1,32|12|1,8|23|1,3|9,9|6,2|1|3,3|1,3|0|1|4,4|0|1|2|1,2|0|1|25|18|17|18|25|1,9|0|1,5|2|1,2|4,2|1|2|1|4,9|0,2|12|1,32|12|1,9|23|9,10|6,3|3,4|1,2|2|1,4|4|1|4|1,6|25|18|17|18|25|1,8|0,2|1|2|1,2|0|1,2|4,4|1|4,11|2|12|1,25|0|1,5|0|12|1,8|23,2|9,8|6,4|3,4|1,5|2,3|4|2|1,2|4|1|2|1|0|25|18|17|18|25|1,9|2|1,6|4,6|2|4,10|1|12|1,32|12|1,9|9,5|6,6|7|1|3,3|1,9|0|1|2|4,3|1|2|1|25|3|6,2|1,9|2|0|1|4|1|2|0,2|1|4,4|1,2|2|4|2|1|4,6|1|12|1,30|2|1|12|0|1,7|23|9|6,8|7|1|3,3|1,13|4,5|2|1,2|3|6,2|1,10|2|4,3|0|4|1|0,2|4,2|1|2,3|4,2|2|4,4|1,3|12|1,31|2|12|1,8|25|9|6,5|3,5|4|1,2|0|1,11|0|1|4,3|1,4|3|8|6|1,9|2|4,5|2|0|2,2|4,2|1,4|0|4,6|0|1,2|12|1,31|2|12|1,8|18,2|6,2|1|3,4|1|2|1,15|2|1,3|4|1|0|1,3|3,2|6,2|1,8|0|1|4,3|2,2|1|2,2|0,3|4|2,2|1|4,8|1|12|1,32|12|1,6|6,2|17,2|1,2|3,2|1,3|2|1,2|4|1|2|1,13|2,2|4|1,6|3|6,2|1,7|2|1|4,6|1,5|4,3|1|2|1|4,3|0|1|4,2|1|12|1,24|2|1,5|0|1|12|1,6|6,2|18,2|3,2|1,7|4,3|1|2|1,14|0|1|2,2|1,3|3|6,3|1,7|0|2|4,4|1|2|4|25|4,6|2|1,2|4|1|0|1,4|12|1,24|2|1,5|0|1|12|1,6|6,2|17,2|3,2|1,7|4,3|1|2|1,14|0|1|2,2|1,3|3|6|5|6|1,7|0|2|4,4|1|2|25,3|4,5|2|1,2|4|1|0|1,4|12|1,32|12|1,4|6,4|25|3,2|1,7|4,5|2|1,21|3|6|5|6|1,6|2|1,3|4,6|25|4,5|1,2|2,3|1,6|12|1,28|0|1,2|2|12|1,4|6,3|3,2|1,8|0|1|4,3|1,23|3|1|6,2|5|6|1,6|2,2|4,9|2|4|1|0|1,3|0|1|2,2|1,3|12|1,32|12|1,3|6,3|3,2|1,7|2,2|1,3|4|1|0|1,22|3,2|8|6,4|1,6|0,2|4,6|2,4|1,12|12|1,32|12|1,2|6,3|3,2|1,11|2,2|4|1,26|3|8|6,4|1,4|2|1,2|2|4|1|0|4|1|0,2|1|0|1|2,2|1,9|12|1,32|12|1,2|6,3|3|1,14|0|1|2,2|1,23|3,2|8|6,4|1,5|2,6|1,17|12|1,32|12,3|14,3|13|12,41|13,3|14,4|12,29|1,1173"
			,spawn:{	
				plr:{x:85,y:95},
				wall:[],
				tree:[],
				sign:[{x:55,y:24,i:8},
					{x:76,y:41,i:7},
					{x:38,y:74,i:6},
					{x:73,y:81,i:5},
					{x:80,y:86,i:2},
					{x:85,y:91,i:1},
					{x:77,y:101,i:3},
					{x:67,y:110,i:4}
					],
				prince:[{x:63,y:14},
					{x:74,y:14}
					],
				gold:[{x:36,y:39},
					{x:58,y:72},
					{x:25,y:84},
					{x:51,y:109},
					{x:85,y:120},
					],	
				bread:[],
				stone:[]
			}	
		}
	]
};

/*****************************/
function Start(canvasBody)
{	
	// Create the canvas
	var canvas = document.createElement("canvas");
	if(canvas.getContext)
	{
		var ctx = canvas.getContext("2d");
		canvas.width = (map.size.screen.width * map.size.tile.width);
		canvas.height = (map.size.screen.height * map.size.tile.height);

		var b = document.getElementById(canvasBody);
    	b.appendChild(canvas);

		Renderer = new Rendering(ctx, {w:canvas.width, h:canvas.height}, 
			{x1:32,x2:32, y1:32,y2:96});

		Sound = new TinySound();
		init();
	}
}

function init()
{  
  var now = timestamp();	
	lastTime = now;

	gameAsset = new Game(map, level);

	FixedLoop();  
}

function SlowMo(mo){
	sStep = mo * step;
}

function FixedLoop(){
	if(Input.IsSingle('Escape') ) {
		gameAsset = new Game(map, level);
	}

	now = timestamp();
	dt = dt + Math.min(1, (now - lastTime) / 1000);
	while (dt > sStep) {
	  dt = dt - sStep;
	  update(step);
	}

	render();
				
	lastTime = now;
	rf(FixedLoop);
}

function timestamp() {
	var wp = window.performance;
	return wp && wp.now ? wp.now() : new Date().getTime();
}

// Update game objects
function update(dt) {
	gameAsset.Update(dt);
};

function render() {
	gameAsset.Render();
};

onkeydown = function(e)
{
    Input.Pressed(e, true);
};

onkeyup = function(e)  {
    Input.Pressed(e, false);
    Input.Released(e, true);
};

onblur = function(e)  {
    Input.pressedKeys = {};
};

window.onload = function() {
	Start("canvasBody");
}
