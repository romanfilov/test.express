let express = require("express");
let app = express();
let path = require('path');
let http = require('http').createServer(app);
let fs = require('fs-extra');
let siofu = require('socketio-file-upload');
let io = require('socket.io').listen(http);


http.listen(8080, function(){
    fs.remove('./public/users');
    console.log('listening on *:8080');
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
        fs.remove(path);
    });
    var uploader = new siofu();
    uploader.dir = path + '/models';
    uploader.listen(socket);
    uploader.on('progress', function(ev) {
        socket.emit('upload.progress', {
            file: ev.file,
            percentage:(ev.file.bytesLoaded / ev.file.size) * 100
        })
    });
    uploader.on('complete', function(ev) {
        ev.file.clientDetail.path = ev.file.pathName;
        ev.file.clientDetail.name = ev.file.name;
    });
    uploader.on("error", function(ev){
        console.log("Error from uploader", ev);
    });
});





