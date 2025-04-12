// js/items.js
// 道具功能实现

// 平底锅功能
function usePan(playerNum) {
    if ((playerNum === 1 && p1Pans > 0 && !player1Died) ||
        (playerNum === 2 && p2Pans > 0 && !player2Died)) {

        // 创建平底锅效果
        const panEffect = document.createElement('div');
        panEffect.className = 'frying-pan-active';

        if (playerNum === 1) {
            p1Pans--;
            pan1Active = true;

            // 清除之前的效果
            if (pan1Effect && pan1Effect.parentNode) {
                pan1Effect.parentNode.removeChild(pan1Effect);
            }
            if (pan1Timeout) {
                clearTimeout(pan1Timeout);
            }

            pan1Effect = panEffect;
            player1.appendChild(panEffect);
            panEffect.style.right = '-15px';
            panEffect.style.top = '30px';

            // 持续30秒
            pan1Timeout = setTimeout(() => {
                pan1Active = false;
                if (pan1Effect && pan1Effect.parentNode) {
                    pan1Effect.parentNode.removeChild(pan1Effect);
                }
                pan1Effect = null;
            }, 30000);

            createEffectText(player1X, player1Y - 30, "平底锅激活！", "#FF9800");
        } else {
            p2Pans--;
            pan2Active = true;

            // 清除之前的效果
            if (pan2Effect && pan2Effect.parentNode) {
                pan2Effect.parentNode.removeChild(pan2Effect);
            }
            if (pan2Timeout) {
                clearTimeout(pan2Timeout);
            }

            pan2Effect = panEffect;
            player2.appendChild(panEffect);
            panEffect.style.left = '-15px';
            panEffect.style.top = '30px';

            // 持续30秒
            pan2Timeout = setTimeout(() => {
                pan2Active = false;
                if (pan2Effect && pan2Effect.parentNode) {
                    pan2Effect.parentNode.removeChild(pan2Effect);
                }
                pan2Effect = null;
            }, 30000);

            createEffectText(player2X, player2Y - 30, "平底锅激活！", "#FF9800");
        }

        updateToolButtons();
    }
}

// 流星锤功能
function useHammer(playerNum) {
    if ((playerNum === 1 && p1Hammers > 0 && !hammer1Active && !player1Died) ||
        (playerNum === 2 && p2Hammers > 0 && !hammer2Active && !player2Died)) {

        // 创建保护罩
        const shield = document.createElement('div');
        shield.className = 'hammer-shield';
        shield.style.transform = 'scale(0)';
        shield.style.opacity = '0';
        shield.style.transition = 'transform 0.3s, opacity 0.3s';
        game.appendChild(shield);

        setTimeout(() => {
            shield.style.transform = 'scale(1)';
            shield.style.opacity = '1';
        }, 10);

        if (playerNum === 1) {
            p1Hammers--;
            hammer1Active = true;
            hammer1Shield = shield;
        } else {
            p2Hammers--;
            hammer2Active = true;
            hammer2Shield = shield;
        }

        updateToolButtons();

        // 保护罩持续时间
        setTimeout(() => {
            if (playerNum === 1) {
                hammer1Active = false;
                if (hammer1Shield && hammer1Shield.parentNode) {
                    hammer1Shield.style.transform = 'scale(0)';
                    hammer1Shield.style.opacity = '0';
                    setTimeout(() => {
                        if (hammer1Shield && hammer1Shield.parentNode) {
                            hammer1Shield.parentNode.removeChild(hammer1Shield);
                        }
                    }, 300);
                }
                hammer1Shield = null;
            } else {
                hammer2Active = false;
                if (hammer2Shield && hammer2Shield.parentNode) {
                    hammer2Shield.style.transform = 'scale(0)';
                    hammer2Shield.style.opacity = '0';
                    setTimeout(() => {
                        if (hammer2Shield && hammer2Shield.parentNode) {
                            hammer2Shield.parentNode.removeChild(hammer2Shield);
                        }
                    }, 300);
                }
                hammer2Shield = null;
            }
        }, 5000);
    }
}

// 医疗包功能
function useMedkit(playerNum) {
    if ((playerNum === 1 && p1Medkits > 0) || (playerNum === 2 && p2Medkits > 0)) {
        // 创建医疗效果
        const medkitEffect = document.createElement('div');
        medkitEffect.className = 'medkit-effect';
        game.appendChild(medkitEffect);

        const playerX = playerNum === 1 ? player1X : player2X;
        const playerY = playerNum === 1 ? player1Y : player2Y;

        medkitEffect.style.left = (playerX - 40) + 'px';
        medkitEffect.style.top = (playerY - 15) + 'px';

        if (playerNum === 1) {
            p1Medkits--;

            // 复活或满血
            if (player1Died) {
                player1Died = false;
                player1.classList.remove('dead');
                player1DeathTime = null;
                createEffectText(player1X, player1Y - 40, "复活！", "green");
            } else {
                createEffectText(player1X, player1Y - 40, "满血！", "green");
            }

            health1 = 10;
        } else {
            p2Medkits--;

            // 复活或满血
            if (player2Died) {
                player2Died = false;
                player2.classList.remove('dead');
                player2DeathTime = null;
                createEffectText(player2X, player2Y - 40, "复活！", "green");
            } else {
                createEffectText(player2X, player2Y - 40, "满血！", "green");
            }

            health2 = 10;
        }

        updateHealthDisplay();
        updateToolButtons();

        // 删除效果
        setTimeout(() => {
            if (medkitEffect.parentNode) {
                medkitEffect.style.opacity = '0';
                setTimeout(() => {
                    if (medkitEffect.parentNode) {
                        medkitEffect.parentNode.removeChild(medkitEffect);
                    }
                }, 300);
            }
        }, 1000);
    }
}

// 更新保护罩位置
function updateShieldPosition() {
    if (hammer1Active && hammer1Shield) {
        hammer1Shield.style.left = (player1X - 25) + 'px';
        hammer1Shield.style.top = (player1Y - 15) + 'px';
    }
    if (hammer2Active && hammer2Shield) {
        hammer2Shield.style.left = (player2X - 25) + 'px';
        hammer2Shield.style.top = (player2Y - 15) + 'px';
    }
}

// 道具使用按钮事件监听
pan1Button.addEventListener('click', () => usePan(1));
hammer1Button.addEventListener('click', () => useHammer(1));
medkit1Button.addEventListener('click', () => useMedkit(1));
pan2Button.addEventListener('click', () => usePan(2));
hammer2Button.addEventListener('click', () => useHammer(2));
medkit2Button.addEventListener('click', () => useMedkit(2));

// 更新工具按钮状态
function updateToolButtons() {
    pan1Button.textContent = `平底锅 (${p1Pans})`;
    hammer1Button.textContent = `流星锤 (${p1Hammers})`;
    medkit1Button.textContent = `医疗包 (${p1Medkits})`;
    pan2Button.textContent = `平底锅 (${p2Pans})`;
    hammer2Button.textContent = `流星锤 (${p2Hammers})`;
    medkit2Button.textContent = `医疗包 (${p2Medkits})`;

    pan1Button.disabled = p1Pans <= 0 || player1Died;
    hammer1Button.disabled = p1Hammers <= 0 || player1Died;
    medkit1Button.disabled = p1Medkits <= 0;
    pan2Button.disabled = p2Pans <= 0 || player2Died;
    hammer2Button.disabled = p2Hammers <= 0 || player2Died;
    medkit2Button.disabled = p2Medkits <= 0;
}