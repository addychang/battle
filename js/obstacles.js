// js/obstacles.js
// 障碍物系统

// 创建障碍物
function createObstacle() {
    if (isGameOver) return;

    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.style.left = Math.random() * 770 + 'px';
    obstacle.style.transform = 'scale(0)';
    obstacle.setAttribute('data-hit-player1', 'false');
    obstacle.setAttribute('data-hit-player2', 'false');
    game.appendChild(obstacle);

    setTimeout(() => {
        obstacle.style.transform = 'scale(1)';
    }, 10);

    let topPosition = 0;
    // 随机速度，基于当前难度级别
    let fallSpeed = obstacleFallBaseSpeed + Math.random() * difficultyLevel;
    const fall = setInterval(() => {
        if (isGameOver) {
            clearInterval(fall);
            return;
        }

        topPosition += fallSpeed;
        obstacle.style.top = topPosition + 'px';

        // 摇摆效果
        const sway = 5 * Math.sin(topPosition / 30);
        obstacle.style.left = (parseFloat(obstacle.style.left) + sway/10) + 'px';

        // 检测碰撞
        if (topPosition > 600) {
            clearInterval(fall);

            // 淡出效果
            obstacle.style.transform = 'scale(0)';
            setTimeout(() => {
                if (obstacle.parentNode) {
                    obstacle.parentNode.removeChild(obstacle);
                }
            }, 300);
        } else {
            checkCollisionAndDamage(obstacle);
        }
    }, 20);
}

// 检查碰撞并造成伤害
function checkCollisionAndDamage(obstacle) {
    // 检查是否已经碰撞过该玩家，防止重复伤害
    const hitPlayer1 = obstacle.getAttribute('data-hit-player1') === 'true';
    const hitPlayer2 = obstacle.getAttribute('data-hit-player2') === 'true';

    // 检查与保护罩的碰撞
    if (hammer1Active && hammer1Shield && isColliding(obstacle, hammer1Shield)) {
        // 保护罩反弹效果
        createExplosion(parseInt(obstacle.style.left), parseInt(obstacle.style.top));

        obstacle.style.transform = 'scale(0)';
        setTimeout(() => {
            if (obstacle.parentNode) {
                obstacle.parentNode.removeChild(obstacle);
            }
        }, 300);
        return;
    }

    if (hammer2Active && hammer2Shield && isColliding(obstacle, hammer2Shield)) {
        // 保护罩反弹效果
        createExplosion(parseInt(obstacle.style.left), parseInt(obstacle.style.top));

        obstacle.style.transform = 'scale(0)';
        setTimeout(() => {
            if (obstacle.parentNode) {
                obstacle.parentNode.removeChild(obstacle);
            }
        }, 300);
        return;
    }

    // 检查与玩家1的碰撞
    if (!hitPlayer1 && isColliding(obstacle, player1) && !player1Died) {
        // 标记为已碰撞玩家1，防止重复伤害
        obstacle.setAttribute('data-hit-player1', 'true');

        takeDamage(1, 1);

        // 碰撞效果
        obstacle.style.transform = 'scale(1.5)';
        obstacle.style.opacity = '0.5';
        setTimeout(() => {
            if (obstacle.parentNode) {
                obstacle.parentNode.removeChild(obstacle);
            }
        }, 200);

        if (player2Carrying) {
            takeDamage(2, 1); // 如果玩家2抱着玩家1，两个都受伤
            player2Carrying = false;
            player1.classList.remove('carried');
            player1.classList.remove('carried-position');
            player2.classList.remove('carrying');
        }
    }

    // 检查与玩家2的碰撞
    if (!hitPlayer2 && isColliding(obstacle, player2) && !player2Died) {
        // 标记为已碰撞玩家2，防止重复伤害
        obstacle.setAttribute('data-hit-player2', 'true');

        takeDamage(2, 1);

        // 碰撞效果
        obstacle.style.transform = 'scale(1.5)';
        obstacle.style.opacity = '0.5';
        setTimeout(() => {
            if (obstacle.parentNode) {
                obstacle.parentNode.removeChild(obstacle);
            }
        }, 200);

        if (player1Carrying) {
            takeDamage(1, 1); // 如果玩家1抱着玩家2，两个都受伤
            player1Carrying = false;
            player2.classList.remove('carried');
            player2.classList.remove('carried-position');
            player1.classList.remove('carrying');
        }
    }
}