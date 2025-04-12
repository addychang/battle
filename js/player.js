// js/player.js
// 玩家相关功能

// 受到伤害
function takeDamage(playerNum, amount = 1) {
    const player = playerNum === 1 ? player1 : player2;

    // 如果玩家已经死亡，不再处理伤害
    if ((playerNum === 1 && player1Died) || (playerNum === 2 && player2Died)) {
        return;
    }

    if (playerNum === 1) {
        // 动画效果显示受伤的心
        const lostHeartIndex = Math.floor(health1 - amount);
        if (lostHeartIndex >= 0 && lostHeartIndex < hearts1.length) {
            hearts1[lostHeartIndex].classList.add('heart-damage');
            setTimeout(() => {
                hearts1[lostHeartIndex].classList.remove('heart-damage');
            }, 500);
        }

        health1 -= amount;
        if (health1 <= 0) {
            health1 = 0;
            playerDied(1);
        }
    } else {
        // 动画效果显示受伤的心
        const lostHeartIndex = Math.floor(health2 - amount);
        if (lostHeartIndex >= 0 && lostHeartIndex < hearts2.length) {
            hearts2[lostHeartIndex].classList.add('heart-damage');
            setTimeout(() => {
                hearts2[lostHeartIndex].classList.remove('heart-damage');
            }, 500);
        }

        health2 -= amount;
        if (health2 <= 0) {
            health2 = 0;
            playerDied(2);
        }
    }
    updateHealthDisplay();

    // 闪烁红色效果
    const playerElements = playerNum === 1 ?
        [player1.querySelector('.torso'), player1.querySelector('.arm.left'),
            player1.querySelector('.arm.right'), player1.querySelector('.leg.left'),
            player1.querySelector('.leg.right')] :
        [player2.querySelector('.torso'), player2.querySelector('.arm.left'),
            player2.querySelector('.arm.right'), player2.querySelector('.leg.left'),
            player2.querySelector('.leg.right')];

    // 闪烁三次
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            playerElements.forEach(el => el.style.backgroundColor = 'red');

            setTimeout(() => {
                playerElements.forEach(el => {
                    el.style.backgroundColor = playerNum === 1 ? 'blue' : 'green';
                });
            }, 100);
        }, i * 200);
    }

    // 添加伤害效果文本
    createEffectText(
        (playerNum === 1 ? player1X : player2X),
        (playerNum === 1 ? player1Y : player2Y),
        '-' + amount
    );
}

// 处理玩家死亡
function playerDied(playerNum) {
    if (playerNum === 1) {
        player1Died = true;
        player1.classList.add('dead');
        createEffectText(player1X, player1Y - 20, "已阵亡!", "black");

        // 记录死亡时间
        player1DeathTime = new Date().getTime();

        // 如果玩家1死亡，解除所有抱起状态
        if (player1Carrying) {
            player1Carrying = false;
            player2.classList.remove('carried');
            player2.classList.remove('carried-position');
            player1.classList.remove('carrying');
        }
        if (player2Carrying) {
            player2Carrying = false;
            player1.classList.remove('carried');
            player1.classList.remove('carried-position');
            player2.classList.remove('carrying');
        }

        // 更新工具按钮状态
        updateToolButtons();
    } else {
        player2Died = true;
        player2.classList.add('dead');
        createEffectText(player2X, player2Y - 20, "已阵亡!", "black");

        // 记录死亡时间
        player2DeathTime = new Date().getTime();

        // 如果玩家2死亡，解除所有抱起状态
        if (player2Carrying) {
            player2Carrying = false;
            player1.classList.remove('carried');
            player1.classList.remove('carried-position');
            player2.classList.remove('carrying');
        }
        if (player1Carrying) {
            player1Carrying = false;
            player2.classList.remove('carried');
            player2.classList.remove('carried-position');
            player1.classList.remove('carrying');
        }

        // 更新工具按钮状态
        updateToolButtons();
    }
}

// 更新健康状态显示
function updateHealthDisplay() {
    hearts1.forEach((heart, index) => {
        if (index < health1) {
            heart.classList.remove('empty');
        } else {
            heart.classList.add('empty');
        }
    });
    hearts2.forEach((heart, index) => {
        if (index < health2) {
            heart.classList.remove('empty');
        } else {
            heart.classList.add('empty');
        }
    });
}

// 检测玩家碰撞并实现推开效果
function checkPlayerCollision() {
    if (player1Died || player2Died || player1Carrying || player2Carrying || player1Thrown || player2Thrown) {
        return;
    }

    // 玩家碰撞半径（两个玩家之间的最小距离）
    const minDistance = 50;

    // 计算两个玩家之间的距离
    const dx = player2X - player1X;
    const dy = player2Y - player1Y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 如果玩家重叠
    if (distance < minDistance) {
        // 计算重叠量
        const overlap = minDistance - distance;

        // 计算单位向量（从玩家1指向玩家2的方向）
        let unitX = dx / distance;
        let unitY = dy / distance;

        // 如果距离非常小，避免除以0，设置一个默认的推开方向
        if (distance < 1) {
            unitX = 1;
            unitY = 0;
        }

        // 计算推力（与相对速度和重叠量成比例）
        const p1Force = 0.3 * overlap;
        const p2Force = 0.3 * overlap;

        // 应用推力，移开两个玩家
        if (!player1Died) {
            player1VelX -= unitX * p1Force;
            player1VelY -= unitY * p1Force;
        }

        if (!player2Died) {
            player2VelX += unitX * p2Force;
            player2VelY += unitY * p2Force;
        }

        // 碰撞闪烁效果
        if (Math.random() < 0.1 && !player1.classList.contains('player-collision') && !player2.classList.contains('player-collision')) {
            player1.classList.add('player-collision');
            player2.classList.add('player-collision');

            setTimeout(() => {
                player1.classList.remove('player-collision');
                player2.classList.remove('player-collision');
            }, 300);
        }
    }
}

// 更新位置
function updatePositions() {
    // 更新玩家位置
    player1.style.left = player1X + 'px';
    player1.style.top = player1Y + 'px';
    player2.style.left = player2X + 'px';
    player2.style.top = player2Y + 'px';

    // 如果玩家1抱起玩家2
    if (player1Carrying) {
        player2X = player1X;
        player2Y = player1Y - 50;
    }

    // 如果玩家2抱起玩家1
    if (player2Carrying) {
        player1X = player2X;
        player1Y = player2Y - 50;
    }
}

// 殴打功能
function punch(playerNum) {
    if (playerNum === 1 && !p1PunchCooldown && !player1Died) {
        p1PunchCooldown = true;
        player1.classList.add('punching');

        // 震动效果
        const originalRotation = player1BodyRotation;
        player1.querySelector('.player-body').style.transform = `rotate(${originalRotation + 5}deg)`;

        setTimeout(() => {
            player1.querySelector('.player-body').style.transform = `rotate(${originalRotation - 3}deg)`;
            setTimeout(() => {
                player1.querySelector('.player-body').style.transform = `rotate(${originalRotation}deg)`;
                player1.classList.remove('punching');
                p1PunchCooldown = false;
            }, 150);
        }, 150);

        // 检查是否击中对方
        const distance = Math.sqrt(
            Math.pow(player1X - player2X, 2) +
            Math.pow(player1Y - player2Y, 2)
        );

        if (distance < 70 && !player2Died) {
            player2.classList.add('hit');

            // 击退效果
            let knockbackX = 0;
            let knockbackY = 0;

            // 根据玩家1面向的方向确定击退方向
            switch(player1Direction) {
                case 1: // 上
                    knockbackY = -50;
                    break;
                case 2: // 右
                    knockbackX = 50;
                    break;
                case 3: // 下
                    knockbackY = 50;
                    break;
                case 4: // 左
                    knockbackX = -50;
                    break;
            }

            // 添加击打效果
            createEffectText(player2X, player2Y, 'POW!');

            // 使用速度模拟击退，而不是直接设置位置
            player2VelX += knockbackX / 5;
            player2VelY += knockbackY / 5;

            // 如果有平底锅，伤害增加
            const damage = pan1Active ? 2 : 1;
            takeDamage(2, damage);

            setTimeout(() => {
                player2.classList.remove('hit');
            }, 500);
        }
    }

    if (playerNum === 2 && !p2PunchCooldown && !player2Died) {
        p2PunchCooldown = true;
        player2.classList.add('punching');

        // 震动效果
        const originalRotation = player2BodyRotation;
        player2.querySelector('.player-body').style.transform = `rotate(${originalRotation - 5}deg)`;

        setTimeout(() => {
            player2.querySelector('.player-body').style.transform = `rotate(${originalRotation + 3}deg)`;
            setTimeout(() => {
                player2.querySelector('.player-body').style.transform = `rotate(${originalRotation}deg)`;
                player2.classList.remove('punching');
                p2PunchCooldown = false;
            }, 150);
        }, 150);

        // 检查是否击中对方
        const distance = Math.sqrt(
            Math.pow(player1X - player2X, 2) +
            Math.pow(player1Y - player2Y, 2)
        );

        if (distance < 70 && !player1Died) {
            player1.classList.add('hit');

            // 击退效果
            let knockbackX = 0;
            let knockbackY = 0;

            // 根据玩家2面向的方向确定击退方向
            switch(player2Direction) {
                case 1: // 上
                    knockbackY = -50;
                    break;
                case 2: // 右
                    knockbackX = 50;
                    break;
                case 3: // 下
                    knockbackY = 50;
                    break;
                case 4: // 左
                    knockbackX = -50;
                    break;
            }

            // 添加击打效果
            createEffectText(player1X, player1Y, 'BAM!');

            // 使用速度模拟击退，而不是直接设置位置
            player1VelX += knockbackX / 5;
            player1VelY += knockbackY / 5;

            // 如果有平底锅，伤害增加
            const damage = pan2Active ? 2 : 1;
            takeDamage(1, damage);

            setTimeout(() => {
                player1.classList.remove('hit');
            }, 500);
        }
    }
}

// 尝试抱起另一个玩家
function tryToCarry(playerNum) {
    const carrier = playerNum === 1 ? player1 : player2;
    const target = playerNum === 1 ? player2 : player1;
    const carrierX = playerNum === 1 ? player1X : player2X;
    const carrierY = playerNum === 1 ? player1Y : player2Y;
    const targetX = playerNum === 1 ? player2X : player1X;
    const targetY = playerNum === 1 ? player2Y : player1Y;

    // 如果目标玩家已经死亡，不能抱起
    if ((playerNum === 1 && player2Died) || (playerNum === 2 && player1Died)) {
        return;
    }

    // 检查是否在抱起范围内（100像素）
    const distance = Math.sqrt(
        Math.pow(carrierX - targetX, 2) +
        Math.pow(carrierY - targetY, 2)
    );

    if (distance < 70) {
        if (playerNum === 1) {
            player1Carrying = true;
            player2.classList.add('carried');
            player2.classList.add('carried-position');
            player1.classList.add('carrying');

            // 抱起效果
            player2.style.transition = 'transform 0.3s, opacity 0.3s';
            player1.querySelector('.arm.left').style.transition = 'transform 0.3s';
            player1.querySelector('.arm.right').style.transition = 'transform 0.3s';
        } else {
            player2Carrying = true;
            player1.classList.add('carried');
            player1.classList.add('carried-position');
            player2.classList.add('carrying');

            // 抱起效果
            player1.style.transition = 'transform 0.3s, opacity 0.3s';
            player2.querySelector('.arm.left').style.transition = 'transform 0.3s';
            player2.querySelector('.arm.right').style.transition = 'transform 0.3s';
        }
    }
}

// 抛出玩家
function throwPlayer(playerNum) {
    if (playerNum === 1 && player1Carrying && !player1Died) {
        player1Carrying = false;
        player2.classList.remove('carried');
        player2.classList.remove('carried-position');
        player1.classList.remove('carrying');

        // 设置抛出速度和方向
        let throwPower = 15;

        switch(player1Direction) {
            case 1: // 上
                throwVelocityX2 = player1VelX * 0.5;
                throwVelocityY2 = -throwPower;
                break;
            case 2: // 右
                throwVelocityX2 = throwPower;
                throwVelocityY2 = -throwPower/2;
                break;
            case 3: // 下
                throwVelocityX2 = player1VelX * 0.5;
                throwVelocityY2 = throwPower/2;
                break;
            case 4: // 左
                throwVelocityX2 = -throwPower;
                throwVelocityY2 = -throwPower/2;
                break;
        }

        player2Thrown = true;

        // 抛出后的物理模拟
        const throwInterval = setInterval(() => {
            // 应用重力
            throwVelocityY2 += 0.5;

            // 创建轨迹
            createTrail(player2X + 25, player2Y + 35, 2);

            // 更新位置
            player2X += throwVelocityX2;
            player2Y += throwVelocityY2;

            // 边界检查
            if (player2X < 0) {
                player2X = 0;
                throwVelocityX2 = -throwVelocityX2 * 0.5;
            }
            if (player2X > 750) {
                player2X = 750;
                throwVelocityX2 = -throwVelocityX2 * 0.5;
            }
            if (player2Y > 530) {
                player2Y = 530;

                // 添加着陆效果
                createLandingEffect(player2X, player2Y);

                // 弹跳效果
                if (Math.abs(throwVelocityY2) > 3) {
                    throwVelocityY2 = -throwVelocityY2 * 0.3;
                } else {
                    throwVelocityY2 = 0;
                    throwVelocityX2 *= 0.8;
                    player2Thrown = false;
                    clearInterval(throwInterval);
                }
            }

            updatePositions();
        }, 30);
    }

    if (playerNum === 2 && player2Carrying && !player2Died) {
        player2Carrying = false;
        player1.classList.remove('carried');
        player1.classList.remove('carried-position');
        player2.classList.remove('carrying');

        // 设置抛出速度和方向
        let throwPower = 15;

        switch(player2Direction) {
            case 1: // 上
                throwVelocityX1 = player2VelX * 0.5;
                throwVelocityY1 = -throwPower;
                break;
            case 2: // 右
                throwVelocityX1 = throwPower;
                throwVelocityY1 = -throwPower/2;
                break;
            case 3: // 下
                throwVelocityX1 = player2VelX * 0.5;
                throwVelocityY1 = throwPower/2;
                break;
            case 4: // 左
                throwVelocityX1 = -throwPower;
                throwVelocityY1 = -throwPower/2;
                break;
        }

        player1Thrown = true;

        // 抛出后的物理模拟
        const throwInterval = setInterval(() => {
            // 应用重力
            throwVelocityY1 += 0.5;

            // 创建轨迹
            createTrail(player1X + 25, player1Y + 35, 1);

            // 更新位置
            player1X += throwVelocityX1;
            player1Y += throwVelocityY1;

            // 边界检查
            if (player1X < 0) {
                player1X = 0;
                throwVelocityX1 = -throwVelocityX1 * 0.5;
            }
            if (player1X > 750) {
                player1X = 750;
                throwVelocityX1 = -throwVelocityX1 * 0.5;
            }
            if (player1Y > 530) {
                player1Y = 530;

                // 添加着陆效果
                createLandingEffect(player1X, player1Y);

                // 弹跳效果
                if (Math.abs(throwVelocityY1) > 3) {
                    throwVelocityY1 = -throwVelocityY1 * 0.3;
                } else {
                    throwVelocityY1 = 0;
                    throwVelocityX1 *= 0.8;
                    player1Thrown = false;
                    clearInterval(throwInterval);
                }
            }

            updatePositions();
        }, 30);
    }
}

// 更新行走动画状态
function updateWalkingState() {
    const player1Moving = keysPressed['w'] || keysPressed['W'] ||
        keysPressed['a'] || keysPressed['A'] ||
        keysPressed['s'] || keysPressed['S'] ||
        keysPressed['d'] || keysPressed['D'];

    const player2Moving = keysPressed['ArrowUp'] || keysPressed['ArrowDown'] ||
        keysPressed['ArrowLeft'] || keysPressed['ArrowRight'];

    if (player1Moving && !player1Walking && !player1Thrown && !player2Carrying && !player1Died) {
        player1Walking = true;
        player1.classList.add('walking');
    } else if (!player1Moving && player1Walking) {
        player1Walking = false;
        player1.classList.remove('walking');
    }

    if (player2Moving && !player2Walking && !player2Thrown && !player1Carrying && !player2Died) {
        player2Walking = true;
        player2.classList.add('walking');
    } else if (!player2Moving && player2Walking) {
        player2Walking = false;
        player2.classList.remove('walking');
    }
}