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

        this.alt = 0;
        this.action = C.act.up;
        this.motion = 0;
        this.death = 0;
        this.lives = 1;
        this.score = 0;
        this.count = 0;
        this.onHold = 0;
        this.hat = 40;
        this.shadow = {src:assets.tile, col:C.col.shadow};

        this.reading = 0;
        this.stones = 0;
        this.bread = 0;
        this.readTimer = 0;
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
                this.count=256;
                this.death = die;
                this.lives--;                
            }

            this.jumping = false;
            this.dx = 0;
            this.dy = 0;
            this.z = 0;
        }
        this.start = function(restart){
            if(restart){
                if(restart>1){
                    this.lives = 1;
                    this.score = 0;   
                }
                this.recovery = 0;                         
            }
            this.x = this.home.x;
            this.y = this.home.y;
            this.anims = [];
            this.hat = 40;
            var h = new Grunt(this.x, this.y, {src:assets.hat, col:C.col.hat, size:0.6}, C.ass.null);
            h.z = this.hat;
            this.anims.push(h);
            this.enabled = true;
            this.action = C.act.up;
            this.death = 0;
            gameAsset.zoomOut = 1;
            gameAsset.zoomIn = 0;
            this.stones = 0;
            this.bread = 0;
            this.reading = 0;
            this.readTimer = 0;
            gameAsset.pickupTxt = null;
            this.reset();
        }
        this.LevelCompleted = function(){
            return this.recovery == 6;
        }
        this.Fall = function(){
            this.action = C.act.splash ;
            Sound.Play(C.sound.fall);
            this.reset(C.act.fall);

            for(var i=0;i<this.anims.length;i++){
                this.anims[i].mt = {x: Util.Rnd(60)-30, y: Util.Rnd(60)-30, z:200};
            }
        }

        this.Splash = function(){
            this.action = C.act.splash;
            Sound.Play(C.sound.splash);
            this.reset(C.act.splash);
            this.anims[0].enabled = false;
            this.hat = 0;
            this.Splish(this.x, this.y);
        }
        this.Splish = function(x, y, sz){
            for(var i=0;i<16;i++){
                gameAsset.assets.Add(
                    new Grunt(x, y, {src:assets.square, col:C.col.splash, size:sz?0.1:0.3}, 0,
                        {x: Util.Rnd(60)-30, y: Util.Rnd(60)-30, z:200}, true));    
            }
        }
    };

    Hero.prototype = {
        
        Logic: function(dt){
            var speed = this.accel * dt;

            if(this.death == 0)
            {
                if(!this.jumping)
                {
                    var inp = {
                        up:Input.Up(),
                        down:Input.Down(),
                        left:Input.Left(),
                        right:Input.Right(),
                        fire1:Input.Fire1(),
                        fire2:Input.Fire2()
                    };

                    if(inp.fire1 && this.stones>0){
                        gameAsset.assets.Add(new Stone(this, this.x, this.y, {src:assets.square, col:C.col.items, size:0.2}, 
                                        {x: this.action==C.act.rt ? 64 : this.action==C.act.lt ? -64 : 0, 
                                        y: this.action==C.act.dn ? 64 : this.action==C.act.up ? -64 : 0, z:200},
                                        {x: this.action==C.act.rt ? this.x+64 : this.action==C.act.lt ? this.x-64 : this.x, 
                                        y: this.action==C.act.dn ? this.y+64 : this.action==C.act.up ? this.y-64 : this.y}));
                        this.stones--;  
                        if(gameAsset.pickupTxt!=null)
                        {
                            gameAsset.pickupTxt=null
                        }
                    }
                    else
                    {
                        AssetUtil.InputLogic(inp, this, speed, 32);  
                    }


                    if(this.jumping){                        
                        gameAsset.firstTime = false;

                        if(inp.fire2 && this.bread>0)
                        {
                            gameAsset.assets.Add(
                                new Grunt(this.x, this.y-1, 
                                    {src:assets.square, col:C.col.items, size:0.1}, C.ass.null, null,false, 0 )
                            );
                            this.bread--;
                            if(gameAsset.pickupTxt!=null)
                            {
                                gameAsset.pickupTxt=null
                            }
                        }
                    }

                }
                else
                {
                    var t = AssetUtil.HopLogic(this, 32, 12);
                    if(!this.jumping)// landed
                    {
                        //check what landed on
                        //4 way
                        var dz = gameAsset.holes.filter(l => l.e && ( (l.x == this.x && (l.y >= this.y-32 && l.y <= this.y+32))
                                                            || (l.y == this.y && (l.x >= this.x-32 && l.x <= this.x+32)) ));

                        //8 way
                        // var dz = gameAsset.holes.filter(l => ( (l.x*32 >= this.x-32 && l.x*32 <= this.x+32) 
                        //                                     && (l.y*32 >= this.y-32 && l.y*32<= this.y+32) ));
                        if(dz.length != 0){
                            this.onHold = 1;
                            var txt = "! ".repeat(dz.length);
                            gameAsset.Text(txt, this.x-80, this.y-64, 5, {x: 0, y: -100, z:0, sz:3}, PAL[C.pal.pickup]);
                            if(gameAsset.helps[2]){
                                gameAsset.helps[2] = 0;
                                gameAsset.pickupTxt = Util.IntTxt(HLP[2], dz.length);
                                this.readTimer = 8;
                            }
                        }

                        //mine collision
                        if(dz.filter(l => ( l.x == this.x && l.y == this.y )).length == 1)
                        {
                            if(t==12 || t==13){
                                this.Splash();
                                gameAsset.scene.SetContent(this.x, this.y, 5);
                            }
                            else{
                                this.Fall();
                                gameAsset.scene.SetContent(this.x, this.y, 7);
                            }
                            dz[0].e = 0;
                            //gameAsset.holes = gameAsset.holes.filter(l => l != dz[0]);
                        }

                        if(map.colliders.over.indexOf(t) != -1){     
                            if(t == 6 || t==7){
                                this.Fall();
                            }
                            else if(t == 4 || t == 5){//water
                                this.Splash();
                            }                                
                        }

                        if(t == 0 || t==1){
                            Sound.Play(C.sound.hop1);
                        }
                        else{
                            Sound.Play(C.sound.hop2+this.alt);
                        }
                        this.alt = 1-this.alt;
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
            if(this.onHold>0){
                this.onHold-=dt;
            }
            if(this.readTimer>0)
            {
                this.readTimer -= dt;
                if(this.readTimer<=0){
                    gameAsset.pickupTxt=null;
                }
            }
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
            this.reading=0;
            if(this.death == 0){
                if(this.jumping){
                    //determine if can jump
                    var d = AssetUtil.Collisions(this, perps, this.jumping, true);

                    var dx = d.filter(l => l.type == C.ass.wall || l.type == C.ass.hard);
                    if(dx.length>0){
                        this.reset();
                    }
                }

                //collect pickup
                var d = AssetUtil.Collisions(this, perps, false);
                var dx = d.filter(l => l.type == C.ass.pickup1 || l.type == C.ass.pickup2 || l.type == C.ass.sign);
                if(dx.length>0){
                    dx.forEach(e => {                        
                        if(e.type == C.ass.pickup1){
                            this.stones++;
                            e.enabled = false;
                            Sound.Play(C.sound.collect1);
                            if(gameAsset.helps[0]){
                                gameAsset.helps[0] = 0;
                                gameAsset.pickupTxt = HLP[0];
                                this.readTimer = 6;
                            }
                        }
                        else if(e.type == C.ass.pickup2){
                            this.bread+=3;
                            Sound.Play(C.sound.collect1);
                            e.enabled = false;
                            if(gameAsset.helps[1]){
                                gameAsset.helps[1] = 0;
                                gameAsset.pickupTxt = HLP[1];
                                this.readTimer = 6;
                            }
                        }
                        else if(e.type == C.ass.sign){
                            this.reading=e.alt;
                            if(gameAsset.pickupTxt!=null)
                            {
                                gameAsset.pickupTxt=null;
                                this.readTimer = 0;
                            }
                        }
                    });
                }
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
        this.alt = null;
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
    function Stone(parent, x, y, b, motion,dest) {
        this.parent = parent;
        this.drone = new Grunt(x, y, b, C.ass.null, motion, 1 );
        this.enabled = true;
        this.x = x;
        this.y = y;
        this.width = 8;
        this.length = 8;
        this.z = 0;
        this.dest = dest
    };

    Stone.prototype = {
    Logic: function(dt){
    },
    Collider: function(perps){
        var d = AssetUtil.Collisions(this, perps, false, true);
        var dx = d.filter(l => l.type == C.ass.hard || l.type == C.ass.wall);
        if(dx.length>0){
            this.enabled = false;
            this.drone.enabled = false;
        }
    },
    Update: function(dt){
        this.x = this.drone.x;
        this.y = this.drone.y;
        if(this.enabled)
        {
            this.drone.Update(dt);  
            if(!this.drone.enabled) {
                
                var x = this.dest.x;
                var y = this.dest.y;
                var dz = gameAsset.holes.filter(l => l.e && ( l.x == x) && ( l.y == y));

                if(dz.length == 1)
                {
                    var t = gameAsset.scene.Content(x, y);
                    if(t==12 || t==13){
                        gameAsset.scene.SetContent(x, y, 4);                        
                    }
                    else{
                        gameAsset.scene.SetContent(x, y, 7);
                    }
                    dz[0].e = 0; //disable
                    //gameAsset.holes = gameAsset.holes.filter(l => l != dz[0]);
                }
                else
                {
                    var t = gameAsset.scene.Content(x, y);
                    if(t==4 || t==5){
                        this.parent.Splish(x, y, true);
                    }
                    else if(t!=6 && t!=7)
                    {
                        gameAsset.assets.Add(
                            new Grunt(x, y-1, 
                                {src:assets.square, col:C.col.items, size:0.2}, C.ass.pickup1, null,true, 0 )
                        );
                    }
                }
            }
            this.enabled = this.drone.enabled;
        }
    },
    Render: function(os,scale){
        if(this.enabled)
        {
            this.drone.Render(os,scale);
        }
    }
};

window.Stone = Stone;
})();

(function() {
    function PickupText(txt, x, y, size, col, motion, frames) {
        this.type = C.ass.ptext;
        this.enabled = true;
        this.x = x;
        this.y = y;
        this.z = 0;
        this.size = size;
        this.width = 32;
        this.length = 32;
        this.mt = motion;
        this.txt = txt;
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

        Renderer.Text(this.txt, pt.x-os.x, pt.y-os.y-(this.z*scale), this.size, 1, this.col);     
    }
};

window.PickupText = PickupText;
})();




