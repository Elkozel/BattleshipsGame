var from = document.getElementById('login_form');
var username = document.getElementById('login_username');
from.onsubmit = function(){
    if(username.value.length >= 5){
        sendUsername(username.value);
    }
    else{
        username.classList.add("invalid");
        prevUsername = username.value;
    }
    return false;
}

function sendUsername(username){
    
}

username.addEventListener("keyup", function(){
    console.log("Change");
    if(username.classList.contains("invalid") && username.value != prevUsername){
        username.classList.remove("invalid");
    }
});