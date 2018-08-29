var express = require("express");
var app = express();
var path = require('path');
var http = require('http').createServer(app);
var fs = require('fs-extra');
//var cookieParser = require('cookie-parser');
var siofu = require('socketio-file-upload');
var io = require('socket.io').listen(http);
// var session = require('express-session');
// var fileUpload = require('express-fileupload');


http.listen(3000, function(){
    console.log('listening on *:3000');
  });



app.use(express.static(path.join(__dirname)));
app.use(express.static('node_modules/three'));
app.use(express.static('node_modules')); 
// app.use(session({
//     secret: 'secretKey',
//     key: 'sid',
//     saveUninitialized: false,
//     resave: true,
//     cookie: {
//         httpOnly: true,
//         secure: true,
//         maxAge: null
//     }
// }));
app.use(siofu.router);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});




io.on('connection', function(socket){


    // ADD AFTER CONFIG SAVE NEW MODEL

    // var path = './public/users/' + socket.id;
    // fs.mkdirsSync(path + '/models');
    // var uploader = new siofu();
    // socket.on('disconnect', function(){
    //     fs.removeSync(path);
    // });
    // var uploader = new siofu();
    // uploader.dir = './public/users/'+ socket.id +'/models';
    // uploader.listen(socket);

    // uploader.on('saved', function(event){
    //     socket.emit('onsaved', event.file);
    // });
    

    // uploader.on("error", function(event){
    //     console.log("Error from uploader", event);
    // });

    /////////////////////////////////////////



});





