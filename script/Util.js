var AssetUtil = {
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
    Collisions: function(prot, perps, dest, first){

        var clx = [];
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
                    clx.push(perps[i]);
                    if(first){
                        return clx;
                    }
                }
            }
        }            

        return clx;
    },
    InputLogic: function(inp, prop, speed, step){
        var x = prop.x;
        var y = prop.y;
        var dx = prop.dx;
        var dy = prop.dy;

        if( inp.up ) {
            if(prop.action == C.act.up){
                dy = -speed;
                y = prop.y - step;
                prop.action = C.act.up;
            }
            prop.action = C.act.up;
        }
        else if(inp.down) {
            if(prop.action == C.act.dn){
                dy = speed;
                y = prop.y + step;
            }
            prop.action = C.act.dn;
        }    
        else if(inp.left) {
            if(prop.action == C.act.lt){
                dx = -speed;
                x = prop.x - step;
            }
            prop.action = C.act.lt;
        }
        else if(inp.right) {
            if(prop.action == C.act.rt){
                dx = speed;
                x = prop.x + step;
            }
            prop.action = C.act.rt;
        } 

        if(prop.onHold<=0){
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
    InvLerp: function(start, end, amt)
    {
        return (amt-start) / (end - start);
    },
    Remap: function(origFrom, origTo, targetFrom, targetTo, value)
    {
        var rel = Util.InvLerp(origFrom, origTo, value);
        return Util.Lerp(targetFrom, targetTo, rel);
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
    Unpack: function(zip){
        var map = [];
        var v, pts;
        var sec = zip.split("|");
        for(var i = 0; i < sec.length; i++){
            pts= sec[i].split(",");
            v = parseInt(pts[0]);
            map.push(v);
            if(pts.length > 1){                
                for(var p = 1; p < pts[1]; p++){
                    map.push(v);
                }
            }
        }
        var s = "";
        for (var i = 0; i < map.length; i++) {
            s+=map[i]+","           
        }

        return map;
    },
    Swap: function(map, s, d){
        for (var i = 0; i < map.length; i++) {
            if(map[i]==s) {
                    map[i] = Util.OneOf(d);
            }
        }
        return map;
    },
    IntTxt: function(txt, val){
        return txt.replace("{0}",val);
    },
    Spawn: function (spawn, src, col, tw, tp, sz,l)
    {
        var items = [];
        for (var i = 0; i < spawn.length; i++) {
            var d = new Grunt(spawn[i].x*tw, spawn[i].y*tw, 
                {src:Util.OneOf(src), col:col, size:sz||1}, tp, null,false, l );
                d.alt = spawn[i].i !=null 
                        ? spawn[i].i==0 ? Util.RndI(0, 5)+100 : spawn[i].i 
                        : null;
                items.push(d);
        }
        return items;
    },
    FreePoint:function(scene, assets, tw, safe){
        var pt;
        do{
            pt = {
                x:Util.RndI(20,101),
                y:Util.RndI(11,132)
            };
            var t = scene.Content(pt.x*tw, pt.y*tw);
            var dz = assets.filter(l => (l.x == pt.x*tw && l.y == pt.y*tw) );
        }while(!safe.includes(t) || dz.length != 0);

        return pt;
    },
    RndSpawn: function(scene,assets,num, src, col, tw, safe, tp, sz,l){
        var spawn = [];
        for (var i = 0; i < num; i++) {
            spawn.push(Util.FreePoint(scene, assets, tw, safe));
        }
        return Util.Spawn(spawn, src, col, tw, tp, sz,l)
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
        Addm: function(arr){
            list.push(...arr);         
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

