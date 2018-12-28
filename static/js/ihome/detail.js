function hrefBack() {
    history.go(-1);
}

function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

$(document).ready(function(){

    $(".book-house").show();
    var house_id = $('#hidden').val();
    console.log(house_id)
    $.ajax({
        url: '/user/detail_info/',
        type: 'POST',
        dataType: 'json',
        data: {'house_id': house_id },
        success: function(data){
            if (data.code==200){
                for(i in data.info.images ){
                    $('.swiper-wrapper').append($('<li>').attr('class', 'swiper-slide').append($('<img>').attr('src','/static/media/'+data.info.images[i])));
                }
                var mySwiper = new Swiper ('.swiper-container', {
                    loop: true,
                    autoplay: 2000,
                    autoplayDisableOnInteraction: false,
                    pagination: '.swiper-pagination',
                    paginationType: 'fraction'
                });
                $('.house-price span').text(data.info.price);
                $('.house-title').text(data.info.title);
                $('.landlord-name span').text(data.info.user_name);
                $('.landlord-pic').append($('<img>').attr('src','/static/media/'+data.info.user_avatar));
                $('.house-info .house-info-list li:first').text(data.info.address);
                $('.house-type .icon-text h3 span').text(data.info.room_count);
                $('.house-type .icon-text p span:first').text(data.info.acreage);
                $('.house-type .icon-text p span:last').text(data.info.unit);
                $('#people span').text(data.info.capacity);
                $('#beds').text(data.info.beds);
                $('#room-info li span:first').text(data.info.deposit);
                $('#min-day span').text(data.info.min_days);
                if (data.info.max_days==0){
                    $('#room-info li span:last').text('无限制');
                }else{
                    $('#room-info li span:last').text(data.info.max_days);
                }
                for(index in data.info.facilities){
                    $('.house-facility-list').append($('<li>').append($('<span>').attr('class',data.info.facilities[index]['css'])).append($('<span>').text(data.info.facilities[index]['name'])));
                }

            }
        },
        error: function(data){
            alert('请求数据失败！')
        }
    })
})