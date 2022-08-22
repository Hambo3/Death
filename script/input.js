class KeyInput{
    
    static pres = [];//pressed
    static rel = [];//released

    static IsDown(key) {
        return this.pres[key];
    }

    static IsSingle(key) {
        var k = this.pres[key] && (this.pres[key] !== null || this.pres[key]);
        if(k){
            this.pres[key] = null;
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

    static Btn(i, p) {
        const pads = this.pads();        
        try {
            if (pads[p].buttons[i].pressed) {
                return true;
            }
        } catch (e) {}
    };
    
    static JoyUp(p)
    {
        return this.Joy(1,-1, p) || this.Btn(12,p);
    }
    static JoyDown(p)
    {
        return this.Joy(1,1, p) || this.Btn(13,p);
    }
    static JoyLeft(p)
    {
        return this.Joy(0,-1, p) || this.Btn(14,p);
    }
    static JoyRight(p)
    {
        return this.Joy(0,1, p) || this.Btn(15,p);
    }
    static Joy (i, v, p) {
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
    static Up(){return this.IsDown('KeyW') || this.IsDown('ArrowUp') || this.JoyUp(0)}
    static Down(){return this.IsDown('KeyS') || this.IsDown('ArrowDown') || this.JoyDown(0)}
    static Left(){return this.IsDown('KeyA') || this.IsDown('ArrowLeft') || this.JoyLeft(0)}
    static Right(){return this.IsDown('KeyD') || this.IsDown('ArrowRight') || this.JoyRight(0)}
    static Fire1(){return this.IsDown('KeyV') || this.Btn(0,0)}
    static Fire2(){return this.IsDown('KeyB') || this.Btn(1,0)}
}


