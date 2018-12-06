var Game = {
    sessionID: null,
    userName: null,
    opponentName: null,
    startTime: null,
    moves: [],
    startTime: null
}
function clicked(obj){
    if(obj.cellIndex != null && obj.parentNode.rowIndex != null){
        console.log("Sent move on: " + obj.cellIndex + ":" + obj.parentNode.rowIndex);
        sendMove(obj.cellIndex, obj.parentNode.rowIndex);
    }
}
function criticalERROR(message){
    document.write("<h1>CRITICAL ERROR ENCOUNTERED</h1><br>" + message);
}
function updateGame(){

    
    GameField.refresh();
}