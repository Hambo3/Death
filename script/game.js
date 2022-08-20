(function() {
    function Game(map, level) {

        var i =0;
        var set = [];
        for (let i = 0; i < 11; i++) {
            set.push( {src:assets.tile, col:i});           
        }

        this.maxLevel = 1;
        this.level = level;    
        this.scene = new MapManager(map.size, map.levels[this.level], set);
        this.screen = {w:map.size.screen.width*map.size.tile.width, h:map.size.screen.height*map.size.tile.height};

        this.gameState = MODE.title;
        this.scCol = 1;
        this.fadeOut = false;
        this.fadeIn = false;

        this.titleDood = {src:Util.Merge([assets.hero.bodyV,assets.hero.down]), col:C.col.man};
        this.zoom = 1;
        //this.photo = null;
        this.enableSound = true;
        this.zoomIn = 0;
        this.zoomOut = 0;
        this.isoIn = 0;
        //this.pickup = 500;
        //this.logPickup = false;
        this.firstTime = true;

        this.time=0;

        this.camera = null;
        this.SetCamera = function(p){
            this.camera = p;
        }


        this.reset = function(full){
            Renderer.Set(this.zoom);
            this.scene.Set(this.zoom);

            //this.carSpawn = [];
            this.assets = new ObjectPool(); 

            //add some pickups to the pool
            // for (var i = 0; i < 2; i++) {
            //     d = new Grunt(0,0, {src:assets.items[0], col:C.col.items,size:0.8}, C.ass.pickup);
            //     d.enabled = false;
            //     this.assets.Add(d);
            // }
            
            if(full){
                //this.multiplier = 0.7;
                this.level = 0;
                this.scene.Map(map.levels[this.level]);       
            }
            var spawn = map.levels[this.level > this.maxLevel ? this.maxLevel : this.level].spawn;
            var tw = map.size.tile.width;
            var th = map.size.tile.height;

            for (var i = 0; i < spawn.wall.length; i++) {
                var d = new Grunt(spawn.wall[i].x*tw, spawn.wall[i].y*th, 
                    {src:assets.wall, col:C.col.base}, C.ass.null );
                this.assets.Add(d);
            }

            for (var i = 0; i < spawn.tree.length; i++) {
                var d = new Grunt(spawn.tree[i].x*tw, spawn.tree[i].y*th, 
                    {src:Util.OneOf([assets.tree1, assets.tree2]), col:C.col.tree}, C.ass.null);
                this.assets.Add(d);
            }

            // AssetUtil.CarSpawn(this.carSpawn, spawn.carl, C.ass.car, 1, tw);
            // AssetUtil.CarSpawn(this.carSpawn, spawn.carr, C.ass.car, -1, tw);

            // AssetUtil.CarSpawn(this.carSpawn, spawn.logl, C.ass.log, 1, tw);            
            // AssetUtil.CarSpawn(this.carSpawn, spawn.logr, C.ass.log, -1, tw);

            if(full){
                this.player = new Hero(spawn.plr.x*tw, spawn.plr.y*th);      
            }

            this.assets.Add(this.player);   

            this.SetCamera(this.player);
            this.scene.ScrollTo(this.camera.x, this.camera.y, false);  
            //this.takePic = 64;
        };

        // this.steal = function(){
        //     var spawn = map.levels[this.level > this.maxLevel ? this.maxLevel : this.level].spawn;
        //     var garage = [0,0,0,0,0,0,1,1,1,1,2,2,3];
        //     garage.sort(() => Math.random() - 0.5);

        //     var stolen = [];
        //     this.stolenRaw = [];

        //     for (var i = 0; i < 6; i++) {
        //         var n = garage[i];
        //         this.stolenRaw.push(n);
        //         stolen.push({index:n, asset:n, value:Util.RndI(1,4) * ((n+1)*1500)});
        //     }

        //     this.stolenRaw.sort((a, b) => a - b);

        //     for (var i = 0; i < spawn.home.length; i++) {
        //         stolen[i].index = spawn.home[i].x*32;
        //     }

        //     this.player.bases = stolen;
        // }

        this.reset(true);
    };

    Game.prototype = {
        Update: function(dt){

            if(this.fadeOut){
                this.scCol = Util.SLerp(this.scCol, 1, 0.1);
                if(this.scCol > 0.9){
                    this.fadeOut = false;
                }                
            }
            if(this.fadeIn){
                this.scCol = Util.SLerp(this.scCol, 0, 0.1);
                if(this.scCol < 0.1){
                    this.fadeIn = false;
                }                
            }
            switch(this.gameState){
                case MODE.title:
                    if(input.isUp("SPACE")){
                        this.gameState= MODE.start;
                        this.timer = 192;
                        this.level = 0;
                        this.zoom=1;
                        Renderer.Set(this.zoom);
                        this.scene.Set(this.zoom);
                        this.reset(true);
                        //this.steal();
                        input.Clr();
                    }
                    break; 
                    case MODE.start:
                        if(--this.timer==0){
                            this.gameState= MODE.game;
                            this.fadeIn = true;
                            // var vans = this.assets.Get([C.ass.van, C.ass.pickup]);
    
                            // for(var e = 0; e < vans.length; e++) {
                            //     vans[e].enabled = false;
                            // } 
    
                            if(this.enableSound){
                                Music.Play(C.sound.music1);
                            }
                            this.player.start(2);
                            this.timer = 64;
                        }
                        break; 
                case MODE.game:
                    if(this.zoomIn > 0){
                        this.zoom = Util.Lerp(this.zoom, this.zoomIn, 0.005);
                        ISO = Util.Lerp(ISO, 0.70, 0.005);
                        if(this.zoom > (this.zoomIn - 0.01))
                        {
                            this.zoomIn = 0;
                        }
                        Renderer.Set(this.zoom);
                        this.scene.Set(this.zoom);
                    }
                    if(this.zoomOut > 0){
                        this.zoom = Util.Lerp(this.zoom, this.zoomOut, 0.05);
                        ISO = Util.Lerp(ISO, 0.95, 0.05);
                        if(this.zoom < (this.zoomOut - 0.01))
                        {
                            this.zoomOut = 0;
                        }
                        Renderer.Set(this.zoom);
                        this.scene.Set(this.zoom);
                    }

                    // if(Util.OneIn(this.takePic)){
                    //     var os = this.scene.ScrollOffset(); 
                    //     var pt = Util.IsoPoint(this.player.x-os.x, this.player.y-os.y);
                    //     this.photo = Renderer.Get(pt.x-100,pt.y-100,200,200);
                    //     this.takePic = 500;
                    // }
                    
                    if(this.player.death){
                        if(this.player.death == C.act.dead){
                            if(this.enableSound){
                                Music.Stop(C.sound.music1);
                            }
                            this.timer = 64;
                            input.Clr();
                            this.gameState = MODE.over;
                            this.news3 = Util.RndI(1,ON.length);
                            this.count=64;
                        }
                        else{
                            this.zoomIn = 2.5;
                            this.zoomOut = 0;
                            this.isoIn = 0.82;
                         }
                    }

                    if(this.player.LevelCompleted()){

                        input.Clr();
                        this.gameState = MODE.level;
                        this.fadeOut = true;
                        this.timer = 192;                        
                        if(this.enableSound){
                            Music.Stop(C.sound.music1);
                        }
                        this.level++;
                        //this.steal();
                    }
                    break; 
                case MODE.level:
                    if(--this.timer == 0){                        
                        this.scene.Map(map.levels[this.level > this.maxLevel ? this.maxLevel : this.level]);
                        this.gameState= MODE.game;
                        this.fadeIn = true;
                        var vans = this.assets.Get([C.ass.van]);

                        for(var e = 0; e < vans.length; e++) {
                            vans[e].enabled = false;
                        } 
                        if(this.enableSound){
                            Music.Play(C.sound.music1);
                        }
                        this.reset();
                        this.player.start(1);
                    }
                    break;
                case MODE.over:
                    if(input.isUp("SPACE")){
                        this.gameState= MODE.title;
                        Renderer.Set(1);
                        this.scene.Set(1);
                        this.scCol = 1; 
                        input.Clr();
                    }
                    break;
            }

            var asses = this.assets.Get();
 
            for(var e = 0; e < asses.length; e++) 
            {
                //do move
                if(asses[e].enabled){
                    asses[e].Logic(dt);
                    asses[e].Collider(asses);
                }
                
                asses[e].Update(dt);
            }        
            this.scene.ScrollTo(this.camera.x, this.camera.y, true);            
        },
        Render: function(){   
            var mp = this.scene.ScrollOffset(); 

            //get everythign except logs and ptext for somereason
            var rest = this.assets.Get([C.ass.log,C.ass.ptext],true);

            rest.sort(function(a, b){
                var p1 = Util.IsoPoint(a.x,a.y);
                var p2 = Util.IsoPoint(b.x,b.y);
                return p1.y - p2.y;
            });

            var pks = this.assets.Get([C.ass.ptext]);
      
            //ensure text is on top
            var asses = rest.concat(pks);

            this.scene.Render(mp);

            var plrPt = {x:this.player.x, y:this.player.y};

            for(var e = 0; e < asses.length; e++) {
                var assPt = {x:asses[e].x, y:asses[e].y}; 

                if((assPt.x > plrPt.x - 96 && assPt.x < plrPt.x + 96) && (assPt.y > plrPt.y && assPt.y < plrPt.y +64)){
                    asses[e].alpha = 0.5;
                }
                else{
                    asses[e].alpha = 1;
                }
                asses[e].Render(mp, this.zoom);
            } 

            Renderer.Box(0,0,this.screen.w, 48, "rgba(0, 0, 0, 0.7)");
            //Renderer.Text("ASSETS", 140, 2, 3, 0, PAL[C.pal.white]);  
            //Renderer.Text("TIME", this.screen.w-200, 2, 3, 0, PAL[C.pal.white]);  
            //Renderer.Text("£"+AssetUtil.NumericText(this.player.score), 140, 24, 4, 0, PAL[C.pal.white]); 
            //Renderer.Text(this.time>0 ? AssetUtil.NumericText(parseInt(this.time/60),2) : "00", this.screen.w-200, 24, 4, 0, PAL[C.pal.white]); 

            if(this.player.lives>0){
                for (var i = 0; i < this.player.lives-1; i++) {
                    Renderer.Sprite2D((i*16)+32,592,assets.lives, C.col.man,0.7);
                }
            }

            // for (var i = 0; i < this.level+1; i++) {
            //     Renderer.Sprite2D(780-(i*24),592,assets.levels, C.col.car3,0.7);
            // }   
            
            switch(this.gameState){
                case MODE.title:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    // Renderer.Text("ABCDEFGHIJKLMNOPQR", 40, 20, 6,1,PAL[C.pal.title]);  
                    Renderer.Text("PRESS [SPACE]", 300, 500, 4,0,PAL[C.pal.title]);  

                    ISO = 0.75;
                    for (let i = 0; i < 3; i++) {
                        Renderer.PolySprite(288+(i*110), 400, this.titleDood.src, this.titleDood.col+i, 2  );
                        Renderer.PolySprite(288+(i*110), 400-82, assets.hat, C.col.black, 1.2  ); 
                    }  
                    break; 
                case MODE.game:
                    if(this.scCol>0.1){
                        Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    }
                    if(this.time <= 0){
                        Renderer.Text("TIME UP", 300, 280, 8,1,PAL[C.pal.gameover]);
                    }
                    if(this.firstTime){
                        Renderer.Text("  W", 240, 500, 5,1,PAL[C.pal.gameover]);
                        Renderer.Text("A S D", 240, 540, 5,1,PAL[C.pal.gameover]);
                        Renderer.Text("ARROWS", 450, 540, 5,1,PAL[C.pal.gameover]);
                    }

                    if(this.player.lives == 0){
                        Renderer.Text("GAME OVER", 160, 100, 8,1,PAL[C.pal.gameover]); 
                    }
                    break;                
                case MODE.start:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    Renderer.Text("DAY "+ (this.level + 1), 160, 100, 8,1,PAL[C.pal.title]); 
                    break;
                case MODE.level:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    Renderer.Text("DAY "+ (this.level+1), 160, 100, 8,1,PAL[C.pal.title]);  
                    break;   
                case MODE.over:

                    break;   

            }
        }
    };

    window.Game = Game;
})();
