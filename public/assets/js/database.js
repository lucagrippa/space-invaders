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
    let i = 1;
    console.log("reading user data");
    firebase.database().ref('scoreboard').orderByChild("time").limitToFirst(10).once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            populateScoreboard(childData, i);
            console.log(childKey);
            console.log(childData);
            console.log(typeof childData);

            i++;
        });
    });
}

function populateScoreboard(data, row) {
    document.querySelector(".row" + row + ".column1").innerHTML = data.teamName;
    document.querySelector(".row" + row + ".column2").innerHTML = data.time;
    document.querySelector(".row" + row + ".column3").innerHTML = data.player1Score;
    document.querySelector(".row" + row + ".column4").innerHTML = data.player2Score;
}

// function populateScoreboard() {
//     for (let i = 1; i < 11; i++) {
//         for (let p = 1; p < 5; p++) {
//             //document.querySelector(".row" + i + ".column" + p).value = ;
//         }
//     }
// }