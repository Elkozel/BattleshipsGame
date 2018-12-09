var WebSocket = require('websocket').server;
var http = require('http');
var express = require('express');
var GameServer = require('./gameServer/gameServer');
var StatisticsServer = require("./statisticsServer/statisticsServer");
StatisticsServer.start(GameServer);
var url = require('url');
var app = express();
var port = 80;
var bodyparser = require('body-parser');
var server = http.createServer(app).listen(port, (req, res) => {
    console.log("running on port: " + port);
});
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.get('/stats/statistics.js', (req, res) => {
    res.sendFile('/stats/statistics.js');
})
app.post('/login', (req, res) => {
    var username = req.body.username;
    console.log(username);
    res.send(username);
})
app.use(express.static(__dirname + "/html"));

var WebSocketServer = new WebSocket({
    httpServer: server
});
WebSocketServer.on('request', function (req) {
    var connection = req.accept(null, req.origin);
    var message = {
        request: "auth"
    }
    connection.send(JSON.stringify(message));

    connection.on('connect', function () {
        console.log("Connected user!");
    });
    connection.on('message', function (message) {
        message = JSON.parse(message.utf8Data);
        GameServer.processRequest(connection, message);
    });
    connection.on('close', function () {
        if (connection.player != null)
            connection.player.detachConnection(connection);
    });
});

var StatHTTP = http.createServer(app).listen(3884, (req, res) => {
    console.log("Statistics available on port: " + 3884);
});
var WebSocketStats = new WebSocket({
    httpServer: StatHTTP
});
WebSocketStats.on('request', function (req) {
    var connection = req.accept(null, req.origin);

    connection.on('message', function (message) {
        message = JSON.parse(message.utf8Data);
        if (message.stats != null)
            StatisticsServer.processRequest(connection);
        else if (message.login != null) {
            if (message.login.length >= 4 && message.login.length <= 20) {
                if(GameServer.addPlayer(message.login)){
                    connection.send(JSON.stringify({"login" : true}));
                }
                else
                    connection.send(JSON.stringify({"login" : false, "reason" : "Username taken"}));
            }
        }
        else {

        }
    });
    connection.on('close', function () {
        if (connection.player != null)
            connection.player.detachConnection(connection);
    });
});
