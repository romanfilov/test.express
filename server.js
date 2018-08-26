var express = require("express");
var app = express();
var path = require('path');
var http = require('http').Server(app);
var fs = require('fs-extra');
var cookieParser = require('cookie-parser');



http.listen(3000, function(){
    console.log('listening on *:3000');
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

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});





io.on('connection', function(socket){
    // var path = './public/users/' + socket.id;
    // fs.mkdirsSync(path + '/models');
    // socket.on('disconnect', function(){
    //     fs.removeSync(path);
    // });
    
    socket.join(socket.id);
    socket.on('upload', function(data) {
        console.log(data);
    });

});

app.post('/', function(req, res) {
    io.sockets.in(req.cookies).emit('upload', JSON.stringify(req.files));
});

