$(document).ready(function() {
    //create a new WebSocket object.
    var wsUri = "ws://localhost:9000/demo/server.php";
    websocket = new WebSocket(wsUri);

    // connection is open 
    websocket.onopen = function(ev) {
            //notify user
            $('#message_box').append("<div class=\"system_msg\">Connected!</div>");
        }
        //use clicks message send button
    $('#send-btn').click(function() {
        var mymessage = $('#message').val();
        var myname = $('#name').val();

        //empty name?
        if (myname == "") {
            alert("Enter your Name please!");
            return;
        }
        //emtpy message?
        if (mymessage == "") {
            alert("Enter Some message Please!");
            return;
        }
        document.getElementById("name").style.visibility = "hidden";

        var objDiv = document.getElementById("message_box");
        objDiv.scrollTop = objDiv.scrollHeight;
        //prepare json data
        var msg = {
            message: mymessage,
            name: myname,
            color: '<?php echo $colours[$user_colour]; ?>'
        };
        //convert and send data to server
        websocket.send(JSON.stringify(msg));
    });

    //#### Message received from server?
    websocket.onmessage = function(ev) {
        //PHP sends Json data
        var msg = JSON.parse(ev.data);
        //message type
        var type = msg.type;
        //message text
        var umsg = msg.message;
        //user name
        var uname = msg.name;
        //color
        var ucolor = msg.color;

        if (type == 'usermsg') {
            $('#message_box').append(
                "<div><span class=\"user_name\" style=\"color:#" +
                ucolor + "\">" + uname + "</span> : <span class = \"user_message\">" + umsg + "</span></div>"
            );
        }
        if (type == 'system') {
            $('#message_box').append("<div class=\"system_msg\">" + umsg + "</div>");
        }

        $('#message').val(''); //reset text

        var objDiv = document.getElementById("message_box");
        objDiv.scrollTop = objDiv.scrollHeight;
    };

    websocket.onerror = function(ev) {
        $('#message_box').append(
            "<div class=\"system_error\">Error Occurred - " + ev.data + "</div>"
        );
    };
    websocket.onclose = function(ev) {
        $('#message_box').append(
            "<div class=\"system_msg\">Connection Closed</div>"
        );
    };
});