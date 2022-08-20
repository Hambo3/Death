
var SoundManager = function (file) {
 
    var sound = new Audio(file.src);
    var plays = [];

    for (let i = 0; i < file.keys.length; i++) {
        plays[file.keys[i].key] = {start:file.keys[i].start, end:file.keys[i].end};
    }

    function play(index){
        plays.forEach(element => {
            element.pause();
        });
        sound.currentTime = plays[index].start;
        sound.play();

        setTimeout(()=> {
            sound.pause();
        }, plays[index].end);
    }

    return {
        Play: function (index) {
            return play(index);
        }
    }
};

var AudioManager = function (files) {

    var sounds = [];

    for (let i = 0; i < files.length; i++) {
        switch (files[i].type) {
            case "split":
                var snds = new AudioPlay(files[i].src);
                break;
            case "play":
                sounds[files[i].key] = new AudioPlay(files[i].src);
                break;
            case "loop":
                sounds[files[i].key] = new AudioLoop(files[i].src);
                break;
            case "sequence":
                sounds[files[i].key] = new AudioSequence(files[i].src, true);
                break; 
            default:
                break;
        }
    }

    function stop(index){
        sounds[index].Stop();
    }

    function play(index){
        return sounds[index].Play();
    }

    return {
        Play: function (index) {
            return play(index);
        },
        Stop: function (index){
            stop(index);
        }
    }
};

var AudioSequence = function (snds, rnd) {
    var sounds = [];
    var playing = false;
    for (let i = 0; i < snds.length; i++) {
        var s = new Audio(snds[i]);
        s.addEventListener('ended', next, false);
        sounds.push(s);   
    }

    var index = rnd ? Util.RndI(0, sounds.length) : 0;

    function next(){
        playing = false;
        if(rnd){
            index = Util.RndI(0, sounds.length);
        }
        else{
            index = (index < sounds.length-1) ? index+1 : 0;
        }
    }

    function play(){
        if(playing == false){
            this.currentTime = 0;
            sounds[index].play();
            playing = true;
            return true;
        }
        else{
            return false;
        }
    }

    return {
        Play: function () {
            return play();
        }
    }
};

var AudioLoop = function (snd) {
    var playing = false;
    var sound = new Audio(snd);
    sound.volume = 0.2;
    sound.addEventListener('ended', loop, false);

    function loop(){
        if(playing == true){
            this.currentTime = 0;
            sound.play();
        }
    }

    function play(){
        if(playing == false){
            this.currentTime = 0;
            sound.play();
            playing = true;
        }
    }

    function stop(){
        //sound.removeEventListener('ended', loop);
        playing = false;
        sound.pause();
    }

    return {
        Play: function () {
            play();
        },
        Stop: function (){
            stop();
        }
    }
};

var AudioPlay = function (snd) {
    var playing = false;    
    var sound = new Audio(snd);

    sound.addEventListener('ended', end, false);

    function play(){
        if(!playing){
            sound.play();
            playing = true;
            return true;
        }
        else{
            return false;
        }
    }

    function end(){
        playing = false;
    }

    return {
        Play: function () {
            return play();
        },
        Stop: function (){
            end();
        }
    }
};

