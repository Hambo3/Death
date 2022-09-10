class Color
{
    constructor(c,a=1) { 
        var s = c.split(''); 
        var rgb = [];
        for (var i = 1; i < s.length; i++) {
            rgb.push(parseInt(s[i], 16));
        }
        this.r=rgb[0]*16;this.g=rgb[1]*16;this.b=rgb[2]*16;this.a=a; 
    }    
    RGBA()  { return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
    }
}

class Display
{
    constructor(str, col,fade, speed,p) { 
        this.chr = [];
        this.col = col;
        for (var i = 0; i < str.length; i++) {
            this.chr.push({t:str[i], f:fade, c:new Color(col)});
        }
        this.index = 0;
        this.rate = speed;
        this.speed = speed;
        this.fade = fade;
        this.pause = p;
    }    

    get Done(){
        return this.index == this.chr.length;
    }

    Update(dt){
        if(this.pause>0){
            this.pause-=dt;
            return false;
        }
        else{
            this.rate-=dt;
            if(this.rate < 0)
            {
                this.rate = this.speed;
                if(this.index < this.chr.length){
                    this.index++;
                }
            }
            for (var i = 0; i < this.index; i++) {
                if(this.chr[i].f > 0){
                    this.chr[i].f -= dt;
                }
            }
            return this.index == this.chr.length;
        }
    }

    Render(rend, pos, sz, st) { 
        var x = pos.x;
        var y = pos.y;
        for (var i = 0; i < this.index; i++) {
            var op = Util.Remap(this.fade, 0, 0, 1, this.chr[i].f);
            this.chr[i].c.a = op;
            var col = this.chr[i].c.RGBA();
            var l = rend.Text(this.chr[i].t, x, y, sz|4, st|0, col); 
            if(l.x == 0)
            {
                x=pos.x;
                y+=l.y;   
            }
            else{
                x+=l.x;
            }
        }
    }    
}