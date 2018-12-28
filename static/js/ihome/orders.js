
//模态框居中的控制
function centerModals(){
    $('.modal').each(function(i){   //遍历每一个模态框
        var $clone = $(this).clone().css('display', 'block').appendTo('body');
        var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
        top = top > 0 ? top : 0;
        $clone.remove();
        $(this).find('.modal-content').css("margin-top", top-30);  //修正原先已经有的30个像素
    });
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

// 提交评价信息
function comment_order(){
    var comment = $('.form-control').val();
    var order_id = $(".modal-comment").attr("order-id");
    if (comment){
        $.get('/user/comment/', {'comment':comment, 'order_id':order_id}, function(data){
            if (data.code==200){
                location.reload();
            }
        })
    }else{
        alert('评论信息不能为空！');
    }
}


$(document).ready(function(){
    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);

    $.ajax({
        url: '/user/orders_ajax/',
        type: 'GET',
        dataType: 'json',
        success: function(data){
            if(data.code==200){
                if (data.order_info){
                    for(var i=0 ; i<data.order_info.length; i+=1){
                        if (data.order_info[i]['comment']){
                            $('.orders-list').append(
                                $('<li>').append(
                                    $('<div>').attr('class','order-title').append($('<h3>').text('订单编号：'+data.order_info[i]['order_id']))
                                ).append(
                                    $('<div>').attr('class', 'order-content').append($('<img>').attr('src','/static/media/'+data.order_info[i]['image'])).append($('<div>').attr('class','order-text').append(
                                        $('<h3>').text('标题：'+data.order_info[i]['house_title']).append(
                                            $('<ul>').append($('<li>').text('创建时间：'+data.order_info[i]['create_date'])).append($('<li>').text('入住日期：'+data.order_info[i]['begin_date'])).append($('<li>').text('离开日期：'+data.order_info[i]['end_date'])).append($('<li>').text('合计金额：￥'+data.order_info[i]['amount']+'(共'+data.order_info[i]['days']+'晚)')).append($('<li>').text('订单状态：'+data.order_info[i]['status'])).append($('<li>').text('我的评价：'+data.order_info[i]['comment'])).append($('<li>').text('拒单原因：'+data.order_info[i]['reject_reason']))
                                        )
                                    ))
                                )
                            );
                        }else{
                            $('.orders-list').append(
                                $('<li>').append(
                                    $('<div>').attr('class','order-title').append($('<h3>').text('订单编号：'+data.order_info[i]['order_id'])).append($('<div>').append($('<button>').attr('type','button').attr('class','btn btn-success order-comment').attr('data-toggle','modal').attr('data-target','#comment-modal').text('发表评价')).attr('class', 'fr order-operate'))
                                ).append(
                                    $('<div>').attr('class', 'order-content').append($('<img>').attr('src','/static/media/'+data.order_info[i]['image'])).append($('<div>').attr('class','order-text').append(
                                        $('<h3>').text('标题：'+data.order_info[i]['house_title']).append(
                                            $('<ul>').append($('<li>').text('创建时间：'+data.order_info[i]['create_date'])).append($('<li>').text('入住日期：'+data.order_info[i]['begin_date'])).append($('<li>').text('离开日期：'+data.order_info[i]['end_date'])).append($('<li>').text('合计金额：￥'+data.order_info[i]['amount']+'(共'+data.order_info[i]['days']+'晚)')).append($('<li>').text('订单状态：'+data.order_info[i]['status'])).append($('<li>').text('我的评价：'+data.order_info[i]['comment'])).append($('<li>').text('拒单原因：'+data.order_info[i]['reject_reason']))
                                        )
                                    ))
                                )
                            );
                        }
                    }
                }else{
                    $('.orders-list').append($('<p>').text('⊙_⊙ 您还没有任何订单哦，赶快去下单把。'))
                }
                // 点击按钮拿到order_id
                $(".order-comment").on("click", function(){
                    var orderId = $(this).parent().prev().text().slice(5);
                    $(".modal-comment").attr("order-id", orderId);
                });
            }
        },
        error: function(){
            alert('请求数据失败！')
        }
    })

});