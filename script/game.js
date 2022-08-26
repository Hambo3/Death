(function() {
    function Game(map, level) {

        var i =0;
        var set = [];
        for (let i = 0; i < 14; i++) {
            set.push( {src:assets.tile, col:i});
        }

        set[10].src=assets.tile1;
        set[11].src=assets.tile1;
        set[5].src=assets.tile2;
        set[7].src=assets.tile2;
        //set.push( {src:assets.tile1, col:11});  

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
        this.enableSound = true;
        this.zoomIn = 0;
        this.zoomOut = 0;
        //this.isoIn = 0;
        this.firstTime = true;

        this.time=0;

        this.camera = null;
        this.SetCamera = function(p){
            this.camera = p;
        }

        this.TitleTxt = [new Display(ST[0], PAL[C.pal.title],0.9, 0.01 ),
                        new Display(ST[1], PAL[C.pal.title],0.9, 0.01 ),
                        new Display(OV[0], PAL[C.pal.title],0.9, 0.01 ),
                        new Display(OV[1], PAL[C.pal.title],0.9, 0.01 )];
        
        this.reset = function(full){
            ISO = 0.75;
            Renderer.Set(this.zoom);
            this.scene.Set(this.zoom);

            //this.carSpawn = [];
            this.assets = new ObjectPool(); 

            //add some pickups to the pool
            for (var i = 0; i < 16; i++) {
                var x = Util.RndI(6,60);
                var y = Util.RndI(6,48);
                d = new Grunt(x*32, y*32, {src:assets.square, col:C.col.items,size:0.8}, C.ass.pickup);
                d.enabled = true;
                this.assets.Add(d);
            }
            
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
                    {src:assets.wall16, col:C.col.wall}, C.ass.null, null,false,4 );
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
        };

        this.reset(true);
    };

    Game.prototype = {
        Update: function(dt){

            if(this.fadeOut){
                this.scCol = Util.SLerp(this.scCol, 1, 0.05);
                if(this.scCol > 0.9){
                    this.scCol = 1;
                    this.fadeOut = false;
                }                
            }
            if(this.fadeIn){
                this.scCol = Util.SLerp(this.scCol, 0, 0.05);
                if(this.scCol < 0.1){
                    this.scCol = 0;
                    this.fadeIn = false;
                }                
            }
            switch(this.gameState){
                case MODE.title:
                    if(Input.Fire1() || Input.IsSingle("Space")){   
                        this.gameState= MODE.start;
                        this.timer = 190;
                        this.line = ST.length-1;
                        this.level = 0;
                        this.zoom=1;
                        Renderer.Set(this.zoom);
                        this.scene.Set(this.zoom);
                        this.reset(true);
                    }
                    break; 
                case MODE.start:
                    if(this.TitleTxt[0].Update(dt))
                    {
                        if(--this.timer==0){
                            this.timer = 190;
                            this.gameState = MODE.ready;
                        }                        
                    }

                    break; 
                case MODE.ready:
                    if(this.TitleTxt[1].Update(dt))
                    {
                        if(--this.timer==0){
                            this.gameState = MODE.game;
                            this.fadeIn = true;

                            this.player.start(2);
                            this.timer = 64;
                            ISO = 0.95;
                        }                        
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
                        ISO = Util.Lerp(ISO, 0.85, 0.05);
                        if(this.zoom < (this.zoomOut - 0.01))
                        {
                            this.zoomOut = 0;
                        }
                        Renderer.Set(this.zoom);
                        this.scene.Set(this.zoom);
                    }
                    
                    if(this.player.death){
                        if(this.player.death == C.act.dead){
                            this.timer = 64;
                            this.gameState = MODE.deathInfo;
                            this.fadeOut = true;
                            this.count=64;
                        }
                        else{
                            this.zoomIn = 2.5;
                            this.zoomOut = 0;
                            //this.isoIn = 0.82;
                         }
                    }
                    break; 
                case MODE.deathInfo:
                    if(this.TitleTxt[2].Update(dt))
                    {
                        if(Input.Fire1() || Input.IsSingle("Space")){
                            this.gameState = MODE.postInfo;
                        }
                    }
                    break;
                case MODE.postInfo:
                    if(this.TitleTxt[3].Update(dt))
                    {
                        if(Input.Fire1() || Input.IsSingle("Space")){
                            this.gameState = MODE.title;
                            Renderer.Set(1);
                            this.scene.Set(1);
                            this.scCol = 1; 
                        }
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
            var rest = this.assets.Get([C.ass.ptext],true);

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
                asses[e].alpha = 1;
                if(asses[e].type == C.ass.null){
                    var assPt = {x:asses[e].x, y:asses[e].y}; 

                    var xd = Math.abs(assPt.x - plrPt.x);
                    var yd = assPt.y - plrPt.y;
                    if((xd<96) && (yd>0 && yd<128)){
                        asses[e].alpha = xd<32 ? 0.1 : xd<64 ? 0.2 : 0.3;
                    }
                }
                asses[e].Render(mp, this.zoom);
            } 

            Renderer.Box(0,0,this.screen.w, 48, "rgba(0, 0, 0, 0.7)");
            if(this.player.lives>0){
                for (var i = 0; i < this.player.lives-1; i++) {
                    Renderer.Sprite2D((i*16)+32,592,assets.lives, C.col.man,0.7);
                }
            }

            switch(this.gameState){
                case MODE.title:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    Renderer.Text("UNCERTAIN", 160, 60, 10,1,PAL[C.pal.title]);  
                    Renderer.Text("DEATH", 240, 140, 12,1,PAL[C.pal.title]);  
                    Renderer.Text("PRESS [SPACE]", 300, 500, 4,0,PAL[C.pal.title]); 
                    
                    for (let i = 0; i < 3; i++) {
                        Renderer.PolySprite(288+(i*110), 400, this.titleDood.src, this.titleDood.col, 2  );
                        Renderer.PolySprite(288+(i*110), 400-82, assets.hat, C.col.hat, 1.2  ); 
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
                    Renderer.PolySprite(288, 400, this.titleDood.src, this.titleDood.col, 2  );   
                    this.TitleTxt[0].Render(Renderer,{x:60,y:100});
                    break;
                case MODE.ready:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    this.TitleTxt[1].Render(Renderer,{x:60,y:100});
                    break;
                case MODE.deathInfo:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    this.TitleTxt[2].Render(Renderer,{x:60,y:100}); 
                    if(this.TitleTxt[2].Done){
                        Renderer.Text("PRESS [SPACE]", 300, 500, 4,0,PAL[C.pal.title]); 
                    }
                    break;     
                case MODE.postInfo:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    this.TitleTxt[3].Render(Renderer,{x:60,y:100},8,1);
                    if(this.TitleTxt[3].Done){
                        Renderer.Text("PRESS [SPACE]", 300, 500, 4,0,PAL[C.pal.title]); 
                    }
                    break; 

            }
        }
    };

    window.Game = Game;
})();
