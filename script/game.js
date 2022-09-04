(function() {
    function Game(map, level) {
        this.level = level;    
        var i =0;
        var set = [];
        for (let i = 0; i < 17; i++) {
            set.push( {src:assets.tile, col:i});
        }

        set[10].src=assets.tile1;
        set[11].src=assets.tile1;
        set[5].src=assets.tile2;
        set[7].src=assets.tile2;
        //set.push( {src:assets.tile1, col:11});  

        this.md = map.levels[this.level];
        this.M = Util.Unpack(this.md.data);
        this.maxLevel = 1;

        this.scene = new MapManager(map.size, this.M, this.md.dim.width, this.md.dim.height, set);
        this.screen = {w:map.size.screen.width*map.size.tile.width, h:map.size.screen.height*map.size.tile.height};

        this.gameState = MODE.title;
        this.scCol = 1;
        this.fadeOut = false;
        this.fadeIn = false;

        this.titleDood = [{src:Util.Merge([assets.hero.bodyV,assets.hero.down]), col:C.col.man},
                            {src:Util.Merge([assets.hero.bodyV,assets.hero.up]), col:C.col.man}];

        this.princess = {src:Util.Merge([assets.hero.bodyV,assets.hero.down,assets.hair]), col:C.col.man};                    
        this.treasure = {src:assets.square, col:C.col.man}; 
        this.zoom = 1;
        this.enableSound = true;
        this.zoomIn = 0;
        this.zoomOut = 0;
        this.firstTime = true;
        this.pickupTxt = null;
        this.helps = [1,1,1];

        this.time=0;

        this.camera = null;
        this.SetCamera = function(p){
            this.camera = p;
        }

        this.TitleTxt = [new Display(ST[0], PAL[C.pal.title],0.9, 0.01 ),
                        new Display(ST[1], PAL[C.pal.title],0.9, 0.01 ),
                        new Display(OV[0], PAL[C.pal.title],0.9, 0.01 ),
                        new Display(OV[1], PAL[C.pal.title],0.9, 0.01 )];
        

        this.Text = function(txt, x, y, size, motion, col){
            var p = new PickupText(txt,x,y, size, col, motion, 64 );
            this.assets.Add(p);
        }

        this.reset = function(full){
            ISO = 0.75;
            Renderer.Set(this.zoom);
            this.scene.Set(this.zoom);

            this.assets = new ObjectPool(); 
            this.holes = [];
            if(full){
                this.M = Util.Unpack(this.md.data);
                this.scene.Map(this.M);
            }
            var spawn = map.levels[this.level > this.maxLevel ? this.maxLevel : this.level].spawn;
            var tw = map.size.tile.width;
            var th = map.size.tile.height;

            var col = this.md.dim.width;
            var row = this.md.dim.height;

            for(var r = 0; r < row; r++) 
            {
                for(var c = 0; c < col; c++) 
                {
                    var m = ((r) * col) + (c);
                    var p = this.M[m];   

                    var pt = { x:(c * tw)*1, y:(r * th)*1 };    

                    var a=null,cl,n = null,typ = C.ass.hard;
                    if(p == 14 || p == 15){
                        a = Util.OneOf([assets.tree1, assets.tree2]);
                        cl = C.col.tree;
                    }
                    if(p == 16){
                        a = assets.wall16;
                        cl = C.col.wall;
                        n = 4;
                        typ = C.ass.wall;
                    }

                    if(a){
                        var d = new Grunt(pt.x, pt.y, 
                            {src:a, col:cl}, typ, null,false, n );
                        this.assets.Add(d);
                    }
                 }
            }

            var d = Util.Spawn(spawn.wall, [assets.wall16], C.col.wall, tw, C.ass.wall, null, 4);
            this.assets.Addm(d);
            d= Util.Spawn(spawn.tree, [assets.tree1, assets.tree2], C.col.tree, tw, C.ass.hard);
            this.assets.Addm(d);
            d = Util.Spawn(spawn.sign, [assets.tile], C.col.sign, tw, C.ass.sign);
            this.assets.Addm(d);

            var asses = this.assets.Get();
            d = Util.RndSpawn(this.scene, asses, 64, [assets.tree1, assets.tree2], C.col.tree, tw, [0,1], C.ass.hard);
            this.assets.Addm(d);
            //secret holes
            //currently:
            asses = this.assets.Get();
            for (var i = 0; i < 200; i++) {
                //var p = {x:59, y:92};//
                var p = Util.FreePoint(this.scene, asses, tw, [0,1,2,3,10,12,13]);
                this.holes.push({x:p.x*tw, y:p.y*tw, e:1});
                asses.push(p);
            }     
            //var p = this.holes.push({x:59*tw, y:92*tw});
            //    asses.push(p);

            //DEBUG      
            // for (var i = 0; i < 200; i++) {
            //     d = new Grunt(this.holes[i].x*32, this.holes[i].y*32, {src:assets.square, col:C.col.items,size:1}, C.ass.pickup);
            //     d.enabled = true;
            //     this.assets.Add(d);
            // }
            //this.holes.push({x:28,y:45});

            //add some pickups to the pool
            //breads
            d = Util.RndSpawn(this.scene, asses, 32, [assets.square], C.col.items, tw, [0,1,2,3,10,11,12,13], C.ass.pickup1, 0.2);
            this.assets.Addm(d);

            asses = this.assets.Get();
            d = Util.RndSpawn(this.scene, asses, 32, [assets.square], C.col.items, tw, [0,1,2,3,10,11,12,13], C.ass.pickup2, 0.4);
            this.assets.Addm(d);

            if(full){
                this.player = new Hero(spawn.plr.x*tw, spawn.plr.y*th);      
            }

            this.assets.Add(this.player);   

            //princess
            d = new Grunt(59*32, 120*32, {src:this.princess.src, col:this.princess.col,size:1}, C.ass.hard);
            d.enabled = true;
            this.assets.Add(d); 
            //treasure
            d = new Grunt(63*32, 120*32, {src:this.treasure.src, col:this.treasure.col,size:1}, C.ass.hard);
            d.enabled = true;
            this.assets.Add(d); 

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

                            Sound.Play(C.sound.wibble);
                            this.player.start(2);
                            this.timer = 64;
                            ISO = 0.95;
                        }                        
                    }

                    break;     
                case MODE.game:

                    // if(Input.IsSingle("KeyI")){
                    //     //this.zoom-=0.1;
                    //     //Renderer.Set(this.zoom);
                    //     //this.scene.Set(this.zoom);
                    //     this.zoomIn = 2.5; 
                    //     this.zoomOut = 0;
                    // }
                    // if(Input.IsSingle("KeyO")){
                    //     // this.zoom+=0.1;
                    //     // Renderer.Set(this.zoom);
                    //     // this.scene.Set(this.zoom);
                    //     this.zoomIn = 0; 
                    //     this.zoomOut = 1;
                    // }
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
                        this.zoom = Util.Lerp(this.zoom, this.zoomOut, 0.015);
                        ISO = Util.Lerp(ISO, 0.85, 0.015);
                        if(this.zoom < (this.zoomOut - 0.01))
                        {
                            this.zoomOut = 0;
                        }
                        Renderer.Set(this.zoom);
                        this.scene.Set(this.zoom);
                    }
                    if(this.player.reading>0){
                        this.zoomIn = 2.5;
                        this.zoomOut = 0;
                    }
                    else{
                        this.zoomIn = 0;
                        this.zoomOut = 1;
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
                        if(Input.Left()){
                            this.gameState = MODE.title;
                            Renderer.Set(1);
                            this.scene.Set(1);
                            this.scCol = 1; 
                        }
                        if(Input.Right()){
                            this.gameState = MODE.game;
                            this.fadeIn = true;
                            Sound.Play(C.sound.wibble);
                            this.player.start(2);
                            //reset holes
                            this.holes.forEach(h => {h.e = 1});
                            this.M = Util.Unpack(this.md.data);
                            this.scene.Map(this.M);
                            this.timer = 64;
                            ISO = 0.95;
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
            this.scene.ScrollTo(this.camera.x, this.camera.y, true, 
                this.zoomOut>0 || this.zoomIn>0 ? 0.1 : null);
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
                if(asses[e].type == C.ass.wall){
                    var assPt = {x:asses[e].x, y:asses[e].y}; 

                    var xd = Math.abs(assPt.x - plrPt.x);
                    var yd = assPt.y - plrPt.y;
                    if((xd<96) && (yd>0 && yd<128)){
                        asses[e].alpha = xd<32 ? 0.1 : xd<64 ? 0.2 : 0.3;
                    }
                }
                asses[e].Render(mp, this.zoom);
            } 

            if(this.player.reading){
                Renderer.Box(200,400,380, 200, PAL[C.pal.sign]);   
                Renderer.Text(signs[this.player.reading], 220, 420, 3, 0,PAL[C.pal.signtxt]);  
            }
            Renderer.Box(0,0,this.screen.w, 48, "rgba(0, 0, 0, 0.7)");

            for (var i = 0; i < this.player.stones; i++) {
                Renderer.Sprite2D((i*16)+32,10,assets.lives, C.col.man,0.7);
            }


            var b = parseInt(this.player.bread/3);
            var br = parseInt(this.player.bread%3);
            b=br>0?b+1:b;
            for (var i = 0; i < b; i++) {
                Renderer.Sprite2D((i*24)+32,30,assets.levels[br>0 && i==b-1 ? br:0], C.col.man,0.7);
            } 

            switch(this.gameState){
                case MODE.title:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    Renderer.Text("UNCERTAIN", 160, 60, 10,1,PAL[C.pal.title]);  
                    Renderer.Text("DEATH", 240, 140, 12,1,PAL[C.pal.title]);  
                    Renderer.Text("PRESS [SPACE]", 300, 500, 4,0,PAL[C.pal.title]); 
                    
                    for (let i = 0; i < 3; i++) {
                        Renderer.PolySprite(288+(i*110), 400, this.titleDood[0].src, this.titleDood[0].col, 2  );
                        Renderer.PolySprite(288+(i*110), 400-82, assets.hat, C.col.hat, 1.2  ); 
                    }  
                    break;
                case MODE.game:
                    if(this.scCol>0.1){
                        Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")"); 
                    }

                    if(this.firstTime){
                        Renderer.Text("  W", 240, 500, 3,1,PAL[C.pal.gameover]);
                        Renderer.Text("A S D", 240, 540, 3,1,PAL[C.pal.gameover]);
                        Renderer.Text("ARROWS", 450, 540, 3,1,PAL[C.pal.gameover]);
                    }
                    if(this.pickupTxt != null){
                        Renderer.Text(this.pickupTxt, 240, 500, 3,1,PAL[C.pal.gameover]);
                    }

                    // if(this.player.lives == 0){
                    //     Renderer.Text("GAME OVER", 160, 100, 8,1,PAL[C.pal.gameover]); 
                    // }
                    break;                
                case MODE.start:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, "rgba(0, 0, 0, "+this.scCol+")");
                    Renderer.PolySprite(340, 300, assets.table, C.col.table, 2.5  );
                    Renderer.PolySprite(340, 240, assets.pc, C.col.pc, 2.5  );
                    Renderer.PolySprite(340, 364, this.titleDood[1].src, this.titleDood[1].col, 2  );

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
                        Renderer.Text("PRESS [LEFT]", 100, 500, 4,0,PAL[C.pal.title]); 
                        Renderer.Text("PRESS [RIGHT]", 400, 500, 4,0,PAL[C.pal.title]); 
                    }
                    break; 

            }
        }
    };

    window.Game = Game;
})();
