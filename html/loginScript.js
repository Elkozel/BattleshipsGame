
var from = document.getElementById('login_form');
var username = document.getElementById('login_username');
from.onsubmit = function(e){
    if(username.value.length >= 5 ){
        if(check(username.value)){
            sendUsername(username.value);
        }
        else {
        username.classList.add("invalid");
        prevUsername = username.value;
        document.getElementById('login_errorPointer').innerHTML = 'Username already taken';
        e.preventDefault();
        }        
    }
    else{
        username.classList.add("invalid");
        prevUsername = username.value;
        document.getElementById('login_errorPointer').innerHTML = 'Password needs to be at least 5 characters';
        e.preventDefault();
    }
}



function sendUsername(userNick){
    
}

username.addEventListener("keyup", function(){
    console.log("Change");
    if(username.classList.contains("invalid") && username.value != prevUsername){
        username.classList.remove("invalid");
    }
});