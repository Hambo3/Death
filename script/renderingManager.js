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
            side(x, y, poly[i+1], 
                PAL[
                    COLS[coli][poly[i]]
            ], size, a);
        } 
    }

    function side(x, y, pts, col, sz, a){

        try {
            var color = new Color(col, a);
            ctx.fillStyle = color.RGBA();//col;   
        } catch (error) {
            console.log(error);
        }

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

        ctx.fillStyle = col || '#000000';
        cr = xs;

        for (i = 0; i < str.length; i++) {
            xp = 0;
            yp = 0;
            mx = 0; 

            c = str.charAt(i);                     
            if(c == '+')
            {
                ys += (size*8);
                xs=cr;
            }
            else
            {
                l = FONT[str.charAt(i)];

                for (var r = 0; r < l.length; r++) 
                {                
                    xp = 0;
                    row = l[r];
                    for (var c = 0; c < row.length; c++) 
                    {                    
                        szx = (sc && c==row.length-1) ? size*2 : size;
                        szy = (sc && r==l.length-1) ? size*2 : size;
                        if (row[c]) {
                            ctx.fillRect(Math.round(xp + xs), Math.round(yp + ys), szx, szy);
                        }
                        xp += szx;
                    }
                    mx = xp>mx ? xp : mx;
                    yp += szy;
                }
                xs += mx + size; 
            }
        }
    } 

    function box(x,y,w,h,c){
        ctx.fillStyle = c || '#000000';
        ctx.fillRect(x, y, w, h);
    }

    function gray(p) {
        var d = p.data;
        for (var i=0; i<d.length; i+=4) {
          var r = d[i],g = d[i+1],b = d[i+2];
          var v = 0.2126*r + 0.7152*g + 0.0722*b;
          d[i] = d[i+1] = d[i+2] = v
        }
        return p;
      }

    function para(tx,x, y, len, w){
        var t=0;
        var c = r = 0;
        for (let i = 0; i < len; i++) {
            txt(tx[t], x + c, y + r, 3, 0);
            t=t==tx.length-1?0:t+1;
            c+=12;
            if(c > w){
                c=0;
                r+=18;
            }
        }
    }

    return {
        News:function(w,h, pic,win){
            box(0,0,w, h, PAL[C.pal.white]);
            box(4,4,w-8, h-8, PAL[C.pal.black]);
            box(8,8,w-16, h-16, PAL[C.pal.white]);
            box(8,140,w-16, 2, PAL[C.pal.black]);
            txt(Util.dateToYMD(), 700, 12, 2,0);
            txt("DAILY BLAH", 200, 60, 10,0);
            txt("PROBABLY ENTIRELY FACTUAL", 240, 120, 3,0);

            txt(win[0], 20, 154, 6,0);            
            txt(win[1], 18, 195, 3,0);
            txt(win[2], 500, 195, 3,0);


            para(ON[0], 18, 280, 80, 250 ); 
            para(ON[0], 18, 400, 200, 250 );
            para(ON[0], 280, 400, 100, 200 );
            para(ON[0], 500, 360, 240, 290 );

            txt("PRESS [SPACE]", 580, 580, 4,0);
            if(pic){
                ctx.putImageData(gray(pic), 280, 195);
            }
        },
        Get:function(x,y, w,h){
            return ctx.getImageData(x, y, w, h);
        },
        Set:function(n){
            scale = n;
        },
        Box: function(x,y,w,h,c){
            ctx.fillStyle = c || '#000000';
            ctx.fillRect(x, y, w, h);
        },
        PolyTile: function(x, y, plane, coli, size){
            if(!bounds || ((x > bounds.minx && x < bounds.maxx) && (y > bounds.miny  && y < bounds.maxy)) ) {
                side(x, y, plane, coli, size || 1);
                return 1;
            }
            return 0;
        },
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
            txt(text, x, y, size, sc, col);
        }
    }
};