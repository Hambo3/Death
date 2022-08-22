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

    static Btn(i) {
        const pads = this.pads();
        for (var p = 0; p < pads.length; p++) {
            try {
                if (pads[p].buttons[i].pressed) {
                    return true;
                }
            } catch (e) {}
        }
    };
    
    static Joy (i, v) {
        const pads = this.pads();
        for (var p = 0; p < pads.length; p++) {
            try {
                if (Math.abs(v - pads[p].axes[i]) < 0.5) {
                    return true;
                }
            } catch (e) {}
        }
    };
}

class Input extends GamePad{
    static Up(){return this.IsSingle('ArrowUp') || this.IsDown('KeyW') ||this.Btn(12) || this.Joy(1,-1)}
    static Down(){return this.IsSingle('ArrowDown') || this.IsDown('KeyS') || this.Btn(13) || this.Joy(1,1)}
    static Left(){return this.IsSingle('ArrowLeft') || this.IsDown('KeyA') || this.Btn(14) || this.Joy(0,-1)}
    static Right(){return this.IsSingle('ArrowRight') || this.IsDown('KeyD') || this.Btn(15) || this.Joy(0,1)}
    static Fire1(){return this.IsSingle('KeyK') || this.Btn(1)}
    static Fire2(){return this.IsSingle('KeyL') || this.Btn(2)}
}
