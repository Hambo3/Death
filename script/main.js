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

var level = 0;

var map = {
	size:{
		tile:{width:32, height:32},
		iso:{width:40, height:32},
		screen:{width:25, height:19}			
	},
	colliders:{
		home:[7],
		hit:[8,9,10],
		over:[4,5,6],
		fend:[8]
	},
	levels:[
		{
			dim:{width:68, height:55},data:"0,68|1,68|0,68|1,4|10,60|1,4|0,4|9|0,58|9|0,4|1,4|9|1,58|9|1,4|0,4|9|0,58|9|0,4|1,4|9|1,58|9|1,4|0,4|9|0,23|4|0,19|5|0,14|9|0,4|1,4|9|1,16|4|1,17|5|1,23|9|1,4|0,4|9|0,16|4|0,2|6|0,38|9|0,4|1,4|9|1,25|6|1,32|9|1,4|0,4|9|2,24|0,10|2,24|9|0,4|1,4|9|3,18|6|3,5|1,2|6|1,4|4|1,2|3,24|9|1,4|0,4|9|2,24|0,10|2,24|9|0,4|1,4|9|3,24|1,10|3,4|6|3,19|9|1,4|0,4|9|2,24|0,5|4|0,4|2,24|9|0,4|1,4|9|1,58|9|1,4|0,4|9|0,33|6|0,4|6|0,19|9|0,4|1,4|9|1,58|9|1,4|0,4|9|0,58|9|0,4|1,4|9|1,44|5|1,13|9|1,4|0,4|9|0,58|9|0,4|1,4|9|1,58|9|1,4|0,4|9|0,37|5|0,20|9|0,4|1,4|9|1,58|9|1,4|0,4|9|2,58|9|0,4|1,4|9|3,58|9|1,4|0,4|9|2,58|9|0,4|1,4|9|3,39|6|3,18|9|1,4|0,4|9|2,58|9|0,4|1,4|9|1,30|5|1,27|9|1,4|0,4|9|0,24|6|0,13|6|0,19|9|0,4|1,4|9|1,58|9|1,4|0,4|9|0,27|6|0,30|9|0,4|1,4|9|1,23|6|1,34|9|1,4|0,4|9|0,35|5|0,22|9|0,4|1,4|9|1,58|9|1,4|0,4|9|0,42|5|0,15|9|0,4|1,4|9|1,22|5|1,35|9|1,4|0,4|9|1,58|9|0,4|1,4|9|0,58|9|1,4|0,4|9|0,58|9|0,4|1,4|9|1,58|9|1,4|0,4|9|0,58|9|0,4|1,4|9|1,9|5|1,48|9|1,4|0,4|9|0,52|5|0,5|9|0,4|1,4|9|1,41|5|1,16|9|1,4|0,4|9|0,58|9|0,4|1,4|9|1,58|9|1,4|0,4|9|0,58|9|0,4|1,4|10,60|1,4|0,68|1,68|0,68"
			,spawn:{	
				plr:{x:16,y:22},
				wall:[{x:29,y:17},
					{x:30,y:17},
					{x:31,y:17},
					{x:34,y:17},
					{x:35,y:17},
					{x:36,y:17},
					{x:37,y:17},
					{x:38,y:17},
					{x:29,y:18},
					{x:38,y:18},
					{x:29,y:19},
					{x:38,y:19},
					{x:29,y:20},
					{x:38,y:20},
					{x:29,y:21},
					{x:38,y:21},
					{x:29,y:22},
					{x:30,y:22},
					{x:31,y:22},
					{x:34,y:22},
					{x:35,y:22},
					{x:36,y:22},
					{x:37,y:22},
					{x:38,y:22},
					{x:29,y:23},
					{x:38,y:23},
					{x:29,y:24},
					{x:38,y:24},
					{x:29,y:25},
					{x:38,y:25},
					{x:29,y:26},
					{x:38,y:26},
					],
				tree:[
					{x:5,y:5},{x:6,y:5},{x:7,y:5},{x:26,y:5},{x:27,y:5},{x:28,y:5},
					{x:4,y:6},{x:29,y:6},
					{x:4,y:12},{x:4,y:13},{x:4,y:14},{x:29,y:12},{x:29,y:13},{x:29,y:14},
					{x:4,y:22},{x:4,y:21},{x:4,y:20},{x:29,y:22},{x:29,y:21},{x:29,y:20}
				],
				home:[{x:9,y:5},{x:12,y:5},{x:15,y:5},{x:18,y:5},{x:21,y:5},{x:24,y:5}]
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

			Music = new AudioManager(
				[
					{
						key:C.sound.music1,
						src:"content/loop2.wav",//audioSources[C.sound.music1],
						type:"loop"
					}				
				]);

		Sound = new AudioManager(
			[
				{
					key:C.sound.alert,
					src:audioSources.alert,
					type:"play"
				},
				{
					key:C.sound.beep,
					src:audioSources.beep,
					type:"play"
				},
				{
					key:C.sound.splash,
					src:audioSources.splash,
					type:"play"
				},
				{
					key:C.sound.hop1,
					src:audioSources.hop1,
					type:"play"
				},
				{
					key:C.sound.hop2,
					src:audioSources.hop2,
					type:"play"
				},
				{
					key:C.sound.splat,
					src:[
						audioSources.splat1,
						audioSources.splat2
					],
					type:"sequence"
				},
				{
					key:C.sound.pickup,
					src:[
						audioSources.frog,
						audioSources.fart,
						audioSources.ping
					],
					type:"sequence"
				}				
			]);		

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
	// if(input.isSingle('Y') ) {
	// 	slowMo+=1;
	// 	SlowMo(slowMo);
	// }
	// else if(input.isSingle('T') ) {
	// 	slowMo-=1;
	// 	SlowMo(slowMo);
	// }
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

window.onload = function() {
	Start("canvasBody");
}
