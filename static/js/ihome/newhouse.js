function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
    $("#form-house-info").submit(function(e){
        e.preventDefault();
        var house_title = $('#house-title').val();
        var house_price = $('#house-price').val();
        var area_id = $('#area-id').val();
        var house_address = $('#house-address').val();
        var house_room_count = $('#house-room-count').val();
        var house_acreage = $('#house-acreage').val();
        var house_unit = $('#house-unit').val();
        var house_capacity = $('#house-capacity').val();
        var house_beds = $('#house-beds').val();
        var house_deposit = $('#house-deposit').val();
        var house_min_days = $('#house-min-days').val();
        var house_max_days = $('#house-max-days').val();
        var checkbox_list = [];
        $('input[name="facility"]:checked').each(function(){
            checkbox_list.push($(this).val());
        });
        $.ajax({
            url: '/user/my_newhouse/',
            type: 'POST',
            dataType: 'json',
            data: {
                'house_title':house_title,
                'house_price':house_price,
                'area_id':area_id,
                'house_address':house_address,
                'house_room_count':house_room_count,
                'house_acreage':house_acreage,
                'house_unit':house_unit,
                'house_capacity':house_capacity,
                'house_beds':house_beds,
                'house_deposit':house_deposit,
                'house_min_days':house_min_days,
                'house_max_days':house_max_days,
                'checkbox_list': checkbox_list,
            },
            success: function(data){
                $('#form-house-info').hide();
                $('#form-house-image').show();
                $('#house-id').val(data.house_id);
            },
            error: function(data){
                alert('请求失败！');
            }

        })

    })
    $("#form-house-image").submit(function(e){
        e.preventDefault();
        var house_id = $('#house-id').val();
        $(this).ajaxSubmit({
            url: '/user/house_img/',
            type: 'POST',
            dataType: 'json',
            data: {'houseZ_id': house_id},
            success: function(data){
                if (data.code==200){
                    var img = $('#house-image').val();
                    $('.house-image-cons').append($('<img>').attr('src','/static/media/'+data.path));
                }
            },
            error: function(data){
                alert('请求失败！')
            }
        })
    })
})

