console.log("Starting...");
var path = require('path');
var jf = require('jsonfile'); //NPM INSTALL
var proc = require('child_process');
var filePathINI = path.join(__dirname, 'ini.json');
var filePathOFF = path.join(__dirname, 'stop.json');
var fs = require('fs');
var mc_server = null;
var HashMap = require('hashmap'); //NPM INSTALL
var map = new HashMap();

var express = require('express'); //NPM INSTALL
//SOCKET IO NPM INSTALL
var app = express();
var serv = require('http').createServer(app);
var startQueue = {};

serv.listen(8080);
console.log("Server initialized");


var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.on('status', function (name) {
        var no = map.get(name);
        if (no != null) {
            socket.emit("statusON"); //server status ON
        } else {
            socket.emit("statusOFF"); //server status OFF
        }
    });
    socket.on('startServer', function (name) {
        var no = map.get(name);
        if (no == null) {
            var poth = path.join(__dirname, '/servers/' + name + "/");
            console.log("Starting server of " + name);
            var mc_server2 = proc.exec("cd " + poth + "; java -Xmx300M -Xms300M -Dcom.mojang.eula.agree=true -jar server.jar", (error, stdout, stderr) => {
                if (error) {
                    console.log("The server of " + name + " was closed because: " + error)
                    socket.emit("statusOFF"); //status off
                    map.remove(name);
                    return;
                }
                if (stdout) {
                    socket.emit("statusOFF"); //status off
                    map.remove(name);
                }
            });
            map.set(name, mc_server2);
            socket.emit("statusON"); //status on
        }
    })
    socket.on('command', function (name, cmd) {
        var no = map.get(name);
        if (no != null) {
            if (cmd == "stop") { //this is not the most efficient way but...
                no.stdin.write("stop\r");
                map.remove(name);
                socket.emit("statusOFF");
                console.log("Closing server of " + name);
            } else {
                if (cmd != null) {
                    console.log("In the server of " + name + " this command was executed: " + cmd);
                    no.stdin.write(cmd + "\r");
                }
            }
        }
    });

    socket.on('stopServer', function (name) {
        //Hashmap saves the variable name and the username
        var no = map.get(name);
        if (no != null) {
            var lelo = map.get(name);
            lelo.stdin.write("stop\r");
            map.remove(name);
            console.log("Closing server of " + name);
            socket.emit("estadoOFF");
        }
    });
    socket.on('stopAllServers', function () { //pararTodos means Stop All servers
        stopAllServers();
    });
    socket.on('allServers', function () { //see all the servers
        var todo1 = map.keys();
        var count1 = 0;
        var max2 = todo1.length;
        var mandar = [];
        while (count1 <= max2) {
            var paDecir = todo1[count1];
            if (paDecir != null) {
                mandar[count1] = paDecir;
            }
            count1++;
        }
        if (mandar != null) {
            socket.emit("todos", mandar); //sending all the servers in a list
        }
    });
});

//Stop the last server
function stopLastServer() {
    var todo = map.keys();
    if (todo.length == 3) { //hardcoded value of How many servers can be ran
        var paBorrar = todo[0];
        var lelo2 = map.get(todo[0]);
        if (lelo2 != null) {
            lelo2.stdin.write("stop\r");
            console.log("Closing server of " + paBorrar + " to save RAM");
            map.remove(paBorrar);
        }
    }
}
//Stop all the servers
function stopAllServers() {
    var todo = map.keys();
    var count = 0;
    var max = todo.length;
    while (count <= max) {
        var toDelete = todo[count];
        var lelo2 = map.get(toDelete); //lelo doesnt mean anything xD
        if (lelo2 != null) {
            lelo2.stdin.write("stop\r");
            console.log("Closing server of " + toDelete);
            map.remove(toDelete);
        }
        count++;
    }
}