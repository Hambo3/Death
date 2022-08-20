
var Debug = function (options) {
    var lastLoop = (new Date()).getMilliseconds();
    var count = 1;
    var fps = 0;

    var lineht = 16;
    var lines = {};

    var width;
    var height;
    var ctx;
    if(options){
        width=options.width;
        height=options.height;
        ctx = options.ctx;
    }
    if(!ctx){
        var canvas = document.createElement("canvas");
        canvas.className = "debugger";
        if(canvas.getContext)
        {
            ctx = canvas.getContext("2d");
            ctx.font = "30px Arial";
            canvas.width = width;
            canvas.height = height;

            var b = document.getElementById(options.canvas);
            b.appendChild(canvas);			
        }        
    }

    function ShowFps() {
        var currentLoop = (new Date()).getMilliseconds();
        if (lastLoop > currentLoop) {
          fps = count;
          count = 1;
        } else {
          count += 1;
        }
        lastLoop = currentLoop;
        return fps;
      }

    return {
        Print: function (id, text, col)//debug.Print("key",value);
        {
            lines[id] = {text:text, col:col || '#000000'};
         
        },
        Render: function(rend, showFps){
            if(rend == true){
                var x=0;
                var y=lineht;
                ctx.font = lineht+"px Arial";

                if(showFps == true){
                    ctx.fillStyle = '#000000';
                    ctx.fillText(ShowFps(), x, y);
                    y+=lineht; 
                }                

                for (var key in lines) {
                    ctx.fillStyle = lines[key].col;
                    ctx.fillText(key+":"+lines[key].text, x, y);
                    y+=lineht; 
                }            
            }
        }
    }
};
