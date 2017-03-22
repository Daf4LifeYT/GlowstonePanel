//This generates the server. It uses a very stupid system but it's working
// I dont know why I did it in this way

var fs = require('fs');
console.log("Starting...");
var disponible = 0;
var path = require('path');
var jf = require('jsonfile'); //NPM INSTALL
var filePath = path.join(__dirname, 'user.json');
var filePath1 = path.join(__dirname, 'port.json');
var copy = require('copy'); //NPM INSTALL

chequear();

function chequear(){
    jf.readFile(filePath, function(err, data) {
    if (!err){
         console.log('A JSON file was found (' + filePath + ")");
         createServer(data);
    }else{
         chequear(); //lets check again (loop)
    }

    });
}
function createServer(data){
    console.log("Creating server for " + data.user);
    dir = "./servers/" + data.user;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir); //create the user server folder
       //Copying all the files to the user server folder
        var destino2 = path.join(__dirname, '/servers/' + data.user);
        copy('server.jar', destino2, function(err, file) {
        });
        copy('server.properties', destino2, function(err, file) {
        });
        copy('port.json', destino2, function(err, file) {
        });
        //Borramos el json
        fs.unlinkSync("user.json");
        fs.unlinkSync("server.properties");
        chequear(); //now we continue checking more work xD

    }
     jf.readFile(filePath, function(err, user12) {
        if (!err){
          fs.unlinkSync("user.json");
        }else{
         chequear(); //lets check again
    }

    });
}



