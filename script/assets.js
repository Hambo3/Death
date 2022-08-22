//Player
(function() {
    function Hero(x, y) {
        this.type = C.ass.player;
        this.enabled = false;

        this.width = 16;
        this.length = 16;
        this.home = {x:x,y:y};
        this.x = x;
        this.y = y;
        this.z = 0;
        this.dx = 0;
        this.dy = 0; 
        this.size = 1;

        this.jumping = false;
        this.dest = {x:0, y:0};

        this.accel = 140;  

        this.action = C.act.up;
        this.motion = 0;
        this.death = 0;
        this.lives = 1;
        this.score = 0;
        this.count = 0;
        this.onHold = 0;
        this.bases = [];
        this.recovery = 0;
        this.hat = 40;
        this.shadow = {src:assets.tile, col:C.col.shadow};

        this.body = [ 
            [{src:Util.Merge([assets.hero.bodyV,assets.hero.up]), col:C.col.man}],
            [{src:Util.Merge([assets.hero.bodyV,assets.hero.down]), col:C.col.man}],
            [{src:Util.Merge([assets.hero.bodyH,assets.hero.left]), col:C.col.man}],
            [{src:Util.Merge([assets.hero.bodyH,assets.hero.right]), col:C.col.man}],
            [{src:assets.splat, col:C.col.man}],
            [{src:[], col:C.col.man}]
        ];  

        this.reset = function(die){
            if(die){
                this.count=128;
                this.death = die;
                this.lives--;                
            }
            this.jumping = false;
            this.dx = 0;
            this.dy = 0;
            this.z = 0;
            this.riding = null;
        }
        this.start = function(restart){
            if(restart){
                if(restart>1){
                    this.lives = 3;
                    this.score = 0;   
                }
                this.recovery = 0;                         
            }
            this.x = this.home.x;
            this.y = this.home.y;
            this.anims = [];
            var h = new Grunt(this.x, this.y, {src:assets.hat, col:C.col.black, size:0.6}, C.ass.null);
            h.z = this.hat;//hat
            this.anims.push(h);
            this.enabled = true;
            this.action = C.act.up;
            this.death = 0;
            gameAsset.zoomOut = 1;
            gameAsset.zoomIn = 0;

            gameAsset.time=60*26;
            this.reset();
        }
        this.LevelCompleted = function(){
            return this.recovery == 6;
        }
    };

    Hero.prototype = {
        
        Logic: function(dt){
            var speed = this.accel * dt;

            if(this.death == 0)
            {
                if(this.onHold==0){
                    if(!this.jumping)
                    {
                        var inp = {
                            up:Input.Up(),
                            down:Input.Down(),
                            left:Input.Left(),
                            right:Input.Right()
                        };
                        AssetUtil.InputLogic(inp, this, speed, 32);  

                        if(this.jumping){
                            if(Util.OneIn(30)){
                                Sound.Play(C.sound.hop2);
                            }
                            else{
                                Sound.Play(C.sound.hop1);
                            }
                            gameAsset.firstTime = false;
                            this.riding = null;
                        }
                    }
                    else
                    {
                        var t = AssetUtil.HopLogic(this, 32, 12);
                        if(!this.jumping)// landed
                        {
                            //check what landed on
                            if(map.colliders.over.indexOf(t) != -1){
                                if(t == 6){
                                    this.action = C.act.splash;
                                    //Sound.Play(C.sound.splash);
                                    this.reset(C.act.fall);

                                    for(var i=0;i<this.anims.length;i++){
                                        this.anims[i].mt = {x: Util.Rnd(60)-30, y: Util.Rnd(60)-30, z:200};
                                    }
                                }
                                else if(t == 4 || t == 5){//water
                                    this.action = C.act.splash;
                                    Sound.Play(C.sound.splash);
                                    this.reset(C.act.splash);
                                    this.anims[0].enabled = false;
            
                                    for(var i=0;i<16;i++){
                                        this.anims.push(
                                            new Grunt(this.x, this.y, {src:assets.square, col:C.col.splash, size:0.3}, 0,
                                                {x: Util.Rnd(60)-30, y: Util.Rnd(60)-30, z:200}, true));    
                                    }
                                }
                            }
                        }
                    }
                }
                else{
                    if(--this.onHold==0){
                        this.onHold = 0;
                        this.start();   
                        gameAsset.SetCamera(this);
                    }
                }
            }
            else{
                if(this.count>0){
                    if(--this.count == 0){
                        if(this.lives == 0)
                        {            
                            this.death = C.act.dead;
                            this.enabled= false;
                        }
                        else{ 
                            this.start();
                        }
                    }
                }
            }
        },
        Update: function(dt){
            this.x += this.dx;
            this.y += this.dy;
            
            for(var i=0;i<this.anims.length;i++){
                if(this.anims[i].enabled){
                    if(this.death == 0){
                        this.anims[i].x = this.x;
                        this.anims[i].y = this.y;
                        this.anims[i].z = this.z+this.hat;
                    }
                    else{
                        this.anims[i].Update(dt);
                    }
                }
            }
        },
        Collider: function(perps){
            if(this.death == 0){
                if(this.jumping){
                    //determine if can jump
                    var d = AssetUtil.Collisions(this, perps, this.jumping);

                    if(d && (d.type == C.ass.van || d.type == C.ass.null || d.type == C.ass.shed)){
                        this.reset();

                        for(var i=0;i<this.anims.length;i++){
                            this.anims[i].dt = {x: Util.Rnd(60)-30, y: Util.Rnd(60)-30, z:200};
                        }
                    }
                    
                }              

                //collect pickup
                var d = AssetUtil.Collisions(this, perps, false);
                if(d && (d.type == C.ass.pickup )){
                    d.enabled = false;
                    //var val = (Util.RndI(0,5)*50)+100;
                    //this.score += val;

                    //gameAsset.PickupScore(val, d.x-32, d.y-64, 4, {x: 0, y: -64, z:0, sz:2}, PAL[C.pal.pickup]);
                
                    Sound.Play(C.sound.pickup);
                }

                // if(d && (d.type == C.ass.car )){
                //     this.action = C.act.splat;
                //     Sound.Play(C.sound.splat);
                //     this.reset(C.act.splat);
                //     for(var i=0;i<this.anims.length;i++){
                //         this.anims[i].mt = {x: Util.Rnd(60)-30, y: Util.Rnd(60)-30, z:200};
                //     }
                // }               
            }
        },
        Render: function(os, scale){
            var x = this.x;
            var y = this.y;

            var pt = Util.IsoPoint(x*scale, y*scale);

            if(this.death == 0){
                Renderer.PolySprite(pt.x-os.x, pt.y-os.y, this.shadow.src, this.shadow.col, 1, 0.5);
            }    

            Renderer.PolySprite(pt.x-os.x, pt.y-os.y-(this.z*scale), 
                this.body[this.action][this.motion].src, 
                this.body[this.action][this.motion].col+(this.death==0 ? this.lives-1 : this.lives), this.size  );    


            for(var i=0;i<this.anims.length;i++){
                if(this.anims[i].enabled){                  
                    this.anims[i].Render(os, scale);
                }
            }
        }
    };

    window.Hero = Hero;
})();


//log
(function() {
    function Log(x, y, type, subtype, dir, speed) {
        this.type = type;
        this.enabled = true;

        this.width = 16;
        this.length = 16;
        this.x = x;
        this.y = y;
        this.z = 0;
        this.dx = 0;
        this.dy = 0; 
        this.size = 1;

        this.accel;

        //this.action = 0;
        this.motion = 0;

        this.body = [ 
            [{src:assets.log.left, col: C.col.log}],
            [{src:Util.OneOf([assets.log.mid,assets.log.mid2]), col: C.col.log}],
            [{src:assets.log.right, col: C.col.log}]
        ];

        this.Set = function(speed, dir, subtype){
            this.accel = speed * dir;
            this.action = subtype;
            //this.width = 32;
        }
  
        this.Set(speed, dir, subtype);
    };

    Log.prototype = {
        
        Logic: function(dt){
            var speed = this.accel * dt;
            this.dx = -speed;
        },
        Update: function(dt){
            this.x += this.dx;
            this.y += this.dy;
        },
        Collider: function(perps){
            var t = gameAsset.scene.Content(this.x, this.y);
            if(map.colliders.fend.indexOf(t) != -1){  
                this.enabled = false;
            }
        },
        Render: function(os, scale){
            var x = this.x;
            var y = this.y;

            var pt = Util.IsoPoint(x*scale, y*scale);
    
            Renderer.PolySprite(pt.x-os.x, pt.y-os.y-this.z, 
                this.body[this.action][this.motion].src, 
                this.body[this.action][this.motion].col, this.size  );              
        }
    };

    window.Log = Log;
})();

//car
(function() {
    function Car(x, y, type, dir, speed) {
        this.type = type;
        this.enabled = true;

        this.width = 64;
        this.length = 16;
        this.x = x;
        this.y = y;
        this.z = 0;
        this.dx = 0;
        this.dy = 0; 
        this.size = 1;

        this.accel;

        this.action = 0;
        this.motion = 0;

        this.body = [];

        this.Set = function(speed, dir){
            this.accel = speed * dir;
            var t = Util.RndI(0,2);
            if(t==0){
                this.width=64;
                this.body = [ 
                    [{src:assets.car, col: Util.OneOf([C.col.car1,C.col.car2,C.col.car3,C.col.car4])}]
                ];
            }
            else{
                this.width=48;
                this.body = [ 
                    [{src:dir==1 ? assets.vanL :assets.vanR, col: Util.OneOf([C.col.car0,C.col.car4,C.col.car3])}]
                ];                
            }

        }
  
        this.Set(speed, dir);
    };

    Car.prototype = {
        
        Logic: function(dt){
            var speed = this.accel * dt;
            this.dx = -speed;
        },
        Update: function(dt){
            this.x += this.dx;
            this.y += this.dy;
        },
        Collider: function(perps){
            var t = gameAsset.scene.Content(this.x, this.y);
            if(map.colliders.fend.indexOf(t) != -1){  
                this.enabled = false;
            }
        },
        Render: function(os, scale){
            var x = this.x;
            var y = this.y;

            var pt = Util.IsoPoint(x*scale, y*scale);
    
            Renderer.PolySprite(pt.x-os.x, pt.y-os.y-this.z, 
                this.body[this.action][this.motion].src, 
                this.body[this.action][this.motion].col, this.size  );              
        }
    };

    window.Car = Car;
})();


//a character that can be a tree or simple animatable object
(function() {
    function Grunt(x, y, b, type, motion, die, stack) {
        this.type = type;
        this.enabled = true;
        this.x = x;
        this.y = y;
        this.z = 0;
        this.width = 32;
        this.length = 32;
        this.mt = motion;
        this.follow;
        this.body = b;        
        this.die = die;
        this.alpha = 1;
        this.stack = stack || 1;
        this.ht = 16;
    };

Grunt.prototype = {
    Logic: function(dt){
    },
    Collider: function(perps){
    },
    Update: function(dt){
        if(this.enabled)
        {
            if(this.mt)
            {
                this.x += this.mt.x*dt;
                if(this.mt.y){
                    this.y += this.mt.y*dt;
                    if(this.y > this.mt.desty)
                    {
                        this.enabled = !this.die;
                        this.mt=null;
                    }
                }
                if(this.mt){
                    this.z += this.mt.z*dt;

                    if(this.mt.z){
                        this.mt.z -= (400*dt);
                        if(this.z < 0)// && this.die)
                        {
                            this.enabled = !this.die;
                            this.mt=null;
                        }
                    }
                }
            }
            else if(this.follow){
                this.enabled = this.follow.enabled;
                this.x += this.follow.dx;
                this.y += this.follow.dy;
            }
        }
    },
    Render: function(os,scale){
        var x = this.x;
        var y = this.y;

        var pt = Util.IsoPoint(x*scale, y*scale);

        for (var i = 0; i < this.stack; i++) {
            Renderer.PolySprite(pt.x-os.x, pt.y-os.y-(this.z*scale)-(this.ht*i), 
                this.body.src, 
                this.body.col, this.body.size, this.alpha );    
        }  
    }
};

window.Grunt = Grunt;
})();

(function() {
    function PickupText(val, x, y, size, col, motion, frames) {
        this.type = C.ass.ptext;
        this.enabled = true;
        this.x = x;
        this.y = y;
        this.z = 0;
        this.size = size;
        this.width = 32;
        this.length = 32;
        this.mt = motion;
        this.value = val;
        this.col = col;
        this.frames = frames;
    };

    PickupText.prototype = {
    Logic: function(dt){
    },
    Collider: function(perps){
    },
    Update: function(dt){
        if(this.enabled)
        {
            if(this.mt)
            {
                this.y += this.mt.x*dt;
                this.y += this.mt.y*dt;
                this.mt.z -= (400*dt);  
                this.size+=this.mt.sz*dt;
            }
            this.enabled = (--this.frames > 0);
        }
    },
    Render: function(os,scale){
        var x = this.x;
        var y = this.y;

        var pt = Util.IsoPoint(x*scale, y*scale);

        Renderer.Text(""+this.value, pt.x-os.x, pt.y-os.y-(this.z*scale), this.size, 1, this.col);     
    }
};

window.PickupText = PickupText;
})();




