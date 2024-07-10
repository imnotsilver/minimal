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

let player = { x: 225, y: 425, width: 50, height: 50 };
let objects = [];
let powerUps = [];
let gameInterval;
let powerUpInterval;
let isGameOver = false;
let score = 0;
let difficulty = 'normal';
let spawnRate;
let objectSpeed;
let keys = {};
let speedBoostActive = false;
let shieldActive = false;

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
    startScreen.style.display = 'flex';
});

backToMenuButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

document.addEventListener('keydown', (event) => keys[event.key] = true);
document.addEventListener('keyup', (event) => keys[event.key] = false);

function startGame() {
    canvas.style.display = 'block';
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height - 4;
    objects = [];
    powerUps = [];
    score = 0;
    isGameOver = false;
    speedBoostActive = false;
    shieldActive = false;

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
    powerUpInterval = setInterval(spawnPowerUp, 12000); // Spawn a power-up every 15 seconds
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

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawPlayer() {
    if (shieldActive) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (speedBoostActive) {
        drawTrail();
    }

    ctx.fillStyle = 'blue';
    drawRoundedRect(player.x, player.y, player.width, player.height, 10); // Adjust the radius as needed
    ctx.fill();
}

function drawTrail() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 1; i < trail.length; i++) {
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.stroke();
}

function updatePlayerPosition() {
    let speed = speedBoostActive ? 10 : 5;
    lastPosition.x = player.x;
    lastPosition.y = player.y;

    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += speed;
    }

    if (speedBoostActive) {
        if (player.x < lastPosition.x) {
            // Moving left
            addTrail(player.x + player.width, player.y + player.height / 2);
        } else if (player.x > lastPosition.x) {
            // Moving right
            addTrail(player.x, player.y + player.height / 2);
        }
    }
}

function addTrail(x, y) {
    trail.push({ x, y });
    if (trail.length > 10) {
        trail.shift();
    }
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
        ctx.fillStyle = powerUp.type === 'speed' ? 'green' : 'yellow';
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.size, powerUp.size);

        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        }
    });
}

function spawnPowerUp() {
    const type = Math.random() < 0.5 ? 'speed' : 'shield';
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
            if (shieldActive) {
                shieldActive = false; // Use up the shield
                objects.splice(objects.indexOf(obj), 1); // Remove the object
            } else {
                gameOver();
            }
        }
    });
}

function checkPowerUpCollision() {
    powerUps.forEach((powerUp, index) => {
        if (
            player.x < powerUp.x + powerUp.size &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.size &&
            player.y + player.height > powerUp.y
        ) {
            if (powerUp.type === 'speed') {
                activateSpeedBoost();
            } else if (powerUp.type === 'shield') {
                activateShield();
            }
            powerUps.splice(index, 1); // Remove the power-up
        }
    });
}

function activateSpeedBoost() {
    speedBoostActive = true;
    setTimeout(() => {
        speedBoostActive = false;
    }, 7000); // Speed boost lasts for 7 seconds
}

function activateShield() {
    shieldActive = true;
    setTimeout(() => {
        shieldActive = false;
    }, 9000); // Shield lasts for 9 seconds
}

function updateScore() {
    score += 1;
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('SCORE: ' + score, canvas.width - 490, 25);
}

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(powerUpInterval);
    isGameOver = true;
    canvas.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    finalScore.textContent = 'SCORE: ' + score;
}
