$(document).ready(function() {
    // chat friend
    $("#boxContent").on('dblclick', '.username:not("#btnAddGroup")', function() {
        var row = $(this).closest("div");
        $name = row.data("name");
        socket.emit("username-friend", $name);
    });

    //send message to Server
    $("#btnFriend").click(function() {
        var message = $('#txtFriend').val();
        var chatBox = $(this).closest('#chatFriend');
        var friendName = chatBox.find('#nameFriend').text();
        if(message !== '') {
            socket.emit("send-message-friend", {
                message: message,
                userID: $("#txtID").val(),
                senderName: $('#currentUser').text(),
                receiverName: friendName,
                sender: $('#currentUserID').val()
            });
        }
    });

    $("#txtFriend").focusin(function() {
        socket.emit("user-dang-go-chu", $("#txtID").val());
    })

    $("#txtFriend").focusout(function() {
        socket.emit("user-stop-go-chu", $("#txtID").val());
    })

    $(".btnClose").click(function() {
        $("#chatFriend").hide(300);
    })

    //show button add group
    $("#boxContent").on('mouseover', '.username', function() {
        //$nameGroup = $(".myRoom-Name").attr("data-name");
        if ($('input[name=rdRadio]').is(":checked")) {
            $(this).find('button').show();
        }
    });
    //hide button add group
    $("#boxContent").on('mouseout', '.username', function() {
        $(this).find('button').hide();
    });
});

//////////////////////////////////
//-------SERVER => CLIENT-------//

//show box chat friend
socket.on("server-send-username-friend", function(data) {
    $("#nameFriend").html(data.UserName);
    $("#txtID").val(data.ID);
    $("#msgFriend").html("");
    $("#chatFriend").show();

    // var chatBox = '<div id="chatFriend">' +
    //     '<div id="headerFriend">' +
    //     '<div id="nameFriend">Friend</div>' +
    //     '<div class="btnClose">' +
    //     '<img src="img/iconClose.png" alt="Close" width="15px" height="15px" title="Close">' +
    //     '</div>' +
    //     ' </div>' +
    //     '<div id="msgFriend"></div>' +
    //     '<div id="alertFriend"></div>' +
    //     '<div class="send">' +
    //     '<input type="hidden" id="txtID" />' +
    //     '<input type="text" id="txtFriend" onkeydown="if (event.keyCode == 13) $("#btnFriend").click()" />' +
    //     '<input type="button" id="btnFriend" value="Send" />' +
    //     '</div>' +
    //     '</div>';
    //$("#chatbox").append(chatBox);

});

//Get message from Server
socket.on("sever-send-msg-friend", function(data) {
    $("#nameFriend").html(data.un);
    $('#txtID').val(data.sender);
    $("#chatFriend").show(300);
    $('.ms').hide();
    console.log($('.ms'));
    $("#msgFriend").append(
        "<div class='ms' room="+data.senderName+"to"+data.receiverName+">" +
        "<strong> " + data.un + " </strong> :" +
        data.nd + "</div>"
    );
    $('[room='+data.senderName+'to'+data.receiverName+']').show();
    $('[room='+data.receiverName+'to'+data.senderName+']').show();
    if(data.senderName == $('#currentUser').text()) {
        $('[room='+data.receiverName+'to'+data.senderName+']').attr('align','left');
        $('[room='+data.senderName+'to'+data.receiverName+']').attr('align','right');
    } else {
        $('[room='+data.receiverName+'to'+data.senderName+']').attr('align','right');
        $('[room='+data.senderName+'to'+data.receiverName+']').attr('align','left');
    }
});

//show again message in Box chat friend
socket.on("server-send-msg-thanhcong", function(data) {
    $('.ms').hide();
    $("#msgFriend").append(
        "<div class='ms' room="+data.senderName+"to"+data.receiverName+">" +
        "<strong> " + data.un + " </strong> :" +
        data.nd + "</div>"
    );
    $("#txtFriend").val("");
    $('[room='+data.senderName+'to'+data.receiverName+']').show();
    $('[room='+data.receiverName+'to'+data.senderName+']').show();
    if(data.senderName == $('#currentUser').text()) {
        $('[room='+data.receiverName+'to'+data.senderName+']').attr('align','left');
        $('[room='+data.senderName+'to'+data.receiverName+']').attr('align','right');
    } else {
        $('[room='+data.receiverName+'to'+data.senderName+']').attr('align','right');
        $('[room='+data.senderName+'to'+data.receiverName+']').attr('align','left');
    }
});

socket.on("sever-send-dang-go-chu", function(data) {
    $("#alertFriend").html("<img width='20px' src='img/typing05.gif'> " + data);
});

socket.on("server-send-STOP-go-chu", function() {
    $("#alertFriend").html("");
});