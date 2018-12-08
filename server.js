var WebSocket = require('websocket').server;
var http = require('http');
var express = require('express');
var GameServer = require('./gameServer/gameServer');
var url = require('url');
var app = express();
var port = 80;
var bodyparser = require('body-parser');
var server = http.createServer(app).listen(port,(req,res) => {
    console.log("running on port: " + port);
});
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

app.get('/post',(req,res)=>{
    var query = url.parse(req.url,true).query;
    var username = (query['username'] !== undefined ) ? query['username'] : "Anonymous";
    var err = GameServer.addPlayer(username);
    console.log(GameServer.players);
    if(err){
    res.sendFile(__dirname + '/html/game.html');
    }
})

app.get('/stats/statistics.js',(req,res)=>{
    res.sendFile('/stats/statistics.js');
})
app.post('/login',(req,res)=>{
    var username = req.body.username;
    console.log(username);
    res.send(username);
})
app.use(express.static(__dirname + "/html"));
var WebSocketServer = new WebSocket({
        httpServer: server
    });
WebSocketServer.on('request', function(req){
        var connection = req.accept(null, req.origin);
        var message = {
            request: "auth"
        }
        connection.send(JSON.stringify(message));
        console.log("Request from user!");

    connection.on('connect', function(){
        console.log("Connected user!");
    });
    connection.on('message', function(message){
        message = JSON.parse(message.utf8Data);
        GameServer.processRequest(connection, message);
    });
    connection.on('close', function(){
        if(connection.player != null)
            connection.player.detachConnection(connection);
    });
});




