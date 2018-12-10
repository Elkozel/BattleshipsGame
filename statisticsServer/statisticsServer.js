var statisticsServer = {
    playersOnline: 0,
    gamesPlayed: 0,
    gamesTotal: 0,
    gameServer: null,
    frequency: null,
    start: function(gameServer, frequency = 1000){
        this.gameServer = gameServer;
        this.frequency = frequency;
        var server = this;
        setInterval(function(){
            server.update();
        },frequency)
    },
    update: function(){
        if(this.gameServer != null){
            this.playersOnline = this.gameServer.players.length;
            this.gamesPlayed = this.gameServer.games.length;
            this.gamesTotal = this.gameServer.gamesTotal
        }
        else
            console.log("Error with statistics Server!");
    },
    getStats: function(){
        var ret = {
            playersOnline: this.playersOnline,
            gamesPlayed: this.gamesPlayed,
            gamesTotal: this.gamesTotal,
            frequency: this.frequency
        }
        return ret;
    },
    processRequest: function(connection){
        if(this.gameServer != null){
            var stats = {
                stats: this.getStats()
            }
            connection.send(JSON.stringify(stats));
        }
        else
            console.log("Error with statistics Server!");


    }
}
module.exports = statisticsServer;