class KeyInput{
    
    static pres = [];//pressed
    static rel = [];//released

    static IsDown(key) {
        return this.pres[key];
    }

    static IsSingle(key) {
        var k = this.pres[key] && (this.rel[key] !== null || this.rel[key]);
        if(k){
            this.rel[key] = null;
        }
        return k;
    }
    
    static Pressed(e, status) {
        var k = this.SetKey(e, status);
        this.pres[k] = status;
        return k;
    }

    static Released(e, status) {
        var k = this.SetKey(e, status);
        this.rel[k] = status;
    }

    static SetKey(event, status) {
        return event.code;
    }
}

class GamePad extends KeyInput{
    static pads = () => (navigator.getGamepads ? Array.from(navigator.getGamepads()) : []).filter(x => !!x);

    static pres = [];
    static meta = [
        {i:1,v:-1,b:12},
        {i:1,v:1,b:13},
        {i:0,v:-1,b:14},
        {i:0,v:1,b:15}];

    static Btn(i, p) {
        const pads = this.pads();        
        try {
            var s = pads[p].buttons[i].pressed;
            var d = s && (this.pres[i+10] != s);
            this.pres[i+10] = s;
            return d;
        } catch (e) {}
    };
    
    static Joy(p, i){
        var m = this.meta[i];
        var s = this.Pad(m.i,m.v, p) || this.Btn(m.b, p);
        var d = s && (this.pres[i] != s);
        this.pres[i] = s;
        return d;
    }

    static Pad (i, v, p) {
        const pads = this.pads();
        try {
            if (Math.abs(v - pads[p].axes[i]) < 0.5) {
                return true;
            }
        } catch (e) {}
    };

    static Pads(){
        return this.pads();
    }
}

class Input extends GamePad{
    static Up(){return this.IsSingle('KeyW') || this.IsSingle('ArrowUp') || this.Joy(0,0)}
    static Down(){return this.IsSingle('KeyS') || this.IsSingle('ArrowDown') || this.Joy(0,1)}
    static Left(){return this.IsSingle('KeyA') || this.IsSingle('ArrowLeft') || this.Joy(0,2)}
    static Right(){return this.IsSingle('KeyD') || this.IsSingle('ArrowRight') || this.Joy(0,3)}
    static Fire1(){return this.IsSingle('KeyV') || this.Btn(0,0)}
    static Fire2(){return this.IsSingle('KeyB') || this.Btn(1,0)}
}


