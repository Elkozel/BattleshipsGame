var Game = {
    sessionID: null,
    userName: null,
    opponentName: null,
    startTime: null,
    moves: [],
    startTime: null
}
var url = window.location.href
var index = url.split("user=");
Game.userName = index[1];
console.log(Game.userName);



function clicked(obj) {
    if (obj.cellIndex != null && obj.parentNode.rowIndex != null) {
        console.log("Sent move on: " + obj.cellIndex + ":" + obj.parentNode.rowIndex);
        sendMove(obj.cellIndex, obj.parentNode.rowIndex);
    }
}
function criticalERROR(message) {
    document.write("<h1>CRITICAL ERROR ENCOUNTERED</h1><br>" + message);
}
function positionShip(element) {
    element.ondragstart = function (e) {
        Pointer.element.src =  element.getAttribute("ship-image");
        Pointer.size = element.getAttribute("ship-size");
        e.dataTransfer.setDragImage(Pointer.element, 0, 0);
        Pointer.element.classList.add("active");
    }
    element.ondrag = function (event) {
        Pointer.element.style.left = event.clientX + "px";
        Pointer.element.style.top = event.clientY + "px";
    }
    element.ondragend = function (event) {
        Pointer.element.style.left = event.clientX + "px";
        Pointer.element.style.top = event.clientY + "px";
        Pointer.element.classList.remove("active");
    }

}
function updateGame() {


    GameField.refresh();
}


window.addEventListener("load", function(){
    document.getElementById("fullscreen").addEventListener("click", function(){
        var GameField = document.getElementById("playField");
        if(fullscreen == null)
            fullscreen = false;
        if(fullscreen){
            if (document.exitFullscreen)
                document.exitFullscreen();
            else if (document.mozCancelFullScreen)
                document.mozCancelFullScreen();
            else if (document.webkitExitFullscreen)
                document.webkitExitFullscreen();
            else if (document.msExitFullscreen)
                document.msExitFullscreen();
            fullscreen = false;
        }
        else{
            if (GameField.requestFullscreen)
                GameField.requestFullscreen();
            else if (GameField.mozRequestFullScreen)
                GameField.mozRequestFullScreen();
            else if (GameField.webkitRequestFullscreen)
                GameField.webkitRequestFullscreen();
            else if (GameField.msRequestFullscreen)
                GameField.msRequestFullscreen();
            fullscreen = true;
        }
    })
    this.document.getElementById("menu").style.width = "30%";
    initializeConnection(window.location.hostname, 80);
})