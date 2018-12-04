var connection = null;
function initializeConnection(ip, port){
    window.WebSocket = windwo.WebSocket || window.MozWebSocket;
    connection = new WebSocket("ws://" + ip + ":" + port);

    connection.onerror = function(error){
        console.log("Critical error encountered: " + error);
    }
    connection.onmessage = function(message){
        message = JSON.parse(message);
        if(message.chatMessage != null){
            updateChat(message); // receive chat message
        }
        if(message.errorMessage != null){
            
        }
        if(message.move != null){
            registerMove(message.move , message.X, message.Y); // register a move from the other player
        }
        else if(message.updateType != null){
            updateGameData(message); // update the game data (late connection)/ show game ended/ show waiting for player
        }
        else if(message.request != null){
            if(message.request === "auth"){
                var authentication = {
                    gameID: 1234123,
                    userName: "Hello World"
                }
                connection.send(JSON.stringify(authentication)); // send authentication
            }
        }
        else
            criticalERROR("Request from server could not be understood"); // notify user of an error
    }
}

function registerMove(type, XAxis, YAxis){
    console.log("Registered " + type + " on position " + XAxis + ":" + YAxis);
    if(type == "HIT"){
        document.getElementById("playerField:" + XAxis + ":" + YAxis).classList.add("Hit");
    }
    else
        document.getElementById("playerField:" + XAxis + ":" + YAxis).classList.add("Miss");
}

function sendMove(positionX, positionY){
    if(connection != null){
         var move = {
            move: "Primal",
            X: positionX,
            Y: positionY
        }
        connection.send(JSON.stringify(move));
    }
}

function sendChatMessage(message){
    if(connection != null){
         var chatMessage = {
            chatMessage: message
        }
        connection.send(JSON.stringify(chatMessage));
    }
}

function updateGameData(message){
    switch(message.updateType){
        case "Late Connection":
            if(message.ships != null){
                for(s in message.ships){
                    for(t in GameField.ships){
                        if(t.update(s)){
                            message.ships.remove(s);
                            break;
                        }
                    }
                }
                if(message.ships.length > 0){
                    
                }
            }
            updateShips();
        break;
        case "End": 
            if(message.reason != null)
            endGame(message.reason);
        break;
        case "Disconnect":
            if(message.time != null)
                playerDisconnect(message.time);
        break;
        case "Reconnect":
            playerReconnect();
        break;
    }
}

function playerDisconnect(time){
    document.getElementById("playField").classList.add("blur");
    document.getElementById("messageDisplay").classList.add("active");
    document.getElementById("messageHeader").innerHTML = "Opponent Disconnected";
    var messageBody = document.getElementById("messageBody");
    messageBody.innerHTML = "Time to reconnect: " + time + "seconds"
    var s = time;
    disconnectTimer = setInterval(function(){
        s--;
        if(s==0)
            clearInterval(disconnectTimer);
        messageBody.innerHTML = "Time to reconnect: " + s + " seconds";
    }, 1000)
}

function playerReconnect(){
    document.getElementById("playField").classList.remove("blur");
    document.getElementById("messageDisplay").classList.remove("active");
    document.getElementById("messageHeader").innerHTML = "";
    clearInterval(disconnectTimer);
}

function playerAlert(message, header = "Critical error encounered"){
    criticalERROR(message);
}