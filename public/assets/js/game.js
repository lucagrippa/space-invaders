// Player 1 Controls Key Codes
const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_UP = 38;
const KEY_CODE_DOWN = 40;
const KEY_CODE_SPACE = 32;

// Player 2 Controls Key Codes
const KEY_CODE_A = 65;
const KEY_CODE_D = 68;
const KEY_CODE_W = 87;
const KEY_CODE_S = 83;
const KEY_CODE_SHIFT = 16;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Player Constants
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 35;
const PLAYER_TRAVEL_HEIGHT = 125;
const PLAYER_MAX_SPEED = 250;

// Laser Constants
const LASER_MAX_SPEED = 300;
const LASER_COOLDOWN = 0.25;
const LASER_LENGTH = 27;

// Enemy Constants
const ENEMIES_PER_ROW = 10;
const ENEMY_HORIZONTAL_PADDING = 80;
const ENEMY_VERTICAL_PADDING = 70;
const ENEMY_VERTICAL_SPACING = 80;
const ENEMY_COOLDOWN = 10.0;

const GAME_STATE = {
    lastTime: Date.now(),
    gameOver: false,
    playersRemaining: 2,
    player1Remaining: true,
    player2Remaining: true,

    // Player 1
    score1: 0,
    leftPressed: false,
    rightPressed: false,
    upPressed: false,
    downPressed: false,
    spacePressed: false,
    player1X: 0,
    player1Y: 0,
    player1Cooldown: 0,
    lasers1: [],

    // Player 2
    score2: 0,
    aPressed: false,
    dPressed: false,
    wPressed: false,
    sPressed: false,
    shiftPressed: false,
    player2X: 0,
    player2Y: 0,
    player2Cooldown: 0,
    lasers2: [],

    // Enemies
    enemies: [],
    enemyLasers: []
};

function objectsIntersect(o1, o2) {
    return !(
        o1.left > o2.right ||
        o1.right < o2.left ||
        o1.top > o2.bottom ||
        o1.bottom < o2.top
    );
}

// sets the CSS transform attribute
function setPosition($element, x, y) {
    // CSS transform to set space ship position
    $element.style.transform = `translate(${x}px, ${y}px)`;
}

// Prevents the player from moving off screen in the x direction
function clampX(xloc, xmin, xmax) {
    if (xloc < xmin) {
        return xmin;
    } else if (xloc > xmax) {
        return xmax;
    } else {
        return xloc;
    }
}

// Prevents the player from moving off screen in the y direction
function clampY(yloc, ymin, ymax) {
    if (yloc < ymin) {
        return ymin;
    } else if (yloc > ymax) {
        return ymax;
    } else {
        return yloc;
    }
}

function rand(min, max) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
    return min + Math.random() * (max - min);
}


function createScoreboard($container) {
    const $scoreboard = document.createElement("section");
    const $gameWrapper = document.querySelector(".game-wrapper");
    $scoreboard.className = "scoreboard";
    $scoreboard.innerHTML = "Player 1:  <strong>" + GAME_STATE.score1 +
        " pts</strong> -  Player 2:  <strong>" + GAME_STATE.score2 + " pts</strong>";
    $gameWrapper.insertBefore($scoreboard, $gameWrapper.childNodes[0]);
}

function createPlayers($container) {
    // Player 1
    GAME_STATE.player1X = GAME_WIDTH / 4;
    GAME_STATE.player1Y = GAME_HEIGHT - 50;
    const $player1 = document.createElement("img");
    $player1.src = "assets/images/player/player-green-2.png";
    $player1.className = "player player1";
    $container.appendChild($player1);
    setPosition($player1, GAME_STATE.player1X, GAME_STATE.player1Y);

    // Player 2
    GAME_STATE.player2X = (GAME_WIDTH * 3) / 4;
    GAME_STATE.player2Y = GAME_HEIGHT - 50;
    const $player2 = document.createElement("img");
    $player2.src = "assets/images/player/player-orange-3.png";
    $player2.className = "player player2";
    $container.appendChild($player2);
    setPosition($player2, GAME_STATE.player2X, GAME_STATE.player2Y);
}

function createLaser($container, xloc, yloc, keyCode) {
    const $element = document.createElement("img");
    $element.className = "laser";

    if (keyCode === KEY_CODE_SPACE) {
        $element.src = "assets/images/laser/laser-green-13.png";
        $container.appendChild($element);
        const laser = {
            xloc,
            yloc,
            $element
        };
        GAME_STATE.lasers1.push(laser);
    } else if (keyCode === KEY_CODE_SHIFT) {
        $element.src = "assets/images/laser/laser-red-7.png";
        $container.appendChild($element);
        const laser = {
            xloc,
            yloc,
            $element
        };
        GAME_STATE.lasers2.push(laser);
    }

    setPosition($element, xloc, yloc);
    // const audio = new Audio("assets/sound/sfx-laser1.ogg");
    // audio.play();
}

function createEnemy($container, xloc, yloc) {
    const randEnemies = [];
    for (let i = 1; i < 21; i++) {
        const $element = document.createElement("img");
        $element.src = "assets/images/enemy/enemy-" + i + ".png";
        $element.className = "enemy";
        randEnemies.push($element);
    }
    const $element = randEnemies[Math.floor(Math.random() * 20)];
    $container.appendChild($element);
    const enemy = {
        xloc,
        yloc,
        cooldown: rand(0.5, ENEMY_COOLDOWN),
        $element
    };
    GAME_STATE.enemies.push(enemy);
    setPosition($element, xloc, yloc);
}

function createEnemyLaser($container, x, y) {
    const $element = document.createElement("img");
    $element.src = "assets/images/laser/laser-red-7.png";
    $element.className = "enemy-laser";
    $container.appendChild($element);
    const laser = {
        x,
        y,
        $element
    };
    GAME_STATE.enemyLasers.push(laser);
    setPosition($element, x, y);
}

function init() {
    const $container = document.querySelector(".game");
    const $wrap = document.querySelector(".wrap");
    createScoreboard($wrap);
    // we will be needing the container so its good to pass it around so we
    // will only need to retrieve it once
    createPlayers($container);

    const enemySpacing = (GAME_WIDTH - ENEMY_HORIZONTAL_PADDING * 2) /
        (ENEMIES_PER_ROW - 1);
    for (let j = 0; j < 3; j++) {
        const yloc = ENEMY_VERTICAL_PADDING + j * ENEMY_VERTICAL_SPACING;
        for (let k = 0; k < ENEMIES_PER_ROW; k++) {
            const xloc = k * enemySpacing + ENEMY_HORIZONTAL_PADDING;
            createEnemy($container, xloc, yloc);
        }
    }

}

function playerHasWon() {
    return GAME_STATE.enemies.length === 0;
}

function playerHasLost() {
    return GAME_STATE.playersRemaining === 0;
}

/*------------ UPDATE FUNCTIONS ------------*/

function updateScoreboard(player) {
    const $scoreboard = document.querySelector(".scoreboard");
    if (player === "player1") {
        GAME_STATE.score1 += 10;
        $scoreboard.innerHTML = "Player 1:" + GAME_STATE.score1 +
            " pts -  Player 2: " + GAME_STATE.score2 + " pts";
    } else if (player === "player2") {
        GAME_STATE.score2 += 10;
        $scoreboard.innerHTML = "Player 1:" + GAME_STATE.score1 +
            " pts -  Player 2: " + GAME_STATE.score2 + " pts";
    }
}

function updatePlayer1(deltaTime, $container) {
    // Update location
    if (GAME_STATE.leftPressed) {
        GAME_STATE.player1X -= deltaTime * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.rightPressed) {
        GAME_STATE.player1X += deltaTime * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.upPressed) {
        GAME_STATE.player1Y -= deltaTime * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.downPressed) {
        GAME_STATE.player1Y += deltaTime * PLAYER_MAX_SPEED;
    }

    GAME_STATE.player1X = clampX(
        GAME_STATE.player1X,
        PLAYER_WIDTH,
        GAME_WIDTH - PLAYER_WIDTH
    );
    GAME_STATE.player1Y = clampY(
        GAME_STATE.player1Y,
        GAME_HEIGHT - PLAYER_TRAVEL_HEIGHT,
        GAME_HEIGHT - PLAYER_HEIGHT
    );

    // Shoot lasers
    if (GAME_STATE.spacePressed && GAME_STATE.player1Cooldown <= 0) {
        createLaser($container, GAME_STATE.player1X, GAME_STATE.player1Y, KEY_CODE_SPACE);
        GAME_STATE.player1Cooldown = LASER_COOLDOWN;
    }

    // Update cooldown
    if (GAME_STATE.player1Cooldown > 0) {
        GAME_STATE.player1Cooldown -= deltaTime;
    }

    const $player1 = document.querySelector(".player1");
    setPosition($player1, GAME_STATE.player1X, GAME_STATE.player1Y);
}

function updatePlayer2(deltaTime, $container) {
    // Update location
    if (GAME_STATE.aPressed) {
        GAME_STATE.player2X -= deltaTime * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.dPressed) {
        GAME_STATE.player2X += deltaTime * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.wPressed) {
        GAME_STATE.player2Y -= deltaTime * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.sPressed) {
        GAME_STATE.player2Y += deltaTime * PLAYER_MAX_SPEED;
    }

    GAME_STATE.player2X = clampX(
        GAME_STATE.player2X,
        PLAYER_WIDTH,
        GAME_WIDTH - PLAYER_WIDTH
    );
    GAME_STATE.player2Y = clampY(
        GAME_STATE.player2Y,
        GAME_HEIGHT - PLAYER_TRAVEL_HEIGHT,
        GAME_HEIGHT - PLAYER_HEIGHT
    );

    // Shoot lasers
    if (GAME_STATE.shiftPressed && GAME_STATE.player2Cooldown <= 0) {
        createLaser($container, GAME_STATE.player2X, GAME_STATE.player2Y, KEY_CODE_SHIFT);
        GAME_STATE.player2Cooldown = LASER_COOLDOWN;
    }

    // Update cooldown
    if (GAME_STATE.player2Cooldown > 0) {
        GAME_STATE.player2Cooldown -= deltaTime;
    }



    const $player2 = document.querySelector(".player2");
    setPosition($player2, GAME_STATE.player2X, GAME_STATE.player2Y);
}

function updateLasers(deltaTime, $container) {
    const lasers1 = GAME_STATE.lasers1;
    const lasers2 = GAME_STATE.lasers2;

    for (let i = 0; i < lasers1.length; i++) {
        const laser1 = lasers1[i];
        laser1.yloc -= deltaTime * LASER_MAX_SPEED;

        if (laser1.yloc < 0) {
            destroyLaser($container, laser1);
        }

        setPosition(laser1.$element, laser1.xloc, laser1.yloc);
        const o1 = laser1.$element.getBoundingClientRect();
        const enemies = GAME_STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (enemy.isDead) continue;
            const o2 = enemy.$element.getBoundingClientRect();
            if (objectsIntersect(o1, o2)) {
                // enemy was hit
                destroyEnemy($container, enemy);
                destroyLaser($container, laser1);
                updateScoreboard("player1");
                break;
            }
        }
    }

    for (let p = 0; p < lasers2.length; p++) {
        const laser2 = lasers2[p];
        laser2.yloc -= deltaTime * LASER_MAX_SPEED;

        if (laser2.yloc < 0) {
            destroyLaser($container, laser2);
        }

        setPosition(laser2.$element, laser2.xloc, laser2.yloc);
        const o1 = laser2.$element.getBoundingClientRect();
        const enemies = GAME_STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (enemy.isDead) continue;
            const o2 = enemy.$element.getBoundingClientRect();
            if (objectsIntersect(o1, o2)) {
                // enemy was hit
                destroyEnemy($container, enemy);
                destroyLaser($container, laser2);
                updateScoreboard("player2");
                break;
            }
        }
    }

    GAME_STATE.lasers1 = GAME_STATE.lasers1.filter(e => !e.isDead);
    GAME_STATE.lasers2 = GAME_STATE.lasers2.filter(e => !e.isDead);
}



function updateEnemies(deltaTime, $container) {
    const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 50;
    const dy = Math.cos(GAME_STATE.lastTime / 1000.0) * 10;

    const enemies = GAME_STATE.enemies;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const xloc = enemy.xloc + dx;
        const yloc = enemy.yloc + dy;
        setPosition(enemy.$element, xloc, yloc);
        enemy.cooldown -= deltaTime;
        if (enemy.cooldown <= 0) {
            createEnemyLaser($container, xloc, yloc);
            enemy.cooldown = ENEMY_COOLDOWN;
        }
    }

    GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);

    if (playerHasWon()) {
        GAME_STATE.gameOver = true;
        document.querySelector(".congratulations").style.display = "block";
        return;
    }

    if (playerHasLost()) {
        GAME_STATE.gameOver = true;
        document.querySelector(".game-over").style.display = "block";
        return;
    }
}

function updateEnemyLasers(deltaTime, $container) {
    const lasers = GAME_STATE.enemyLasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y += deltaTime * LASER_MAX_SPEED;
        if (laser.y > GAME_HEIGHT - LASER_LENGTH) {
            destroyLaser($container, laser);
        }
        setPosition(laser.$element, laser.x, laser.y);
        const o1 = laser.$element.getBoundingClientRect();

        if (GAME_STATE.player1Remaining) {
            // Test if player1 was hit
            const player1 = document.querySelector(".player1");
            const o2 = player1.getBoundingClientRect();
            if (objectsIntersect(o1, o2)) {
                // Player1 was hit
                GAME_STATE.player1Remaining = false;
                destroyPlayer($container, player1);
                break;
            }
        }
        // Test if player2 was hit
        if (GAME_STATE.player2Remaining) {
            const player2 = document.querySelector(".player2");
            const o3 = player2.getBoundingClientRect();
            if (objectsIntersect(o1, o3)) {
                // Player 2 was hit
                GAME_STATE.player2Remaining = false;
                destroyPlayer($container, player2)
                break;
            }
        }
    }
    GAME_STATE.enemyLasers = GAME_STATE.enemyLasers.filter(e => !e.isDead);
}

function update() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - GAME_STATE.lastTime) / 1000;

    const $container = document.querySelector(".game");

    if (GAME_STATE.gameOver) {
        return;
    }

    if (GAME_STATE.playersRemaining == 2) {
        updatePlayer1(deltaTime, $container);
        updatePlayer2(deltaTime, $container);
    } else if (GAME_STATE.playersRemaining == 1 && GAME_STATE.player1Remaining) {
        updatePlayer1(deltaTime, $container);
    } else if (GAME_STATE.playersRemaining == 1 && GAME_STATE.player2Remaining) {
        updatePlayer2(deltaTime, $container);
    }

    updateLasers(deltaTime, $container);
    updateEnemies(deltaTime, $container);
    updateEnemyLasers(deltaTime, $container);

    GAME_STATE.lastTime = currentTime;
    window.requestAnimationFrame(update);
}


/*------------ DESTROY FUNCTIONS ------------*/

function destroyLaser($container, laser) {
    $container.removeChild(laser.$element);
    laser.isDead = true;
}

function destroyEnemy($container, enemy) {
    $container.removeChild(enemy.$element);
    enemy.isDead = true;
}

function destroyPlayer($container, player) {
    $container.removeChild(player);
    if (GAME_STATE.playersRemaining == 2) {
        GAME_STATE.playersRemaining -= 1;
    } else {
        GAME_STATE.playersRemaining = 0;
    }
    // const audio = new Audio("sound/sfx-lose.ogg");
    // audio.play();
}


/*------------ KEY EVENT HANDLERS ------------*/

function onKeyDown(e) {
    switch (e.keyCode) {
        case KEY_CODE_LEFT:
            GAME_STATE.leftPressed = true;
            break;
        case KEY_CODE_RIGHT:
            GAME_STATE.rightPressed = true;
            break;
        case KEY_CODE_UP:
            GAME_STATE.upPressed = true;
            break;
        case KEY_CODE_DOWN:
            GAME_STATE.downPressed = true;
            break;
        case KEY_CODE_SPACE:
            GAME_STATE.spacePressed = true;
            break;
        case KEY_CODE_A:
            GAME_STATE.aPressed = true;
            break;
        case KEY_CODE_D:
            GAME_STATE.dPressed = true;
            break;
        case KEY_CODE_W:
            GAME_STATE.wPressed = true;
            break;
        case KEY_CODE_S:
            GAME_STATE.sPressed = true;
            break;
        case KEY_CODE_SHIFT:
            GAME_STATE.shiftPressed = true;
            break;
    }
}

function onKeyUp(e) {
    switch (e.keyCode) {
        case KEY_CODE_LEFT:
            GAME_STATE.leftPressed = false;
            break;
        case KEY_CODE_RIGHT:
            GAME_STATE.rightPressed = false;
            break;
        case KEY_CODE_UP:
            GAME_STATE.upPressed = false;
            break;
        case KEY_CODE_DOWN:
            GAME_STATE.downPressed = false;
            break;
        case KEY_CODE_SPACE:
            GAME_STATE.spacePressed = false;
            break;
        case KEY_CODE_A:
            GAME_STATE.aPressed = false;
            break;
        case KEY_CODE_D:
            GAME_STATE.dPressed = false;
            break;
        case KEY_CODE_W:
            GAME_STATE.wPressed = false;
            break;
        case KEY_CODE_S:
            GAME_STATE.sPressed = false;
            break;
        case KEY_CODE_SHIFT:
            GAME_STATE.shiftPressed = false;
            break;
    }
}

init();

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.requestAnimationFrame(update);