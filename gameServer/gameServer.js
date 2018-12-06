class Player {
    constructor(name, game = null, connection = null, ships = null) {
        this.moves = [];
        this.name = name;
        this.ships = ships;
        this.isConnected = false;
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
                this.connection.sendUTF(JSON.stringify({ errorMessage: "Error: unable to read orientation of ship (" + s.orientation + ")" }));
        }
        return false;
    }
    migrateShips(ships) {
        if (ships.length >= 5)
            this.ships = ships;
    }
    attachConnection(connection) {
        connection.player = this;
        this.connection = connection;
        this.isConnected = true;
    }
    detachConnection(connection) {
        connection.player = null;
        this.connection = null;
        this.isConnected = false;
        this.game.disconnected();
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
        this.Player1 = new Player(Player1, this);
        this.Player2 = new Player(Player2, this);
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
        this.Player1.connection.sendUTF(message);
        this.Player2.connection.sendUTF(message);
    }
    prepare() {
        var temp = new Date();
        temp.setSeconds(temp.getSeconds + 15);
        this.startTime = temp;
        this.gameID = GameServer.getID();
        this.status = "prep";
        if (this.open) {
            GameServer.games.push(this);
            GameServer.waitList.slice(GameServer.waitList.findIndex(this), 1);
        }
        var broadcast = {
            updateType: "Perparation started",
            startTime: this.startTime,
            status: this.status,
            gameID: this.gameID
        }
        this.sendMessage(JSON.stringify(broadcast));
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
                game.broadcast(JSON.stringify({ errorMessage: "Game failed to start (Opponent disconnected)" }));
                this.end();
            }
    }
    end() {
        this.startTime = null;
        this.turn = null;
        this.status = "End";
        var game = GameServer.games.indexOf(this);
        if (game > 0)
            setTimeout(function () {
                GameServer.games.splice(game, 1);
            }, 300000)
        else
            console.log("EROR, I could not delete the game");
    }
    disconnected(){
        if((!game.Player1.isConnected || !game.Player2.isConnected) && game.status == "ongoing")
            game.broadcast(JSON.stringify({ errorMessage: "Game failed to start (Opponent disconnected)", disconnect: true }));
    }
    reconnected(player){
        game.broadcast(JSON.stringify({ reconnect: true }));
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
        // implement profanity filter
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
    createPrivateGame: function (Player1, Player2) {
        this.games.push(new Game(Player1, Player2, this.getID()));
        return nextID - 1;
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
        if (this.checkUsername(player.name)){
            this.players.push(player);
            return true;
        }
        else
            return false;
    },
    checkUsername(username) {
        for (s in this.players)
            if (s.name === username)
                return true;
        return false;
    },
    getPlayerByUsername: function (username) {
        for (s in this.players) {
            if (s.name === username)
                return s;
        }
        return null;
    },
    getGameByUsername: function (username) {
        for (s in games)
            if (s.Player1.name === username || s.Player2.name === username)
                return s;
        return null;
    },
    getGameByGameID: function (ID) {
        for (s in this.games)
            if (s.gameID === ID)
                return s;
        return null;
    },
    processRequest: function (connection, message) {
        if (message.userName != null) {
            var user = this.getPlayerByUsername(message.userName);
            if (user != null) {
                user.attachConnection(connection);
            }
            else {
                connection.send(JSON.stringify({ errorMessage: "Username is not in the database" }));
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
                        if(game.status == null)
                            game.prepare();
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
        else if (message.ships != null) {
            connection.player.game.migrateShips(message.ships, connection.player);
        }
        else if (message.chatMessage != null) {
            connection.player.game.addChatMessage(message.chatMessage, connection.player);
        }
    }
}
module.exports = gameServer;