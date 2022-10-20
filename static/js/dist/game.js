class GameMenu{
    constructor(root){
        this.root=root;
        this.$menu = $(`
            <div class="game-menu">
                <div class="game-menu-field">
                    <div class="game-menu-field-item game-menu-field-item-single-mode">
                        单人模式
                    </div>

                    <br>

                    <div class="game-menu-field-item game-menu-field-item-multi-mode">
                        多人模式
                    </div>

                    <br>

                    <div class="game-menu-field-item game-menu-field-item-settings">
                        退出
                    </div>
                </div>
            </div>
        `);
        this.$menu.hide();
        this.root.$game.append(this.$menu);
        this.$single_mode = this.$menu.find('.game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.game-menu-field-item-settings');

        this.start();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });

        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });

        this.$settings.click(function(){
            outer.root.settings.logout_remote();
        });

    }

    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }

}
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
class ChatField { 
    constructor(playground) { 
        this.playground = playground;

        this.$history = $(`<div class="game-chat-field-history">聊天</div>`);
        this.$input = $(`<input type="text" class="game-chat-field-input">`);
        this.func_id = null;

        this.$history.hide();
        this.$input.hide();

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() { 
        this.add_listening_events();
    }

    add_listening_events() { 
        let outer = this;

        this.$input.keydown(function (e) {
            if (e.which === 27) {
                outer.hide_input();
                return false;
            }
            else if (e.which === 13) {
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text) {
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(username, text);
                }
                return false;
            }
        });
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    show_history() {
        let outer = this;

        this.$history.fadeIn();

        if (this.func_id) clearTimeout(this.func_id);

        this.func_id = setTimeout(function () {
            outer.$history.fadeOut();
            this.func_id = null;
        },3000);
    }

    show_input() {
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input() { 
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}class GameMap extends GameObject {
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        this.$canvas.focus();
    }

    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0,0,0,1)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }
}
class NoticeBoard extends GameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪：0人";

    }

    start(){
    }

    write(text){
        this.text = text;
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
    }
}
class Particle extends GameObject {
    constructor(playground, x, y, radius, color, vx, vy, speed, move_length){
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.move_length = move_length;
        this.ctx = this.playground.game_map.ctx;
        this.friction = 0.9;
        this.eps = 0.01;
    }

    start(){
    }

    update(){
        if(this.move_length < this.eps || this.speed < this.eps){
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.friction;
        this.render();
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends GameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo){
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.01;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.cur_skill = null;
        this.fireballs = [];
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.9;
        this.spent_time = 0;

        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }

        if(this.character === "me"){
            this.fireball_coldtime = 3; //3秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 5;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start(){
        this.playground.player_count ++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if(this.playground.player_count >= 3){
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if(this.character === "me"){
            this.add_listening_events();
        }
        else if (this.character === "robot"){
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e){
            if (outer.playground.state !== "fighting"){
                return true;
            }
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which === 3){
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to( tx, ty);

                if(outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_move_to(tx, ty);
                }
            }
            else if(e.which === 1){
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if(outer.cur_skill === "fireball"){
                    if(outer.fireball_coldtime > outer.eps){
                        return false;
                    }
                    let fireball = outer.shoot_fireball(tx, ty);
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uid);
                    }
                }
                else if(outer.cur_skill === "blink"){
                    if(this.blink_coldtime > outer.eps){
                        return false;
                    }
                    outer.blink(tx, ty);

                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }
                outer.cur_skill = null;

            }
        });

        this.playground.game_map.$canvas.keydown(function (e) {
            if (e.which === 13) {
                if (outer.playground.mode === "multi mode") {
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }
            else if (e.which === 27) { 
                if (outer.playground.mode === "multi mode") { 
                    outer.playground.chat_field.hide_input();
                }
            }
            if (outer.playground.state !== "fighting"){
                return true;
            }

            if(e.which === 81){
                if(outer.fireball_coldtime > outer.eps){
                    return true;
                }
                outer.cur_skill = "fireball";
                return false;
            }
            else if(e.which === 70){
                if(outer.blink_coldtime > outer.eps){
                    return true;
                }

                outer.cur_skill = "blink";
                return false;
            }
        });
    }

    is_attacked(angle, damage){
        for(let i = 0;i < 20 + Math.random() * 10;i ++){
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let speed = this.speed * 10;
            let color = this.color;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, color, vx, vy, speed, move_length);
        }
        this.radius -= damage;
        if(this.radius < this.eps){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.85;
    }

    receive_attack(x, y, angle, damage, ball_uid, attacker){
        attacker.destroy_fireball(ball_uid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    shoot_fireball(tx, ty){
        let x = this.x;
        let y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let fireball = new FireBall(this.playground, this, x, y, radius, color, speed, vx, vy, move_length, 0.01);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;
        return fireball;
    }

    blink(tx, ty){
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0;
    }

    destroy_fireball(uid){
        for (let i = 0; i < this.fireballs.length; i ++){
            let fireball = this.fireballs[i];
            if(fireball.uid === uid){
                fireball.destroy();
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(tx, ty){
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }
    update(){
        this.spent_time += this.timedelta / 1000;
        if(this.character === "me" && this.playground.state === "fighting"){
            this.update_coldtime();
        }
        this.update_move();
        this.render();
    }

    update_coldtime(){
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    update_move(){
        if(this.spent_time > 5 && Math.random() < 1 / 300.0 && this.character === "robot"){
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            this.shoot_fireball(player.x, player.y);
        }
        if(this.damage_speed > this.eps){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else{
            if(this.move_length < this.eps){
                this.move_length = 0;
                this.vx = this.vy = 0;
                if(this.character === "robot"){
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }
            else{
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render(){
        let scale = this.playground.scale;
        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        if(this.character === "me" && this.playground.state === "fighting"){
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime(){
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.03;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if(this.fireball_coldtime > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.4)";
            this.ctx.fill();
        }

        x = 1.62, y = 0.9;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if(this.blink_coldtime > 0){
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.4)";
            this.ctx.fill();
        }
    }

    on_destroy(){
        if(this.character === "me")
            this.playground.state = "over";
        for(let i = 0;i < this.playground.players.length;i ++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
            }
        }
    }
}
class FireBall extends GameObject {
    constructor(playground, player, x, y, radius, color, speed, vx, vy, move_length, damage){
        super();
        this.playground = playground;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.vx = vx;
        this.vy = vy;
        this.move_length = move_length;
        this.damage = damage;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.01;
    }

    start(){
    }

    update(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }

        this.update_move();

        if(this.player.character != "enemy"){
            this.update_attack();
        }

        this.render();
    }

    update_move(){
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack(){
        for(let i = 0; i < this.playground.players.length;i ++){
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player);
            }
        }
    }

    is_collision(obj){
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        if(distance < this.radius + obj.radius){
            return true;
        }
        else{
            return false;
        }
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        if(this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uid, player.x, player.y, angle, this.damage, this.uid);
        }

        this.destroy();
    }

    get_dist(x1, y1, x2, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy(){
        let fireballs = this.player.fireballs;
        for(let i = 0; i < fireballs.length; i ++){
            if(fireballs[i] === this){
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}
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
}class GamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="game-playground"></div>`);

        this.hide();

        this.root.$game.append(this.$playground);

        this.start();
    }

    get_random_color(){
        let colors = ["red", "pink", "green", "blue", "grey"];
        return colors[Math.floor(Math.random()*5)];
    }

    start(){
        let outer = this;
        $(window).resize(function(){
            outer.resize();
        });
    }

    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;

        if(this.game_map){
            this.game_map.resize();
        }
    }

    show(mode){
        let outer = this;
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.mode = mode;
        this.state = "waiting";
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;
        this.resize();
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "single mode"){
            for(let i = 0;i < 5;i ++){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uid = this.players[0].uid;
            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }

    }

    hide(){
        this.$playground.hide();
    }
}
class Settings {
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        if(this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class="game-settings">
<div class="game-settings-login">
            <div class="login">
                <h1>Login</h1>
                <br>
                <br>
                <div class="form">
                    <div class="game-settings-username">
                        <div class="game-settings-item">
                            <br>
                            <input type="text" placeholder="账号">
                        </div>
                    </div>

                    <div class="game-settings-password">
                        <div class="game-settings-item">
                            <br>
                            <input type="password" placeholder="密码">
                        </div>
                    </div>

                    <br>
                    <div class="game-settings-error-message"></div>

                    <div class="game-settings-submit">
                        <div class="game-settings-item">
                            <br>
                            <button>登录</button>
                        </div>
                    </div>

                    <div class="game-settings-option">
                        <div class="game-settings-item">
                            <br>
                            <button>注册</button>
                        </div>
                    </div>

                    <div class="game-settings-acwing">
                        <br>
                        <div>
                            AcWing一键登录
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="game-settings-register">
            <div class="register">

                <h1>Register</h1>
                <br>
                <br>
                <br>
                <br>
                <div class="form">
                    <div class="game-settings-username">
                        <div class="game-settings-item">
                            <br>
                            <input type="text" placeholder="账号">
                        </div>
                    </div>

                    <div class="game-settings-password-first">
                        <div class="game-settings-item">
                            <br>
                            <input type="password" placeholder="密码">
                        </div>
                    </div>

                    <div class="game-settings-password-second">
                        <div class="game-settings-item">
                            <br>
                            <input type="password" placeholder="确认密码">
                        </div>
                    </div>

                    <br>
                    <div class="game-settings-error-message"></div>

                    <div class="game-settings-submit">
                        <div class="game-settings-item">
                            <br>
                            <button>注册</button>
                        </div>
                    </div>

                    <div class="game-settings-option">
                        <div class="game-settings-item">
                            <br>
                            <button>登录</button>
                        </div>
                    </div>

                    <div class="game-settings-acwing">
                        <br>
                        <div>
                            AcWing一键登录
                        </div>
                    </div>
                </div>
            </div>
        </div>
</div>
        `);


        this.$login = this.$settings.find(".game-settings-login");
        this.$login_username = this.$login.find(".game-settings-username input");
        this.$login_password = this.$login.find(".game-settings-password input");
        this.$login_submit = this.$login.find(".game-settings-submit button");
        this.$login_error_message = this.$login.find(".game-settings-error-message");
        this.$login_register = this.$login.find(".game-settings-option button");
        this.$login.hide();

        this.$register = this.$settings.find(".game-settings-register");
        this.$register_username = this.$register.find(".game-settings-username input");
        this.$register_password = this.$register.find(".game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".game-settings-password-second input");
        this.$register_submit = this.$register.find(".game-settings-submit button");
        this.$register_error_message = this.$register.find(".game-settings-error-message");
        this.$register_login = this.$register.find(".game-settings-option button");
        this.$register.hide();
        this.$acwing_login = this.$settings.find('.game-settings-acwing');

        this.root.$game.append(this.$settings);
        this.start();



//获取 login
let login = document.querySelector('.login')

let span
let inTime, outTime
let isIn = true //默认开关 打开
let isOut

//鼠标进入事件
login.addEventListener('mouseenter', function (e) {
    isOut = false //预先关闭，若不进入if语句，则不能进入鼠标离开事件里的 if
    if (isIn) {
        inTime = new Date().getTime()

        //生成 span 元素并添加进 login 的末尾
        span = document.createElement('span')
        login.appendChild(span)

        //span 去使用 in动画
        span.style.animation = 'in .5s ease-out forwards'

        //计算 top 和 left 值，跟踪鼠标位置
        let top = e.clientY - e.target.offsetTop
        let left = e.clientX - e.target.offsetLeft

        span.style.top = top + 'px'
        span.style.left = left + 'px'

        isIn = false //当我们执行完程序后，关闭
        isOut = true //当我们执行完里面的程序，再打开
    }

})
//鼠标离开事件
login.addEventListener('mouseleave', function (e) {
    if (isOut) {
        outTime = new Date().getTime()
        let passTime = outTime - inTime

        if (passTime < 500) {
            setTimeout(mouseleave, 500 - passTime) //已经经过的时间就不要了
        }
        else {
            mouseleave()
        }
    }

    function mouseleave() {
        span.style.animation = 'out .5s ease-out forwards'

        //计算 top 和 left 值，跟踪鼠标位置
        let top = e.clientY - e.target.offsetTop
        let left = e.clientX - e.target.offsetLeft

        span.style.top = top + 'px'
        span.style.left = left + 'px'

        //注意：因为要等到动画结束，所以要给个定时器
        setTimeout(function () {
            login.removeChild(span)
            isIn = true //当我们执行完鼠标离开事件里的程序，才再次打开
        }, 500)
    }
})




//获取 login
let register = document.querySelector('.register')

let spans
let inTimes, outTimes
let isIns = true //默认开关 打开
let isOuts

//鼠标进入事件
register.addEventListener('mouseenter', function (e) {
    isOuts = false //预先关闭，若不进入if语句，则不能进入鼠标离开事件里的 if
    if (isIns) {
        inTimes = new Date().getTime()

        //生成 spans 元素并添加进 login 的末尾
        spans = document.createElement('span')
        register.appendChild(spans)

        //spans 去使用 in动画
        spans.style.animation = 'in .5s ease-out forwards'

        //计算 top 和 left 值，跟踪鼠标位置
        let top = e.clientY - e.target.offsetTop
        let left = e.clientX - e.target.offsetLeft

        spans.style.top = top + 'px'
        spans.style.left = left + 'px'

        isIns = false //当我们执行完程序后，关闭
        isOuts = true //当我们执行完里面的程序，再打开
    }

})
//鼠标离开事件
register.addEventListener('mouseleave', function (e) {
    if (isOuts) {
        outTimes = new Date().getTime()
        let passTime = outTimes - inTimes

        if (passTime < 500) {
            setTimeout(mouseleave, 500 - passTime) //已经经过的时间就不要了
        }
        else {
            mouseleave()
        }
    }

    function mouseleave() {
        spans.style.animation = 'out .5s ease-out forwards'

        //计算 top 和 left 值，跟踪鼠标位置
        let top = e.clientY - e.target.offsetTop
        let left = e.clientX - e.target.offsetLeft

        spans.style.top = top + 'px'
        spans.style.left = left + 'px'

        //注意：因为要等到动画结束，所以要给个定时器
        setTimeout(function () {
            register.removeChild(spans)
            isIns = true //当我们执行完鼠标离开事件里的程序，才再次打开
        }, 500)
    }
})


    }

    start(){
        if(this.platform === "ACAPP"){
            this.getinfo_acapp();
        }
        else{
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events(){
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$acwing_login.click(function(){
            outer.acwing_login();
        });
    }

    add_listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
        this.$login_submit.click(function(){
            outer.login_remote();
        });
    }

    add_listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });
        this.$register_submit.click(function(){
            outer.register_remote();
        });
    }

    acwing_login(){
        $.ajax({
            url:"https://app2761.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type:"GET",
            success:function(resp){
                if(resp.result === "success"){
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    login(){
        this.$register.hide();
        this.$login.show();
    }

    register(){
        this.$login.hide();
        this.$register.show();
    }

    login_remote(){
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "https://app2761.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data:{
                username: username,
                password: password,
            },
            success:function(resp){
                if(resp.result === "success"){
                    location.reload();
                }
                else{
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    register_remote(){
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url:"https://app2761.acapp.acwing.com.cn/settings/register",
            type:"GET",
            data:{
                username:username,
                password:password,
                password_confirm:password_confirm,
            },
            success:function(resp){
                if(resp.result === "success"){
                    location.reload();
                }
                else{
                    outer.$register_error_message.html(resp.result);
                }
            },
        });
    }

logout_remote(){
    if(this.platform === "ACAPP"){
        this.root.AcWingOS.api.window.close();
    }
    else{
        $.ajax({
            url:"https://app2761.acapp.acwing.com.cn/settings/logout/",
            type:"GET",
            success: function(resp){
                if(resp.result === "success"){
                    location.reload();
                }
            }
        });
    }
}

getinfo_web(){
    let outer = this;
    $.ajax({
        url: "https://app2761.acapp.acwing.com.cn/settings/getinfo/",
        type: "GET",
        data:{
            platform: outer.platform,
        },
        success: function(resp){
            if(resp.result === "success"){
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
            else{
                outer.login();
            }
        }
    });
}

getinfo_acapp(){
    let outer = this;
    $.ajax({
        url:"https://app2761.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
        type:"GET",
        success:function(resp){
            if(resp.result === "success"){
                outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
            }
        },
    });
}

acapp_login(appid, redirect_uri, scope, state){
    let outer = this;
    this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp){
        if(resp.result === "success"){
            outer.username = resp.username;
            outer.photo = resp.photo;
            outer.hide();
            outer.root.menu.show();
        }
    });
}


hide(){
    this.$settings.hide();
}

show(){
    this.$settings.show();
}
}
export class Game{
    constructor(id, AcWingOS){
        this.id = id;
        this.$game = $('#' + id);
        this.AcWingOS = AcWingOS;
        this.settings = new Settings(this);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }

    start(){

    }
}
