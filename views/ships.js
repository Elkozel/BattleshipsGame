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
            if (position.x >= 0 && position.x <= 7 && position.y >= 0 && position.y <= 7) {
                switch (orientation) {
                    case "h":
                        for (var s = 0; s < this.size; s++) {
                            if (GameField.grid[position.x + s, position.y].ship != null) {
                                console.log("Placing ship onto another ship");
                                return false;
                            }
                        }
                        for (var s = 0; s < this.size; s++)
                            GameField.grid[position.x + s, position.y].ship == this;
                        break;
                    case "v":
                        for (var s = 0; s < this.size; s++) {
                            if (GameField.grid[position.x, position.y + s].ship != null) {
                                console.log("Placing ship onto another ship");
                                return false;
                            }
                        }
                        for (var s = 0; s < this.size; s++)
                            GameField.grid[position.x, position.y + s].ship == this;
                        break;
                    default:
                        console.log("Ship orientation cannot be " + orientation);
                        return false;
                }
                this.position = position;
                this.orientation = orientation;
            }
            else {
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
var GameField = {
    homeField: [10, 10],
    attackField: [10, 10],
    ships: constructShips(),
    getShip: function (position) {
        if (position.x >= 0 && position.x <= 10 && position.y <= 10 && position.y >= 0)
            return this.grid[position.x, position.y].ship;
        else {
            console.log("Position invalid");
            return null;
        }
    },
    registerMove: function (move) {
        if (move.X != null && move.Y != null) {
            var cell = this.homeField[move.X, move.Y];
            if (move.type === "HIT") {
                cell.hit = true;
                this.apply(move);
            }
            else if (move.type === "MISS") {
                cell.miss = true;
                this.apply(move);
            }
        }
        else {
            console.log("What in hell is this move?");
        }
    },
    registerAttack: function (move) {
        if (move.X != null && move.Y != null) {
            if (move.X >= 0 && move.X < 9 && move.Y >= 0 && move.Y < 10) {
                this.homeField[move.X, move.Y].attacked = true;
                this.apply(move);
                return true;
            }
        }
        return false;
    },
    apply: function (move) {
        if (move.type === "Primal") {
            var element = document.getElementById("attackField:" + move.X + "x" + move.Y);
            if (!element.classList.contains("attacked"))
                element.classList.add("attacked");
            else
                console.log("Another big big problem!");
        }
        else if (move.type === "HIT") {
            var element = document.getElementById("playerField:" + move.X + "x" + move.Y);
            if (!element.classList.contains("hit"))
                element.classList.add("hit");
            else
                console.log("big problem!");

        }
        else if (move.type === "MISS") {
            var element = document.getElementById("playerField:" + move.X + "x" + move.Y);
            if (!element.classList.contains("miss"))
                element.classList.add("miss");
            else
                console.log("big big problem!");

        }
        else
            console.log("Big fat error!!!");
    },
    refresh: function () {
        for (var s = 0; s < 10; s++) {
            for (var t = 0; t < 10; t++) {
                var element = document.getElementById("playerField:" + move.X + "x" + move.Y);
                element.classList.remove("hit");
                element.classList.remove("miss");
                element = document.getElementById("attackField:" + move.X + "x" + move.Y);
                element.classList.remove("attacked");
            }
        }
        for(s in Game.moves){
            this.apply(s);
        }
    }
}
function constructShips() {
    var ret = [];
    for (var s = 0; s < 5; s++) {
        ret.push(new Ship(s));
    }
    return ret;
}
var Pointer = {
    element: document.getElementById("shipPlace"),
    size: null
}