var AssetUtil = {
    Dir: function(perp, prot){
        var inp = {
            up: false,
            down: false,
            left: false,
            right: false,
            d:0
        };
        var distx = Util.AbsDist( perp.x, prot.x);
        var disty = Util.AbsDist( perp.y, prot.y);
        inp.d = Util.PDist(distx, disty);
        if(distx > disty){
            if(perp.x > prot.x){
                inp.right = true;
            }
            else if(perp.x < prot.x){
                inp.left = true;      
            }
        }else{
            if(perp.y > prot.y){
                inp.down = true;           
            }
            else if(perp.y < prot.y){
                inp.up = true;
            }
        }
        return inp;
    },
    RectHit: function (prot, perp){ //if 2 rects overlap
        prot.x -= (prot.width/2);
        prot.y -= (prot.length/2);
        perp.x -= (perp.width/2);
        perp.y -= (perp.length/2);
        return (prot.x < perp.x + perp.width &&
            prot.x + prot.width > perp.x &&
            prot.y < perp.y + perp.length &&
            prot.length + prot.y > perp.y);
    },    
    Collisions: function(prot, perps, dest){

        for(var i = 0; i < perps.length; i++) {
            if(prot != perps[i]){
                var p = {x:(dest) ? prot.dest.x : prot.x, y:(dest) ? prot.dest.y : prot.y, 
                    width: prot.width, length: prot.length};
                var e = {
                    x:perps[i].x, 
                    y:perps[i].y, 
                    width: perps[i].width, 
                    length: perps[i].length};

                if(AssetUtil.RectHit(p, e)){
                    return perps[i];
                }
            }
        }            

        return null;
    },
    WhichDir: function(src, list){
        for(var i = 0; i < list.length; i++) {
            if(src == list[i].v){
                return list[i].r;
            }
        }
    },
    InputLogic: function(inp, prop, speed, step){
        var x = prop.x;
        var y = prop.y;
        var dx = prop.dx;
        var dy = prop.dy;

        if( inp.up ) {
            dy = -speed;
            y = prop.y - step;
            prop.action = C.act.up;
        }
        else if(inp.down) {
            dy = speed;
            y = prop.y + step;
            prop.action = C.act.dn;
        }    
        else if(inp.left) {
            dx = -speed;
            x = prop.x - step;
            prop.action = C.act.lt;
        }
        else if(inp.right) {
            dx = speed;
            x = prop.x + step;
            prop.action = C.act.rt;
        } 

        if(x != prop.x || y != prop.y){
            var c = gameAsset.scene.Content(x, y); //check for obstructions
            if(map.colliders.hit.indexOf(c) == -1){  
                prop.dest.x = x;
                prop.dest.y = y;
                prop.dx = dx;
                prop.dy = dy;
                prop.jumping = true;
            }
        }
    },
    HopLogic: function(asset, step, ht){
        if(asset.dy > 0){
            if(asset.y > asset.dest.y){
                asset.y = asset.dest.y;
                asset.dy = 0;
                asset.jumping = false;
                asset.z = 0;
            }else{
                asset.p = asset.dest.y - asset.y;                
                asset.z = Util.Arc(asset.p, step, ht);
            }
        }
        else if(asset.dy < 0){
            if(asset.y < asset.dest.y){
                asset.y = asset.dest.y;
                asset.dy = 0;
                asset.jumping = false;
                asset.z = 0;
            }else{
                asset.p = asset.y - asset.dest.y;   
                asset.z = Util.Arc(asset.p, step, ht);
            }
        }
        if(asset.dx > 0){
            if(asset.x > asset.dest.x){
                asset.x = asset.dest.x;
                asset.dx = 0;
                asset.jumping = false;
                asset.z = 0;
            }else{
                asset.p = asset.dest.x - asset.x; 
                asset.z = Util.Arc(asset.p, step, ht);
            }
        }
        else if(asset.dx < 0){
            if(asset.x < asset.dest.x){
                asset.x = asset.dest.x;
                asset.dx = 0;
                asset.jumping = false;
                asset.z = 0;
            }else{
                asset.p = asset.x - asset.dest.x; 
                asset.z = Util.Arc(asset.p, step, ht);
            }
        }
        return gameAsset.scene.Content(asset.x, asset.y);
    },
    CarSpawn: function(list, assets, type, dir, sz){

        for (var i = 0; i < assets.length; i++) {
            list.push(
                {
                    ready:0, 
                    x:assets[i].x*sz, 
                    y:assets[i].y*sz,
                    rank:assets[i].rank,
                    dir:dir,
                    type:type
                });
        }  
    },
    Recoveries: function(arr, num){
 
        arr.sort(() => Math.random() - 0.5);
        var list = arr.slice(0, num);
        var m = [];
        for(var j=0;j<list.length;j++){
            m.push(
                {
                    found:false,
                    x:list[j].x,
                    y:list[j].y
                });
        }
        return m;
    },
    VehicleSpeed: function(rank, type, multi){
        var rate = {sp:0,min:0,max:0};

        if(type==C.ass.car){
            var r = CARSPEEDS[rank];
            rate.sp = r.sp*multi;
            rate.min = parseInt(r.min/multi);
            rate.max = parseInt(r.max/multi);
            
        }
        else{
            rate = LOGSPEEDS[rank];
        }        

        return rate;
    },
    ScoreMoney: function(txts, score){
        var tx = []
        for(var j=0;j<txts.length;j++){
            tx.push(txts[j].replace("{0}",score));
        }
        return tx;
    },
    NumericText: function(val,len){
        if(len){
            val = ("000000"+val).slice(-len);
        }
        else{
            if (val < 100000) { len = 5; }
            else if(val < 1000000){ len = 6; }
            else{ len = 7; }
        }
        val = ("000000"+val).slice(-len);
        return val;
    }

}


var Util = {
    OneIn: function(c){
        return Util.RndI(0,c)==0;
    },
    OneOf: function(arr){
        return arr[Util.RndI(0,arr.length)];
    },
    //int min to max-1
    RndI: function (min, max){
        return parseInt(Math.random() * (max-min)) + min;
    },
    Rnd: function (max){
        return Math.random() * max;
    },  
    SLerp: function(start, end, amt)
    {
        if(start>end){
            return ((start-amt) > end) ? start-amt : end;
        }
        else{
            return ((start+amt) < end) ? start+amt : end;
        }
    },   
    Lerp: function(start, end, amt)
    {
        return (end-start) * amt+start;
    },
    AbsDist: function(p1, p2){
        return Math.abs( p1 - p2);
    },   
    Dist: function(x1,y1,x2,y2){
        var x = x2 - x1, y = y2 - y1;
        return Util.PDist(x, y);
    },
    PDist: function(x, y){        
        return Math.sqrt(x*x + y*y);
    },
    IsoPoint: function(x, y)
    {
        return {x: x - (y * (1-ISO)), y: (y + (x * (1-ISO)))*ISO};
    },
    Arc: function(i, items, radius)
    {
        return (radius * Math.sin( Math.PI * i / items));
    },
    Merge: function(src){
        var arr = [];
        for (let i = 0; i < src.length; i++) {
            for (let j = 0; j < src[i].length; j++) {
                arr.push(src[i][j]);
            }
        }
        return arr;
    },
    dateToYMD: function() {
        var date = new Date();
        var strArray=['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        var d = date.getDate();
        var m = strArray[date.getMonth()];
        var y = date.getFullYear();
        return '' + (d <= 9 ? '0' + d : d) + ' ' + m + ' ' + y;
    }
}

// a v simple object pooler
var ObjectPool = function () {
    var list = [];

    return {
        Is: function(type){
            for (var i = 0; i < list.length; i++) {
                if (list[i].enabled == false && list[i].type == type)
                {
                    return list[i];
                }
            }
            return null;
        },
        Add: function(obj){
            list.push(obj);         
        },
        Get: function(type, not){
            if(type){
                if(not){
                    return list.filter(l => l.enabled && type.indexOf(l.type) == -1);
                }else{
                    return list.filter(l => l.enabled && type.indexOf(l.type) != -1);
                }
            }else{
                return list.filter(l => l.enabled);
            }

        },
        Count: function(all, type){
            if(type){
                return (all) ? list.filter(l => type.indexOf(l.type) != -1).length : list.filter(l => l.enabled && type.indexOf(l.type) != -1).length;
            }
            else{
                return (all) ? list.length : list.filter(l => l.enabled).length;
            }
        }      
    }
};

