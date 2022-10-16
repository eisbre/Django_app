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
class GameMap extends GameObject {
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start(){
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
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.friction = 0.9;
        this.spent_time = 0;

        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start(){
        if(this.character === "me"){
            this.add_listening_events();
        }
        else{
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
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if(e.which === 3){
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
            }
            else if(e.which === 1){
                if(outer.cur_skill === "fireball"){
                    outer.shoot_fireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e){
            if(e.which === 81){
                outer.cur_skill = "fireball";
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
        new FireBall(this.playground, this, x, y, radius, color, speed, vx, vy, move_length, 0.01);
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
        this.update_move();
        this.render();
    }

    update_move(){
        this.spent_time += this.timedelta / 1000;
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
    }

    on_destroy(){
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

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for(let i = 0; i < this.playground.players.length;i ++){
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)){
                this.attack(player);
            }
        }

        this.render();
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
}
class GamePlayground{
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
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.resize();
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if(mode === "single mode"){
            for(let i = 0;i < 5;i ++){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        else if(mode === "multi mode"){
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
                console.log(resp);
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
        if(this.platform === "ACAPP")
            return false;
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
