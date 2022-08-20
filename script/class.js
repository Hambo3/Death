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
    Clone(s=1) { 
        var r = new Color("#000", this.a*s); 
        r.r = this.r*s;
        r.g = this.g*s;
        r.b = this.b*s; 
        return r;
    }
    Subtract(c)                  { this.r-=c.r;this.g-=c.g;this.b-=c.b;this.a-=c.a; return this; }
    Lerp(c,p)                    { return c.Clone().Subtract(c.Clone().Subtract(this).Clone(1-p)); }
    RGBA()                       { return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
    }
}