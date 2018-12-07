var Game = {
    sessionID: null,
    userName: null,
    opponentName: null,
    startTime: null,
    moves: [],
    startTime: null
}
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