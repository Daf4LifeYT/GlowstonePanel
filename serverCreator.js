var express = require('express');
var fs = require('fs');
var path = require('path');
var jf = require('jsonfile');
var copy = require('copy');
var app = express();
var serv = require('http').createServer(app);
var mysql = require('mysql');
//var db = require('./db.js');
var startQueue = {};

serv.listen(8081);
console.log("Servercreator initialized");

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'sql8.freemysqlhosting.net',
    user: 'sql8164855',
    password: 'vIaX9H4bp8',
    database: 'sql8164855'
});
connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('Success. Connected to MySQL as id ' + connection.threadId);
});

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.on('register', function (username, email, password) {
        connection.query("SELECT * FROM `users` WHERE username='" + username + "'", function (err, rows, fields) {
            if (!err) {
                if (rows == 0) {
                    connection.query("INSERT into `users` (username, password, email) VALUES ('" + username + "', '" + password + "', '" + email + "')", function (err, rows, fields) {
                        if (!err) {
                            var registered = true;
                            socket.emit("register", registered)
                            console.log('New user registered');
                            createServer(username);
                        } else {
                            var registered = false;
                            socket.emit("register", registered)
                            console.log('Error while performing Query: ' + err);
                        }
                    });
                } else {
                    //There is already one user with that username
                }
            } else {
                console.log('Error while performing Query: ' + err);
            }
        });
    });
    socket.on('login', function (username, password) {
        connection.query("SELECT * FROM `users` WHERE username='" + username + "' and password='" + password + "'", function (err, rows, fields) {
            if (!err) {
                //If password is correct...
                if (rows.length > 0) {
                    //All is correct
                    socket.emit("loginSucess");
                } else {
                    //Password is incorrect
                    socket.emit("loginFail");
                }
            } else {
                console.log('Error while performing Query: ' + err);
            }
        });
    });
});
function createServer(username) {
    var serverInfoFile = 'serverInfo.json'
    jf.readFile(serverInfoFile, function (err, currentServerInfo) {
        var serverInfo = currentServerInfo;
        var port = serverInfo.port;
        serverInfo.port = port + 1;
        jf.writeFile(serverInfoFile, serverInfo, function (err) {
            var properties = 'properties generator-settings= force-gamemode=false allow-nether=true gamemode=0 enable-query=false player-idle-timeout=0 difficulty=1 spawn-monsters=true op-permission-level=4 announce-player-achievements=true pvp=true snooper-enabled=true level-type=DEFAULT hardcore=false enable-command-block=false max-players=10 network-compression-threshold=256 resource-pack-sha1= max-world-size=29999984 server-port=' + port + ' debug=false server-ip= spawn-npcs=true allow-flight=false level-name=world view-distance=10 resource-pack= spawn-animals=true white-list=false generate-structures=true online-mode=false max-build-height=256 level-seed= use-native-transport=true motd=209MBforMC | Get your free Minecraft server today enable-rcon=false';
            fs.writeFile("server.properties", properties, function (err) {
                if (err) {
                    return console.log(err);
                }
                var dir = "./servers/" + username;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                    //Copying all the files to the user server folder
                    var serverFolder = path.join(__dirname, '/servers/' + username);
                    copy('server.jar', serverFolder, function (err, file) {
                    });
                    copy('server.properties', serverFolder, function (err, file) {
                    });
                    copy('serverInfo.json', serverFolder, function (err, file) {
                    });
                    //Delete the generated server.properties
                    fs.unlinkSync("server.properties");
                }
            });
        })
    })
}