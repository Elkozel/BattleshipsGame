var WebSocket = require('websocket').server;
var http = require('http');
var express = require('express');
var GameServer = require('../BattleshipsGame-mergeNodejs/gameServer/server');
var app = express();
var port = 80;
var server = http.createServer(app).listen(port,(req,res) => {
    console.log("running on port: " + port);
});
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
            connection.player.detachConnection();
    });
});




