const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const difficultyScreen = document.getElementById('difficultyScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const playButton = document.getElementById('playButton');
const settingsButton = document.getElementById('settingsButton');
const difficultyButtons = document.querySelectorAll('.difficultyButton');
const finalScore = document.getElementById('finalScore');
const retryButton = document.getElementById('retryButton');
const backToMenuButton = document.getElementById('backToMenuButton');
const playerGif = document.getElementById('playerGif');

let player = { x: 225, y: 425, width: 50, height: 50 };
let objects = [];
let powerUps = [];
let gameInterval;
let isGameOver = false;
let score = 0;
let difficulty = 'normal';
let spawnRate;
let objectSpeed;
let keys = {};

let lastPosition = { x: player.x, y: player.y };
let trail = [];

canvas.width = 500;
canvas.height = 500;

playButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    difficultyScreen.style.display = 'flex';
});

settingsButton.addEventListener('click', () => {
    alert('Settings button clicked!');
});

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        difficulty = button.getAttribute('data-difficulty');
        difficultyScreen.style.display = 'none';
        startGame();
    });
});

retryButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startGame(); // Restart the game
});

backToMenuButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

document.addEventListener('keydown', (event) => keys[event.key] = true);
document.addEventListener('keyup', (event) => keys[event.key] = false);

function getCanvasOffset() {
    const rect = canvas.getBoundingClientRect();
    return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
}

function updatePlayerGif() {
    const offset = getCanvasOffset();
    playerGif.style.left = (player.x + offset.left) + 'px';
    playerGif.style.top = (player.y + offset.top) + 'px';
    playerGif.style.width = player.width + 'px';
    playerGif.style.height = player.height + 'px';

    // Check the direction of movement
    if (keys['ArrowLeft']) {
        playerGif.style.transform = 'scaleX(-1)'; // Flip horizontally
    } else {
        playerGif.style.transform = 'scaleX(1)'; // Reset to normal
    }

    playerGif.style.display = 'block';
}

function startGame() {
    canvas.style.display = 'block';
    playerGif.style.display = 'block'; // Show player GIF when the game starts
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 4;
    objects = [];
    powerUps = [];
    score = 0;
    isGameOver = false;

    switch (difficulty) {
        case 'easy':
            spawnRate = 0.03;
            objectSpeed = 3;
            break;
        case 'normal':
            spawnRate = 0.05;
            objectSpeed = 5;
            break;
        case 'hard':
            spawnRate = 0.1;
            objectSpeed = 7;
            break;
        case 'impossible':
            spawnRate = 5;
            objectSpeed = 5;
            break;
    }

    gameInterval = setInterval(gameLoop, 1000 / 60);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updatePlayerPosition();
    drawPlayer();
    handleObjects();
    handlePowerUps();
    checkCollision();
    checkPowerUpCollision();
    updateScore();
}

function drawPlayer() {
    // Update the position of the player GIF
    updatePlayerGif();
}

function updatePlayerPosition() {
    let speed = 5;
    lastPosition.x = player.x;
    lastPosition.y = player.y;

    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += speed;
    }

    // Update the player GIF position whenever the player moves
    updatePlayerGif();
}

function handleObjects() {
    if (Math.random() < spawnRate) {
        objects.push({ x: Math.random() * canvas.width, y: 0, size: 20 });
    }

    objects.forEach((obj, index) => {
        obj.y += objectSpeed;
        drawTriangle(obj.x, obj.y, obj.size);

        if (obj.y > canvas.height) {
            objects.splice(index, 1);
        }
    });
}

function drawTriangle(x, y, size) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(x, y + size); // Bottom point of the triangle
    ctx.lineTo(x - size / 2, y); // Top left point
    ctx.lineTo(x + size / 2, y); // Top right point
    ctx.closePath();
    ctx.fill();
}

function handlePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += objectSpeed;
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.size / 2, powerUp.y + powerUp.size / 2, powerUp.size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        }
    });
}

function spawnPowerUp() {
    // Adjust this function if you want to spawn different types of power-ups
    const type = 'some_type';
    powerUps.push({ x: Math.random() * canvas.width, y: 0, size: 20, type: type });
}

function checkCollision() {
    objects.forEach((obj) => {
        if (
            player.x < obj.x + obj.size &&
            player.x + player.width > obj.x &&
            player.y < obj.y + obj.size &&
            player.y + player.height > obj.y
        ) {
            gameOver();
        }
    });
}

function checkPowerUpCollision() {
    powerUps.forEach((powerUp, index) => {
        // Handle power-up collision here if needed
        powerUps.splice(index, 1); // Remove the power-up
    });
}

function updateScore() {
    score += 1;
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('SCORE: ' + score, 10, 25);
}

function gameOver() {
    clearInterval(gameInterval);
    isGameOver = true;
    playerGif.style.display = 'none'; // Hide player GIF when the game is over
    canvas.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    finalScore.textContent = 'SCORE: ' + score;
}
