// js/config.js
// 游戏配置和全局变量

// DOM 元素获取
const game = document.getElementById('game');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const score1Element = document.getElementById('scoreValue1');
const score2Element = document.getElementById('scoreValue2');
const totalScore1Element = document.getElementById('totalScore1');
const totalScore2Element = document.getElementById('totalScore2');
const hearts1 = document.querySelectorAll('#health1 .heart');
const hearts2 = document.querySelectorAll('#health2 .heart');
const shopButton = document.getElementById('shop-button');
const shopModal = document.getElementById('shop-modal');
const closeShop = document.querySelector('.close-shop');
const p1Tab = document.getElementById('p1-tab');
const p2Tab = document.getElementById('p2-tab');
const p1Shop = document.getElementById('p1-shop');
const p2Shop = document.getElementById('p2-shop');
const buyPanP1 = document.getElementById('buy-pan-p1');
const buyHammerP1 = document.getElementById('buy-hammer-p1');
const buyMedkitP1 = document.getElementById('buy-medkit-p1');
const buyPanP2 = document.getElementById('buy-pan-p2');
const buyHammerP2 = document.getElementById('buy-hammer-p2');
const buyMedkitP2 = document.getElementById('buy-medkit-p2');
const p1PanCount = document.getElementById('p1-pan-count');
const p1HammerCount = document.getElementById('p1-hammer-count');
const p1MedkitCount = document.getElementById('p1-medkit-count');
const p2PanCount = document.getElementById('p2-pan-count');
const p2HammerCount = document.getElementById('p2-hammer-count');
const p2MedkitCount = document.getElementById('p2-medkit-count');
const pan1Button = document.getElementById('pan1');
const hammer1Button = document.getElementById('hammer1');
const medkit1Button = document.getElementById('medkit1');
const pan2Button = document.getElementById('pan2');
const hammer2Button = document.getElementById('hammer2');
const medkit2Button = document.getElementById('medkit2');
const gameTimeElement = document.getElementById('game-time');
const difficultyIndicator = document.querySelector('.difficulty-indicator');

// 游戏状态变量
let player1X = 175;
let player1Y = 480;
let player2X = 575;
let player2Y = 480;
let score1 = 0;
let score2 = 0;
let totalScore1 = 0;
let totalScore2 = 0;
let health1 = 10;
let health2 = 10;
let gameLoop;
let isGameOver = false;
let player1Died = false;
let player2Died = false;

// 记录玩家死亡时间
let player1DeathTime = null;
let player2DeathTime = null;

// 游戏难度系统
let gameStartTime = null;
let gameCurrentTime = 0;
let difficultyLevel = 1;
let obstacleFallBaseSpeed = 3;
let obstacleSpawnInterval = 1000;
let obstacleSpawnCount = 1;
let obstacleTimerId = null;

// 方向记录 (1:上, 2:右, 3:下, 4:左)
let player1Direction = 2;
let player2Direction = 4;

// 玩家速度和动画状态
let player1VelX = 0;
let player1VelY = 0;
let player2VelX = 0;
let player2VelY = 0;
let player1Walking = false;
let player2Walking = false;
const maxSpeed = 5;
const acceleration = 0.7;
const friction = 0.8;

// 玩家身体转向变量
let player1BodyRotation = 0;
let player2BodyRotation = 0;

// 道具数量
let p1Pans = 0;
let p1Hammers = 0;
let p1Medkits = 0;
let p2Pans = 0;
let p2Hammers = 0;
let p2Medkits = 0;

// 道具状态
let hammer1Active = false;
let hammer2Active = false;
let hammer1Shield = null;
let hammer2Shield = null;
let pan1Active = false;
let pan2Active = false;
let pan1Effect = null;
let pan2Effect = null;
let pan1Timeout = null;
let pan2Timeout = null;

// 抱起状态
let player1Carrying = false;
let player2Carrying = false;

// 抛出状态和速度
let player1Thrown = false;
let player2Thrown = false;
let throwVelocityX1 = 0;
let throwVelocityY1 = 0;
let throwVelocityX2 = 0;
let throwVelocityY2 = 0;

// 殴打冷却
let p1PunchCooldown = false;
let p2PunchCooldown = false;

// 键盘状态对象初始化
const keysPressed = {};