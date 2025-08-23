// Simple HTML5 Canvas Platformer Game with Enhanced UI
console.log("Game script loaded");

// Game variables
let canvas, ctx;
let player = { x: 100, y: 300, width: 32, height: 32, vx: 0, vy: 0, onGround: false };
let platforms = [];
let coins = [];
let spikes = [];
let movingObstacles = [];
let score = 0;
let gameOver = false;
let keys = {};
let particles = [];
let gameTime = 0;

// Game constants
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;

// Initialize the game
function initGame() {
    console.log("Initializing game...");
    
    // Remove loading text
    const loadingText = document.querySelector('.loading');
    if (loadingText) {
        loadingText.remove();
    }
    
    // Create canvas
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.display = 'block';
    canvas.style.borderRadius = '10px';
    document.getElementById('game-container').appendChild(canvas);
    
    // Get 2D context
    ctx = canvas.getContext('2d');
    
    // Setup game objects
    setupGameObjects();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start game loop
    gameLoop();
    
    console.log("Game initialized successfully");
}

// Setup game objects
function setupGameObjects() {
    // Create platforms
    platforms = [
        { x: 0, y: 560, width: 800, height: 40 },      // Ground
        { x: 200, y: 450, width: 120, height: 20 },    // Platform 1
        { x: 400, y: 350, width: 120, height: 20 },    // Platform 2
        { x: 600, y: 250, width: 120, height: 20 },    // Platform 3
        { x: 300, y: 200, width: 120, height: 20 },    // Platform 4
        { x: 100, y: 150, width: 100, height: 20 },    // Platform 5
        { x: 500, y: 100, width: 100, height: 20 }     // Platform 6
    ];
    
    // Create more coins
    coins = [
        { x: 250, y: 420, width: 20, height: 20, collected: false, rotation: 0 },
        { x: 450, y: 320, width: 20, height: 20, collected: false, rotation: 0 },
        { x: 650, y: 220, width: 20, height: 20, collected: false, rotation: 0 },
        { x: 350, y: 180, width: 20, height: 20, collected: false, rotation: 0 },
        { x: 150, y: 130, width: 20, height: 20, collected: false, rotation: 0 },
        { x: 550, y: 80, width: 20, height: 20, collected: false, rotation: 0 },
        { x: 300, y: 520, width: 20, height: 20, collected: false, rotation: 0 },
        { x: 500, y: 520, width: 20, height: 20, collected: false, rotation: 0 },
        { x: 700, y: 520, width: 20, height: 20, collected: false, rotation: 0 },
        { x: 100, y: 520, width: 20, height: 20, collected: false, rotation: 0 }
    ];
    
    // Create static spikes in easier positions
    spikes = [
        { x: 50, y: 520, width: 32, height: 32 },      // Far left, easy to avoid
        { x: 750, y: 520, width: 32, height: 32 }      // Far right, easy to avoid
    ];
    
    // Create moving obstacles in much easier positions
    movingObstacles = [
        {
            x: 150, y: 520, width: 32, height: 32,
            startX: 150, endX: 250, speed: 0.8, direction: 1,
            type: 'spike'
        },
        {
            x: 550, y: 520, width: 32, height: 32,
            startX: 550, endX: 650, speed: 0.6, direction: 1,
            type: 'spike'
        }
    ];
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        
        // Jump
        if (e.code === 'Space' && player.onGround && !gameOver) {
            player.vy = JUMP_FORCE;
            player.onGround = false;
            // Add jump particles
            addJumpParticles();
        }
        
        // Restart
        if (e.code === 'KeyR' && gameOver) {
            restartGame();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
}

// Add jump particles
function addJumpParticles() {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: player.x + player.width/2,
            y: player.y + player.height,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3,
            life: 30,
            maxLife: 30,
            color: `hsl(${200 + Math.random() * 40}, 70%, 60%)`
        });
    }
}

// Update game logic
function update() {
    if (gameOver) return;
    
    gameTime++;
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Update moving obstacles
    updateMovingObstacles();
    
    // Player movement
    if (keys['ArrowLeft']) {
        player.vx = -MOVE_SPEED;
    } else if (keys['ArrowRight']) {
        player.vx = MOVE_SPEED;
    } else {
        player.vx = 0;
    }
    
    // Apply gravity
    player.vy += GRAVITY;
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    
    // Check if player fell off
    if (player.y > canvas.height) {
        gameOver = true;
        return;
    }
    
    // Collision detection
    checkCollisions();
    
    // Update coin rotations
    for (let coin of coins) {
        if (!coin.collected) {
            coin.rotation += 0.1;
        }
    }
}

// Update moving obstacles
function updateMovingObstacles() {
    for (let obstacle of movingObstacles) {
        // Move obstacle
        obstacle.x += obstacle.speed * obstacle.direction;
        
        // Change direction at boundaries
        if (obstacle.x <= obstacle.startX || obstacle.x >= obstacle.endX) {
            obstacle.direction *= -1;
        }
        
        // Keep obstacle within bounds
        obstacle.x = Math.max(obstacle.startX, Math.min(obstacle.endX, obstacle.x));
    }
}

// Check collisions
function checkCollisions() {
    player.onGround = false;
    
    // Platform collisions
    for (let platform of platforms) {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            // Landing on top of platform
            if (player.vy > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.vy = 0;
                player.onGround = true;
            }
        }
    }
    
    // Coin collisions
    for (let coin of coins) {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            
            coin.collected = true;
            score += 10;
            // Add coin collection particles
            addCoinParticles(coin.x + coin.width/2, coin.y + coin.height/2);
        }
    }
    
    // Static spike collisions
    for (let spike of spikes) {
        if (player.x < spike.x + spike.width &&
            player.x + player.width > spike.x &&
            player.y < spike.y + spike.height &&
            player.y + player.height > spike.y) {
            
            gameOver = true;
            // Add death particles
            addDeathParticles();
        }
    }
    
    // Moving obstacle collisions
    for (let obstacle of movingObstacles) {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            
            gameOver = true;
            // Add death particles
            addDeathParticles();
        }
    }
}

// Add coin collection particles
function addCoinParticles(x, y) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 40,
            maxLife: 40,
            color: `hsl(${60 + Math.random() * 20}, 100%, 60%)`
        });
    }
}

// Add death particles
function addDeathParticles() {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: player.x + player.width/2,
            y: player.y + player.height/2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 60,
            maxLife: 60,
            color: `hsl(${0 + Math.random() * 30}, 100%, 60%)`
        });
    }
}

// Render the game
function render() {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(0.5, '#34495e');
    gradient.addColorStop(1, '#2c3e50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background stars
    drawBackgroundStars();
    
    // Draw platforms with shadows and gradients
    for (let platform of platforms) {
        // Platform shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(platform.x + 3, platform.y + 3, platform.width, platform.height);
        
        // Platform gradient
        const platformGradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
        platformGradient.addColorStop(0, '#27ae60');
        platformGradient.addColorStop(1, '#2ecc71');
        ctx.fillStyle = platformGradient;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(platform.x, platform.y, platform.width, 3);
    }
    
    // Draw coins with rotation and glow
    for (let coin of coins) {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2);
            ctx.rotate(coin.rotation);
            
            // Coin glow
            ctx.shadowColor = '#f1c40f';
            ctx.shadowBlur = 15;
            
            // Coin gradient
            const coinGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coin.width/2);
            coinGradient.addColorStop(0, '#f39c12');
            coinGradient.addColorStop(1, '#f1c40f');
            ctx.fillStyle = coinGradient;
            ctx.fillRect(-coin.width/2, -coin.height/2, coin.width, coin.height);
            
            // Coin shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(-coin.width/2 + 2, -coin.height/2 + 2, coin.width - 4, 3);
            
            ctx.restore();
        }
    }
    
    // Draw static spikes with gradients and shadows
    for (let spike of spikes) {
        // Spike shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(spike.x + 2, spike.y + 2, spike.width, spike.height);
        
        // Spike gradient
        const spikeGradient = ctx.createLinearGradient(spike.x, spike.y, spike.x, spike.y + spike.height);
        spikeGradient.addColorStop(0, '#e74c3c');
        spikeGradient.addColorStop(1, '#c0392b');
        ctx.fillStyle = spikeGradient;
        
        // Draw triangle
        ctx.beginPath();
        ctx.moveTo(spike.x + spike.width/2, spike.y);
        ctx.lineTo(spike.x, spike.y + spike.height);
        ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
        ctx.closePath();
        ctx.fill();
        
        // Spike highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(spike.x + spike.width/2, spike.y + 2);
        ctx.lineTo(spike.x + 4, spike.y + spike.height - 2);
        ctx.lineTo(spike.x + spike.width - 4, spike.y + spike.height - 2);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw moving obstacles with special effects
    for (let obstacle of movingObstacles) {
        // Moving obstacle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width, obstacle.height);
        
        // Moving obstacle gradient (different color to distinguish from static)
        const movingGradient = ctx.createLinearGradient(obstacle.x, obstacle.y, obstacle.x, obstacle.y + obstacle.height);
        movingGradient.addColorStop(0, '#9b59b6');
        movingGradient.addColorStop(1, '#8e44ad');
        ctx.fillStyle = movingGradient;
        
        // Draw triangle
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
        ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
        
        // Moving obstacle highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y + 2);
        ctx.lineTo(obstacle.x + 4, obstacle.y + obstacle.height - 2);
        ctx.lineTo(obstacle.x + obstacle.width - 4, obstacle.y + obstacle.height - 2);
        ctx.closePath();
        ctx.fill();
        
        // Add movement trail effect
        ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
        ctx.fillRect(obstacle.x + obstacle.width/2 - 2, obstacle.y + obstacle.height, 4, 10);
    }
    
    // Draw particles
    for (let particle of particles) {
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // Draw player with gradient and shadow
    // Player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(player.x + 2, player.y + 2, player.width, player.height);
    
    // Player gradient
    const playerGradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
    playerGradient.addColorStop(0, '#3498db');
    playerGradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = playerGradient;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(player.x, player.y, player.width, 3);
    
    // Player eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 6, player.y + 8, 4, 4);
    ctx.fillRect(player.x + 22, player.y + 8, 4, 4);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(player.x + 7, player.y + 9, 2, 2);
    ctx.fillRect(player.x + 23, player.y + 9, 2, 2);
    
    // Draw score with shadow and glow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Score background
    ctx.fillStyle = 'rgba(52, 73, 94, 0.8)';
    ctx.fillRect(15, 15, 120, 35);
    
    // Score text
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Score: ${score}`, 25, 35);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw game over message with effects
    if (gameOver) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game over text with glow
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#ecf0f1';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER!', canvas.width/2, canvas.height/2 - 50);
        
        // Restart instruction
        ctx.shadowBlur = 10;
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Press R to restart', canvas.width/2, canvas.height/2 + 20);
        
        // Final score
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 60);
        
        ctx.textAlign = 'left';
        ctx.shadowBlur = 0;
    }
}

// Draw background stars
function drawBackgroundStars() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 73) % canvas.height;
        const size = Math.sin(gameTime * 0.01 + i) * 0.5 + 0.5;
        ctx.fillRect(x, y, size, size);
    }
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Restart game
function restartGame() {
    // Reset player
    player.x = 100;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    
    // Reset coins
    for (let coin of coins) {
        coin.collected = false;
        coin.rotation = 0;
    }
    
    // Reset moving obstacles to starting positions
    for (let obstacle of movingObstacles) {
        obstacle.x = obstacle.startX;
        obstacle.direction = 1;
    }
    
    // Reset game state
    score = 0;
    gameOver = false;
    keys = {};
    particles = [];
    gameTime = 0;
}

// Wait for the page to load
window.addEventListener('load', () => {
    console.log("Page loaded, starting game...");
    
    // Try to load Kaboom.js first, but fall back to canvas game if it fails
    setTimeout(() => {
        if (typeof kaboom !== 'undefined') {
            console.log("Kaboom.js loaded, using it...");
            // If Kaboom.js is available, we could use it here
            // But for now, let's use our reliable canvas game
        }
        
        // Always initialize our canvas game as it's more reliable
        initGame();
    }, 1000); // Wait 1 second to see if Kaboom.js loads
});
