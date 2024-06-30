const speeds = [750, 500, 250];
let currentSpeedIndex = 0;

function updateSpeed() {
    const levelSelect = document.getElementById('levelSelect');
    currentSpeedIndex = parseInt(levelSelect.value) - 1;
    document.getElementById('levelDisplay').innerText = levelSelect.value;
    levelSelect.style.display = 'none';
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, getCurrentSpeed());
    }
}

function getCurrentSpeed() {
    return speeds[currentSpeedIndex];
}

document.getElementById('levelSelect').addEventListener('change', updateSpeed);

document.getElementById('levelDisplay').addEventListener('click', () => {
    const levelSelect = document.getElementById('levelSelect');
    levelSelect.style.display = 'inline';
});
