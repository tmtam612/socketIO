var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

//list User connect to server
var mangUsers = [];

io.on("connection", function(socket) {
    // console.log("Co nguoi ket noi " + socket.id);

    function User($username, $id) {
        this.UserName = $username;
        this.ID = $id;
        this.status = true;
    }

    // for (r in socket.adapter.rooms) {
    //     if (r == socket.id) {
    //         socket.leave(socket.id);
    //     }
    // }
    function searchForId(userName) {
        for( var i = 0; i < mangUsers.length; i++) {
            if(mangUsers[i].UserName == userName) {
                return mangUsers[i].ID;
            }
        }
        return false;
    }
    function searchForUserName(id) {
        for( var i = 0; i < mangUsers.length; i++) {
            if(mangUsers[i].ID == id) {
                return mangUsers[i];
            }
        }
        return false;
    }
    //Create username, send list User to client
    socket.on("client-send-Username", function(data) {
        $flag = true;
        var object = {};
        var numb = -1;
        mangUsers.forEach(function(item, i) {
            if (item.UserName == data) {
                // Exits user
                numb = i;
                object = item;
                $flag = false;
                return;
            }
        });
        if(object.UserName) {
            if(object.status == true) {
                socket.emit("server-send-dki-thatbai");
            } else {
                mangUsers[numb].ID = socket.id;
                mangUsers[numb].status = true;
                socket.Username = data;
                socket.emit("server-send-dki-thanhcong", mangUsers[numb]);
                io.sockets.emit("server-send-danhsach-Users", mangUsers);
            }
        } else {
            $users = new User(data, socket.id);
            //add array list USER
            mangUsers.push($users);
            socket.Username = data;
            socket.emit("server-send-dki-thanhcong", $users);
            socket.broadcast.emit("server-send-danhsach-Users", mangUsers);
        }
        // if ($flag) {
        //     $users = new User(data, socket.id);
        //     //add array list USER
        //     mangUsers.push($users);
        //     console.log(mangUsers);
        //     socket.Username = data;
        //     socket.emit("server-send-dki-thanhcong", $users);
        //     io.sockets.emit("server-send-danhsach-Users", mangUsers);
        // } else {
        //     socket.emit("server-send-dki-thatbai");
        // }
    });

    //remove user in list User
    socket.on("logout", function() {
        for (var i = 0; i < mangUsers.length; i++) {
            if (mangUsers[i].ID === socket.id) {
                mangUsers[i].status = false;
                break;
            }
        }
        socket.broadcast.emit("server-send-danhsach-Users", mangUsers);
    });

    //send username and message to client
    socket.on("user-send-message", function(data) {
        if(socket.Username !== undefined) {
            io.sockets.emit("server-send-mesage", {
                un: socket.Username,
                nd: data
            });
        }
        
    });

    socket.on("toi-dang-go-chu", function() {
        if(socket.Username !== undefined) {
            var s = "<strong style = 'color:blue;'> " + socket.Username + " </strong> sending message...";
            socket.broadcast.emit("ai-do-dang-go-chu", s);
        }
    });

    socket.on("toi-stop-go-chu", function() {
        socket.broadcast.emit("ai-do-STOP-go-chu");
    });

    // ------CHAT FRIEND------ //
    //Check username in mangUser
    socket.on("username-friend", function(data) {
        // console.log(data);
        for (var i = 0; i < mangUsers.length; i++) {
            if (mangUsers[i].ID === data) {
                socket.emit("server-send-username-friend", mangUsers[i]);
                break;
            }
        }
    });

    //Send private message
    socket.on("send-message-friend", function(data) {
        if(socket.Username  !== undefined) {
            //Server send message to User
            var friendID = searchForId(data.receiverName);
            io.to(friendID).emit("sever-send-msg-friend", {
                un: socket.Username,
                nd: data.message,
                sender: data.sender,
                senderName: data.senderName,
                receiverName: data.receiverName
            });
         //Server send message to client 
            socket.emit("server-send-msg-thanhcong", {
                un: socket.Username,
                nd: data.message,
                sender: data.sender,
                senderName: data.senderName,
                receiverName: data.receiverName
            });
        }
    });

    socket.on("user-dang-go-chu", function(data) {
        if(socket.Username !== undefined) {
            var s = "<strong style = 'color:blue;'> " + socket.Username + " </strong> sending message...";
            io.to(data).emit("sever-send-dang-go-chu", s);
        }
    });

    socket.on("user-stop-go-chu", function(data) {
        io.to(data).emit("server-send-STOP-go-chu");
    });


    // ------ CHAT ROOM ------- //
    // socket.adapter.rooms=>list rooms
    socket.on("client-send-RoomName", function(data) {
        if(socket.Username !== undefined) {
            socket.join(data);
            socket.Room = data;
            var mang = [];
            for (name in socket.adapter.rooms) {
                var flag = true;
                for (var i = 0; i < mangUsers.length; i++) {
                    if (mangUsers[i].ID == name) {
                        flag = false;
                        break;
                    }
                }
                if (flag == true) {
                    mang.push(name);
                }
            }
            io.sockets.emit("server-send-rooms", mang);
            socket.emit("server-send-room-socket", data);
    
            //list user in Room
            var lstUser = [];
            var sioRoom = io.sockets.adapter.rooms[data];
            if (sioRoom) {
                Object.keys(sioRoom.sockets).forEach(function(socketId) {
                    for (var i = 0; i < mangUsers.length; i++) {
                        if (mangUsers[i].ID === socketId) {
                            lstUser.push(mangUsers[i].UserName);
                        }
                    }
                });
                // send list user in Room
                io.sockets.in(data).emit("server-send-lstUser-Room", lstUser);
                //Send username, nameRoom joined room
                io.sockets.in(data).emit("server-send-user-join-Room", {
                    name: socket.Username,
                    nameRoom: data
                });
            }
        }
    });

    //Add users in Group
    socket.on("Add-group", function(data) {
        var id = data.idUser;
        var name = data.nameGroup;
        io.to(id).emit("Server-send-addGroup", name);
    });

    //Server send message to client in Room
    socket.on("user-chat", function(data) {
        if(socket.Username !== undefined) {
            var myRoom = data.myRoom;
            io.sockets.in(myRoom).emit("server-chat", {
                un: socket.Username,
                nd: data.messages,
                nameRoom: myRoom
            });
        }
    });

    // Leave room
    socket.on("leave-room", function(data) {
        socket.leave(data);
        var lstRooom = [];
        // get list room, except room default of socket
        for (r in socket.adapter.rooms) {
            var flag = true;
            for (var i = 0; i < mangUsers.length; i++) {
                if (mangUsers[i].ID == r) {
                    flag = false;
                    break;
                }
            }
            if (flag == true) {
                lstRooom.push(r);
            }
        }
        io.sockets.emit("server-send-rooms", lstRooom);

        //list user in Room
        var lstUser = [];
        var sioRoom = io.sockets.adapter.rooms[data];
        if (sioRoom) {
            Object.keys(sioRoom.sockets).forEach(function(socketId) {
                for (var i = 0; i < mangUsers.length; i++) {
                    if (mangUsers[i].ID === socketId) {
                        lstUser.push(mangUsers[i].UserName);
                    }
                }
            });
            io.sockets.in(data).emit("server-send-lstUser-Room", lstUser);
            //Send username, name room left room
            io.sockets.in(data).emit("server-send-user-leave-Room", {
                name: socket.Username,
                nameRoom: data
            });
        }
    });

    //Send list user in room when user leave room, user hover in room
    socket.on("send-list-us-Room", function(data) {
        //list user in Room
        var lstUser = [];
        var sioRoom = io.sockets.adapter.rooms[data];
        if (sioRoom) {
            Object.keys(sioRoom.sockets).forEach(function(socketId) {
                for (var i = 0; i < mangUsers.length; i++) {
                    if (mangUsers[i].ID === socketId) {
                        lstUser.push(mangUsers[i].UserName);
                    }
                }
            });
            // send list user in Room
            io.sockets.in(data).emit("server-send-lstUser-Room", lstUser);
        }
    });


    //Disconnect 
    socket.on('disconnect', function() {
        for (var i = 0; i < mangUsers.length; i++) {
            if (mangUsers[i].ID === socket.id) {
                mangUsers[i].status = false;
                break;
            }
        }
        socket.broadcast.emit("server-send-danhsach-Users", mangUsers);
        // console.log(socket.id + " ngat ket noi");
    });
});

app.get("/", function(req, res) {
    res.render("trangchu");
});