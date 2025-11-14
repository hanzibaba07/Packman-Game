const main = document.querySelector('main');

const baseMaze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const enemyPositions = [
    [[6, 5]],
    [[6, 5], [1, 8]],
    [[6, 5], [1, 8], [8, 3]],
    [[6, 5], [1, 8], [8, 3], [3, 7]],
    [[6, 5], [1, 8], [8, 3], [3, 7]]
];

let currentLevel = 0;
const maxLevel = enemyPositions.length;

function getMazeForLevel(level) {
    let newMaze = JSON.parse(JSON.stringify(baseMaze));
    enemyPositions[level].forEach(([row, col]) => {
        newMaze[row][col] = 3;
    });
    newMaze[1][1] = 2;
    return newMaze;
}

maze = getMazeForLevel(currentLevel);
const originalMaze = JSON.parse(JSON.stringify(maze));

let enemies = [];
let enemyMoveInterval = null;

function initEnemiesForLevel(level) {
    enemies = enemyPositions[level].map(([row, col]) => ({
        row,
        col,
        dir: 1,
        wasOnPoint: false
    }));
}

function moveEnemies() {
    for (const enemy of enemies) {
        if (enemy.wasOnPoint) {
            maze[enemy.row][enemy.col] = 0;
        } else if (maze[enemy.row][enemy.col] === 3) {
            maze[enemy.row][enemy.col] = -1;
        }
    }
    for (const enemy of enemies) {
        let nextCol = enemy.col + enemy.dir;
        if (
            nextCol < 0 ||
            nextCol >= maze[0].length ||
            maze[enemy.row][nextCol] === 1
        ) {
            enemy.dir *= -1;
            nextCol = enemy.col + enemy.dir;
        }
        if (
            nextCol >= 0 &&
            nextCol < maze[0].length &&
            maze[enemy.row][nextCol] !== 1
        ) {
            enemy.wasOnPoint = (maze[enemy.row][nextCol] === 0);
            enemy.col = nextCol;
        } else {
            enemy.wasOnPoint = false;
        }
    }
    for (const enemy of enemies) {
        maze[enemy.row][enemy.col] = 3;
    }
    updateEnemyBlocks();
    checkEnemyCollision();
}

function updateEnemyBlocks() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const idx = y * maze[0].length + x;
            const block = main.children[idx];
            if (block) block.classList.remove('enemy');
            if (maze[y][x] === 0 && block) {
                block.classList.add('point');
                block.style.height = '1vh';
                block.style.width = '1vh';
                block.innerHTML = '';
            } else if (maze[y][x] === 4 && block) {
                block.classList.remove('point');
                block.style.height = '';
                block.style.width = '';
                block.innerHTML = '';
                const dot = document.createElement('div');
                dot.className = 'extra-life-dot';
                block.appendChild(dot);
            } else if (block) {
                block.classList.remove('point');
                block.style.height = '';
                block.style.width = '';
                block.innerHTML = '';
            }
        }
    }
    for (const enemy of enemies) {
        const idx = enemy.row * maze[0].length + enemy.col;
        const block = main.children[idx];
        if (block) block.classList.add('enemy');
    }
}

function startEnemyMovement() {
    if (enemyMoveInterval) clearInterval(enemyMoveInterval);
    enemyMoveInterval = setInterval(() => {
        if (gameStarted) moveEnemies();
    }, 500);
}

function stopEnemyMovement() {
    if (enemyMoveInterval) clearInterval(enemyMoveInterval);
    enemyMoveInterval = null;
}

function generateMaze() {
    main.innerHTML = '';
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            let block = document.createElement('div');
            block.classList.add('block');
            block.innerHTML = '';
            if (maze[y][x] === 1) {
                block.classList.add('wall');
            } else if (maze[y][x] === 3) {
                block.classList.add('enemy');
            } else if (maze[y][x] === 0) {
                block.classList.add('point');
                block.style.height = '1vh';
                block.style.width = '1vh';
            } else if (maze[y][x] === 4) {
                block.innerHTML = '';
                const dot = document.createElement('div');
                dot.className = 'extra-life-dot';
                block.appendChild(dot);
            }
            main.appendChild(block);
        }
    }
    updateEnemyBlocks();
}

for (let y = 0; y < maze.length; y++)
    for (let x = 0; x < maze[y].length; x++) {
        let block = document.createElement('div');
        block.classList.add('block');
        if (maze[y][x] === 1) {
            block.classList.add('wall');
        } else if (maze[y][x] === 3) {
            block.classList.add('enemy');
        } else if (maze[y][x] === 0) {
            block.classList.add('point');
            block.style.height = '1vh';
            block.style.width = '1vh';
        }
        main.appendChild(block);
    }

const player = document.createElement('div');
player.id = 'player';
const playerMouth = document.createElement('div');
playerMouth.classList.add('mouth');
player.appendChild(playerMouth);
main.appendChild(player);

let playerRow = 1;
let playerCol = 1;
const CELL_SIZE = 64;

player.style.position = 'absolute';
player.style.width = CELL_SIZE + 'px';
player.style.height = CELL_SIZE + 'px';
player.style.top = playerRow * CELL_SIZE + 'px';
player.style.left = playerCol * CELL_SIZE + 'px';

let score = 0;
const scoreDisplay = document.querySelector('.score p');

let lives = 3;
const livesList = document.querySelectorAll('.lives li');

let extraLife = null;
let extraLifeColorIndex = 0;
const extraLifeColors = ['red', 'orange', 'green', 'yellow'];
function getNextExtraLifeColor() {
    const color = extraLifeColors[extraLifeColorIndex];
    extraLifeColorIndex = (extraLifeColorIndex + 1) % extraLifeColors.length;
    return color;
}

function spawnExtraLife() {
    let available = [];
    for (let y = 0; y < maze.length; y++)
        for (let x = 0; x < maze[y].length; x++)
            if (maze[y][x] === 0) available.push([y, x]);
    if (available.length > 0) {
        const [row, col] = available[Math.floor(Math.random() * available.length)];
        maze[row][col] = 4;
        extraLife = { row, col };
        updateExtraLifeBlock(row, col);
    }
}

function updateExtraLifeBlock(row, col) {
    const idx = row * maze[0].length + col;
    const block = main.children[idx];
    if (block) {
        block.classList.remove('point');
        block.style.height = '';
        block.style.width = '';
        block.innerHTML = '';
        const dot = document.createElement('div');
        dot.className = 'extra-life-dot';
        block.appendChild(dot);
    }
}

function clearExtraLifeBlock(row, col) {
    const idx = row * maze[0].length + col;
    const block = main.children[idx];
    if (block) block.innerHTML = '';
}

function isWall(row, col) {
    if (row < 0 || row >= maze.length || col < 0 || col >= maze[0].length) return true;
    return maze[row][col] === 1;
}

function allPointsCollected() {
    for (let y = 0; y < maze.length; y++)
        for (let x = 0; x < maze[y].length; x++)
            if (maze[y][x] === 0) return false;
    return true;
}

function removePointIfPresent() {
    const blockIndex = playerRow * maze[0].length + playerCol;
    const block = main.children[blockIndex];

    if (maze[playerRow][playerCol] === 4) {
        maze[playerRow][playerCol] = -1;
        clearExtraLifeBlock(playerRow, playerCol);
        extraLife = null;
        lives = Math.min(lives + 1, 3);
        updateLivesDisplay();
        return;
    }

    if (maze[playerRow][playerCol] === 0 && block.classList.contains('point')) {
        block.classList.remove('point');
        maze[playerRow][playerCol] = -1;
        score += 10;
        scoreDisplay.textContent = score;
        if (allPointsCollected()) {
            if (currentLevel < maxLevel - 1) {
                currentLevel++;
                maze = getMazeForLevel(currentLevel);
                generateMaze();
                playerRow = 1;
                playerCol = 1;
                player.style.top = playerRow * CELL_SIZE + 'px';
                player.style.left = playerCol * CELL_SIZE + 'px';
                main.appendChild(player);
                initEnemiesForLevel(currentLevel);
                startEnemyMovement();
                showLevelMessage(currentLevel);
                extraLife = null;
            } else {
                showGameOver('You collected all the points!');
                gameStarted = false;
                stopEnemyMovement();
            }
        }
    }
}

function updateLivesDisplay() {
    for (let i = 0; i < livesList.length; i++)
        livesList[i].style.visibility = i < lives ? 'visible' : 'hidden';
}

function setEnemiesHidden(hidden) {
    for (const enemy of enemies) {
        const idx = enemy.row * maze[0].length + enemy.col;
        const block = main.children[idx];
        if (block) {
            if (hidden) block.classList.add('hidden');
            else block.classList.remove('hidden');
        }
    }
}

function checkEnemyCollision() {
    for (const enemy of enemies) {
        if (enemy.row === playerRow && enemy.col === playerCol) {
            lives--;
            updateLivesDisplay();
            player.classList.add('dead');
            setEnemiesHidden(true);
            gameStarted = false;
            stopEnemyMovement();

            const DEATH_ANIMATION_DURATION = 1500;

            if (lives === 1 && !extraLife) {
                spawnExtraLife();
            }

            if (lives > 0) {
                setTimeout(() => {
                    player.classList.remove('dead');
                    playerRow = 1;
                    playerCol = 1;
                    player.style.top = playerRow * CELL_SIZE + 'px';
                    player.style.left = playerCol * CELL_SIZE + 'px';
                    setEnemiesHidden(false);
                    gameStarted = true;
                    startEnemyMovement();
                }, DEATH_ANIMATION_DURATION);
            } else {
                setTimeout(() => {
                    setEnemiesHidden(false);
                    showGameOver('You lost all your lives!');
                    stopEnemyMovement();
                }, DEATH_ANIMATION_DURATION);
            }
            return;
        }
    }
}

function showGameOver(message) {
    const gameOverDiv = document.getElementById('gameOverMessage');
    if (gameOverDiv) {
        gameOverDiv.style.display = 'flex';
        gameOverDiv.querySelector('h1').textContent = 'Game Over!';
        gameOverDiv.querySelector('p').textContent = message;
    }
    showNamePopup(score);
    stopEnemyMovement();
}

function showNamePopup(finalScore) {
    const popup = document.getElementById('namePopup');
    const input = document.getElementById('playerNameInput');
    popup.style.display = 'flex';
    input.value = '';
    input.focus();

    function submitHandler() {
        let playerName = input.value.trim() || "Anonymous";
        saveScoreToLeaderboard(playerName, finalScore);
        popup.style.display = 'none';
        updateLeaderboard();
        document.getElementById('submitNameBtn').removeEventListener('click', submitHandler);
    }

    document.getElementById('submitNameBtn').addEventListener('click', submitHandler);

    input.onkeydown = function(e) {
        if (e.key === "Enter") {
            submitHandler();
        }
    };
}

function saveScoreToLeaderboard(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || "[]");
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function updateLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || "[]");
    const ol = document.querySelector('.leaderboard ol');
    ol.innerHTML = "";
    leaderboard.forEach((entry, idx) => {
        const li = document.createElement('li');
        let displayName = entry.name.length > 16 ? entry.name.slice(0, 15) + "…" : entry.name;
        li.innerHTML = `<span style="display:inline-block; max-width: 180px; overflow:hidden; text-overflow:ellipsis; vertical-align:middle;">${idx + 1}. ${displayName}</span>
                        <span style="float:right; margin-left:10px;">${entry.score}</span>`;
        ol.appendChild(li);
    });
}

updateLeaderboard();

initEnemiesForLevel(currentLevel);
startEnemyMovement();

function keyDown(event) {
    if (!gameStarted) return;

    let moved = false;
    let newRow = playerRow;
    let newCol = playerCol;

    if (event.key === 'ArrowUp') {
        newRow = playerRow - 1;
        if (!isWall(newRow, playerCol)) {
            playerRow = newRow;
            moved = true;
            playerMouth.classList = 'mouth up';
        }
    } else if (event.key === 'ArrowDown') {
        newRow = playerRow + 1;
        if (!isWall(newRow, playerCol)) {
            playerRow = newRow;
            moved = true;
            playerMouth.classList = 'mouth down';
        }
    } else if (event.key === 'ArrowLeft') {
        newCol = playerCol - 1;
        if (!isWall(playerRow, newCol)) {
            playerCol = newCol;
            moved = true;
            playerMouth.classList = 'mouth left';
        }
    } else if (event.key === 'ArrowRight') {
        newCol = playerCol + 1;
        if (!isWall(playerRow, newCol)) {
            playerCol = newCol;
            moved = true;
            playerMouth.classList = 'mouth right';
        }
    }

    if (moved) {
        player.style.top = playerRow * CELL_SIZE + 'px';
        player.style.left = playerCol * CELL_SIZE + 'px';
        removePointIfPresent();
        checkEnemyCollision();
    }
}

document.addEventListener('keydown', keyDown);

document.querySelector('.startDiv .start').addEventListener('click', function() {
    document.querySelector('.startDiv').style.display = 'none';
    gameStarted = true;
    startEnemyMovement();
});

document.getElementById('playAgainBtn').addEventListener('click', function () {
    currentLevel = 0;
    maze = getMazeForLevel(currentLevel);
    generateMaze();
    playerRow = 1;
    playerCol = 1;
    player.classList.remove('dead');
    player.style.top = playerRow * CELL_SIZE + 'px';
    player.style.left = playerCol * CELL_SIZE + 'px';
    main.appendChild(player);
    score = 0;
    scoreDisplay.textContent = score;
    lives = 3;
    updateLivesDisplay();
    const gameOverDiv = document.getElementById('gameOverMessage');
    if (gameOverDiv) {
        gameOverDiv.style.display = 'none';
    }
    initEnemiesForLevel(currentLevel);
    startEnemyMovement();
    gameStarted = true;
});

function handleButtonMove(direction) {
    if (!gameStarted) return;
    let event = { key: '' };
    if (direction === 'left') event.key = 'ArrowLeft';
    else if (direction === 'up') event.key = 'ArrowUp';
    else if (direction === 'right') event.key = 'ArrowRight';
    else if (direction === 'down') event.key = 'ArrowDown';
    keyDown(event);
}

document.getElementById('lbttn').addEventListener('click', () => handleButtonMove('left'));
document.getElementById('ubttn').addEventListener('click', () => handleButtonMove('up'));
document.getElementById('rbttn').addEventListener('click', () => handleButtonMove('right'));
document.getElementById('dbttn').addEventListener('click', () => handleButtonMove('down'));

function showLevelMessage(level) {
    const levelDiv = document.getElementById('levelMessage');
    const levelTitle = document.getElementById('levelTitle');
    const levelDesc = document.getElementById('levelDesc');
    const nextLevel = level + 1;
    levelTitle.textContent = `Level ${nextLevel}`;
    if (level === 0) {
        levelDesc.textContent = "Get ready for Level 1!";
    } else {
        levelDesc.textContent = `Congratulations! You completed Level ${level}. Move to Level ${nextLevel}.`;
    }
    levelDiv.style.display = 'flex';

    function continueHandler() {
        levelDiv.style.display = 'none';
        gameStarted = true;
        startEnemyMovement();
        document.getElementById('continueLevelBtn').removeEventListener('click', continueHandler);
    }

    document.getElementById('continueLevelBtn').addEventListener('click', continueHandler);
    gameStarted = false;
    stopEnemyMovement();
}


