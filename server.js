var express = require("express");
var app = express();
var path = require('path');
<<<<<<< HEAD
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
=======
var http = require('http').Server(app);
var fs = require('fs-extra');
var cookieParser = require('cookie-parser');
var siofu = require("socketio-file-upload");


http.listen(3030, function(){
    //console.log('listening on *:3000');
  });

var io = require('socket.io').listen(http);
var session = require('express-session');
var fileUpload = require('express-fileupload');

app.use(express.static(path.join(__dirname + '/public')));
app.use(express.static('node_modules/three'));
app.use(express.static('node_modules')); 
app.use(fileUpload());
app.use(cookieParser());
app.use(session({
    key: 'express.sid',
    secret: 'secretKey',
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 72,
        httpOnly: true,
        secure: true
    }
}));
>>>>>>> f777013e1ff2f950ac336e881c54f9a8a9cdc7bb
app.use(siofu.router);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});




<<<<<<< HEAD
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


=======

io.on('connection', function(socket){
    // var path = './public/users/' + socket.id;
    // fs.mkdirsSync(path + '/models');
    // socket.on('disconnect', function(){
    //     fs.removeSync(path);
    // });
    
    var uploader = new siofu();
    uploader.dir = "./public/models";
    uploader.listen(socket);
    uploader.on('error', console.error);
});

io.on('error', function(error) {
    console.log(error);
})
>>>>>>> f777013e1ff2f950ac336e881c54f9a8a9cdc7bb



