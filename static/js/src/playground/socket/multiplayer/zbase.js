class MultiPlayerSocket {
    constructor(playground){
        this.playground = playground;

        this.ws = new WebSocket("wss://app2761.acapp.acwing.com.cn/wss/multiplayer/?token=" + this.playground.root.access);

        this.start();
    }

    start(){
        this.receive();
    }

    receive(){
        let outer = this;
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data);
            let uid = data.uid;
            if(uid === outer.uid){
                return false;
            }

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uid, data.username, data.photo);
            }
            else if (event === "move_to") {
                outer.receive_move_to(uid, data.tx, data.ty);
            }
            else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uid, data.tx, data.ty, data.ball_uid);
            }
            else if (event === "attack") {
                outer.receive_attack(uid, data.attackee_uid, data.x, data.y, data.angle, data.damage, data.ball_uid);
            }
            else if (event === "blink") {
                outer.receive_blink(uid, data.tx, data.ty);
            }
            else if (event === "message") {
                outer.receive_message(uid, data.username, data.text);
            }
        }
    }

    send_create_player(username, photo){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uid': outer.uid,
            'username': username,
            'photo': photo,
        }));
    }

    get_player(uid){
        let players = this.playground.players;
        for(let i = 0; i < players.length; i ++){
            let player = players[i];
            if(player.uid === uid){
                return player;
            }
        }
        return null;
    }

    receive_create_player(uid, username, photo){
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );
        player.uid = uid;
        this.playground.players.push(player);
    }

    send_move_to(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uid': outer.uid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_move_to(uid, tx, ty){
        let player = this.get_player(uid);
        if(player){
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uid': outer.uid,
            'tx': tx,
            'ty': ty,
            'ball_uid': ball_uid,
        }));
    }

    receive_shoot_fireball(uid, tx, ty, ball_uid){
        let player = this.get_player(uid);
        if(player){
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uid = ball_uid;
        }
    }

    send_attack(attackee_uid, x, y, angle, damage, ball_uid){//attackee是被攻击者
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uid': outer.uid,
            'attackee_uid': attackee_uid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uid': ball_uid,
        }));
    }

    receive_attack(uid, attackee_uid, x, y, angle, damage, ball_uid){
        let attacker = this.get_player(uid);
        let attackee = this.get_player(attackee_uid);
        if(attacker && attackee){
            attackee.receive_attack(x, y, angle, damage, ball_uid, attacker);
        }
    }

    send_blink(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uid': outer.uid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_blink(uid, tx, ty){
        let player = this.get_player(uid);
        if(player){
            player.blink(tx, ty);
        }
    }

    send_message(username, text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uid': outer.uid,
            'username': username,
            'text': text,
        }));
    }

    receive_message(uid, username, text) {
        this.playground.chat_field.add_message(username, text);
    }
}
