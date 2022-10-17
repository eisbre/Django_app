class MultiPlayerSocket {
    constructor(playground){
        this.playground = playground;

        this.ws = new WebSocket("wss://app2761.acapp.acwing.com.cn/wss/multiplayer/");

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
            if(event === "create_player"){
                outer.receive_create_player(uid, data.username, data.photo);
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
}
