function constructField(id){
    var characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    var endResult = "";
    endResult += "<thead><tr><th></th>";
    for(var s=0; s<10; s++){
        endResult += "<th id=\"" + id + ":" + s + "x0\">";
        endResult += characters[s];
        endResult += "</th>";
    }
    endResult += "</tr></thead>";
    endResult += "<tbody>";
    for(var y=1; y<11; y++){
        endResult += "<tr>";
        endResult += "<td id=\"" + id + ":0x" + y + "\">";
        endResult += y;
        endResult += "</td>";
        for(var x=1; x<11; x++){
            endResult += "<td id=\"" + id + ":" + x + "x" + y + "\">";

            endResult += "</td>";
        }
        endResult += "</tr>";
    }
    endResult += "</tbody>";
    document.getElementById(id).innerHTML = endResult;
}
constructField("attackField");
constructField("playerField");