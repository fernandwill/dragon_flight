const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Game state
let gameRunning = true;
let score = 0;
let gameSpeed = 2;

// Dragon object
const dragon = {
    x: 100,
    y: 200,
    width: 60,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 4
};

// Obstacles array
let obstacles = [];
let obstacleTimer = 0;

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Draw dragon
function drawDragon() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(dragon.x, dragon.y, dragon.width, dragon.height);
    
    // Dragon head
    ctx.fillStyle = '#654321';
    ctx.fillRect(dragon.x + dragon.width - 15, dragon.y + 5, 20, 30);
    
    // Dragon wings
    ctx.fillStyle = '#228B22';
    ctx.fillRect(dragon.x + 10, dragon.y - 10, 30, 15);
    ctx.fillRect(dragon.x + 10, dragon.y + dragon.height - 5, 30, 15);
    
    // Dragon tail
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(dragon.x - 15, dragon.y + 15, 20, 10);
    
    // Dragon eye
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(dragon.x + dragon.width - 8, dragon.y + 12, 4, 4);
}

// Create obstacle
function createObstacle() {
    const gap = 120;
    const topHeight = Math.random() * (canvas.height - gap - 100) + 50;
    
    obstacles.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + gap,
        bottomHeight: canvas.height - (topHeight + gap),
        width: 50,
        passed: false
    });
}

// Draw obstacles
function drawObstacles() {
    ctx.fillStyle = '#8B4513';
    obstacles.forEach(obstacle => {
        // Top obstacle
        ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.topHeight);
        // Bottom obstacle
        ctx.fillRect(obstacle.x, obstacle.bottomY, obstacle.width, obstacle.bottomHeight);
    });
}

// Update dragon position
function updateDragon() {
    dragon.velocityX = 0;
    dragon.velocityY = 0;
    
    if (keys['arrowup'] || keys['w']) dragon.velocityY = -dragon.speed;
    if (keys['arrowdown'] || keys['s']) dragon.velocityY = dragon.speed;
    if (keys['arrowleft'] || keys['a']) dragon.velocityX = -dragon.speed;
    if (keys['arrowright'] || keys['d']) dragon.velocityX = dragon.speed;
    
    dragon.x += dragon.velocityX;
    dragon.y += dragon.velocityY;
    
    // Keep dragon within bounds
    if (dragon.x < 0) dragon.x = 0;
    if (dragon.x > canvas.width - dragon.width) dragon.x = canvas.width - dragon.width;
    if (dragon.y < 0) dragon.y = 0;
    if (dragon.y > canvas.height - dragon.height) dragon.y = canvas.height - dragon.height;
}

// Update obstacles
function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
        
        // Score when passing obstacle
        if (!obstacle.passed && obstacle.x + obstacle.width < dragon.x) {
            obstacle.passed = true;
            score += 10;
            scoreElement.textContent = `Score: ${score}`;
            
            // Increase speed every 50 points
            if (score % 50 === 0) {
                gameSpeed += 0.5;
            }
        }
    });
    
    // Remove off-screen obstacles
    obstacles = obstacles.filter(obstacle => obstacle.x > -obstacle.width);
    
    // Create new obstacles
    obstacleTimer++;
    if (obstacleTimer > 100) {
        createObstacle();
        obstacleTimer = 0;
    }
}

// Collision detection
function checkCollisions() {
    obstacles.forEach(obstacle => {
        // Check collision with top obstacle
        if (dragon.x < obstacle.x + obstacle.width &&
            dragon.x + dragon.width > obstacle.x &&
            dragon.y < obstacle.topHeight) {
            gameOver();
        }
        
        // Check collision with bottom obstacle
        if (dragon.x < obstacle.x + obstacle.width &&
            dragon.x + dragon.width > obstacle.x &&
            dragon.y + dragon.height > obstacle.bottomY) {
            gameOver();
        }
    });
}

// Game over
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// Restart game
function restartGame() {
    gameRunning = true;
    score = 0;
    gameSpeed = 2;
    dragon.x = 100;
    dragon.y = 200;
    obstacles = [];
    obstacleTimer = 0;
    scoreElement.textContent = 'Score: 0';
    gameOverElement.style.display = 'none';
    gameLoop();
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Moving clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const cloudOffset = (Date.now() * 0.02) % canvas.width;
    for (let i = 0; i < 5; i++) {
        const x = (i * 200 - cloudOffset) % (canvas.width + 100);
        const y = 50 + i * 30;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw everything
    drawBackground();
    updateDragon();
    updateObstacles();
    checkCollisions();
    drawDragon();
    drawObstacles();
    
    requestAnimationFrame(gameLoop);
}

// Start the game
createObstacle();
gameLoop();