let GAME_OBJECTS = [];

class GameObject {
    constructor(){
        GAME_OBJECTS.push(this);
        this.has_called_start = false;
        this.timedelta = 0;
        this.uid = this.create_uid();
    }

    create_uid(){
        let res = "";
        for(let i = 0; i < 8; i ++){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start(){
    }

    update(){
    }

    on_destroy(){
    }

    destroy(){
        this.on_destroy();

        for(let i = 0;i < GAME_OBJECTS.length;i ++){
            if(GAME_OBJECTS[i] === this){
                GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;

let GAME_ANIMATION = function(timestamp){
    for(let i = 0;i < GAME_OBJECTS.length;i ++){
        let obj = GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }
        else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;

    requestAnimationFrame(GAME_ANIMATION);
}

requestAnimationFrame(GAME_ANIMATION);
