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
        //this.$acwing_login = this.$settings.find('.game-settings-acwing img');

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
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events(){
        this.add_listening_events_login();
        this.add_listening_events_register();
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
    getinfo(){
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

    hide(){
        this.$settings.hide();
    }

    show(){
        this.$settings.show();
    }
}
