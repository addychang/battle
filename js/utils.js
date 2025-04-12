// js/utils.js
// 工具函数

// 碰撞检测函数
function isColliding(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

// 更新游戏时间显示
function updateGameTime() {
    if (isGameOver || !gameStartTime) return;

    const now = new Date().getTime();
    const elapsedTime = Math.floor((now - gameStartTime) / 1000);
    gameCurrentTime = elapsedTime;

    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');

    gameTimeElement.textContent = `游戏时间: ${minutes}:${seconds}`;

    // 根据时间增加难度
    updateDifficulty();
}

// 更新游戏难度
function updateDifficulty() {
    // 每30秒增加一次难度
    const newDifficultyLevel = Math.floor(gameCurrentTime / 30) + 1;

    if (newDifficultyLevel > difficultyLevel) {
        difficultyLevel = newDifficultyLevel;

        // 提高障碍物下落速度
        obstacleFallBaseSpeed = 3 + (difficultyLevel - 1) * 0.5;

        // 减少障碍物生成间隔（最短300毫秒）
        obstacleSpawnInterval = Math.max(300, 1000 - (difficultyLevel - 1) * 100);

        // 每两个难度级别增加一个同时生成的障碍物数量
        if (difficultyLevel % 2 === 0) {
            obstacleSpawnCount++;
        }

        // 更新障碍物生成定时器
        clearInterval(obstacleTimerId);
        obstacleTimerId = setInterval(() => {
            for (let i = 0; i < obstacleSpawnCount; i++) {
                createObstacle();
            }
        }, obstacleSpawnInterval);

        // 显示难度提示
        difficultyIndicator.textContent = `难度增加！(Level ${difficultyLevel})`;
        difficultyIndicator.style.opacity = '1';

        setTimeout(() => {
            difficultyIndicator.style.opacity = '0';
        }, 2000);
    }
}