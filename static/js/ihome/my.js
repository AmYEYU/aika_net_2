function logout() {
    $.get("/user/logout", function(data){
        if (200 == data.code) {
            alert(data.msg)
            location.href = "/user/login/";
        }
    })
}



