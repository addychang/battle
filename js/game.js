// js/game.js
// 游戏主逻辑

// 键盘控制
document.addEventListener('keydown', (e) => {
    // 如果游戏结束并且按下回车键，开始新游戏
    if (isGameOver && (e.key === 'Enter' || e.keyCode === 13)) {
        const resultPanel = document.getElementById('result-panel');
        if (resultPanel) {
            resultPanel.style.transform = 'scale(0)';
            setTimeout(() => {
                if (resultPanel.parentNode) {
                    resultPanel.parentNode.removeChild(resultPanel);
                }
                startGame();
            }, 500);
        }
        return;
    }

    if (isGameOver) return;

    keysPressed[e.key] = true;

    // 更新行走动画状态
    updateWalkingState();

    // 玩家1控制 (WSAD)
    if (!player2Carrying && !player1Thrown && !player1Died) {
        switch(e.key.toLowerCase()) {
            case 'a':
                player1Direction = 4; // 左
                break;
            case 'd':
                player1Direction = 2; // 右
                break;
            case 'w':
                player1Direction = 1; // 上
                break;
            case 's':
                player1Direction = 3; // 下
                break;
            case '1': // 使用平底锅
                usePan(1);
                break;
            case '2': // 使用流星锤
                useHammer(1);
                break;
            case '3': // 使用医疗包
                useMedkit(1);
                break;
            case 't': // 殴打
                punch(1);
                break;
        }
    }

    // 玩家2控制 (方向键)
    if (!player1Carrying && !player2Thrown && !player2Died) {
        switch(e.key) {
            case 'ArrowLeft':
                player2Direction = 4; // 左
                break;
            case 'ArrowRight':
                player2Direction = 2; // 右
                break;
            case 'ArrowUp':
                player2Direction = 1; // 上
                break;
            case 'ArrowDown':
                player2Direction = 3; // 下
                break;
            case '8': // 使用平底锅
                usePan(2);
                break;
            case '9': // 使用流星锤
                useHammer(2);
                break;
            case '0': // 使用医疗包
                useMedkit(2);
                break;
            case 'o':
            case 'O': // 殴打
                punch(2);
                break;
        }
    }

    // 抱起功能
    if (e.key === 'r' || e.key === 'R') {
        e.preventDefault(); // 防止浏览器默认行为
        // R键用于左玩家 (按下时抱起)
        if (!player2Carrying && !player1Carrying && !player1Died && !player2Died) {
            tryToCarry(1);
        }
    }
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault(); // 防止浏览器默认行为
        // P键用于右玩家 (按下时抱起)
        if (!player1Carrying && !player2Carrying && !player1Died && !player2Died) {
            tryToCarry(2);
        }
    }

    updateShieldPosition();
});

// 键盘松开监听（用于抛出功能）
document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;

    // 更新行走动画状态
    updateWalkingState();

    // 松开R键时抛出
    if ((e.key === 'r' || e.key === 'R') && player1Carrying) {
        throwPlayer(1);
    }

    // 松开P键时抛出
    if ((e.key === 'p' || e.key === 'P') && player2Carrying) {
        throwPlayer(2);
    }
});

// 游戏主循环
function gameMainLoop() {
    if (isGameOver) return;

    // 更新游戏时间
    updateGameTime();

    // 玩家1运动物理
    if (!player2Carrying && !player1Thrown && !player1Died) {
        // 添加加速度
        if (keysPressed['a'] || keysPressed['A']) {
            player1VelX -= acceleration;
        }
        if (keysPressed['d'] || keysPressed['D']) {
            player1VelX += acceleration;
        }
        if (keysPressed['w'] || keysPressed['W']) {
            player1VelY -= acceleration;
        }
        if (keysPressed['s'] || keysPressed['S']) {
            player1VelY += acceleration;
        }

        // 限制最大速度
        player1VelX = Math.max(-maxSpeed, Math.min(maxSpeed, player1VelX));
        player1VelY = Math.max(-maxSpeed, Math.min(maxSpeed, player1VelY));

        // 应用摩擦力
        if (!keysPressed['a'] && !keysPressed['A'] && !keysPressed['d'] && !keysPressed['D']) {
            player1VelX *= friction;
        }
        if (!keysPressed['w'] && !keysPressed['W'] && !keysPressed['s'] && !keysPressed['S']) {
            player1VelY *= friction;
        }

        // 如果速度很小则停止
        if (Math.abs(player1VelX) < 0.1) player1VelX = 0;
        if (Math.abs(player1VelY) < 0.1) player1VelY = 0;

        // 更新位置
        player1X += player1VelX;
        player1Y += player1VelY;

        // 边界检查
        player1X = Math.max(0, Math.min(750, player1X));
        player1Y = Math.max(0, Math.min(530, player1Y));

        // 身体倾斜效果
        const targetRotation = player1VelX * 1.5; // 根据水平速度倾斜
        player1BodyRotation += (targetRotation - player1BodyRotation) * 0.2; // 平滑过渡
        player1.querySelector('.player-body').style.transform = `rotate(${player1BodyRotation}deg)`;
    }

    // 玩家2运动物理
    if (!player1Carrying && !player2Thrown && !player2Died) {
        // 添加加速度
        if (keysPressed['ArrowLeft']) {
            player2VelX -= acceleration;
        }
        if (keysPressed['ArrowRight']) {
            player2VelX += acceleration;
        }
        if (keysPressed['ArrowUp']) {
            player2VelY -= acceleration;
        }
        if (keysPressed['ArrowDown']) {
            player2VelY += acceleration;
        }

        // 限制最大速度
        player2VelX = Math.max(-maxSpeed, Math.min(maxSpeed, player2VelX));
        player2VelY = Math.max(-maxSpeed, Math.min(maxSpeed, player2VelY));

        // 应用摩擦力
        if (!keysPressed['ArrowLeft'] && !keysPressed['ArrowRight']) {
            player2VelX *= friction;
        }
        if (!keysPressed['ArrowUp'] && !keysPressed['ArrowDown']) {
            player2VelY *= friction;
        }

        // 如果速度很小则停止
        if (Math.abs(player2VelX) < 0.1) player2VelX = 0;
        if (Math.abs(player2VelY) < 0.1) player2VelY = 0;

        // 更新位置
        player2X += player2VelX;
        player2Y += player2VelY;

        // 边界检查
        player2X = Math.max(0, Math.min(750, player2X));
        player2Y = Math.max(0, Math.min(530, player2Y));

        // 身体倾斜效果
        const targetRotation = player2VelX * 1.5; // 根据水平速度倾斜
        player2BodyRotation += (targetRotation - player2BodyRotation) * 0.2; // 平滑过渡
        player2.querySelector('.player-body').style.transform = `rotate(${player2BodyRotation}deg)`;
    }

    // 检查玩家碰撞
    checkPlayerCollision();

    updatePositions();
    updateShieldPosition();

    // 检查游戏是否已经结束（两个玩家都死亡）
    if ((player1Died && player2Died) && !isGameOver) {
        gameOver();
    } else if ((player1Died && !player2Died) || (!player1Died && player2Died)) {
        // 如果只有一个玩家死亡，检查是否已经超过3秒，如果是则宣布幸存玩家获胜
        const now = new Date().getTime();

        if (player1Died && !player2Died && player1DeathTime && now - player1DeathTime > 3000) {
            gameOver();
        } else if (!player1Died && player2Died && player2DeathTime && now - player2DeathTime > 3000) {
            gameOver();
        }
    }

    requestAnimationFrame(gameMainLoop);
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    if (obstacleTimerId) {
        clearInterval(obstacleTimerId);
        obstacleTimerId = null;
    }

    // 根据结果分配积分
    let winner = "";
    if (player1Died && player2Died) {
        // 如果两个玩家都死亡，比较死亡时间
        if (player1DeathTime < player2DeathTime) {
            winner = "玩家2获胜！";
            totalScore2 += 20; // 赢家获得20积分
            totalScore1 += 10; // 输家获得10积分
        } else if (player2DeathTime < player1DeathTime) {
            winner = "玩家1获胜！";
            totalScore1 += 20; // 赢家获得20积分
            totalScore2 += 10; // 输家获得10积分
        } else {
            winner = "平局！";
            totalScore1 += 15; // 平局各得15积分
            totalScore2 += 15;
        }
    } else if (player1Died) {
        winner = "玩家2获胜！";
        totalScore2 += 20; // 赢家获得20积分
        totalScore1 += 10; // 输家获得10积分
    } else if (player2Died) {
        winner = "玩家1获胜！";
        totalScore1 += 20; // 赢家获得20积分
        totalScore2 += 10; // 输家获得10积分
    } else {
        winner = "平局！";
        totalScore1 += 15; // 平局各得15积分
        totalScore2 += 15;
    }

    totalScore1Element.textContent = totalScore1;
    totalScore2Element.textContent = totalScore2;

    // 创建结果面板
    const resultPanel = document.createElement('div');
    resultPanel.id = 'result-panel';
    resultPanel.innerHTML = `
        <h2 style="color: yellow; margin-bottom: 20px;">游戏结束！${winner}</h2>
        <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
            <div>
                <h3 style="color: lightblue;">玩家1</h3>
                <p>本局得分: ${player1Died ? "10" : "20"}</p>
                <p>累计积分: ${totalScore1}</p>
                <p>剩余生命: ${health1}</p>
            </div>
            <div>
                <h3 style="color: lightgreen;">玩家2</h3>
                <p>本局得分: ${player2Died ? "10" : "20"}</p>
                <p>累计积分: ${totalScore2}</p>
                <p>剩余生命: ${health2}</p>
            </div>
        </div>
        <p style="margin-top: 20px; color: yellow; font-weight: bold;">按回车键开始新游戏</p>
    `;

    game.appendChild(resultPanel);

    // 动画效果显示面板
    setTimeout(() => {
        resultPanel.style.transform = 'scale(1)';
    }, 100);
}

// 开始游戏
function startGame() {
    // 初始化键盘状态对象
    for (const key in keysPressed) {
        keysPressed[key] = false;
    }

    // 清除所有障碍物
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => obstacle.remove());

    // 清除所有子弹
    const bullets = document.querySelectorAll('.bullet');
    bullets.forEach(bullet => bullet.remove());

    // 清除保护罩
    if (hammer1Shield && hammer1Shield.parentNode) {
        hammer1Shield.parentNode.removeChild(hammer1Shield);
    }
    if (hammer2Shield && hammer2Shield.parentNode) {
        hammer2Shield.parentNode.removeChild(hammer2Shield);
    }

    // 清除平底锅效果
    if (pan1Effect && pan1Effect.parentNode) {
        pan1Effect.parentNode.removeChild(pan1Effect);
    }
    if (pan2Effect && pan2Effect.parentNode) {
        pan2Effect.parentNode.removeChild(pan2Effect);
    }

    // 清除定时器
    if (pan1Timeout) {
        clearTimeout(pan1Timeout);
    }
    if (pan2Timeout) {
        clearTimeout(pan2Timeout);
    }

    // 清除所有特效
    const effects = document.querySelectorAll('.player-trail, .effect-text, .explosion, .medkit-effect, .frying-pan-active');
    effects.forEach(effect => effect.remove());

    isGameOver = false;
    score1 = 0;
    score2 = 0;
    health1 = 10;
    health2 = 10;
    player1Carrying = false;
    player2Carrying = false;
    player1Thrown = false;
    player2Thrown = false;
    hammer1Active = false;
    hammer2Active = false;
    hammer1Shield = null;
    hammer2Shield = null;
    pan1Active = false;
    pan2Active = false;
    pan1Effect = null;
    pan2Effect = null;
    player1VelX = 0;
    player1VelY = 0;
    player2VelX = 0;
    player2VelY = 0;
    player1Walking = false;
    player2Walking = false;
    player1BodyRotation = 0;
    player2BodyRotation = 0;
    player1Died = false;
    player2Died = false;
    player1DeathTime = null;
    player2DeathTime = null;

    // 重置难度系统
    gameStartTime = new Date().getTime();
    gameCurrentTime = 0;
    difficultyLevel = 1;
    obstacleFallBaseSpeed = 3;
    obstacleSpawnInterval = 1000;
    obstacleSpawnCount = 1;

    // 更新游戏时间显示
    updateGameTime();

    score1Element.textContent = score1;
    score2Element.textContent = score2;
    updateHealthDisplay();
    updateToolButtons();

    player1X = 175;
    player1Y = 480;
    player2X = 575;
    player2Y = 480;
    player1Direction = 2;
    player2Direction = 4;

    player1.style.left = player1X + 'px';
    player1.style.top = player1Y + 'px';
    player1.querySelector('.player-body').style.transform = 'rotate(0deg)';
    player2.style.left = player2X + 'px';
    player2.style.top = player2Y + 'px';
    player2.querySelector('.player-body').style.transform = 'rotate(0deg)';

    player1.classList.remove('carried', 'carrying', 'punching', 'hit', 'carried-position', 'walking', 'dead', 'player-collision');
    player2.classList.remove('carried', 'carrying', 'punching', 'hit', 'carried-position', 'walking', 'dead', 'player-collision');

    // 恢复颜色
    player1.querySelector('.torso').style.backgroundColor = 'blue';
    player1.querySelector('.arm.left').style.backgroundColor = 'blue';
    player1.querySelector('.arm.right').style.backgroundColor = 'blue';
    player1.querySelector('.leg.left').style.backgroundColor = 'blue';
    player1.querySelector('.leg.right').style.backgroundColor = 'blue';

    player2.querySelector('.torso').style.backgroundColor = 'green';
    player2.querySelector('.arm.left').style.backgroundColor = 'green';
    player2.querySelector('.arm.right').style.backgroundColor = 'green';
    player2.querySelector('.leg.left').style.backgroundColor = 'green';
    player2.querySelector('.leg.right').style.backgroundColor = 'green';

    // 开始生成障碍物
    if (obstacleTimerId) {
        clearInterval(obstacleTimerId);
    }
    obstacleTimerId = setInterval(() => {
        for (let i = 0; i < obstacleSpawnCount; i++) {
            createObstacle();
        }
    }, obstacleSpawnInterval);

    // 重启游戏主循环
    requestAnimationFrame(gameMainLoop);
}

// 初始化
updateToolButtons();
startGame();