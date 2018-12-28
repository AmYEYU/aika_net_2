function hrefBack() {
    history.go(-1);
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

function showErrorMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$(document).ready(function(){
    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });
    var house_id = location.search.split('=')[1]
    $.ajax({
        url: '/user/booking_ajax/',
        type: 'POST',
        dataType: 'json',
        data: {'house_id':house_id},
        success: function(data){
            if (data.code==200){
                $('.house-info .house-text h3').text(data.house_info['title']);
                $('.house-info .house-text p span').text(data.house_info['price']);
                $('.house-info img').attr('src','/static/media/'+data.house_info['image']);
                if (data.max_day==0){
                    $('.select-date-header').text('入住时间范围 : ['+data.min_day +' - ∞] 天');
                }else if(data.max_day!=0){
                    $('.select-date-header').text('入住时间范围 : ['+ data.min_day + ' - '+ data.max_day+'] 天');
                }

            }
        },
        error: function(){
            alert('第N+一次凉凉！');
        }
    });
    $(".input-daterange").on("changeDate", function(){
        var startDate = $("#start-date").val();
        var endDate = $("#end-date").val();
        if (startDate && endDate && startDate > endDate) {
            showErrorMsg();
        } else {
            var sd = new Date(startDate);
            var ed = new Date(endDate);
            days = (ed - sd)/(1000*3600*24) + 1;
            var price = $(".house-text>p>span").html();
            var amount = days * parseFloat(price);
            $(".order-amount>span").html(amount.toFixed(2) + "(共"+ days +"晚)");
        }
    });
    $(".submit-form").submit(function(e){
        e.preventDefault();
        var startDate = $("#start-date").val();
        var endDate = $("#end-date").val();
        var sd = new Date(startDate);
        var ed = new Date(endDate);
        var days = (ed - sd)/(1000*3600*24) + 1;
        $.ajax({
            url: '/user/add_order/',
            data: {'startdate':startDate, 'enddate':endDate, 'house_id':house_id, 'days':days},
            dataType: 'json',
            type: 'POST',
            success: function(data){
                if(data.code==200){
                    alert(data.msg);
                    location.href = '/user/orders';
                }else if(data.code==700){
                    alert(data.msg);
                    location.reload();
                }else if(data.code==701){
                    alert(data.msg);
                    location.reload();
                }else if(data.code==702){
                    alert(data.msg);
                    location.href = '/user/myhouse';
                }
            },
            error: function(data){
                alert('请求数据失败!');
            }

        });
    })
})
