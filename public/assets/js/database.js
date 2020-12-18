function writeUserData(teamName, time, player1Score, player2Score) {
    firebase.database().ref('scoreboard/' + teamName + Date.now().set({
        teamName: teamName,
        time: time,
        player1Score: player1Score,
        player2Score: player2Score,
    }));
}