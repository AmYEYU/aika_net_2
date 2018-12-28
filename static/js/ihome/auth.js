function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$(document).ready(function() {
    $("#form-auth").submit(function(e){
        e.preventDefault();
        var real_name = $('#real-name').val();
        var id_card = $('#id-card').val();
        $.ajax({
            url: '/user/my_auth/',
            data: {'real_name':real_name, 'id_card':id_card},
            type: 'POST',
            dataType: 'json',
            success: function(data){
                if (data.code==1000){
                    alert(data.msg);
                }
                if (data.code==1001){
                    alert(data.msg);
                }
                if (data.code==200){
                    alert(data.msg);
                    location.href = "/user/my/";
                }
            },
            error: function(data){
                alert('请求失败！');
            }
        });
    })

})
