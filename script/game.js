(function() {
    function Game(map, level) {
        this.level = level;    

        this.md = map.levels[this.level];
        this.M= Util.Unpack(this.md.data);
        this.maxLevel = 1;

        this.scene = new MapManager(map.size, this.M, this.md.dim.width, this.md.dim.height, TILES);
        this.screen = {w:map.size.screen.width*map.size.tile.width, h:map.size.screen.height*map.size.tile.height};

        this.gameState = MODE.title;
        this.scCol = 1;
        this.fadeOut = false;
        this.fadeIn = false;

        this.titleDood = [{src:Util.Merge([assets.hero.bodyV,assets.hero.down]), col:C.col.man},
                            {src:Util.Merge([assets.hero.bodyV,assets.hero.up]), col:C.col.man}];

        this.princess = {src:Util.Merge([assets.hero.bodyV,assets.hero.down,assets.hero.lips,assets.hero.hair]), col:C.col.prince};                    
        this.treasure = {src:assets.chest, col:C.col.gold}; 
        this.zoom = 1;
        this.enableSound = true;
        this.zoomIn = 0;
        this.zoomOut = 0;
        this.firstTime = true;

        this.pickupTxt = null;
        this.helps = [1,1,1,1,1];
        this.hows = [0,0,0];
        this.deaths=0;
        this.time=0;

        this.camera = null;
        this.SetCamera = function(p){
            this.camera = p;
        }
        
        this.TitleTxt =null;
        this.TitleTxt2 =null;
        this.Text = function(txt, x, y, size, motion, col){
            var p = new PickupText(txt,x,y, size, col, motion, 64 );
            this.assets.Add(p);
        }

        this.ResetMap = function(){
            var m = Util.Unpack(this.md.data);
            this.M = Util.Swap(m, 23, [26,27,28,29,30,31]);
            this.scene.Map(this.M);
        }

        this.Next = function(e){
            if((e || !this.firstTime) && (Input.Fire1() || Input.IsSingle(" "))){   
                this.timer = 1;
                return true;
            }
            return false;
        }
        this.reset = function(full){
            ISO = 0.75;
            Renderer.Set(this.zoom);
            this.scene.Set(this.zoom);

            this.helps[3]=1;
            this.helps[4]=1;
            this.deaths=0;
            this.assets = new ObjectPool(); 
            this.holes = [];
            if(full){
                this.ResetMap();
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
                    if(p > 19 & p < 23){
                        a = Util.OneOf([assets.tree1, assets.tree2]);
                        cl = C.col.tree;
                    }
                    if(p == 19){
                        a = Util.OneOf([assets.wall1,assets.wall2]);
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

            var d = Util.Spawn(spawn.wall, [assets.wall1,assets.wall2], C.col.wall, tw, C.ass.wall, null, 4);
            this.assets.Addm(d);
//??might not need
d= Util.Spawn(spawn.tree, [assets.tree1, assets.tree2], C.col.tree, tw, C.ass.hard);
this.assets.Addm(d);

            d = Util.Spawn(spawn.sign, [assets.sign], C.col.sign, tw, C.ass.sign);
            this.assets.Addm(d);

            var zn1 = [20,11,101,125];
            var zones = [80,[46,66,72,92], 40,[75,104,101,124], 16,[48,107,59,120]];
            
            //zones 
            for(var i = 0; i < 6; i+=2){            
                var asses = this.assets.Get();
                d = Util.RndSpawn(this.scene, asses, zones[i], [assets.tree1, assets.tree2], 
                    C.col.tree, tw, [0,1,2,3,4], C.ass.hard, zones[i+1]);
                this.assets.Addm(d);
            }
            

            //randoms
            var asses = this.assets.Get();
            d = Util.RndSpawn(this.scene, asses, 64, [assets.tree1, assets.tree2], 
                C.col.tree, tw, [0,1,2,3,4], C.ass.hard, zn1);
            this.assets.Addm(d);
            //secret holes
            //currently:
            asses = this.assets.Get();
            for (var i = 0; i < 250; i++) {
                var p = Util.FreePoint(this.scene, asses, tw, [0,1,2,3,4,9,10,11,17,18,24], zn1);//paths are safe
                this.holes.push({x:p.x*tw, y:p.y*tw, e:1});
            }    

            //add specials
            this.holes.push({x:59*tw, y:109*tw, e:1});

            d = Util.Spawn(spawn.bread, [assets.loaf], C.col.bread, tw, C.ass.pickup2, 0.4);
            this.assets.Addm(d);

            d = Util.Spawn(spawn.stone, [assets.square], C.col.rock, tw, C.ass.pickup1, 0.2);
            this.assets.Addm(d);

            //add some pickups to the pool
            //rock
            asses = this.assets.Get().concat(this.holes);
            d = Util.RndSpawn(this.scene, asses, 32, [assets.square], 
                C.col.rock, tw, [0,1,2,3,4,9,10,11,17,18,23,24], C.ass.pickup1, zn1, 0.2);
            this.assets.Addm(d);

            asses = this.assets.Get().concat(this.holes);
            d = Util.RndSpawn(this.scene, asses, 32, [assets.loaf], 
                C.col.bread, tw, [0,1,2,3,4,9,10,11,17,18,23,24], C.ass.pickup2, zn1, 0.4);
            this.assets.Addm(d);

            if(full){
                this.player = new Hero(spawn.plr.x*tw, spawn.plr.y*th);      
            }

            this.assets.Add(this.player);   

            // //princess
            var pp = Util.OneOf(spawn.prince);
            this.prince = new Grunt(
                pp.x*32, pp.y*32, 
                {src:this.princess.src, col:this.princess.col,size:1}, C.ass.hard);
            this.prince.enabled = true;
            this.assets.Add(this.prince); 

            // //treasure 2 x??
            this.gold = [];
            spawn.gold.sort(() => Math.random() - 0.5);
            for (var i = 0; i < 2; i++) {
                this.gold[i] = {f:1,a:new Grunt(spawn.gold[i].x*32, spawn.gold[i].y*32, {src:this.treasure.src, 
                    col:this.treasure.col,size:1}, C.ass.hard)};
                this.gold[i].a.enabled = true;
                this.assets.Add(this.gold[i].a); 
            }

            this.SetCamera(this.player);
            this.scene.ScrollTo(this.camera.x, this.camera.y, false);  
        };

        this.Space=function(b){
            if(b){
                Renderer.Text("[SPACE]", 344, 500, 4,0,PAL[C.pal.title]); 
            }
        }
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
                    if(this.Next(1)){   
                        this.gameState= MODE.start;
                        this.TitleTxt = new Display(ST[0], PAL[C.pal.title],3, 0.03 );
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
                    if(this.TitleTxt.Update(dt) || this.Next())
                    {
                        if(--this.timer==0){
                            this.gameState = MODE.ready;
                            this.TitleTxt = new Display(ST[1], PAL[C.pal.title],3, 0.03, 1.2 );
                        }                        
                    }

                    break; 
                case MODE.ready:
                    if(this.TitleTxt.Update(dt))
                    {
                        if(this.Next(1)){
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
if(Input.IsSingle("i")){
    this.player.invincible = !this.player.invincible;
}

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
                        if(this.zoom  == this.zoomOut)
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
                            this.deaths++;
                            this.gameState = MODE.deathInfo;
                            this.fadeOut = true;
                            this.TitleTxt = new Display(OV[this.player.how-3], PAL[C.pal.title],0.6, 0.03 );
                            this.TitleTxt2 = new Display(OV[0], PAL[C.pal.title],1.2, 0.005 );
                        }
                        else{
                            this.zoomIn = 2.5;
                            this.zoomOut = 0;
                         }
                    }

                    if(this.player.goal == 1){
                        this.player.goal = 2;
                        this.timer = 340;
                    }
                    else if(this.player.goal == 2){
                        this.zoomIn = 2.5;
                        this.zoomOut = 0;
                        if(--this.timer==0){
                            Renderer.Set(1);
                            this.scene.Set(1);
                            this.timer = 190;
                            this.gameState = MODE.goal;
                            this.scCol = 1; 
                            //?? win state
                            this.TitleTxt = new Display(ST[this.player.treasure==0?3:2], 
                                PAL[C.pal.title],3, 0.03 );
                        }  
                    }
                    break; 
                case MODE.goal:
                    if(this.TitleTxt.Update(dt))
                    {
                        if(Input.Fire1() || Input.IsSingle(" ")){
                            this.gameState = MODE.title;
                            Renderer.Set(1);
                            this.scene.Set(1);
                            this.scCol = 1; 
                        }
                    }
                    break;
                case MODE.deathInfo:
                    if(this.TitleTxt.Update(dt))
                    {
                        if(this.TitleTxt2.Update(dt))
                        {
                            if(Input.Fire1() || Input.IsSingle(" ")){
                                this.gameState = MODE.postInfo;
                                var t = this.hows[this.player.how-4] ? 3 : this.player.how-4;
                                this.TitleTxt = new Display(ED[t], PAL[C.pal.title],0.1, 0.01 );
                                this.hows[this.player.how-4] = 1;
                            }
                        }
                    }
                    break;
                case MODE.postInfo:
                    if(this.TitleTxt.Update(dt))
                    {
                        if(Input.Left()){
                            this.gameState = MODE.title;
                            Renderer.Set(1);
                            this.scene.Set(1);
                            this.scCol = 1; 
                        }
                        if(Input.Right()){
                            //reset holes
                            this.holes.forEach(h => {h.e = 1});
                            this.ResetMap();
                            ISO = 0.95;
                            if(this.deaths>1){
                                this.gameState = MODE.game;
                                this.fadeIn = true;
    
                                Sound.Play(C.sound.wibble);
                                this.player.start(2);
                                this.timer = 64;
                                ISO = 0.95;
                            }
                            else{
                                this.gameState = MODE.ready;
                                this.TitleTxt = new Display(ST[4], PAL[C.pal.title],0.1, 0.01, 0.5 );
                            }
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
                (this.zoomOut>0 || this.zoomIn>0 ? 8 : 5)*dt);
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

            Renderer.Box(0,0,this.screen.w, 48, RGB+"0.7)");

            for (var i = 0; i < this.player.treasure; i++) {
                Renderer.Sprite2D(760-(i*32),20,assets.lives, C.col.gold,1.5);
            }

            for (var i = 0; i < this.player.stones; i++) {
                Renderer.Sprite2D((i*16)+32,10,assets.lives, C.col.rock,0.7);
            }

            var b = parseInt(this.player.bread/3);
            var br = parseInt(this.player.bread%3);
            b=br>0?b+1:b;
            for (var i = 0; i < b; i++) {
                Renderer.Sprite2D((i*24)+32,30,assets.levels[br>0 && i==b-1 ? br:0], C.col.bread,0.7);
            } 
if(this.player.invincible){
Renderer.Text("X", 240, 10, 3,1,PAL[C.pal.help]);
}

            switch(this.gameState){
                case MODE.title:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, RGB+this.scCol+")");
                    Renderer.Text("DEATH OR", 160, 60, 12,1,PAL[C.pal.title]);  
                    Renderer.Text(" GLORIA", 160, 140, 12,1,PAL[C.pal.title]);  
                    this.Space(1);                  
                    
                    Renderer.PolySprite(400, 400, this.titleDood[0].src, this.titleDood[0].col, 2  );
                    Renderer.PolySprite(400, 400-82, assets.hat, C.col.hat, 1.2  ); 
                    break;
                case MODE.game:
                    if(this.scCol>0.1){
                        Renderer.Box(0,0,this.screen.w, this.screen.h, RGB+this.scCol+")"); 
                    }

                    if(this.firstTime){
                        Renderer.Text("  W", 240, 400, 3,1,PAL[C.pal.help]);
                        Renderer.Text("A S D", 240, 440, 3,1,PAL[C.pal.help]);
                        Renderer.Text("ARROWS", 450, 440, 3,1,PAL[C.pal.help]);
                    }
                    if(this.pickupTxt != null){
                        Renderer.Text(this.pickupTxt, 240, 400, 3,1,PAL[C.pal.help]);
                    }

                    break;                
                case MODE.start:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, RGB+this.scCol+")");
                    var y = 400;
                    Renderer.PolySprite(340, y, assets.table, C.col.table, 2.5  );
                    Renderer.PolySprite(340, y-60, assets.pc, C.col.pc, 2.5  );
                    Renderer.PolySprite(340, y+64, this.titleDood[1].src, this.titleDood[1].col, 2  );

                    this.TitleTxt.Render(Renderer,{x:60,y:100});
                    this.Space(!this.firstTime);
                    break;
                case MODE.ready:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, RGB+this.scCol+")");
                    this.TitleTxt.Render(Renderer,{x:60,y:100});
                    this.Space(this.TitleTxt.Done);
                    break;
                case MODE.deathInfo:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, RGB+this.scCol+")");
                    this.TitleTxt.Render(Renderer,{x:60,y:100}); 
                    this.TitleTxt2.Render(Renderer,{x:160,y:240},20,1); 

                    this.Space(this.TitleTxt2.Done);
                    break;     
                case MODE.postInfo:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, RGB+this.scCol+")");
                    this.TitleTxt.Render(Renderer,{x:60,y:100});
                    if(this.TitleTxt.Done){
                        Renderer.Text("[LEFT]", 80, 400, 4,0,PAL[C.pal.title]);                         
                        Renderer.Text(ST[5], 60, 440, 3,0,PAL[C.pal.title]); 

                        Renderer.Text("[RIGHT]", 600, 400, 4,0,PAL[C.pal.title]);                         
                        Renderer.Text(ST[6], 460, 440, 3,0,PAL[C.pal.title]); 
                    }
                    break; 
                case MODE.goal:
                    Renderer.Box(0,0,this.screen.w, this.screen.h, RGB+this.scCol+")");
                    var y = 400;
                    if(1){                    
                        Renderer.PolySprite(520, y-40, this.princess.src, this.princess.col, 2  );
                    }
                    Renderer.PolySprite(340, y, assets.table, C.col.table, 2.5  );
                    Renderer.PolySprite(340, y-60, assets.pc, C.col.pc, 2.5  );
                    Renderer.PolySprite(340, y+64, this.titleDood[1].src, this.titleDood[1].col, 2  );
                    Renderer.PolySprite(340, y-18, assets.hat, C.col.hat, 1.2  ); 

                    this.TitleTxt.Render(Renderer,{x:60,y:100});

                    this.Space(this.TitleTxt.Done);
                    break;
            }
        }
    };

    window.Game = Game;
})();
