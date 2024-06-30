const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('nextPieceCanvas');
const nextCtx = nextPieceCanvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreDisplay = document.getElementById('score');
const leftBtn = document.getElementById('leftBtn');
const rotateBtn = document.getElementById('rotateBtn');
const rightBtn = document.getElementById('rightBtn');
const downBtn = document.getElementById('downBtn');
const pauseBtn = document.getElementById('pauseBtn');
const gameOverDisplay = document.getElementById('gameOver');
const levelSelect = document.getElementById('levelSelect');
const levelDisplay = document.getElementById('levelDisplay');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 12.5;
let score = 0;
let linesCleared = 0;
let startTime;
let endTime;
let isPaused = false;

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentPiece = null;
let nextPiece = null;
let gameInterval = null;

const pieces = [
    {
        rotations: [
            [[1, 1, 1, 1]],  // 0 degrees
            [[1], [1], [1], [1]],  // 90 degrees
            [[1, 1, 1, 1]],  // 180 degrees
            [[1], [1], [1], [1]]  // 270 degrees
        ],
        color: 'cyan'
    },
    {
        rotations: [
            [[1, 1], [1, 1]],  // 0 degrees
            [[1, 1], [1, 1]],  // 90 degrees
            [[1, 1], [1, 1]],  // 180 degrees
            [[1, 1], [1, 1]]  // 270 degrees
        ],
        color: 'yellow'
    },
    {
        rotations: [
            [[0, 1, 0], [1, 1, 1]],  // 0 degrees
            [[1, 0], [1, 1], [1, 0]],  // 90 degrees
            [[1, 1, 1], [0, 1, 0]],  // 180 degrees
            [[0, 1], [1, 1], [0, 1]]  // 270 degrees
        ],
        color: 'purple'
    },
    {
        rotations: [
            [[1, 0, 0], [1, 1, 1]],  // 0 degrees
            [[1, 1], [1, 0], [1, 0]],  // 90 degrees
            [[1, 1, 1], [0, 0, 1]],  // 180 degrees
            [[0, 1], [0, 1], [1, 1]]  // 270 degrees
        ],
        color: 'blue'
    },
    {
        rotations: [
            [[0, 0, 1], [1, 1, 1]],  // 0 degrees
            [[1, 0], [1, 0], [1, 1]],  // 90 degrees
            [[1, 1, 1], [1, 0, 0]],  // 180 degrees
            [[1, 1], [0, 1], [0, 1]]  // 270 degrees
        ],
        color: 'orange'
    },
    {
        rotations: [
            [[1, 1, 0], [0, 1, 1]],  // 0 degrees
            [[0, 1], [1, 1], [1, 0]],  // 90 degrees
            [[1, 1, 0], [0, 1, 1]],  // 180 degrees
            [[0, 1], [1, 1], [1, 0]]  // 270 degrees
        ],
        color: 'green'
    },
    {
        rotations: [
            [[0, 1, 1], [1, 1, 0]],  // 0 degrees
            [[1, 0], [1, 1], [0, 1]],  // 90 degrees
            [[0, 1, 1], [1, 1, 0]],  // 180 degrees
            [[1, 0], [1, 1], [0, 1]]  // 270 degrees
        ],
        color: 'red'
    }
];

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ccc';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            if (grid[r][c]) {
                ctx.fillStyle = grid[r][c];
                ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece(piece, context = ctx) {
    context.fillStyle = piece.color;
    piece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) {
                context.fillRect((piece.x + c) * BLOCK_SIZE, (piece.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect((piece.x + c) * BLOCK_SIZE, (piece.y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    if (nextPiece) {
        const piece = JSON.parse(JSON.stringify(nextPiece)); // 深拷贝避免修改原始对象
        piece.x = 1;
        piece.y = 1;
        drawPiece(piece, nextCtx);
    }
}

function spawnPiece() {
    currentPiece = nextPiece || generateRandomPiece();
    nextPiece = generateRandomPiece();
    currentPiece.x = Math.floor((COLS - currentPiece.shape[0].length) / 2);
    currentPiece.y = 0;
    if (collision()) {
        gameOver();
    }
    drawNextPiece();
}

function generateRandomPiece() {
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    return {
        shape: type.rotations[0],
        rotations: type.rotations,
        rotationIndex: 0,
        color: type.color,
        x: 0,
        y: 0
    };
}

function movePiece(dx, dy) {
    if (!currentPiece) return; // 确保 currentPiece 不为空
    currentPiece.x += dx;
    currentPiece.y += dy;
    if (collision()) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        if (dy === 1) {
            lockPiece();
            spawnPiece();
            score += 10; // 每次方块落下都算入分数
            scoreDisplay.textContent = score;
        }
    }
    drawGrid();
    drawPiece(currentPiece);
}

function rotatePiece() {
    if (!currentPiece) return; // 确保 currentPiece 不为空
    const newRotationIndex = (currentPiece.rotationIndex + 1) % 4;
    const newShape = currentPiece.rotations[newRotationIndex];
    currentPiece.shape = newShape;
    currentPiece.rotationIndex = newRotationIndex;
    if (collision()) {
        currentPiece.shape = currentPiece.rotations[(currentPiece.rotationIndex + 3) % 4];
        currentPiece.rotationIndex = (currentPiece.rotationIndex + 3) % 4;
    }
    drawGrid();
    drawPiece(currentPiece);
}

function collision() {
    if (!currentPiece) return true; // 确保 currentPiece 不为空
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                const newX = currentPiece.x + c;
                const newY = currentPiece.y + r;
                if (newX < 0 || newX >= COLS || newY >= ROWS || grid[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function lockPiece() {
    if (!currentPiece) return; // 确保 currentPiece 不为空
    currentPiece.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell) {
                grid[currentPiece.y + r][currentPiece.x + c] = currentPiece.color;
            }
        });
    });
    clearLines();
}

function clearLines() {
    let lines = 0;
    for (let r = 0; r < ROWS; r++) {
        if (grid[r].every(cell => cell)) {
            grid.splice(r, 1);
            grid.unshift(Array(COLS).fill(0));
            lines++;
            music.playClearLineSound(); // 播放消除行的音效
        }
    }
    linesCleared += lines;
    score += lines * 100; // 每行100分
    scoreDisplay.textContent = score;
}

function gameLoop() {
    if (!currentPiece || isPaused) return; // 确保 currentPiece 不为空
    movePiece(0, 1);
    drawGrid();
    drawPiece(currentPiece);
}

function gameOver() {
    clearInterval(gameInterval);
    endTime = new Date();
    const totalTime = (endTime - startTime) / 1000;
    const minutes = Math.floor(totalTime / 60);
    const seconds = Math.floor(totalTime % 60);
    const timeString = minutes > 0 ? `${minutes}分钟${seconds}秒` : `${seconds}秒`;

    alert(`
        Game Over\n
        总时间: ${timeString}\n
        消除行数: ${linesCleared}\n
        得分: ${score}
    `);
}

function togglePause() {
    if (isPaused) {
        gameInterval = setInterval(gameLoop, getCurrentSpeed());
        pauseBtn.textContent = 'Pause';
    } else {
        clearInterval(gameInterval);
        pauseBtn.textContent = 'Resume';
    }
    isPaused = !isPaused;
}

function init() {
    drawGrid();
    nextPiece = generateRandomPiece();
    drawNextPiece();
}

startBtn.addEventListener('click', () => {
    if (gameInterval) clearInterval(gameInterval);
    score = 0;
    linesCleared = 0;
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    startTime = new Date();
    spawnPiece();
    gameOverDisplay.style.display = 'none';
    gameInterval = setInterval(gameLoop, getCurrentSpeed());
    startBtn.style.display = 'none';
    restartBtn.style.display = 'block';
    pauseBtn.style.display = 'block';
    pauseBtn.textContent = 'Pause';
    isPaused = false;
    document.getElementById('speedBtn').style.display = 'block';
});

restartBtn.addEventListener('click', () => {
    clearInterval(gameInterval);
    score = 0;
    linesCleared = 0;
    scoreDisplay.textContent = score;
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    startTime = new Date();
    spawnPiece();
    gameOverDisplay.style.display = 'none';
    gameInterval = setInterval(gameLoop, getCurrentSpeed());
    pauseBtn.textContent = 'Pause';
    isPaused = false;
});

pauseBtn.addEventListener('click', togglePause);

leftBtn.addEventListener('click', () => movePiece(-1, 0));
rightBtn.addEventListener('click', () => movePiece(1, 0));
downBtn.addEventListener('click', () => movePiece(0, 1));
rotateBtn.addEventListener('click', rotatePiece);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') movePiece(-1, 0);
    if (e.key === 'ArrowRight') movePiece(1, 0);
    if (e.key === 'ArrowDown') movePiece(0, 1);
    if (e.key === 'ArrowUp') rotatePiece();
});

levelSelect.addEventListener('change', () => {
    clearInterval(gameInterval);
    if (!isPaused) {
        gameInterval = setInterval(gameLoop, getCurrentSpeed());
    }
});

window.onload = init;
