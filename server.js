let express = require("express");
let app = express();
let path = require('path');
let http = require('http').createServer(app);
let fs = require('fs-extra');
let siofu = require('socketio-file-upload');
let io = require('socket.io').listen(http);


http.listen(3000, function(){
    console.log('listening on *:3000');
  });



app.use(express.static(path.join(__dirname)));
app.use(express.static('node_modules/three'));
app.use(express.static('node_modules')); 

app.use(siofu.router);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});




io.on('connection', function(socket){
    var path = './public/users/' + socket.id;
    fs.mkdirsSync(path + '/models');
    var uploader = new siofu();
    socket.on('disconnect', function(){
        fs.removeSync(path);
    });
    var uploader = new siofu();
    uploader.dir = path + '/models';
    uploader.listen(socket);
    uploader.on('complete', function(ev) {
        ev.file.clientDetail.path = ev.file.pathName; 
    });
    uploader.on("error", function(event){
        console.log("Error from uploader", event);
    });
});





