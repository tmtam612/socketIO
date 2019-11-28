$(document).ready(function() {
    $("#loginForm").show();
    $("#chatForm").hide();
    $("#chatFriend").hide();
    $("#formChatRoom").hide();

    var userName = $("#userName").val();
    var userId = $("#userId").val();
    var auctionId = $("#auctionId").val();
    var startBid = $("#startBid").val();
    var bidAmount = $("#bidAmount").val();
    var timeStart = $("#timeStart").val();
    var timeEnd = $("#timeEnd").val();
    console.log(auctionId);

    
    var socket = io("http://localhost:3000");
    socket.emit("client-send-Username", userId);
    socket.on("server-send-dki-thatbai", function() {
        alert("Lỗi! Username đã tồn tại.");
    });
    socket.emit("client-send-RoomName", {
        auctionId: auctionId,
        userId: userId,
        startBid: startBid,
        bidAmount: bidAmount,
        timeStart: timeStart,
        timeEnd: timeEnd,
    });
    $("#loginForm").hide();
    $("#chatForm").show();
    // $("#btnLogout").click(function() {
    //     socket.emit("logout");
    //     $("#chatForm").hide();
    //     $("#chatRoom").show();
    //     $("#registerRoom").show();
    //     $("#loginForm").show();
    // });

    $("#btnSendMessage").click(function() {
        console.log('1');
        socket.emit("user-chat", {
            myRoom : auctionId,
            currentValue: $("#txtMessage").val(),
            userId: userId
        });
    });
    $("#btnSendMessageRoom").click(function(e) {
        $name = $("#nameRoom").attr("data-name");
        socket.emit("user-chat", {
            myRoom: $name,
            currentValue: $("#txtMessageRoom").val()
        })
    });
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



    //Get message
    socket.on("server-chat", function(data) {
        $("#nameRoom").attr("data-name", data.nameRoom);
        $("#nameRoom").html(data.nameRoom);
        $("#formChatRoom").show(300);
        $("#oldValue").val(data.nd);
        if(data.un == $('#currentUser').text()) {
            $("#listMessagesRoom").append(
                "<div class='ndChat' align='right'>" +
                "<strong> " + data.un + " </strong> :" +
                data.nd + "</div>"
            );
        }  else {
            $("#listMessagesRoom").append(
                "<div class='ndChat' align='left'>" +
                "<strong> " + data.un + " </strong> :" +
                data.nd + "</div>"
            );
        }
        
        $("#txtMessageRoom").val("");
    });

    //Get message joined room from Server
    socket.on("server-send-user-join-Room", function(data) {
        $("#nameRoom").attr("data-name", data.nameRoom);
        $("#nameRoom").html(data.nameRoom);
        $("#formChatRoom").show(300);
        //var datetime = dateFormat(new Date(), "mm/dd/yy, h:MM:ss TT");
        var d = new Date();
        var datetime = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear() + " " +
            d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        $("#listMessagesRoom").append(
            "<div class='ndChat' style='font-size:10px;'>" +
            "<strong> " + data.name + " </strong><span style='color:gray;'> joined room  " +
            "<span class='time'>" + datetime + "</span></span></div>"
        );
    });
    //Show lit Room

    //Get message leave room from Server
    socket.on("server-send-user-leave-Room", function(data) {
        $("#nameRoom").attr("data-name", data.nameRoom);
        $("#nameRoom").html(data.nameRoom);
        $("#formChatRoom").show(300);
        var d = new Date();
        var datetime = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear() + " " +
            d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        $("#listMessagesRoom").append(
            "<div class='ndChat' style='font-size:10px;'>" +
            "<strong> " + data.name + " </strong><span style='color:gray;'> left room  " +
            "<span class='time'>" + datetime + "</span></div>"
        );
    });

    //Clients get name AddGroup from Server and Join user in this Room
    socket.on("Server-send-addGroup", function(data) {
        socket.emit("client-send-RoomName", data);
    });

    //Get list User in Room
    socket.on("server-send-lstUser-Room", function(data) {
        $("#lstUser-Room").html("");
        data.map(function(r) {
            $("#lstUser-Room").append("<div class='room' data-name='" + r + "'>" + r + "</div>");
        });
    });
    socket.on("error-value", function() {
        alert("số tiền lỗi");
    });
    $("#chatRoom").show();

    //Create room
    $("#btnCreate").click(function() {
        var nameRoom = $("#txtRoom").val();
        if (nameRoom) {
            socket.emit("client-send-RoomName", nameRoom);
            $("#txtRoom").val("");
            $("#listMessagesRoom").html("");
        }
    });

    //Double click Show box chat room
    $("#myRoom").on('dblclick', '.myRoom-Name', function() {
        var row = $(this).closest("div");
        $name = row.data("name");
        $("#nameRoom").html($name);
        $("#nameRoom").attr("data-name", $name);
        $("#listMessagesRoom").html("");
        $("#formChatRoom").show();
    });

    //Leave room and close box chat room    
    $("#btnLeaveRoom").click(function() {
        //get name room 
        $name = $("#nameRoom").attr("data-name");
        socket.emit("leave-room", $name);
        //close Box chat room
        $("#formChatRoom").hide(300);
        //remove ROOM in list my room
        $(".myRoom-Name[data-name=" + $name + "]").remove();
    });

    //Close Box chat Room
    $("#headerRoom").dblclick(function() {
        $("#formChatRoom").hide(300);
    });

    //Get name room click radio to Add room
    $("#myRoomName").on('click', '.myRoom-Name', function() {
        $(this).find('input').prop('checked', true)
        $name = $("input[name='rdRadio']:checked").val();
        $("#myRoomName").attr("data-name", $name);
    });

    //Event click button Add group, send $id,$nameGroup to Server 
    $("#boxContent").on('click', '#btnAddGroup', function() {
        //get id list User
        var row = $(this).closest("div");
        $id = row.data("name");
        //get name room in my room to Add room
        $nameGroup = $("#myRoomName").attr("data-name");
        if ($nameGroup) {
            socket.emit("Add-group", {
                idUser: $id,
                nameGroup: $nameGroup
            });
        }
    });
    //show list user in room
    $("#headerRoom").mouseover(function() {
        $name = $("#nameRoom").attr("data-name");
        socket.emit("send-list-us-Room", $name);
        $("#boxUser").show();
    });
    $("#headerRoom").mouseout(function() {
        $("#boxUser").hide();
    });
});

// var socket = io.connect('http://localhost:3000', {
//     reconnection: true,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     reconnectionAttempts: Infinity
// });

//-----SERVER => CLIENT------//

// var socket = io("http://localhost:3000");

// socket.on("server-send-dki-thatbai", function() {
//     alert("Lỗi! Username đã tồn tại.");
// });

//get list all User from Server
