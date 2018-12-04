var GameField = {
    homeField: [10,10],
    attackField: [10,10],
    ships: constructShips(),
    getShip: function(position){
        if(position.x >= 0 && position.x <= 10 && position.y <= 10 && position.y >= 0)
            return this.grid[position.x, position.y].ship;
        else{
            console.log("Position invalid");
            return null;
        }
    },
    recover: function(other){
        for(s in other.ships)
            for(t in GameField.ships)
                if(s.type === t.type)
                    t.update(s);
    },
    apply: function(){

    }
}
function constructShips(){
    var ret = [];
    for(var s=0; s<5; s++){
        ret.push(new Ship(s));
    }
    return ret;
}
class Ship {
    constructor(type, orientation = "h", name = null) {
        var shipTypes = ["Carrier", "Battleship", "Cruiser", "Submarine", "Destroyer"];
        var shipSizes = [5, 4, 3, 3, 2];
        this.type = shipTypes[type];
        if (name != null)
            this.name = name;
        this.size = shipSizes[type];
        this.orientation = orientation;
        this.hits = [];
    }
    update(ship) {
        if (ship.size == this.size && ship.type === this.type) {
            this.name = ship.name;
            if (this.hits.length > ship.hits.length)
                console.log("Ships are not supposed to regenerate!"); // needs to be fixed
            this.hits = ship.hits;
            return true;
        }
        return false;
    }
    placeShip(position, orientation) {
        if (this != null) {
            if(position.x >= 0 && position.x <= 7 && position.y >= 0 && position.y <= 7){
                switch(orientation){
                    case "h":
                        for(var s=0; s<this.size; s++){
                            if(GameField.grid[position.x + s, position.y].ship != null){
                                console.log("Placing ship onto another ship");
                                return false;
                            }
                        }
                        for(var s=0; s<this.size; s++)
                            GameField.grid[position.x + s, position.y].ship == this;
                    break;
                    case "v":
                        for(var s=0; s<this.size; s++){
                            if(GameField.grid[position.x, position.y + s].ship != null){
                                console.log("Placing ship onto another ship");
                                return false;
                            }
                        }
                        for(var s=0; s<this.size; s++)
                            GameField.grid[position.x, position.y + s].ship == this;
                    break;
                    default:
                        console.log("Ship orientation cannot be " + orientation);
                        return false;
                }
                this.position = position;
                this.orientation = orientation;
            }
            else{
                console.log("Ship out of borders");
                return false;
            }
        }
        else {
            console.log("Ship was null");
            return false;
        }
    }
}
console.log(Game);