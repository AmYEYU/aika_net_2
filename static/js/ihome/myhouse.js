$(document).ready(function(){
    $('.auth-warn').show();
    $.get('/user/myhouse_ajax/', function(data){
        if (data.code==200){
            for (house in data.list_house){
                $('#houses-list').append($('<li>').append($('<a>').attr('href',"/user/detail/?house_id="+data.list_house[house][0]).append($('<div>').attr('class','house-title').append($('<h3>').text('房屋ID: '+data.list_house[house][0]+' —— 房屋标题: '+data.list_house[house][1]))).append($('<div>').attr('class','house-content').append($('<img>').attr('src','/static/media/'+data.list_house[house][5])).append($('<div>').attr('class','house-text').append($('<ul>').append($('<li>').text('位于:'+data.list_house[house][2])).append($('<li>').text('价格：￥'+data.list_house[house][3]+'/晚')).append($('<li>').text('发布时间：'+data.list_house[house][4])))))));
            }
        }
    }, 'json')

})