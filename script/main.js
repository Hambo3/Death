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
		hit:[8,9],
		over:[4,5,6,7]
	},
	levels:[
		{
			dim:{width:68, height:55},data:"0,68|1,68|0,68|1,8|8,49|1,11|0,8|9|0,47|9|0,11|1,8|8|1,47|8|1,11|0,8|9|0,47|9|0,11|1,8|8|1,47|8|1,11|0,8|9|0,47|9|0,11|1,8|8|1,23|13,3|1,21|8|1,11|0,8|9|0,20|4,3|12,3|4,4|0,17|9|0,11|1,8|8|1,18|5|4,4|13,3|4,4|1,17|8|1,11|0,8|9|0,19|5|4,3|12,3|4,5|0,16|9|0,11|1,8|8|1,20|5|4,2|13,3|4,5|1,16|8|1,11|0,8|9|0,17|5|0,5|12,3|0,21|9|0,11|1,8|8|1,47|8|1,11|0,8|9|0,47|9|0,11|1,8|8|1,27|7|1,11|7|1,7|8|1,11|0,8|9|0,47|9|0,11|1,8|8|1,32|7|1,14|8|1,11|0,8|9|0,47|9|0,11|1,8|8|1,9|7|6|1,36|8|1,11|0,8|9|0,42|5|0,4|9|0,11|1,8|8|1,30|3,2|1,15|8|1,11|0,8|9|0,17|5|4,3|0,9|2,2|0,15|9|0,11|1,8|8|1,5|7|6,2|1,10|5|4,2|1,9|3,2|1,7|5|1,7|8|1,11|0,8|9|0,6|7|6,2|0,21|2,2|0,15|9|0,11|1,8|8|1,30|3,2|1,15|8|1,11|0,8|9|0,18|2,2|0,10|2,2|0,15|9|0,11|1,8|8|1,18|3,2|1,10|3,2|1,15|8|1,11|0,8|9|0,18|2,2|0,10|2,2|0,15|9|0,11|1,8|8|1,18|3,2|1,10|3,2|1,15|8|1,11|0,8|9|0,18|10,2|0,4|2,2|0,4|10,2|0,15|9|0,11|1,8|8|1,14|10,23|1,10|8|1,11|0,8|9|0,14|10,23|0,10|9|0,11|1,8|8|1,13|10,24|1,10|8|1,11|0,8|9|0,13|10,24|0,10|9|0,11|1,8|8|1,14|10,23|1,10|8|1,11|0,8|9|0,14|10,23|0,10|9|0,11|1,8|8|1,14|10,23|1,10|8|1,11|0,8|9|0,18|11,2|0,10|11,2|0,15|9|0,11|1,8|8|1,14|11,23|1,10|8|1,11|0,8|9|0,14|11,23|0,10|9|0,11|1,8|8|1,14|11,23|1,10|8|1,11|0,8|9|0,14|11,23|0,10|9|0,11|1,8|8|1,14|11,23|1,10|8|1,11|0,8|9|0,14|11,23|0,10|9|0,11|1,8|8|1,14|11,23|1,10|8|1,11|0,8|9|0,14|11,23|0,10|9|0,11|1,8|8|1,47|8|1,11|0,8|9|0,47|9|0,11|1,8|8,49|1,11|0,68|1,68|0,68"
			,spawn:{	
				plr:{x:28,y:47},
				wall:[{x:22,y:32},
					{x:23,y:32},
					{x:24,y:32},
					{x:25,y:32},
					{x:26,y:32},
					{x:29,y:32},
					{x:30,y:32},
					{x:31,y:32},
					{x:32,y:32},
					{x:33,y:32},
					{x:34,y:32},
					{x:35,y:32},
					{x:36,y:32},
					{x:37,y:32},
					{x:38,y:32},
					{x:41,y:32},
					{x:42,y:32},
					{x:43,y:32},
					{x:44,y:32},
					{x:45,y:32},
					{x:46,y:32},
					{x:22,y:33},
					{x:34,y:33},
					{x:46,y:33},
					{x:22,y:34},
					{x:34,y:34},
					{x:46,y:34},
					{x:34,y:35},
					{x:46,y:35},
					{x:46,y:36},
					{x:22,y:37},
					{x:46,y:37},
					{x:22,y:38},
					{x:34,y:38},
					{x:46,y:38},
					{x:22,y:39},
					{x:34,y:39},
					{x:46,y:39},
					{x:22,y:40},
					{x:23,y:40},
					{x:24,y:40},
					{x:25,y:40},
					{x:26,y:40},
					{x:29,y:40},
					{x:30,y:40},
					{x:31,y:40},
					{x:32,y:40},
					{x:33,y:40},
					{x:34,y:40},
					{x:35,y:40},
					{x:36,y:40},
					{x:37,y:40},
					{x:38,y:40},
					{x:41,y:40},
					{x:42,y:40},
					{x:43,y:40},
					{x:44,y:40},
					{x:45,y:40},
					{x:46,y:40},
					{x:22,y:41},
					{x:34,y:41},
					{x:46,y:41},
					{x:22,y:42},
					{x:34,y:42},
					{x:46,y:42},
					{x:22,y:43},
					{x:34,y:43},
					{x:46,y:43},
					{x:22,y:44},
					{x:34,y:44},
					{x:46,y:44},
					{x:22,y:45},
					{x:34,y:45},
					{x:46,y:45},
					{x:22,y:46},
					{x:34,y:46},
					{x:46,y:46},
					{x:22,y:47},
					{x:34,y:47},
					{x:46,y:47},
					{x:22,y:48},
					{x:34,y:48},
					{x:46,y:48},
					{x:22,y:49},
					{x:23,y:49},
					{x:24,y:49},
					{x:25,y:49},
					{x:26,y:49},
					{x:27,y:49},
					{x:28,y:49},
					{x:29,y:49},
					{x:30,y:49},
					{x:31,y:49},
					{x:32,y:49},
					{x:33,y:49},
					{x:34,y:49},
					{x:35,y:49},
					{x:36,y:49},
					{x:37,y:49},
					{x:38,y:49},
					{x:39,y:49},
					{x:40,y:49},
					{x:41,y:49},
					{x:42,y:49},
					{x:43,y:49},
					{x:44,y:49},
					{x:45,y:49},
					{x:46,y:49},
					],
				tree:[{x:14,y:7},
					{x:22,y:7},
					{x:24,y:8},
					{x:49,y:9},
					{x:12,y:11},
					{x:17,y:11},
					{x:21,y:12},
					{x:49,y:13},
					{x:13,y:16},
					{x:21,y:16},
					{x:54,y:16},
					{x:11,y:19},
					{x:15,y:22},
					{x:28,y:22},
					{x:29,y:22},
					{x:42,y:22},
					{x:26,y:23},
					{x:37,y:23},
					{x:41,y:23},
					{x:24,y:24},
					{x:38,y:24},
					{x:41,y:24},
					{x:19,y:25},
					{x:31,y:25},
					{x:32,y:25},
					{x:41,y:25},
					{x:19,y:26},
					{x:41,y:26},
					{x:38,y:27},
					{x:54,y:28},
					{x:55,y:28},
					{x:13,y:29},
					{x:54,y:29},
					{x:16,y:31},
					{x:51,y:35},
					]
			}	}
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
