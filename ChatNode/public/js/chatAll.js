$(document).ready(function() {
    $("#loginForm").show();
    $("#chatForm").hide();
    $("#chatFriend").hide();
    $("#formChatRoom").hide();

    $("#txtMessage").focusin(function() {
        socket.emit("toi-dang-go-chu");
    })

    $("#txtMessage").focusout(function() {
        socket.emit("toi-stop-go-chu");
    })

    $("#btnRegister").click(function() {
        $name = $("#txtUsername").val();
        if ($name) {
            socket.emit("client-send-Username", $("#txtUsername").val());
            // $("#txtUsername").val("");
        }
    });

    $("#btnLogout").click(function() {
        socket.emit("logout");
        $("#chatForm").hide();
        $("#chatRoom").show();
        $("#registerRoom").show();
        $("#loginForm").show();
    });

    $("#btnSendMessage").click(function() {
        socket.emit("user-send-message", $("#txtMessage").val());
    });
});

// var socket = io.connect('http://localhost:3000', {
//     reconnection: true,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     reconnectionAttempts: Infinity
// });

//-----SERVER => CLIENT------//

var socket = io("http://localhost:3000");

socket.on("server-send-dki-thatbai", function() {
    alert("Lỗi! Username đã tồn tại.");
});

//get list all User from Server
socket.on("server-send-danhsach-Users", function(data) {
    $("#boxContent").html("");
    data.forEach(function(item) {
        if(item.status) {
            $("#boxContent").append(
                "<div class='username' data-name='" + item.ID + "'>" + item.UserName +
                "<button id='btnAddGroup' class ='btnGroup'>Add Group</button></div>"
            );
        }
    });
});

//show Box chat all user
socket.on("server-send-dki-thanhcong", function(data) {
    $('#currentUserID').val(data.ID);
    $("#currentUser").html(data.UserName);
    console.log($('#currentUser'));
    $("#loginForm").hide();
    $("#chatForm").show();
});

//get messages from all User
socket.on("server-send-mesage", function(data) {
    if(data.un == $('#currentUser').text()) {
        $("#listMessages").append(
            "<div class='ms' align='right'>" +
            "<strong>" + data.un + "</strong> :" +
            data.nd + "</div>"
        );
    } else {
        $("#listMessages").append(
            "<div class='ms' align='left'>" +
            "<strong>" + data.un + "</strong> :" +
            data.nd + "</div>"
        );
    }
   
    $("#txtMessage").val("");
});

socket.on("ai-do-dang-go-chu", function(data) {
    $("#thongbao").html("<img width='20px' src='img/typing05.gif'> " + data);
});

socket.on("ai-do-STOP-go-chu", function() {
    $("#thongbao").html("");
});