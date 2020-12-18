var data;

function writeUserData(teamName, time, player1Score, player2Score) {
    firebase.database().ref('scoreboard/' + teamName + Date.now()).set({
        teamName: teamName,
        time: time,
        player1Score: player1Score,
        player2Score: player2Score,
    });
}

function readUserData() {
    console.log("reading user data");
    firebase.database().ref('scoreboard').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            console.log(childKey);
            var childData = childSnapshot.val();
            console.log(childData);
        });
    });
}

function sortData() {

}

function populateScoreboard() {
    for (let i = 1; i < 11; i++) {
        for (let p = 1; p < 5; p++) {
            //document.querySelector(".row" + i + ".column" + p).value = ;
        }
    }
}