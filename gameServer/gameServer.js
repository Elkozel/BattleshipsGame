class Player {
    constructor(name, game = null, connection = null, ships = null) {
        this.moves = [];
        this.name = name;
        this.ships = ships;
        this.isConnected = false;
        this.hasConnected = false;
        this.connection = connection;
        this.game = game;
    }
    sendMessage(message) {
        if (this.connection != null) {
            this.connection.send(message);
        }
    }
    addMove(move) {
        var newMove = {
            type: move.move,
            origin: move.origin,
            X: move.X,
            Y: move.Y
        }
        this.moves.push(newMove);
    }
    shipHit(position) {
        for (s in this.ships) {
            if (s.orientation == "h") {
                if (s.position.X === position.X) {
                    if (position.X >= s.position.X && position.X <= (s.position.X + s.size)) {
                        s.hits.push(position.X - s.position.X);
                        return true;
                    }
                }
            }
            else if (s.orientation == "v") {
                if (s.position.Y === position.Y) {
                    if (position.Y >= s.position.Y && position.Y <= (s.position.Y + s.size)) {
                        s.hits.push(position.Y - s.position.Y);
                        return true;
                    }
                }
            }
            else
                this.connection.send(JSON.stringify({ errorMessage: "Error: unable to read orientation of ship (" + s.orientation + ")" }));
        }
        return false;
    }
    migrateShips(ships) {
        if (ships.length >= 5)
            this.ships = ships;
    }
    isAlive() {
        for (var s = 0; s < this.ships.length; s++) {
            if (this.ships[s].size > this.ships[s].hits.length)
                return true;
        }
        return false;
    }
    attachConnection(connection) {
        connection.player = this;
        this.connection = connection;
        this.isConnected = true;
        this.hasConnected = true;
    }
    detachConnection(connection) {
        connection.player = null;
        this.connection = null;
        this.isConnected = false;
        if (this.game != null)
            this.game.disconnected();
        var user = this;
        setTimeout(function () {
            if (!user.isConnected)
                gameServer.players.splice(gameServer.getPlayerIndexByUsername(user.name), 1);
        }, 30000)
    }
}


class Game {
    constructor(Player1, Player2, ID) {
        this.startTime = null;
        this.turn = null;
        this.chat = [];
        this.gameID = ID;
        if (this.gameID == null)
            this.open = true;
        else
            this.open = false;
        Player1.game = this;
        this.Player1 = Player1;
        this.Player2 = Player2;
        if (Player2 != null)
            Player2.game = this;
        this.status = "pending";
    }
    registerMove(move) {
        if (move.move === "Primal") {
            var field = null;
            move.move = "MISS";
            if (move.origin.name === this.Player1.name)
                if (this.Player2.shipHit(move)) {
                    move.move = "HIT";
                    this.sendMessage(JSON.stringify(move));
                }
                else {
                    this.sendMessage(JSON.stringify(move));
                    this.turn = !this.turn;
                }
            else if (move.origin.name === this.Player2.name)
                if (this.Player1.shipHit(move)) {
                    move.move = "HIT";
                    this.sendMessage(JSON.stringify(move));
                }
                else {
                    this.sendMessage(JSON.stringify(move));
                    this.turn = !this.turn;
                }
            else {
                this.sendMessage(JSON.stringify({ errorMessage: "Error: Unknown player tried to register a move" }));
            }
        }
        else
            console.log("Huge error, move not primal");
    }
    sendMessage(message) {
        this.Player1.connection.send(message);
        this.Player2.connection.send(message);
    }
    prepare() {
        var temp = new Date();
        temp.setSeconds(parseInt(temp.getSeconds() + 15));
        this.startTime = temp;
        this.status = "prep";
        var broadcast = {
            updateType: "Perparation started",
            startTime: this.startTime,
            status: this.status,
            gameID: this.gameID
        }
        this.sendMessage(JSON.stringify(broadcast));
        var game = this;
        setTimeout(function () { game.start() }, 15000);
    }
    start() {
        if (this.Player1.isConnected && this.Player2.isConnected)
            if (this.Player1.ships != null && this.Player2.ships != null && this.Player1.ships.length >= 5 && this.Player2.ships.length >= 5) {
                this.turn = true; // true for Player 1 and false for Player 2
                this.status = "ongoing";
                var broadcast = this.sendGame(this.Player1);
                broadcast.updateType = "Game started";
                this.Player1.sendMessage(JSON.stringify(broadcast));
                var broadcast = this.sendGame(this.Player2);
                broadcast.updateType = "Game started";
                this.Player2.sendMessage(JSON.stringify(broadcast));
            }
            else {
                this.sendMessage(JSON.stringify({ errorMessage: "Game failed to start (Opponent disconnected)" }));
                this.end();
            }
    }
    end() {
        this.startTime = null;
        this.turn = null;
        this.status = "End";
        var game = this.gameID;
        this.sendMessage(JSON.stringify({
            startTime: this.startTime,
            updateType: "Game Ended"
        }))
        if (game >= 0)
            setTimeout(function () {
                var index = gameServer.getIndexByGameID(game)
                if (index >= 0)
                    gameServer.games.splice(index, 1);
            }, 30000)
        else
            console.log("ERROR, I could not delete the game");
    }
    disconnected() {
        if ((!this.Player1.isConnected || !this.Player2.isConnected) && this.status == "ongoing") {
            this.broadcast(JSON.stringify({ errorMessage: "Game failed to start (Opponent disconnected)", disconnect: true }));
            var game = this;
            setTimeout(function () {
                if(game.Player1.isConnected ^ game.Player2.isConnected){
                    game.end();
                }
            }, 20000);
        }
    }
    reconnected(player) {
        this.broadcast(JSON.stringify({ reconnect: true }));
        var broadcast = this.sendGame(player);
        broadcast.updateType = "Game started";
        player.sendMessage(JSON.stringify(broadcast));

    }
    sendGame(username) {
        var ret = {
            startTime: this.startTime,
            open: this.open,
            status: this.status,
            chatUpdate: this.chat
        }
        if (username === this.Player1.name) {
            ret.ships = this.Player1.ships;
            ret.moves = this.Player1.moves;
            ret.opponentName = this.Player2.name;
        }
        else if (username === this.Player2.name) {
            ret.ships = this.Player2.ships;
            ret.moves = this.Player2.moves;
            ret.opponentName = this.Player1.name;
        }
        else {
            console.log("Big Big error, could not send the game");
            return null;
        }
        return ret;
    }
    addChatMessage(message, player) {
        var chatMsg = {
            time: new Date(),
            author: player.name,
            text: message
        }
        this.chat.push(chatMsg);
        this.broadcastChat();
    }
    broadcastChat(chatMessage) {
        var message = JSON.stringify({ chatMessage: chatMessage });
        this.sendMessage(message);
    }
    updateChat() {
        var message = JSON.stringify({ chatUpdate: this.chat });
        this.sendMessage(message);
    }
    updateShips(ships, origin) {
        if (this.status === "prep") {
            origin.migrateShips(ships);
        }
    }
}

var gameServer = {
    games: [],
    players: [],
    waitList: [],
    nextID: 0,
    getID: function () {
        return this.nextID++;
    },
    createGame: function (Player1) {
        this.waitList.push(new Game(Player1, null, null));
    },
    createPrivateGame: function (Player1) {
        this.games.push(new Game(Player1, null, this.getID()));
        return this.nextID - 1;
    },
    endGame: function (ID) {
        this.getGameByGameID(ID).end();
    },
    cleanUp: function () {
        if (nextID >= 300 || games[0].gameID > 250) {
            nextID = 0;
        }
    },
    addPlayer(player) {
        if (!this.checkUsername(player)) {
            this.players.push(new Player(player, null, null));
            var username = player;
            var server = this;
            setInterval(function () {
                var index = server.getPlayerIndexByUsername(username);
                if (index != null && !server.players[index].hasConnected) {
                    server.players.splice(index, 1);
                }
            }, 30000);
            return true;
        }
        else
            return false;
    },
    checkUsername(username) {
        this.players.forEach(function (s) {
            if (s.name === username)
                return true;
        });
        return false;
    },
    getPlayerByUsername: function (username) {
        for (var s = 0; s < this.players.length; s++) {
            if (this.players[s].name === username) {
                return this.players[s];
            }
        }
        return;
    },
    getPlayerIndexByUsername: function (username) {
        for (var s = 0; s < this.players.length; s++) {
            if (this.players[s].name === username) {
                return s;
            }
        }
        return;
    },
    getGameByUsername: function (username) {
        for (var s = 0; s < this.waitList.length; s++) {
            if (this.waitList[s].Player1.name === username || this.waitList[s].Player2.name === username) {
                return this.waitList[s];
            }
        }
        return;
    },
    getGameByGameID: function (ID) {
        for (var s = 0; s < this.games.length; s++) {
            if (this.games[s].gameID === ID) {
                return this.games[s];
            }
                
        }
        return;
    },
    getIndexByGameID: function (ID) {
        for (var s = 0; s < this.games.length; s++) {
            if (this.games[s].gameID === ID) {
                return s;
            }
        }
        return;
    },
    getWaitlistIndex: function (game) {
        for (var s = 0; s < this.waitList.length; s++) {
            if (this.waitList[s].Player1 === game.Player1 && this.waitList[s].Player2 === game.Player2) {
                return s;
            }
        }
        return;
    },
    processRequest: function (connection, message) {
        if (message.userName != null) {
            var user = gameServer.getPlayerByUsername(message.userName);
            if (user != null) {
                user.attachConnection(connection);
            }
            else {
                connection.send(JSON.stringify({ errorMessage: "Username is not in the database" }));
                connection.close();
                return;
            }
            if (message.gameID != null) {
                var game = GameServer.getGameByGameID(message.gameID);
                if (game != null) {
                    if (game.Player1.name === message.userName) {
                        game.Player1 = user;
                    }
                    else if (game.Player2.name === message.userName) {
                        game.Player2 = user;
                    }
                    else {
                        connection.send(JSON.stringify({ errorMessage: "User is not part of this game" }));
                        return;
                    }
                    if (game.Player1.isConnected && game.Player2.isConnected) {
                        if (game.status === "pending") {
                            if (game.startTime == null)
                                game.prepare();
                            else
                                game.reconnected(connection.player);
                        }
                        else if (game.status == "ongoing")
                            game.reconnected(connection.player);
                    }
                }
                else {
                    connection.send(JSON.stringify({ errorMessage: "Could not find game by the given ID" }));
                }
            }
        }
        else if (message.move != null) {
            message.origin = connection.player;
            connection.player.game.registerMove(message);
        }
        else if (message.request != null) {
            if (message.request === "games") {
                var response = {
                    updateType: "Games on wait",
                    games: []
                }
                for (var s = 0; s < this.waitList.length; s++) {
                    response.games.push({
                        Player1: {
                            name: this.waitList[s].Player1.name
                        }
                    });
                }
                connection.send(JSON.stringify(response));
            }
            if (message.request === "createGame") {
                if (message.open != null) {
                    if (message.open) {
                        this.createGame(connection.player);
                        var response = {
                            updateType: "Game Created",
                            gameID: null
                        }
                        connection.send(JSON.stringify(response));
                    }
                    else {
                        this.createPrivateGame(connection.player);
                        var response = {
                            updateType: "Game Created",
                            gameID: connection.player.game.gameID
                        }
                        connection.send(JSON.stringify(response));
                    }
                }
                else
                    connection.send(JSON.stringify({ errorMessage: "Insufficient info for the game!" }));
            }
            if (message.request === "connect") {
                if ((message.name != null ^ message.ID != null) && message.open != null) {
                    if (message.open) {
                        var game = this.getGameByUsername(message.name);
                        if (game == null) {
                            connection.send(JSON.stringify({ errorMessage: "Game does not exist!" }));
                        }
                        else if (game.status === "ongoing") {
                            connection.send(JSON.stringify({ errorMessage: "Trying to join a full game!" }));
                        }
                        else if (game.Player2 == null) {
                            game.Player2 = connection.player;
                            game.gameID = this.getID();
                            this.games.push(game);
                            var index = this.getWaitlistIndex(game);
                            if (index != null) {
                                this.waitList.slice(index, 1);
                                game.prepare();
                            }
                            else {
                                connection.send(JSON.stringify({ errorMessage: "Game could not be transferred, please try again!" }));
                            }
                        }
                        else
                            connection.send(JSON.stringify({ errorMessage: "Host of the game disconnected!" }));
                    }
                    else {
                        var game = this.getGameByGameID(message.ID);
                        if (game.status === "pending") {
                            game.Player2 = connection.player;
                            game.prepare();
                        }
                        else
                            connection.send(JSON.stringify({ errorMessage: "Game join rejected!" }));
                    }
                }
                else
                    connection.send(JSON.stringify({ errorMessage: "Game ID or game type was null!" }));
            }
        }
        else if (message.ships != null) {
            connection.player.game.migrateShips(message.ships, connection.player);
        }
        else if (message.chatMessage != null) {
            connection.player.game.addChatMessage(message.chatMessage, connection.player);
        }
        else
            connection.send(JSON.stringify({ errorMessage: "Unable to understand massage!" }));
    }
}
module.exports = gameServer;