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

function setStartDate() {
    var startDate = $("#start-date-input").val();
    if (startDate) {
        $(".search-btn").attr("start-date", startDate);
        $("#start-date-btn").html(startDate);
        $("#end-date").datepicker("destroy");
        $("#end-date-btn").html("离开日期");
        $("#end-date-input").val("");
        $(".search-btn").attr("end-date", "");
        $("#end-date").datepicker({
            language: "zh-CN",
            keyboardNavigation: false,
            startDate: startDate,
            format: "yyyy-mm-dd"
        });
        $("#end-date").on("changeDate", function() {
            $("#end-date-input").val(
                $(this).datepicker("getFormattedDate")
            );
        });
        $(".end-date").show();
    }
    $("#start-date-modal").modal("hide");
}

function setEndDate() {
    var endDate = $("#end-date-input").val();
    if (endDate) {
        $(".search-btn").attr("end-date", endDate);
        $("#end-date-btn").html(endDate);
    }
    $("#end-date-modal").modal("hide");
}




// 搜索按钮功能
function goToSearchPage(th) {
    // 拼接url
    var id =  $(th).attr("area-id");
    var area_name = $(th).attr("area-name");
    var sd = $(th).attr("start-date");
    var ed = $(th).attr("end-date");
    if (!id){
        alert('请选择区域');
        location.reload();
    }else{
        if (!sd){
            alert('请选择开始日期');
            location.reload();
        }else{
            if (!ed){
                alert('请选择结束日期');
                location.reload();
            }else{
                var url = "/user/search/?";
                url += ("area_id=" + $(th).attr("area-id"));
                url += "&";
                var areaName = $(th).attr("area-name");
                if (undefined == areaName) areaName="";
                url += ("area_name=" + $(th).attr("area-name"));
                url += "&";
                url += ("sd=" + $(th).attr("start-date"));
                url += "&";
                url += ("ed=" + $(th).attr("end-date"));
                location.href = url;
            }
        }
    }

}

$(document).ready(function(){

    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);               //当窗口大小变化的时候
    $("#start-date").datepicker({
        language: "zh-CN",
        keyboardNavigation: false,
        startDate: "today",
        format: "yyyy-mm-dd"
    });
    $("#start-date").on("changeDate", function() {
        var date = $(this).datepicker("getFormattedDate");
        $("#start-date-input").val(date);
    });

    $.get('/user/index_ajax/', function(data){
        if (data.code==200){
            if (data.user_id){
                $(".top-bar>.register-login").hide();
            }else{
                $(".top-bar>.register-login").show();
            }
            // 生成图片及链接
            for (index in data.house_info){
                $('.swiper-container .swiper-wrapper').append($('<div>').attr('class', 'swiper-slide').append($('<a>').attr('href','/user/detail/?house_id='+data.house_info[index]['id']).append($('<img>').attr('src','/static/media/'+data.house_info[index]['image']) ) ).append($('<div>').attr('class','slide-title').text(data.house_info[index]['title'])));
            }
            // 生成所有区域信息
            for (index in data.area_info){
                $('.area-list').append($('<a>').attr('area-id',data.area_info[index]['id']).text(data.area_info[index]['name']));
            }
            // 滑动效果
            var mySwiper = new Swiper ('.swiper-container', {
                loop: true,
                autoplay: 2000,
                autoplayDisableOnInteraction: false,
                pagination: '.swiper-pagination',
                paginationClickable: true
            });
            // 区域效果
            $(".area-list a").click(function(e){
                $("#area-btn").html($(this).html());
                $(".search-btn").attr("area-id", $(this).attr("area-id"));
                $(".search-btn").attr("area-name", $(this).html());
                $("#area-modal").modal("hide");
            });
        }
    });
})