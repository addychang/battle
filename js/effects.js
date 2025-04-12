// js/effects.js
// 游戏视觉效果

// 创建轨迹效果
function createTrail(x, y, playerNum) {
    const trail = document.createElement('div');
    trail.className = 'player-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    trail.style.backgroundColor = playerNum === 1 ? 'rgba(0, 0, 255, 0.3)' : 'rgba(0, 128, 0, 0.3)';
    game.appendChild(trail);

    // 淡出效果
    setTimeout(() => {
        trail.style.opacity = 0;
        trail.style.transform = 'scale(0.5)';
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 500);
    }, 10);
}

// 创建着陆效果
function createLandingEffect(x, y) {
    const landingEffect = document.createElement('div');
    landingEffect.style.position = 'absolute';
    landingEffect.style.left = (x - 10) + 'px';
    landingEffect.style.top = (y + 70) + 'px';
    landingEffect.style.width = '70px';
    landingEffect.style.height = '10px';
    landingEffect.style.backgroundColor = 'rgba(100,100,100,0.5)';
    landingEffect.style.borderRadius = '50%';
    landingEffect.style.transform = 'scale(0.5, 1)';
    landingEffect.style.opacity = '0.7';
    landingEffect.style.transition = 'transform 0.2s, opacity 0.4s';
    game.appendChild(landingEffect);

    setTimeout(() => {
        landingEffect.style.transform = 'scale(1, 0.5)';
        landingEffect.style.opacity = '0';
        setTimeout(() => {
            if (landingEffect.parentNode) {
                landingEffect.parentNode.removeChild(landingEffect);
            }
        }, 400);
    }, 10);
}

// 创建爆炸效果
function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    explosion.style.transform = 'scale(0)';
    game.appendChild(explosion);

    setTimeout(() => {
        explosion.style.transform = 'scale(2)';
        setTimeout(() => {
            explosion.style.opacity = '0';
            setTimeout(() => {
                if (explosion.parentNode) {
                    explosion.parentNode.removeChild(explosion);
                }
            }, 300);
        }, 200);
    }, 10);
}

// 创建效果文本
function createEffectText(x, y, text, color = 'red') {
    const effectText = document.createElement('div');
    effectText.className = 'effect-text';
    effectText.style.left = x + 'px';
    effectText.style.top = y + 'px';
    effectText.style.color = color;
    effectText.textContent = text;
    game.appendChild(effectText);

    setTimeout(() => {
        effectText.style.transform = 'translateY(-30px)';
        effectText.style.opacity = '0';
        setTimeout(() => {
            if (effectText.parentNode) {
                effectText.parentNode.removeChild(effectText);
            }
        }, 1000);
    }, 10);

    return effectText;
}