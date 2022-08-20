//handles map rendering and collisons
var MapManager = function (mapdim, mapdata, set) {
    var mapSize = mapdim;
    var map = unpack(mapdata.data);

    var mapCols = mapdata.dim.width;
    var mapRows = mapdata.dim.height;

    var mapWidth = mapCols * mapSize.tile.width;
    var mapHeight = mapRows * mapSize.tile.height;

    var screenWidth = mapSize.screen.width * mapSize.tile.width;
    var screenHeight = mapSize.screen.height * mapSize.tile.height

    var offset = {x:0,y:0};

    var logging = false;
    var tileset = set;
    var zoom = 1;

    function unpack(zip){
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
    }
    function hpoint(p, w){
        return Math.floor(p / w);
    }		
    function vpoint(p, h){
        return Math.floor(p / h);
    }
    function cell(x, y){
        var h = hpoint(x, mapSize.tile.width);
        var v = vpoint(y, mapSize.tile.height);
        var p = h + (v * mapCols);
        return p;
    }
    function content(x,y){
        var cp = map[cell(x, y)];
        return cp;
    }    
    
    
    function render() {
        var m = 0;
        var p;

        var col = mapCols;
        var row = mapRows;

        var tc=0;
        for(var r = 0; r < row; r++) 
        {
            for(var c = 0; c < col; c++) 
            {
                m = ((r) * mapCols) + (c);
                p = map[m];                 
                var pt = Util.IsoPoint( (c * mapSize.tile.width)*zoom, (r * mapSize.tile.height)*zoom); 

                if(tileset[p].src.length){
                    tc+=Renderer.PolySprite(
                        pt.x-offset.x,
                        pt.y-offset.y,
                        tileset[p].src,
                        tileset[p].col, 1); 
                }
                else{
                    // tc+=Renderer.PolyTile(
                    //     pt.x-offset.x,
                    //     pt.y-offset.y,
                    //     tileset[p].src;  
                }
             }
        }
    }

    return {  
        Map: function(data){
            map = unpack(data.data);
            mapCols = data.dim.width;
            mapRows = data.dim.height;
        },
        Cell: function(x, y, d){
            return {x:hpoint(x,d)*d, y:vpoint(y,d)*d};
        },
        Set:function(z){
            zoom = z;
        },
        Content: function (x, y) {
            return content(x, y);
        },  
        ScrollOffset: function () {            
            return offset;
        },  
        ScrollTo: function(x, y,lerp){
            var pt = Util.IsoPoint(x*zoom,y*zoom);
            var midx = screenWidth / 2;
            var midy = screenHeight / 2;
            var maxx = (mapWidth*zoom) - screenWidth - 160;
            var maxy = (mapHeight*zoom) - screenHeight - 64;
    
            var destx = (pt.x-midx);
            var desty = (pt.y-midy);
    
            if(lerp){
                destx = Util.Lerp(offset.x, destx, 0.04);
                desty = Util.Lerp(offset.y, desty, 0.04);
            }
    
            if(destx > 64){
                if(destx < maxx)
                {
                    offset.x = destx;
                }
                else{
                    offset.x = maxx;
                }            
            }
            else{
                offset.x = 64;
            }
    
            if(desty > 64){
                if(desty < maxy)
                {
                    offset.y = desty;
                }
                else{
                    offset.y = maxy;
                }            
            }
            else{
                offset.y = 64;
            }
        },
        Render: function (p) {
            render(p);            
        }
    }
};