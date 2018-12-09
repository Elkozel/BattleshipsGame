var from = document.getElementById('login_form');
var username = document.getElementById('login_username');
initializeConnection(window.location.hostname, 3884);
Statistics.start(connection);
from.onsubmit = function(){
    if(username.value.length >= 4 && username.value.length <= 20){
        sendUsername(username.value);
    }
    else{
        username.classList.add("invalid");
        prevUsername = username.value;
    }
    return false;
}

function sendUsername(username){
    connection.send(JSON.stringify({"login" : username}));
}

username.addEventListener("keyup", function(){
    console.log("Change");
    if(username.classList.contains("invalid") && username.value != prevUsername){
        username.classList.remove("invalid");
    }
});


function initializeConnection(ip, port){
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    connection = new WebSocket("ws://" + ip + ":" + port);

    connection.onerror = function(error){
        console.log("Critical error encountered: " + error);
    }
    connection.onmessage = function(message){
        message = JSON.parse(message.data);
        if(message.login != null){
            if(message.login){
                document.location.href = "/game.html?user=" + username.value;
            }
            else{
                username.classList.add("invalid");
                prevUsername = username.value;
                document.getElementById("login_errorPointer").innerHTML = message.reason;
            }
        }
        else if(message.stats != null){
            Statistics.updateStats(message.stats.playersOnline, message.stats.gamesPlayed, message.stats.isAndyPlaying);
        }
        else{
            console.log("Error, could not understand server: " + message);
        }
    }
}