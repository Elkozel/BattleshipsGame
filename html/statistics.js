var Statistics = {
    connection: null,
    interval: null,
    numPlayers: document.getElementById("stats_PlayersOnline"),
    numGames: document.getElementById("stats_GamesInProgress"),
    Andy: document.getElementById("stats_IsAndyPlaying"),
    start: function(connection, frequency = 1000){
        if(this.interval == null){
            this.connection = connection;
            var server = this.connection;
            this.interval = setInterval(function(){
                server.send(JSON.stringify({"stats": true}));
            }, frequency);
        }
    },
    updateStats: function(numPlayers, numGames, Andy){
        this.numGames.innerHTML = numGames;
        this.numPlayers.innerHTML = numPlayers;
        if(Andy)
            this.Andy.innerHTML = "Yes";
        else
            this.Andy.innerHTML = "No";
    }
}