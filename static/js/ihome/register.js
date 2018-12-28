function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

var imageCodeId = "";

function generateUUID() {
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function generateImageCode() {
    $.ajax({
        url: '/user/security_code/',
        type: 'GET',
        dataType: 'json',
        success: function(data){
            console.log(data)
            if (data.code==200){
                $('.image-code').text(data.security_code);
            }
        },
        error: function(data){
            alert('请求验证码失败！');
        }
    })
}


$(document).ready(function() {
    generateImageCode();
    $("#mobile").focus(function(){
        $("#mobile-err").hide();
    });
    $("#imagecode").focus(function(){
        $("#image-code-err").hide();
    });
    $("#phonecode").focus(function(){
        $("#phone-code-err").hide();
    });
    $("#password").focus(function(){
        $("#password-err").hide();
        $("#password2-err").hide();
    });
    $("#password2").focus(function(){
        $("#password2-err").hide();
    });
    $(".form-register").submit(function(e){
        e.preventDefault();
        mobile = $("#mobile").val();
        passwd = $("#password").val();
        passwd2 = $("#password2").val();
        imagecode = $("#imagecode").val();

        if (!mobile) {
            $("#mobile-err span").html("请填写正确的手机号！");
            $("#mobile-err").show();
            return;
        }
        if (!passwd) {
            $("#password-err span").html("请填写密码!");
            $("#password-err").show();
            return;
        }
        if (passwd != passwd2) {
            $("#password2-err span").html("两次密码不一致!");
            $("#password2-err").show();
            return;
        }

        $.ajax({
            url: '/user/my_register/',
            type: 'POST',
            data: {'mobile':mobile, 'passwd':passwd, 'imagecode':imagecode},
            dataType: 'json',
            success: function(data){
                if (data.code==200){
                    location.href = "/user/login/";
                }
                if (data.code==500){
                    alert(data.msg);
                }
                if (data.code==502){
                    alert(data.msg);
                }
            },
            error: function(data){
                alert('请求失败！');
            }
        })
    });
})
