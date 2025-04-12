// js/shop.js
// 商店功能实现

// 商店功能
shopButton.addEventListener('click', () => {
    shopModal.style.display = 'block';
    setTimeout(() => {
        shopModal.classList.add('shop-modal-visible');
    }, 10);
    updateShopDisplay();
});

closeShop.addEventListener('click', () => {
    shopModal.classList.remove('shop-modal-visible');
    setTimeout(() => {
        shopModal.style.display = 'none';
    }, 300);
});

p1Tab.addEventListener('click', () => {
    p1Shop.style.display = 'flex';
    p2Shop.style.display = 'none';
    p1Tab.classList.add('active');
    p2Tab.classList.remove('active');
});

p2Tab.addEventListener('click', () => {
    p1Shop.style.display = 'none';
    p2Shop.style.display = 'flex';
    p2Tab.classList.add('active');
    p1Tab.classList.remove('active');
});

// 购买功能
buyPanP1.addEventListener('click', () => {
    if (totalScore1 >= 10) {
        totalScore1 -= 10;
        p1Pans++;
        updateShopDisplay();
        updateToolButtons();
    }
});

buyHammerP1.addEventListener('click', () => {
    if (totalScore1 >= 20) {
        totalScore1 -= 20;
        p1Hammers++;
        updateShopDisplay();
        updateToolButtons();
    }
});

buyMedkitP1.addEventListener('click', () => {
    if (totalScore1 >= 30) {
        totalScore1 -= 30;
        p1Medkits++;
        updateShopDisplay();
        updateToolButtons();
    }
});

buyPanP2.addEventListener('click', () => {
    if (totalScore2 >= 10) {
        totalScore2 -= 10;
        p2Pans++;
        updateShopDisplay();
        updateToolButtons();
    }
});

buyHammerP2.addEventListener('click', () => {
    if (totalScore2 >= 20) {
        totalScore2 -= 20;
        p2Hammers++;
        updateShopDisplay();
        updateToolButtons();
    }
});

buyMedkitP2.addEventListener('click', () => {
    if (totalScore2 >= 30) {
        totalScore2 -= 30;
        p2Medkits++;
        updateShopDisplay();
        updateToolButtons();
    }
});

// 更新商店显示
function updateShopDisplay() {
    totalScore1Element.textContent = totalScore1;
    totalScore2Element.textContent = totalScore2;
    p1PanCount.textContent = p1Pans;
    p1HammerCount.textContent = p1Hammers;
    p1MedkitCount.textContent = p1Medkits;
    p2PanCount.textContent = p2Pans;
    p2HammerCount.textContent = p2Hammers;
    p2MedkitCount.textContent = p2Medkits;

    buyPanP1.disabled = totalScore1 < 10;
    buyHammerP1.disabled = totalScore1 < 20;
    buyMedkitP1.disabled = totalScore1 < 30;
    buyPanP2.disabled = totalScore2 < 10;
    buyHammerP2.disabled = totalScore2 < 20;
    buyMedkitP2.disabled = totalScore2 < 30;
}