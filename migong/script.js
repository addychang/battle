document.addEventListener('DOMContentLoaded', () => {
    // --- 配置 ---
    const MAZE_WIDTH = 21; // 迷宫宽度 (必须是奇数)
    const MAZE_HEIGHT = 15; // 迷宫高度 (必须是奇数)
    const CELL_SIZE = 20; // 单元格大小 (像素) - 必须与 CSS 中的 .cell 宽高一致
    const DEVIL_MOVE_INTERVAL = 700; // 魔鬼移动间隔 (毫秒)
    const TIMER_UPDATE_INTERVAL = 100; // 计时器更新间隔 (毫秒)

    // --- 单元格类型常量 ---
    const WALL = 0;
    const PATH = 1;
    const PLAYER = 2;
    const DEVIL = 3;
    const END = 4;

    // --- DOM 元素 ---
    const mazeContainer = document.getElementById('maze-container');
    const timerDisplay = document.getElementById('timer');
    const statusDisplay = document.getElementById('status');
    const restartButton = document.getElementById('restart-button');

    // --- 游戏状态变量 ---
    let maze = []; // 存储迷宫数据的二维数组
    let playerPos = { r: 1, c: 1 }; // 玩家起始位置
    let devilPos = { r: -1, c: -1 }; // 魔鬼位置 (初始无效)
    let endPos = { r: MAZE_HEIGHT - 2, c: MAZE_WIDTH - 2 }; // 终点位置
    let gameState = 'ready'; // 'ready', 'playing', 'won', 'lost'
    let startTime = 0;
    let timerInterval = null;
    let devilInterval = null;
    let keydownListener = null; // 用于存储事件监听器，方便移除

    // --- 初始化游戏 ---
    function initGame() {
        console.log("Initializing game...");
        // 清理旧状态
        clearInterval(timerInterval);
        clearInterval(devilInterval);
        if (keydownListener) {
            document.removeEventListener('keydown', keydownListener);
        }
        mazeContainer.innerHTML = ''; // 清空旧迷宫
        mazeContainer.style.width = `${MAZE_WIDTH * CELL_SIZE}px`;
        mazeContainer.style.height = `${MAZE_HEIGHT * CELL_SIZE}px`;
        mazeContainer.style.gridTemplateColumns = `repeat(${MAZE_WIDTH}, ${CELL_SIZE}px)`;
        mazeContainer.style.gridTemplateRows = `repeat(${MAZE_HEIGHT}, ${CELL_SIZE}px)`;

        // 重置状态变量
        playerPos = { r: 1, c: 1 };
        endPos = { r: MAZE_HEIGHT - 2, c: MAZE_WIDTH - 2 };
        gameState = 'playing';
        statusDisplay.textContent = '状态: 进行中';
        timerDisplay.textContent = '时间: 00:00';

        // 1. 生成迷宫数据
        generateMazeData();

        // 2. 设置玩家、终点
        maze[playerPos.r][playerPos.c] = PLAYER;
        maze[endPos.r][endPos.c] = END;

        // 3. 随机放置魔鬼
        placeDevilRandomly();
        if (devilPos.r !== -1) { // 确保魔鬼成功放置
            maze[devilPos.r][devilPos.c] = DEVIL;
        } else {
            console.warn("Could not place devil.");
        }

        // 4. 绘制迷宫到 DOM
        drawMaze();

        // 5. 启动计时器
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, TIMER_UPDATE_INTERVAL);

        // 6. 启动魔鬼移动
        if (devilPos.r !== -1) {
            devilInterval = setInterval(moveDevil, DEVIL_MOVE_INTERVAL);
        }

        // 7. 添加键盘监听
        keydownListener = handleKeyDown; // 保存引用
        document.addEventListener('keydown', keydownListener);
        console.log("Game started!");
    }

    // --- 迷宫生成 (使用递归回溯算法) ---
    function generateMazeData() {
        // 1. 初始化迷宫，全部填满墙
        maze = Array.from({ length: MAZE_HEIGHT }, () => Array(MAZE_WIDTH).fill(WALL));

        // 2. 递归函数，用于挖掘路径
        function carvePassages(r, c) {
            maze[r][c] = PATH; // 将当前单元格标记为通路

            // 定义四个方向的移动向量 (随机打乱顺序)
            const directions = [
                { dr: -2, dc: 0 }, // 上
                { dr: 2, dc: 0 },  // 下
                { dr: 0, dc: -2 }, // 左
                { dr: 0, dc: 2 }   // 右
            ].sort(() => Math.random() - 0.5); // 随机排序

            for (const move of directions) {
                const nr = r + move.dr; // 新行
                const nc = c + move.dc; // 新列
                const wallR = r + move.dr / 2; // 中间的墙行
                const wallC = c + move.dc / 2; // 中间的墙列

                // 检查新位置是否在边界内，并且是未访问过的墙
                if (nr > 0 && nr < MAZE_HEIGHT - 1 && nc > 0 && nc < MAZE_WIDTH - 1 && maze[nr][nc] === WALL) {
                    maze[wallR][wallC] = PATH; // 打破中间的墙
                    carvePassages(nr, nc);     // 递归访问新单元格
                }
            }
        }

        // 从起始点开始挖掘
        carvePassages(1, 1);

        // 确保终点是通路 (有时生成器可能不会连接到右下角)
        if (maze[MAZE_HEIGHT - 2][MAZE_WIDTH - 2] === WALL) {
            // 如果终点是墙，简单地强制打通它和它左边或上边的墙
            if(maze[MAZE_HEIGHT - 2][MAZE_WIDTH - 3] === PATH) {
                maze[MAZE_HEIGHT - 2][MAZE_WIDTH - 2] = PATH;
            } else if (maze[MAZE_HEIGHT - 3][MAZE_WIDTH - 2] === PATH){
                maze[MAZE_HEIGHT - 2][MAZE_WIDTH - 2] = PATH;
            }
            // 如果还不行，可能需要更复杂的处理，但通常递归回溯能保证连通性
        }
        console.log("Maze data generated.");
    }

    // --- 随机放置魔鬼 ---
    function placeDevilRandomly() {
        const pathCells = [];
        for (let r = 1; r < MAZE_HEIGHT - 1; r++) {
            for (let c = 1; c < MAZE_WIDTH - 1; c++) {
                // 确保是通路，且不是玩家起始点或终点
                if (maze[r][c] === PATH && !(r === playerPos.r && c === playerPos.c) && !(r === endPos.r && c === endPos.c)) {
                    // 稍微远离玩家出生点
                    if (Math.abs(r - playerPos.r) + Math.abs(c - playerPos.c) > 5) {
                        pathCells.push({ r, c });
                    }
                }
            }
        }

        if (pathCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * pathCells.length);
            devilPos = pathCells[randomIndex];
            console.log(`Devil placed at: ${devilPos.r}, ${devilPos.c}`);
        } else {
            devilPos = { r: -1, c: -1 }; // 找不到合适位置
            console.warn("Could not find suitable place for devil.");
        }
    }


    // --- 绘制迷宫到 DOM ---
    function drawMaze() {
        mazeContainer.innerHTML = ''; // 清空现有内容
        for (let r = 0; r < MAZE_HEIGHT; r++) {
            for (let c = 0; c < MAZE_WIDTH; c++) {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');
                cellDiv.dataset.r = r; // 存储行信息
                cellDiv.dataset.c = c; // 存储列信息
                cellDiv.id = `cell-${r}-${c}`; // 给每个单元格一个唯一ID，方便更新

                switch (maze[r][c]) {
                    case WALL:
                        cellDiv.classList.add('wall');
                        break;
                    case PATH:
                        cellDiv.classList.add('path');
                        break;
                    case PLAYER:
                        cellDiv.classList.add('path', 'player'); // 玩家在通路上
                        break;
                    case DEVIL:
                        cellDiv.classList.add('path', 'devil'); // 魔鬼在通路上
                        break;
                    case END:
                        cellDiv.classList.add('path', 'end'); // 终点在通路上
                        break;
                }
                mazeContainer.appendChild(cellDiv);
            }
        }
        // console.log("Maze drawn.");
    }

    // --- 更新单个单元格的 DOM 显示 ---
    function updateCellDOM(r, c, type) {
        const cellDiv = document.getElementById(`cell-${r}-${c}`);
        if (!cellDiv) return;

        // 移除所有可能的类型 class
        cellDiv.classList.remove('wall', 'path', 'player', 'devil', 'end');

        // 添加基础类型 class
        if (type === WALL) {
            cellDiv.classList.add('wall');
        } else {
            cellDiv.classList.add('path'); // Player, Devil, End 都在 Path 上
        }

        // 添加特殊类型 class
        switch (type) {
            case PLAYER:
                cellDiv.classList.add('player');
                break;
            case DEVIL:
                cellDiv.classList.add('devil');
                break;
            case END:
                cellDiv.classList.add('end');
                break;
        }
    }


    // --- 处理键盘按下事件 ---
    function handleKeyDown(event) {
        if (gameState !== 'playing') return; // 游戏结束或未开始，不处理

        let dr = 0, dc = 0;
        switch (event.key) {
            case 'ArrowUp':
            case 'w': // 支持 WASD
                dr = -1;
                break;
            case 'ArrowDown':
            case 's':
                dr = 1;
                break;
            case 'ArrowLeft':
            case 'a':
                dc = -1;
                break;
            case 'ArrowRight':
            case 'd':
                dc = 1;
                break;
            default:
                return; // 非方向键，不处理
        }

        event.preventDefault(); // 阻止页面滚动

        const nextR = playerPos.r + dr;
        const nextC = playerPos.c + dc;

        // 检查目标位置是否有效 (非墙)
        if (maze[nextR] !== undefined && maze[nextR][nextC] !== undefined && maze[nextR][nextC] !== WALL) {
            // 移动玩家
            const oldR = playerPos.r;
            const oldC = playerPos.c;

            // 更新数据模型
            maze[oldR][oldC] = PATH; // 旧位置变回通路
            playerPos = { r: nextR, c: nextC };
            const nextCellType = maze[nextR][nextC]; // 记录目标单元格原始类型 (可能是 END 或 DEVIL)
            maze[nextR][nextC] = PLAYER; // 新位置标记为玩家

            // 更新 DOM (只更新变化的两个格子)
            updateCellDOM(oldR, oldC, PATH);
            updateCellDOM(nextR, nextC, PLAYER);

            // 检查游戏状态
            checkGameStatus();
        }
    }

// --- 移动魔鬼 (尝试避免立即返回) ---
    function moveDevil() {
        if (gameState !== 'playing' || devilPos.r === -1) return;

        const possibleMoves = [];
        const directions = [
            { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
        ];

        // 1. 查找所有可以移动的相邻单元格 (通路、玩家、终点)
        for (const move of directions) {
            const nr = devilPos.r + move.dr;
            const nc = devilPos.c + move.dc;
            // 检查边界和是否为墙
            if (maze[nr] !== undefined && maze[nr][nc] !== undefined && maze[nr][nc] !== WALL) {
                possibleMoves.push({ r: nr, c: nc });
            }
        }

        if (possibleMoves.length > 0) {
            let nextMove;

            // 2. 尝试选择一个不是上一步位置的移动方向
            const preferredMoves = possibleMoves.filter(move =>
                !(move.r === devilPrevPos.r && move.c === devilPrevPos.c)
            );

            if (preferredMoves.length > 0) {
                // 如果有非返回的选择，从中随机选一个
                nextMove = preferredMoves[Math.floor(Math.random() * preferredMoves.length)];
            } else if (possibleMoves.length > 0) {
                // 如果唯一的选择是返回 (例如在死胡同里)，或者只有一个出口，那就只能选择它
                nextMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            } else {
                // 没有可移动的地方 (理论上不应发生，除非被完全围住)
                return;
            }

            // --- 更新位置和状态 ---
            const oldR = devilPos.r;
            const oldC = devilPos.c;
            const newR = nextMove.r;
            const newC = nextMove.c;

            // 3. 记录当前位置，作为下一次移动的“上一步位置”
            devilPrevPos = { r: oldR, c: oldC };

            // 4. 更新数据模型 - 旧位置恢复原状
            //    注意：如果魔鬼在终点格子上，离开后那里应该还是终点
            const oldCellType = (oldR === endPos.r && oldC === endPos.c) ? END : PATH;
            maze[oldR][oldC] = oldCellType;

            // 5. 更新 DOM - 旧位置
            updateCellDOM(oldR, oldC, oldCellType);

            // 6. 更新魔鬼的坐标变量
            devilPos = { r: newR, c: newC };

            // 7. 检查是否移动到了玩家位置
            if (playerPos.r === devilPos.r && playerPos.c === devilPos.c) {
                // 魔鬼抓住了玩家
                checkGameStatus(); // 这会触发 gameOver('lost')
                return; // 游戏结束，不需要绘制魔鬼在新位置
            }

            // 8. 如果没抓住玩家，更新数据模型 - 新位置标记为魔鬼
            //    注意：如果魔鬼移动到终点格子上，模型上那里仍然是 END
            if (!(newR === endPos.r && newC === endPos.c)) {
                maze[newR][newC] = DEVIL;
                // 9. 更新 DOM - 新位置显示为魔鬼
                updateCellDOM(newR, newC, DEVIL);
            } else {
                // 如果魔鬼移动到了终点格子（但玩家不在那），保持终点标记
                // 模型已经是 END，确保 DOM 也显示 END
                updateCellDOM(newR, newC, END);
                // 魔鬼暂时在视觉上“消失”在终点格，直到它移开
            }

            // 10. 再次检查游戏状态 (虽然抓捕已检查，但保留以防万一)
            // checkGameStatus(); // 可能不再严格需要，因为上面已经处理了碰撞
        }
    }

    // --- 检查游戏状态 (胜利/失败) ---
    function checkGameStatus() {
        if (gameState !== 'playing') return; // 避免重复检查

        // 检查是否被魔鬼抓住
        if (playerPos.r === devilPos.r && playerPos.c === devilPos.c) {
            gameOver('lost');
            return; // 游戏结束，无需再检查胜利
        }

        // 检查是否到达终点
        if (playerPos.r === endPos.r && playerPos.c === endPos.c) {
            gameOver('won');
        }
    }

    // --- 更新计时器 ---
    function updateTimer() {
        if (gameState !== 'playing') return;

        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
        const seconds = String(elapsedSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `时间: ${minutes}:${seconds}`;
    }

    // --- 游戏结束处理 ---
    function gameOver(result) {
        if (gameState !== 'playing') return; // 防止重复调用

        clearInterval(timerInterval);
        clearInterval(devilInterval);
        document.removeEventListener('keydown', keydownListener); // 移除监听
        keydownListener = null;

        if (result === 'won') {
            gameState = 'won';
            statusDisplay.textContent = '状态: 你赢了!';
            showOverlay('恭喜你！成功逃脱！');
            console.log("Game Won!");
        } else if (result === 'lost') {
            gameState = 'lost';
            statusDisplay.textContent = '状态: 你被抓住了!';
            // 让魔鬼图标显示在玩家位置上
            updateCellDOM(playerPos.r, playerPos.c, DEVIL);
            showOverlay('游戏结束！你被魔鬼抓住了！');
            console.log("Game Lost!");
        }
    }

    // --- 显示游戏结束的覆盖层 (可选) ---
    function showOverlay(message) {
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.textContent = message;
        mazeContainer.appendChild(overlay);
    }


    // --- 事件监听器 ---
    restartButton.addEventListener('click', initGame);

    // --- 首次加载时初始化游戏 ---
    initGame();
});