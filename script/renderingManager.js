//handles loading and keeps track of all graphics
//performs all rendering operations
var Rendering = function (context, screen, border) {
    var ctx = context;
    var scale = 1;
    var bounds = null;
    
    if(screen)
    {
        bounds ={
            minx:0, 
            maxx:screen.w, 
            miny:0,
            maxy:screen.h};
    
        if(border){
            bounds.minx -= border.x1,
            bounds.maxx += border.x2,
            bounds.miny -= border.y1,
            bounds.maxy += border.y2
        };    
    }

    function PT(p){
        return Math.round(p);
    }

    function poly2D(x,y,poly,coli,sz){
        for(var i = 0; i < poly.length; i+=2) 
        {
            var pts = poly[i+1];
            ctx.fillStyle = PAL[ COLS[coli][poly[i]] ];
            ctx.beginPath();
            var pt = {x:pts[0]*sz, y:pts[1]*sz};
            ctx.moveTo(
                PT(pt.x + x), 
                PT(pt.y + y)
                );
    
            for(var p = 2; p < pts.length; p+=2) {
                pt = {x:pts[p]*sz, y:pts[p+1]*sz};
                ctx.lineTo(
                    PT(pt.x + x), 
                    PT(pt.y + y)
                    ); 
            }
            ctx.closePath();
            ctx.fill();
        } 
    }

    function polygon(x, y, poly, coli, size, a){
        for(var i = 0; i < poly.length; i+=2) 
        {
            var t = Array.isArray(coli) ? PAL[coli[poly[i]]] : PAL[ COLS[coli][poly[i]] ];
            side(x, y, poly[i+1], t, size, a);
        } 
    }

    function side(x, y, pts, col, sz, a){
        var color = new Color(col, a);
        ctx.fillStyle = color.RGBA();//col;   

        ctx.beginPath();
        var pt = Util.IsoPoint(pts[0]*sz, pts[1]*sz);
        var z = pts[2]*sz;
        ctx.moveTo(
            PT((pt.x * scale) + x), 
            PT(((pt.y + z)* scale) + y)
            );

        for(var p = 3; p < pts.length; p+=3) {
            pt = Util.IsoPoint(pts[p]*sz, pts[p+1]*sz);
            z = pts[p+2]*sz;
            ctx.lineTo(
                PT((pt.x * scale) + x), 
                PT(((pt.y + z)* scale) + y)
                ); 
        }
        ctx.closePath();
        ctx.fill();
    }

    //assumes upper
    function txt(str, xs, ys, size, sc, col) {

        str = !isNaN(str) ? ""+str : str;
        ctx.fillStyle = col || '#000000';

        var cr = xs;
        var blockSize = {x:0,y:0};

        var ln = str.length||1;
        for (var i = 0; i < ln; i++) {
            var xp = 0;
            var yp = 0;
            var mx = 0; 

            var chr = str.length ? str.charAt(i) : str;
            if(chr == '|')
            {
                ys += (size*8);
                xs=cr;
                blockSize.x = 0;
                blockSize.y = (size*8);
            }
            else
            {
                var l = FONT[chr];
                var chrSize = {x:0,y:0};
                for (var r = 0; r < l.length; r++) 
                {
                    chrSize.x = 0;
                    xp = 0;
                    var row = l[r];
                    for (var c = 0; c < row.length; c++) 
                    {                    
                        var szx = (sc && c==row.length-1) ? size*2 : size;
                        var szy = (sc && r==l.length-1) ? size*2 : size;
                        if (row[c]) {
                            ctx.fillRect(Math.round(xp + xs), Math.round(yp + ys), szx, szy);
                        }
                        xp += szx;
                        chrSize.x += szx;
                    }
                    mx = xp>mx ? xp : mx;
                    yp += szy;
                    chrSize.y += szy;
                }
                blockSize.x += chrSize.x + size;
                blockSize.y = chrSize.y;

                xs += mx + size; 
            }
        }

        return blockSize;
    } 

    function box(x,y,w,h,c){
        ctx.fillStyle = c || '#000000';
        ctx.fillRect(x, y, w, h);
    }

    return {
        Set:function(n){
            scale = n;
        },
        Box: function(x,y,w,h,c){
            ctx.fillStyle = c || '#000000';
            ctx.fillRect(x, y, w, h);
        },
        // PolyTile: function(x, y, plane, coli, size){
        //     if(!bounds || ((x > bounds.minx && x < bounds.maxx) && (y > bounds.miny  && y < bounds.maxy)) ) {
        //         side(x, y, plane, coli, size || 1);
        //         return 1;
        //     }
        //     return 0;
        // },
        PolySprite: function(x, y, poly, coli, size, alpha){
            if(poly && (!bounds || ((x > bounds.minx && x < bounds.maxx) && (y > bounds.miny  && y < bounds.maxy))) )
            {  
                polygon(x, y, poly, coli, size || 1, alpha || 1);
                return 1;
            }
            return 0;
        },  
        Sprite2D: function(x, y, poly, coli, size){
            poly2D(x,y,poly,coli,size);
        },
        Text: function(text, x, y, size, sc, col){
            return txt(text, x, y, size, sc, col);
        }
    }
};