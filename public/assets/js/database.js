function writeUserData(teamName, time, player1Score, player2Score) {
    firebase.database().ref('scoreboard/' + teamName + Date.now()).set({
        teamName: teamName,
        time: time,
        player1Score: player1Score,
        player2Score: player2Score,
    });
}

function readUserData() {
    var topUserPostsRef = firebase.database().ref('scoreboard/').orderByChild('time');
    console.log(topUserPostsRef);
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