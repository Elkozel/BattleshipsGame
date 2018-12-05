var WebSocket = require('websocket').server;
var server = 5; // define http server
var http = require('http');
var express = require('express');
var app = express();
var port = 1337;
var server = http.createServer(app).listen(port,(req,res) => {
    console.log("running")
});
app.use(express.static(__dirname + "/html"));
var WebSocketServer = new WebSocket({
    httpServer: server
});
WebSocketServer.on('request', function(req){
    var connection = req.accept(null, req.origin);
    var player = null;
    var message = {
        request: "auth"
    }
    connection.sendUTF(JSON.stringify(message));
    console.log("Request from user!");

connection.on('connect', function(){
    console.log("Connected user!");
    var message = {
        request: "auth"
    }
    connection.sendUTF(JSON.stringify(message));
});
connection.on('message', function(message){
    console.log("Received message: " + message);
    message = JSON.parse(message);
    GameServer.processRequest(connection, message);
});
connection.on('close', function(){
    // emit that the game is over
});
});




