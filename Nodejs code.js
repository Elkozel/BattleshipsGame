var WebSocket = require('websocket').server;
var server = 5; // define http server

var WebSocketServer = new WebSocket({
    httpServer: server
});
WebSocketServer.on('request', function(req){
    var connection = req.accept(null, req.origin);
    var player = null;
});
connection.on('connect', function(){
    var message = {
        request: "auth"
    }
    connection.sendUTF(JSON.stringify(message));
});
connection.on('message', function(message){
    message = JSON.parse(message);
    GameServer.processRequest(connection, message);
});
connection.on('close', function(){
    // emit that the game is over
});
