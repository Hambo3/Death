var Fac = [];
var ISO = 0.95;
var RGB ="rgba(0,0,0,";
var C = {
    pal:{
        white:31,
        black:47,
        title:14,
        help:30,
        pickup:46,
        sign:21,
        signtxt:53
    },
    col:{
        man:0,
        hat:1,    
        shadow:2,
        tree:3,
        rock:4,
        wall:5,
        sign:6,
        bread:7,
        splash:8,
        pc:9,
        table:10,
        prince:11,
        gold:12
    },   
    ass:{
        null:0,
        hard:1,
        wall:2,
        sign:3,
        player:5,
        pickup1:8,
        pickup2:9,
        ptext:10
    },
    act:{
        up:0,
        dn:1,
        lt:2,
        rt:3,
        splat:4,
        splash:5,
        fall:6,
        dead:7
    },
    sound:{
        hop1:0,
        hop2:1,
        fall:3,
        splash:4,
        collect1:5,
        collect2:7,
        collect3:7,
        wibble:6
    }
}

var MODE = {
    title:0,
    start:1,
    ready:2,
    game:3,    
    level:4,
    deathInfo:5,
    postInfo:6,
    goal:7,
    over:9
}

var COLS = [
    [
        12,12+16,12+32,12+48,
        8+32,8+48,5+16,5+32,
        15+16,6+32
    ],
    [// hat
        7+32,7+32,7+48,15+32
    ],
    [15+48],// shadow
    [//tree
        1+16,1,1+32,1+48, 5 ,5+16
    ],
    [
        //rock??
        7,6+48,6+32
    ],
    [ //wall
        7+48,7+32,7+16,7
    ],
    [
        5+32,5,4+48
    ],
    [//bread
        6,6+16,6+32,15+16
    ],
    [//splash
        2,2+48,2+32
    ],
    [//29
        7,6+48,6+16,7+32,15+16
    ]
    ,
    [//30
        5+32,5+16,5
    ],
    [//prince
    15+16,6+32,6+48,7,
    8+16,8+32,5+16,5+32,
    15+16,6+32,
    9+32,9+16,9,11+16   
    ],
    [//gold
    9+48,9+32,9+16, 9
    ]
];
var PAL =[
//    0      1       2     3    4       5       6      7      8      9     10     11     12     13     14     15    
    //GRN			WATR  		 BRN1   BRN2   GRL   GRD	 FLSH	GOLD   SAND   REDS	 BLU	Yell   UI   func	
    '#9D4','#692','#6CF','#39D','#950','#530','#EEE','#777','#fb8','#FD4','#FDB','#F00','#36F','#FF0','#5d3','#0F0',
    '#9C3','#681','#5CF','#38C','#840','#420','#DDD','#555','#f95','#DC3','#DB9','#C00','#24C','#CC0','#FFf','#FFF',
    '#8C3','#571','#5BE','#27B','#740','#320','#BBB','#333','#c74','#BA2','#BA7','#900','#129','#990','#FF0','#000',
    '#7A2','#460','#4AD','#16B','#630','#310','#999','#222','#953','#981','#A86','#600','#006','#660','#fff','#555'
];
   
var ST = [
"YOU ARE WORKING LATE ONE NIGHT.|DURING A PARTICULARLY DIFFICULT GAME OF|MINESWEEPER, YOU START TO FEEL SLEEPY.",
"YOU DREAM OF GLORIA THE BEAUTIFUL PRINCESS.|YOU MUST FIND HER.|ON YOUR QUEST YOU MUST FIND THE GOLDEN|TREASURE AND BRING IT TO HER,|FOR SOME REASON.",
"YOU AWAKEN. YOUR BOSS GLORIA LOOKS AT YOU.|WITH A SMILE SHE SAYS YOU CAN GO HOME|YOUVE WORKED HARD TONIGHT!",
"YOU AWAKEN. YOUR BOSS IS STANDING THERE.|SHE SAYS YOU CAN GO, AFTER YOUVE DONE THE|MONTHLY ACCOUNTING REPORT!",
"HEROICALLY YOU RETURN.|EVERYTHING IS AS IT WAS|EVERYTHING YOU DROPPED REMAINS",
"LEAVE THIS NIGHTMARE AND|RETURN TO YOUR LIFE OF REPORTS|AND TABULAR LISTS OF DATA",
"CONTINUE THE QUEST FOR|RICHES AND PRINCESSES.|OR JUST A PRINCESS WILL DO"
];

var ED = [
    "APART FROM YOUR MAGIC HAT AND ALL THE WARNING|SIGNS HOW COULD YOU HAVE KNOWN|THE GROUND WAS SO UNSTABLE?|BUT YOU REMEMBER THAT FOR NEXT TIME.|YOU DID REMEMBER, RIGHT?",
    "WHAT DID YOU EXPECT?|YOU JUMPED IN THE RIVER OF DEATH!",
    "YOU ACTUALLY JUMPED DOWN A HOLE OF DEATH?",
    "YOU KNOW WHAT YOU DID!"
];
var OV=[
    "DEATH",
    "THE FLOOR CRUMBLES AWAY BENEATH YOUR FEET|AND YOU FELL TO YOUR",
    "YOU JUMPED IN THE WATER|AND DROWNED TO",   
    "YOU JUMPED DOWN A HOLE|AND YOU FELL TO YOUR"
];

var HLP = [
"A ROCK. IT IS HEAVY WHEN IT LANDS!|[K] TO THROW",
"BREAD. HOLD [L] AND MOVE|TO DROP BREADCRUMB",
"YOUR MAGIC HAT SENSES DANGER!|THERE ARE {0} ADJACENT STEPS|THAT COULD LEAD TO DEATH",
"YONDER. A BEAUTIFULL PRINCESS|STANDS BEFORE YOU.|YOU MUST GO TO HER",
"THE PRINCESS THANKS YOU.|YOU SHOW HER THE TREASURE YOU HAVE|BROUGHT AND YOU WALK OFF|INTO THE SUNSET TOGETHER",
"YOU EXPLAIN WHY YOU DIDNT BRING|TREASURE. SHE GIVES YOU A POLITE|YET DISAPPOINTED SMILE!",
"THERE IS TREASURE HERE!"];

var signs = [
    0,
    "THE QUEST TO FIND TREASURE|AND THE PRINCESS*|STARTS HERE|||*OR PRINCE",
    "THE FLOORS ARE UNEVEN HERE|ONE STEP CAN LEAD TO|INSTANT DEATH!",    
    "LOOK FOR OBJECTS ON THE WAY|TO AID IN YOUR QUEST",
    "THE FLOORS ARE UNEVEN HERE|ONE STEP CAN LEAD TO|INSTANT DEATH!",
    "PRINCESSES LIKE SHINY THINGS|DONT TURN UP EMPTY HANDED!",
    "PATHS ARE SAFE!",
    "THE DUNGEON OF DEATH|YOU BROUGHT TREASURE|I HOPE?",
    "THE DUNGEON OF DEATH|DEATH OR GLORY AWAITS|DONT TURN UP EMPTY|HANDED"
];

var assets ={   
    hero:{
        bodyH:[2,[8,11,0,-8,11,0,-8,11,-16,8,11,-16],3,[8,-4,0,8,11,0,8,11,-16,8,-4,-16],1,[16,16,-8,-16,16,-8,-16,16,-24,16,16,-24],3,[16,-16,-8,16,16,-8,16,16,-24,16,-16,-24],8,[16,16,-14,-16,16,-14,-16,16,-24,16,16,-24],9,[16,-16,-13,16,16,-14,16,16,-24,16,-16,-24],4,[16,16,-24,-16,16,-24,-16,16,-40,16,16,-40],5,[16,-16,-24,16,16,-24,16,16,-40,16,-16,-40],6,[-16,-16,-40,16,-16,-40,16,16,-40,-16,16,-40],9,[5,22,-6,-2,22,-6,-2,22,-21,5,22,-21],9,[5,16,-6,5,22,-6,5,22,-21,5,16,-21],8,[-2,16,-21,5,16,-21,5,22,-21,-2,22,-21]],
        bodyV:[
            2,[8,11,0,-8,11,0,-8,11,-16,8,11,-16],
            3,[8,-4,0,8,11,0,8,11,-16,8,-4,-16],
            9,[-16,4,-6,-21,4,-6,-21,4,-21,-16,4,-21],
            9,[-20,-4,-6,-20,4,-6,-20,4,-21,-20,-4,-21],
            8,[-21,-4,-21,-16,-4,-21,-16,4,-21,-21,4,-21],
            1,[16,16,-8,-16,16,-8,-16,16,-24,16,16,-24],
            3,[16,-16,-8,16,16,-8,16,16,-24,16,-16,-24],
            8,[16,16,-14,-16,16,-14,-16,16,-24,16,16,-24],
            9,[16,-16,-13,16,16,-14,16,16,-24,16,-16,-24],
            4,[16,16,-24,-16,16,-24,-16,16,-40,16,16,-40],
            5,[16,-16,-24,16,16,-24,16,16,-40,16,-16,-40],
            6,[-16,-16,-40,16,-16,-40,16,16,-40,-16,16,-40],
            9,[21,4,-6,16,4,-6,16,4,-21,21,4,-21],
            9,[21,-4,-6,21,4,-6,21,4,-21,21,-4,-21],
            8,[16,-4,-21,21,-4,-21,21,4,-21,16,4,-21]
            ],
        up:[6,[16,16,-27,-16,16,-27,-16,16,-40,16,16,-40],7,[16,-2,-27,16,16,-27,16,17,-40,16,-16,-40,16,-16,-34,16,-2,-33]
        ],
        down:[2,[-3,16,-33,-9,16,-33,-9,16,-36,-3,16,-36],2,[10,16,-33,4,16,-33,4,16,-36,10,16,-36],2,[15,16,-26,-15,16,-26,-15,16,-29,15,16,-29],7,[16,-2,-28,16,-16,-28,16,-16,-40,16,16,-40,16,16,-34,16,-1,-34]
        ],
        left:[7,[2,16,-28,16,16,-28,16,16,-40,-16,16,-40,-16,16,-34,2,16,-34],7,[16,-16,-28,16,16,-28,16,16,-40,16,-16,-40]
        ],
        right:[7,[-2,16,-28,-16,16,-28,-16,16,-40,16,16,-40,16,16,-34,-2,16,-34],7,[16,-16,-35,16,16,-35,16,16,-40,16,-16,-40],3,[16,-14,-26,16,14,-26,16,14,-28,16,-14,-28],3, [16,5,-31,16,11,-31,16,11,-33,16,5,-33],3,[16,-11,-31,16,-6,-31,16,-5,-33,16,-11,-33]
        ],
        lips:[4,[16,16,-22,-16,16,-22,-16,16,-30,16,16,-30],13,[-5,16,-25,-4,16,-29,-1,16,-29,0,16,-27,1,16,-29,4,16,-29,5,16,-25,0,16,-23]
        ],
        hair:[11,[-22,16,-27,-18,16,-27,-18,16,-45,20,16,-45,20,16,-27,24,16,-27,24,16,-23,14,16,-23,14,16,-38,7,16,-35,-13,16,-37,-13,16,-23,-22,16,-23],
            10,[20,-16,-27,20,16,-27,20,16,-45,20,-16,-45],
            10,[24,-16,-23,24,16,-23,24,16,-27,24,-16,-27],
            12,[-18,-16,-45,20,-16,-45,20,16,-45,-18,16,-45],
            12,[20,-16,-27,24,-16,-27,24,16,-27,20,16,-27]
            ]
    },
    tree1:[4,[8,8,0,-8,8,0,-8,8,-32,8,8,-32],5,[8,-8,0,8,8,0,8,8,-32,8,-8,-32],2,[16,16,-32,-16,16,-32,-16,16,-66,16,16,-66],3,[16,-16,-32,16,16,-32,16,16,-66,16,-16,-66],0,[-16,-16,-66,16,-16,-66,16,16,-66,-16,16,-66]
    ],
    tree2:[4,[8,8,0,-8,8,0,-8,8,-32,8,8,-32],5,[8,-8,0,8,8,0,8,8,-32,8,-8,-32],2,[16,16,-27,-16,16,-27,-16,16,-38,16,16,-38],3,[16,-16,-28,16,16,-28,16,16,-38,16,-16,-38],0,[-16,-16,-38,16,-16,-38,16,16,-38,-16,16,-38],3,[8,-8,-38,8,8,-38,8,8,-50,8,-8,-50],2,[8,8,-38,-8,8,-38,-8,8,-50,8,8,-50],1,[-8,-8,-50,8,-8,-50,8,8,-50,-8,8,-50]
    ],    
    hat:[0,[-16,-16,0, 16,-16,0, 16,16,0, -16,16,0],
        1,[-10,-10,-16, 10,-10,-16, 10,10,-16, -10,10,-16],
        3,[10,-10,0, 10,10,0, 10,10,-16, 10,-10,-16],
        2,[10,10,0, -10,10,0, -10,10,-16, 10,10,-16]
    ],    
    square:[2,[-16,-16,-16,16,-16,-16,16,16,-16,-16,16,-16],0,[16,-16,0,16,16,0,16,16,-16,16,-16,-16],1,[16,16,0,-16,16,0,-16,16,-16,16,16,-16]],
    loaf:[0,[12,-16,0,12,16,0,10,16,-11,10,-16,-11],1,[12,-16,-11,12,16,-11,12,16,-16,12,-16,-16],2,[12,16,0,-12,16,0,-10,16,-11,-12,16,-11,-12,16,-16,12,16,-16,12,16,-11,10,16,-11],3,[-12,-16,-16,12,-16,-16,12,16,-16,-12,16,-16]],
    wall1:[2,[-16,-16,-20,16,-16,-20,16,16,-20,-16,16,-20],1,[16,16,0,-16,16,0,-16,16,-20,16,16,-20],0,[16,-16,0,16,16,0,16,16,-20,16,-16,-20],3,[4,16,-1,3,16,-8,16,16,-9,16,16,-1],3,[-16,16,-11,-16,16,-19,-4,16,-19,-3,16,-11],3,[-1,16,-10,-2,16,-19,16,16,-19,16,16,-11],3,[-16,16,-1,-16,16,-9,1,16,-9,1,16,0]],
    wall2:[2,[-16,-16,-20,16,-16,-20,16,16,-20,-16,16,-20],1,[16,16,0,-16,16,0,-16,16,-20,16,16,-20],0,[16,-16,0,16,16,0,16,16,-20,16,-16,-20],3,[5,16,-1,6,16,-9,16,16,-9,16,16,-1],3,[-16,16,-1,-16,16,-9,-11,16,-9,-10,16,-1],3,[8,16,-11,9,16,-19,16,16,-19,16,16,-11],3,[-16,16,-11,-16,16,-19,-8,16,-19,-9,16,-11],3,[-6,16,-11,-7,16,-19,7,16,-18,6,16,-10],3,[-8,16,-1,-10,16,-9,4,16,-8,2,16,-1]],
    tile:[0,[-16,-16,0, 16,-16,0, 16,16,0, -16,16,0]],
    tilea:[0,[-16,-16,0,16,-16,0,16,16,0,-16,16,0],1,[-13,-15,0,15,-13,0,14,14,0,-15,13,0]],
    tileb:[0,[-16,-16,0,16,-16,0,16,16,0,-16,16,0],1,[-15,-13,0,15,-15,0,12,14,0,-12,13,0]],
    tilec:[0,[-16,-16,0,16,-16,0,16,16,0,-16,16,0],1,[-14,-13,0,14,-14,0,6,-1,0,-3,4,0,-7,13,0,-15,14,0],1,[7,1,0,14,-10,0,14,14,0,-6,14,0,-2,5,0]],
    tilef:[0,[-16,-16,0,16,-16,0,16,16,0,-16,16,0],1,[-15,-15,0,15,-15,0,15,15,0,-15,15,0]],
    tileh:[0,[-16,-16,0,16,-16,0,16,16,0,-16,16,0],1,[-11,16,0,-16,16,0,-16,-16,0]],
    table:[1,[31,16,0,27,16,0,27,16,-16,31,16,-16],0,[31,12,0,31,16,0,31,16,-16,31,12,-16],1,[-27,16,0,-31,16,0,-31,16,-16,-27,16,-16],0,[-27,12,0,-27,16,0,-27,16,-16,-27,12,-16],1,[31,-12,0,27,-12,0,27,-12,-16,31,-12,-16],0,[31,-16,0,31,-12,0,31,-12,-16,31,-16,-16],0,[-32,-16,-16,32,-16,-16,32,16,-16,-32,16,-16],2,[-32,-16,-17,32,-16,-17,32,16,-17,-32,16,-17]],
    pc:[1,[16,16,0,-16,16,0,-16,16,-8,16,16,-8],0,[16,-16,0,16,16,0,16,16,-8,16,-16,-8],2,[-16,-16,-8,16,-16,-8,16,16,-8,-16,16,-8],1,[16,14,-10,-16,14,-10,-16,14,-26,16,14,-26],0,[16,-18,-10,16,14,-10,16,14,-26,16,-18,-26],2,[-16,-18,-26,16,-18,-26,16,14,-26,-16,14,-26],3,[14,14,-12,-14,14,-12,-14,14,-24,14,14,-24],4,[10,14,-15,-5,14,-15,-5,14,-23,10,14,-23]],
    sign:[0,[4,-16,-1,4,-10,-1,4,-10,-24,4,-16,-24],1,[4,-11,0,-4,-11,0,-4,-11,-24,4,-11,-24],2,[-4,-16,-24,4,-16,-24,4,-11,-24,-4,-11,-24],0,[16,-12,-6,-16,-12,-6,-16,-12,-22,16,-12,-22],1,[16,-11,-6,-16,-11,-6,-16,-11,-22,16,-11,-22],0,[8,-11,-14,-9,-11,-14,-9,-11,-16,8,-11,-16]],
    chest:[1,[14,8,0,-14,8,0,-14,8,-16,14,8,-16],0,[14,-8,0,14,8,0,14,8,-16,14,4,-20,14,-4,-20,14,-8,-16],2,[-14,4,-20,14,4,-20,14,8,-16,-14,8,-16],3,[-14,-4,-20,14,-4,-20,14,4,-20,-14,4,-20]],
    lives:[0,[-8,-8,8,-8,8,8,-8,8]],
    levels:[
        [1,[-16,-10,16,-10,16,-2,13,-2,13,16,-13,16,-13,-2,-16,-2]],
        [1,[-16,-10,-6,-10,-6,16,-13,16,-13,-2,-16,-2]],
        [1,[-16,-10,6,-10,6,16,-13,16,-13,-2,-16,-2]]
    ]
};

var TILES = [
    {src:0, col: [0]},
    {src:0, col:[0+16]},
    {src:0, col:[0+32]},
    {src:0, col:[0+48]},
    {src:0, col: [1]},//4

    {src:0, col: [2]},
    {src:0, col: [2+16]},
    {src:0, col: [2+32]},
    {src:assets.tileh, col:[2+16,2+48]},//8

    {src:0, col: [10]},
    {src:0, col: [10+16]},
    {src:0, col: [10+32]},//11

    {src:0, col: [16]},
    {src:0, col: [0+48]},
    {src:0, col: [2+16]},//14

    {src:0, col: [4+16]},
    {src:assets.tileh, col:[4+16,4+48]},//16

    {src:0, col: [5]},
    {src:0, col: [5+16]},

    {src:0, col: [7]},//19 wall

    {src:0, col: [0+16]},  //tree spawn
    {src:0, col:[0+48]},
    {src:0, col:[0+32]},

    {src:0, col: [6+32]},//path
    {src:assets.tilef, col:[6+16,6+48]},//floor
    {src:0, col:[0+16]}, //25 safe zone

    {src:assets.tilea, col: [0+16, 6+32]},
    {src:assets.tileb, col: [0+16, 6+32]},
    {src:assets.tilec, col: [0+16, 6+32]},
    {src:assets.tilea, col: [0+16, 6+48]},
    {src:assets.tileb, col: [0+16, 6+48]},
    {src:assets.tilec, col: [0+16, 6+48]}
    ];

var SOUNDS = [
    [,,434,.02,.02,.01,2,.23,-0.1,-0.1,-100,,.01,,14,.5,,.9,,.39],//hop1
    [,,876,,.01,.01,2,.13,48,.2,,,,,35,,,.9],//hop2.1
    [,,876,,.01,.01,,.13,48,.2,50,,,,35,,,.9],//hop2.2
    [1.07,,1665,.02,.09,.16,1,.47,-0.3,-6.6,119,.02,,,,.1,,.41,.05,.17],//fall        
    [1.07,,1664,.02,.1,.16,,.37,-0.3,-6.5,119,.02,,.1,2,.1,,.41,.05,.17],//splash
    [1.02,,1590,,.01,.11,1,1.4,,,-161,.04,,,,.1,,.93,.02,.2],//collect
    [1.78,,1341,.21,,.16,1,.34,19,22,-15,.27,.18,,9.5,,.1,.23,.22,.27],
    [,,1851,.01,.05,.2,1,1.09,,-1,,,,,,,,.55,.05,.16]//gold
];

var FONT = {    
    'A': [
        [, 1, 0],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, , 1]
    ],
    'B': [
        [1, 1, 0],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, 1,0]
    ],
    'C': [
        [1, 1, 1],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1, 1, 1]
    ],
    'D': [
        [1, 1,0],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1,0]
    ],
    'E': [
        [1, 1, 1],
        [1,0,0],
        [1, 1, 1],
        [1,0,0],
        [1, 1, 1]
    ],
    'F': [
        [1, 1, 1],
        [1,0,0],
        [1, 1,1],
        [1,0,0],
        [1,0,0]
    ],
    'G': [
        [, 1, 1,0],
        [1,0,0,0],
        [1, , 1, 1],
        [1, , , 1],
        [, 1, 1,0]
    ],
    'H': [
        [1, , 1],
        [1, , 1],
        [1, 1, 1],
        [1, , 1],
        [1, , 1]
    ],
    'I': [
        [1, 1, 1],
        [, 1,0],
        [, 1,0],
        [, 1,0],
        [1, 1, 1]
    ],
    'J': [
        [1, 1, 1],
        [, , 1],
        [, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'K': [
        [1, , , 1],
        [1, , 1,0],
        [1, 1,0,0],
        [1, , 1,0],
        [1, , , 1]
    ],
    'L': [
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1, 1, 1]
    ],
    'M': [
        [1,1,1,1],
        [1,0,1,1],
        [1,0,1,1],
        [1,0,0,1],
        [1,0,0,1]
    ],
    'N': [
        [1, , , 1],
        [1, 1, , 1],
        [1, , 1, 1],
        [1, , , 1],
        [1, , , 1]
    ],
    'O': [
        [1, 1, 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'P': [
        [1, 1, 1],
        [1, , 1],
        [1, 1, 1],
        [1,0,0],
        [1,0,0]
    ],
    'Q': [
        [0, 1, 1,0],
        [1, , , 1],
        [1, , , 1],
        [1, , 1, 1],
        [1, 1, 1, 1]
    ],
    'R': [
        [1, 1,0],
        [1, , 1],
        [1, , 1],
        [1, 1,0],
        [1, , 1]
    ],
    'S': [
        [1, 1, 1],
        [1,0,0],
        [1, 1, 1],
        [, , 1],
        [1, 1, 1]
    ],
    'T': [
        [1, 1, 1],
        [, 1,0],
        [, 1,0],
        [, 1,0],
        [, 1,0]
    ],
    'U': [
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, , 1],
        [1, 1, 1]
    ],
    'V': [
        [1,,1],
        [1,,1],
        [1,,1],
        [1,,1],
        [0,1,0]
    ],
    'W': [
        [1,,,1],
        [1,,,1],
        [1,,,1],
        [1,,1,1],
        [1,1,1,1]
    ],
    'X': [
        [1,0,1],
        [1,0,1],
        [0,1,0],
        [1,0,1],
        [1,0,1]
    ],
    'Y': [
        [1,,1],
        [1,,1],
        [,1,0],
        [,1,0],
        [,1,0]
    ],
    'Z': [
        [1,1,1],
        [,,1],
        [,1,0],
        [1,0,0],
        [1,1,1]
    ],
    '0': [
        [1,1,1],
        [1,,1],
        [1,,1],
        [1,,1],
        [1,1,1]
    ],
    '1': [
        [, 1,0],
        [, 1,0],
        [, 1,0],
        [, 1,0],
        [, 1,0]
    ],
    '2': [
        [1,1,1],
        [0,0,1],
        [1,1,1],
        [1,0,0],
        [1,1,1]
    ],
    '3':[
        [1,1,1],
        [0,0,1],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    '[': [
        [,1,1],
        [,1,],
        [,1,],
        [,1,],
        [,1,1]
    ],
    ']': [
        [1,1,],
        [,1,],
        [,1,],
        [,1,],
        [1,1,]
    ],
    ' ': [
        [, ,],
        [, ,],
        [, ,],
        [, ,],
        [, ,]
    ],
    '?': [
        [1,1,1],
        [1,0,1],
        [0,1,1],
        [0,1,0],
        [0,1,0]
    ],
    '!': [
        [0,1,1],
        [0,1,1],
        [0,1,0],
        [0,0,0],
        [0,1,0]
    ],
    '.': [
        [, ,],
        [, ,],
        [, ,],
        [, ,],
        [,1,]
    ],
    ',': [
        [, ,],
        [, ,],
        [, ,],
        [ ,,1],
        [,1,]
    ],
    '*':
    [
        [1,,1,,1],
        [,1,1,1,],
        [1,1,1,1,1],
        [,1,1,1,],
        [1,,1,,1]
    ],
    '|':[]
};

