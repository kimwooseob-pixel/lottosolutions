// 벽돌깨기 게임 JavaScript

// Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyAwh55rLOQkY8ZVCzaC4ZF3iaUVU5Vu0GM",
    authDomain: "ai-lottosolutions.firebaseapp.com",
    databaseURL: "https://ai-lottosolutions-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ai-lottosolutions",
    storageBucket: "ai-lottosolutions.appspot.com",
    messagingSenderId: "616782090306",
    appId: "1:616782090306:web:34f8d03f7fc7c3555e8c17"
};

// Firebase 초기화가 되어있지 않다면 초기화
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// 게임 상태 관리
const gameState = {
    score: 0,
    lives: 3,
    level: 1,
    gameStarted: false,
    gamePaused: false,
    gameOver: false,
    winningNumbers: {},
    currentDraw: null,
    ball: {
        x: 0,        // 공의 x 좌표
        y: 0,        // 공의 y 좌표
        dx: 0,       // x 방향 속도
        dy: 0,       // y 방향 속도
        speed: 5,    // 기본 속도
        size: 8      // 공의 크기
    },
    paddle: {
        width: 80,
        height: 10,
        speed: 8
    },
    bricks: [],
    container: null,
    animationId: null
};

// 기본 당첨번호 데이터 (Firebase 연결 전 사용)
const defaultWinningNumbers = {
    '1155': [1, 15, 21, 32, 41, 45],
    '1156': [3, 7, 14, 28, 35, 40],
    '1157': [9, 18, 23, 25, 35, 44],
    '1158': [2, 6, 17, 27, 33, 42],
    '1159': [4, 11, 20, 26, 37, 45],
    '1160': [1, 8, 16, 31, 36, 43],
    '1161': [5, 12, 22, 29, 38, 41],
    '1162': [7, 13, 19, 24, 34, 39],
    '1163': [3, 10, 15, 30, 40, 44],
    '1164': [2, 9, 21, 25, 35, 43],
    '1165': [6, 14, 22, 28, 32, 41],
    '1166': [4, 11, 17, 26, 37, 45],
    '1167': [1, 8, 20, 31, 36, 42],
    '1168': [5, 13, 19, 24, 38, 40],
    '1169': [7, 12, 23, 29, 33, 44]
};

// 로또 당첨번호 데이터 (최근 16회차)
const lottoData = {
    drawNumber: 1170,
    winningNumbers: [12, 19, 27, 28, 30, 35],
    bonusNumber: 25
};

// 최근 16회차 데이터 (예시)
const recentDraws = [];
for (let i = 15; i >= 0; i--) {
    const drawNumber = lottoData.drawNumber - i;
    // 각 회차별 당첨번호 (실제로는 API에서 가져와야 함)
    const winningNumbers = i === 0 ? [12, 19, 27, 28, 30, 35] : 
        Array.from({length: 6}, () => Math.floor(Math.random() * 45) + 1).sort((a,b) => a-b);
    recentDraws.push({
        drawNumber: drawNumber,
        winningNumbers: winningNumbers
    });
}

// 벽돌 설정 (45열 16행 = 720개)
const brickRowCount = 16; // 16회차
const brickColumnCount = 45; // 1-45번호
let brickWidth = 0;
let brickHeight = 0;
const brickPadding = 1;
const brickOffsetTop = 10; // 상단 간격 줄임
const brickOffsetLeft = 10; // 왼쪽 간격 줄임
const bricks = [];

// 번호 추출용 변수
let brokenBricks = [];
let predictedNumbers = [];

// 전역 변수 선언
let currentRound = 1;
const roundDisplay = document.querySelector('.round-display');

// 횟차 표시 업데이트 함수
function updateRoundDisplay() {
    const roundDisplay = document.querySelector('.round-display');
    if (roundDisplay) {
        roundDisplay.textContent = currentRound.toString();
    }
}

// 특정 회차에서 해당 번호가 당첨되었는지 확인
function isWinningNumberInDraw(number, drawIndex) {
    if (drawIndex >= recentDraws.length) return false;
    return recentDraws[drawIndex].winningNumbers.includes(number);
}

// 현재 게임에서 당첨번호인지 확인 (최신 회차 기준)
function isWinningNumber(number) {
    return lottoData.winningNumbers.includes(number) || number === lottoData.bonusNumber;
}

// 벽돌 내구도 결정 함수
function getBrickDurability(number, drawIndex) {
    if (isWinningNumberInDraw(number, drawIndex)) {
        return 1; // 당첨번호: 1번에 깨짐
    } else {
        return 2; // 일반번호: 2번에 깨짐
    }
}

// 벽돌 색상 결정 함수
function getBrickColor(number, drawIndex, durability, maxDurability) {
    if (isWinningNumberInDraw(number, drawIndex)) {
        // 당첨번호는 빨간색 계열
        return durability === 1 ? '#ff0000' : '#ff6666';
    } else {
        // 일반번호는 회색 계열
        if (durability === 2) return '#444444';
        else return '#666666';
    }
}

// 벽돌 생성 함수
function createBricks() {
    const brickContainer = document.getElementById('brickContainer');
    brickContainer.innerHTML = '';
    
    // 컨테이너 스타일 설정
    brickContainer.style.display = 'grid';
    brickContainer.style.gridTemplateColumns = 'repeat(45, 1fr)';
    brickContainer.style.gridTemplateRows = 'repeat(15, 20px)';
    brickContainer.style.gap = '1px';
    brickContainer.style.padding = '1px';
    brickContainer.style.boxSizing = 'border-box';
    brickContainer.style.position = 'relative';

    // 회차 헤더 생성 (텍스트 없이 숫자만)
    const roundHeader = document.createElement('div');
    roundHeader.className = 'round-header';
    roundHeader.style.position = 'absolute';
    roundHeader.style.left = '-40px';
    roundHeader.style.top = '21px';
    roundHeader.style.width = '35px';
    roundHeader.style.display = 'flex';
    roundHeader.style.flexDirection = 'column';
    roundHeader.style.gap = '1px';
    brickContainer.appendChild(roundHeader);

    // 상단 번호 행(1~45) 헤더와 '번호' 검은색 상자 제거 (headerRow 생성/삽입 부분 삭제)
    // for (let i = 1; i <= 45; i++) { ... } 부분도 삭제

    const brickData = [];
    const startRound = 1169;
    const brickHeight = 20;
    const numRows = 15;
    const numCols = 45;

    for (let r = 0; r < numRows; r++) {
        brickData[r] = [];
        const currentRound = startRound - r;
        const winningNumbers = defaultWinningNumbers[currentRound] || [];

        // 회차 번호만 추가 (텍스트 없이 숫자만)
        const roundNumber = document.createElement('div');
        roundNumber.className = 'round-number';
        roundNumber.style.height = `${brickHeight}px`;
        roundNumber.style.lineHeight = `${brickHeight}px`;
        roundNumber.style.fontSize = '12px';
        roundNumber.style.textAlign = 'right';
        roundNumber.style.paddingRight = '5px';
        roundNumber.style.color = '#fff';
        roundNumber.textContent = currentRound;
        roundHeader.appendChild(roundNumber);
        
        for (let c = 0; c < numCols; c++) {
            const number = c + 1;
            const brick = document.createElement('div');
            brick.className = 'brick';
            brick.style.height = `${brickHeight}px`;
            brick.style.lineHeight = `${brickHeight}px`;
            brick.style.fontSize = '10px';
            brick.style.textAlign = 'center';
            brick.textContent = number;
            brickContainer.appendChild(brick);

            brickData[r][c] = {
                element: brick,
                isWinning: winningNumbers.includes(number),
                r: r,
                c: c
            };
        }
    }

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            const currentBrickInfo = brickData[r][c];
            let durability;
            let bgColor;
            let initialDurability;

            if (currentBrickInfo.isWinning) {
                durability = 1;
                initialDurability = 1;
                bgColor = '#ff4444';
            } else {
                let isAdjacentToWinning = false;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols && brickData[nr][nc].isWinning) {
                            isAdjacentToWinning = true;
                            break;
                        }
                    }
                    if (isAdjacentToWinning) break;
                }

                if (isAdjacentToWinning) {
                    durability = 2;
                    initialDurability = 2;
                    bgColor = '#ff9933';
                } else {
                    durability = 3;
                    initialDurability = 3;
                    bgColor = '#444444';
                }
            }
            currentBrickInfo.element.dataset.durability = durability;
            currentBrickInfo.element.dataset.initialDurability = initialDurability;
            currentBrickInfo.element.style.backgroundColor = bgColor;
        }
    }

    // 컨테이너 크기 조정 (box-sizing: border-box 기준)
    const bricksTotalHeight = numRows * brickHeight;
    const gapsTotalHeight = (numRows - 1) * 1;
    const paddingTotalHeight = 2 * 1;
    const containerHeight = bricksTotalHeight + gapsTotalHeight + paddingTotalHeight;
    brickContainer.style.height = `${containerHeight}px`;
}

// 번호 그리드 생성 함수 제거 (더 이상 사용하지 않음)
function createNumberGrid() {
    // 빈 함수로 남겨둠 (호출되는 곳이 있을 수 있으므로)
}

// 번호 헤더 생성 함수 제거 (더 이상 사용하지 않음)
function createNumberHeader() {
    // 빈 함수로 남겨둠 (호출되는 곳이 있을 수 있으므로)
}

// 회차 헤더 생성 함수 제거 (createBricks에 통합됨)
function createRoundHeader() {
    // 빈 함수로 남겨둠 (호출되는 곳이 있을 수 있으므로)
}

// 게임 초기화
function initGame() {
    console.log('게임 초기화 시작');
    
    // 게임 컨테이너 설정
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.style.width = '100%';
        gameContainer.style.maxWidth = '900px';
        gameContainer.style.margin = '0 auto';
        gameContainer.style.position = 'relative';
        gameContainer.style.backgroundColor = '#1a1a1a';
    }

    // 기본 당첨번호 데이터로 초기화
    if (Object.keys(gameState.winningNumbers).length === 0) {
        gameState.winningNumbers = defaultWinningNumbers;
    }
    
    gameState.container = document.querySelector('.game-container');
    if (!gameState.container) {
        console.error('게임 컨테이너를 찾을 수 없습니다.');
        return;
    }

    createBricks();
    resetBall();
    resetPaddle();
    updateScore();
    setupEventListeners();
    
    console.log('게임 초기화 완료');
}

// 헤더 업데이트 함수
function updateHeaders() {
    // 번호 헤더 업데이트 (1-45)
    const numberHeader = document.querySelector('.number-header');
    if (numberHeader) {
        numberHeader.innerHTML = '';
        for (let i = 1; i <= 45; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            numberHeader.appendChild(span);
        }
    }
    
    // 회차 헤더 업데이트
    const roundHeader = document.querySelector('.round-header');
    if (roundHeader) {
        roundHeader.innerHTML = '';
        recentDraws.forEach(draw => {
            const span = document.createElement('span');
            span.textContent = draw.drawNumber;
            roundHeader.appendChild(span);
        });
    }
}

// 당첨번호 표시 함수
function displayWinningNumbers() {
    const container = document.getElementById('winning-numbers');
    const drawRound = document.getElementById('draw-round');
    
    drawRound.textContent = `제${lottoData.drawNumber}회`;
    container.innerHTML = '';
    
    // 당첨번호 6개 + 보너스번호 표시
    [...lottoData.winningNumbers, lottoData.bonusNumber].forEach((number, index) => {
        const ball = document.createElement('div');
        ball.className = 'winning-ball';
        ball.textContent = number;
        ball.style.backgroundColor = getBallColor(number);
        
        // 보너스번호는 테두리 추가
        if (index === 6) {
            ball.style.border = '2px solid #ffd700';
        }
        
        container.appendChild(ball);
    });
}

// 벽돌 크기 업데이트
function updateBrickSize() {
    const container = document.querySelector('.game-container');
    if (!container) return;
    
    const gameAreaWidth = container.clientWidth - (brickOffsetLeft * 2);
    const gameAreaHeight = container.clientHeight - brickOffsetTop - 60; // 패들 공간 확보
    
    brickWidth = Math.max(8, (gameAreaWidth - brickPadding * (brickColumnCount - 1)) / brickColumnCount);
    brickHeight = Math.max(6, (gameAreaHeight - brickPadding * (brickRowCount - 1)) / brickRowCount);
    
    // 최대 크기 제한
    brickWidth = Math.min(brickWidth, 15);
    brickHeight = Math.min(brickHeight, 12);
}

// 패들 이동
function movePaddle(mouseX) {
    const container = document.querySelector('.play-area');
    const paddle = document.getElementById('paddle');
    if (!container || !paddle) return;

    const containerRect = container.getBoundingClientRect();
    const paddleWidth = paddle.offsetWidth;
    
    // 마우스 X 좌표를 컨테이너 내부 좌표로 변환
    const relativeX = mouseX - containerRect.left;
    
    // 패들 위치 계산 (컨테이너 경계 내에서만)
    let newX = Math.max(0, Math.min(relativeX - paddleWidth / 2, containerRect.width - paddleWidth));
    
    paddle.style.left = `${newX}px`;
}

// 공 초기화
function resetBall() {
    const playArea = document.querySelector('.play-area');
    const ball = document.getElementById('ball');
    const paddle = document.getElementById('paddle');
    
    if (!playArea || !ball || !paddle) return;

    const playAreaRect = playArea.getBoundingClientRect();
    const paddleRect = paddle.getBoundingClientRect();

    // 공의 초기 위치 (패들 중앙 위)
    gameState.ball.x = (playAreaRect.width - gameState.ball.size) / 2;
    gameState.ball.y = paddleRect.top - playAreaRect.top - gameState.ball.size - 5;

    // 초기 속도 벡터 설정 (45도 각도)
    const angle = -45 * Math.PI / 180;
    gameState.ball.dx = gameState.ball.speed * Math.cos(angle);
    gameState.ball.dy = gameState.ball.speed * Math.sin(angle);

    // 공 위치 업데이트
    ball.style.left = `${gameState.ball.x}px`;
    ball.style.top = `${gameState.ball.y}px`;
}

// 패들 초기 위치 설정
function resetPaddle() {
    const container = document.querySelector('.play-area');
    const paddle = document.getElementById('paddle');
    if (!container || !paddle) return;

    const containerRect = container.getBoundingClientRect();
    const paddleX = (containerRect.width - paddle.offsetWidth) / 2;
    
    paddle.style.left = `${paddleX}px`;
    paddle.style.bottom = '15px';
}

// 벽돌 초기화
function initBricks() {
    // 기존 벽돌 배열 완전 초기화
    bricks.length = 0;
    
    // 45열(번호) x 16행(회차) 배치
    for (let c = 0; c < brickColumnCount; c++) { // 번호 (1-45)
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) { // 회차
            const number = c + 1; // 1부터 45까지
            const drawIndex = r; // 회차 인덱스
            const maxDurability = getBrickDurability(number, drawIndex);
            
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1, 
                number: number,
                drawIndex: drawIndex,
                durability: maxDurability,
                maxDurability: maxDurability,
                color: getBrickColor(number, drawIndex, maxDurability, maxDurability)
            };
        }
    }
    
    // 벽돌 위치 업데이트
    updateBrickPositions();
    console.log('벽돌 배열 크기:', bricks.length, 'x', bricks[0] ? bricks[0].length : 0);
}

// 벽돌 위치 업데이트
function updateBrickPositions() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c] && bricks[c][r] && bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
            }
        }
    }
}

// 통계 초기화
function resetStats() {
    gameState.score = 0;
    gameState.lives = 3;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('level').textContent = gameState.level;
    
    // 깨진 벽돌 및 예측 번호 초기화
    brokenBricks = [];
    updatePredictedNumbers();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    const container = document.querySelector('.play-area');
    if (!container) return;
    
    // 마우스 이벤트
    container.addEventListener('mousemove', (e) => {
        if (gameState.gameStarted && !gameState.gamePaused) {
            movePaddle(e.clientX);
        }
    });

    // 터치 이벤트
    container.addEventListener('touchmove', (e) => {
        if (gameState.gameStarted && !gameState.gamePaused) {
            e.preventDefault();
            const touch = e.touches[0];
            movePaddle(touch.clientX);
        }
    });

    // 버튼 이벤트
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('pauseButton').addEventListener('click', togglePause);
    document.getElementById('resetButton').addEventListener('click', resetGame);
}

// 게임 시작
function startGame() {
    if (!gameState.gameStarted) {
        gameState.gameStarted = true;
        gameState.gameOver = false;
        gameLoop();
        
        document.getElementById('startButton').disabled = true;
        document.getElementById('pauseButton').disabled = false;
    }
}

// 게임 일시정지
function togglePause() {
    gameState.gamePaused = !gameState.gamePaused;
    
    if (!gameState.gamePaused) {
        gameLoop();
    }
    
    document.getElementById('pauseButton').textContent = 
        gameState.gamePaused ? '계속하기' : '일시정지';
}

// 게임 리셋
function resetGame() {
    gameState.gameStarted = false;
    gameState.gamePaused = false;
    gameState.gameOver = false;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    
    resetBall();
    resetPaddle();
    createBricks();
    updateScore();
    
    document.getElementById('startButton').disabled = false;
    document.getElementById('pauseButton').disabled = true;
    document.getElementById('pauseButton').textContent = '일시정지';
    
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
}

// 게임 루프
function gameLoop() {
    if (!gameState.gameStarted || gameState.gamePaused || gameState.gameOver) {
        return;
    }
    
    moveBall();
    checkCollisions();
    
    gameState.animationId = requestAnimationFrame(gameLoop);
}

// 충돌 체크
function checkCollisions() {
    checkPaddleCollision();
    checkBrickCollision();
}

// 패들 충돌 체크
function checkPaddleCollision() {
    const container = document.querySelector('.play-area');
    const ball = document.getElementById('ball');
    const paddle = document.getElementById('paddle');
    
    if (!container || !ball || !paddle) return false;

    const containerRect = container.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();
    const paddleRect = paddle.getBoundingClientRect();

    // 패들과 충돌 감지
    if (ballRect.bottom >= paddleRect.top &&
        ballRect.top <= paddleRect.bottom &&
        ballRect.right >= paddleRect.left &&
        ballRect.left <= paddleRect.right) {
        
        // 충돌 위치에 따른 반사 각도 계산
        const hitPoint = (ballRect.left + ballRect.width/2 - paddleRect.left) / paddleRect.width;
        
        // 반사 각도 범위: -60도 ~ 60도
        gameState.ball.angle = -180 + (hitPoint * 120);
        
        // 속도 약간 증가 (최대 속도 제한)
        gameState.ball.speed = Math.min(gameState.ball.speed + 0.1, 8);
        
        return true;
    }
    
    return false;
}

// 공 움직임 처리
function moveBall() {
    const playArea = document.querySelector('.play-area');
    const ball = document.getElementById('ball');
    const paddle = document.getElementById('paddle');
    
    if (!playArea || !ball || !paddle) return;

    const playAreaRect = playArea.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();
    const paddleRect = paddle.getBoundingClientRect();

    // 다음 위치 계산
    let nextX = gameState.ball.x + gameState.ball.dx;
    let nextY = gameState.ball.y + gameState.ball.dy;

    // 벽 충돌 체크
    if (nextX <= 0 || nextX + gameState.ball.size >= playAreaRect.width) {
        gameState.ball.dx = -gameState.ball.dx; // x 방향 반전
        nextX = nextX <= 0 ? 0 : playAreaRect.width - gameState.ball.size;
    }

    // 천장 충돌
    if (nextY <= 0) {
        gameState.ball.dy = -gameState.ball.dy; // y 방향 반전
        nextY = 0;
    }

    // 바닥 충돌 (게임 오버)
    if (nextY + gameState.ball.size >= playAreaRect.height) {
        handleLifeLost();
        return;
    }

    // 패들 충돌 체크
    if (nextY + gameState.ball.size >= paddleRect.top - playAreaRect.top &&
        nextY <= paddleRect.bottom - playAreaRect.top &&
        nextX + gameState.ball.size >= paddleRect.left - playAreaRect.left &&
        nextX <= paddleRect.right - playAreaRect.left) {
        
        // 패들에 맞은 위치에 따라 반사 각도 조정
        const hitPoint = (nextX + gameState.ball.size/2 - (paddleRect.left - playAreaRect.left)) / paddleRect.width;
        const angle = (-60 + hitPoint * 120) * Math.PI / 180;
        
        // 속도 벡터 업데이트
        gameState.ball.dx = gameState.ball.speed * Math.cos(angle);
        gameState.ball.dy = -Math.abs(gameState.ball.speed * Math.sin(angle)); // 항상 위로 튕기도록
        
        // 패들 위로 위치 보정
        nextY = paddleRect.top - playAreaRect.top - gameState.ball.size;
        
        // 속도 약간 증가
        gameState.ball.speed = Math.min(gameState.ball.speed + 0.1, 8);
    }

    // 벽돌 충돌 체크
    const brickCollision = checkBrickCollision(nextX, nextY);
    if (brickCollision.hit) {
        // 충돌 방향에 따라 반사
        if (brickCollision.direction === 'vertical') {
            gameState.ball.dy = -gameState.ball.dy;
        } else {
            gameState.ball.dx = -gameState.ball.dx;
        }
        
        // 위치 보정
        if (brickCollision.direction === 'vertical') {
            nextY = brickCollision.reflectPosition;
        } else {
            nextX = brickCollision.reflectPosition;
        }
    }

    // 공 위치 업데이트
    gameState.ball.x = nextX;
    gameState.ball.y = nextY;
    ball.style.left = `${nextX}px`;
    ball.style.top = `${nextY}px`;
}

// 벽돌 충돌 체크
function checkBrickCollision(nextX, nextY) {
    const playArea = document.querySelector('.play-area');
    const brickContainer = document.getElementById('brickContainer');
    const bricks = document.querySelectorAll('#brickContainer .brick:not(.header-brick)');
    
    if (!playArea || !brickContainer) return { hit: false };

    const playAreaRect = playArea.getBoundingClientRect();
    const brickContainerRect = brickContainer.getBoundingClientRect();
    const ballSize = gameState.ball.size;

    // 공의 실제 위치를 brickContainer 기준으로 변환
    const ballXInBricks = nextX + (brickContainerRect.left - playAreaRect.left);
    const ballYInBricks = nextY + (brickContainerRect.top - playAreaRect.top);

    for (const brick of bricks) {
        if (brick.style.visibility === 'hidden') continue;

        const brickRect = brick.getBoundingClientRect();
        
        // 벽돌과의 충돌 감지
        if (ballXInBricks + ballSize >= brickRect.left - brickContainerRect.left &&
            ballXInBricks <= brickRect.right - brickContainerRect.left &&
            ballYInBricks + ballSize >= brickRect.top - brickContainerRect.top &&
            ballYInBricks <= brickRect.bottom - brickContainerRect.top) {

            // 충돌 방향 결정
            const overlapX = Math.min(
                ballXInBricks + ballSize - (brickRect.left - brickContainerRect.left),
                (brickRect.right - brickContainerRect.left) - ballXInBricks
            );
            const overlapY = Math.min(
                ballYInBricks + ballSize - (brickRect.top - brickContainerRect.top),
                (brickRect.bottom - brickContainerRect.top) - ballYInBricks
            );

            let durability = parseInt(brick.dataset.durability || '3');
            durability--;

            if (durability <= 0) {
                brick.style.visibility = 'hidden';
                const initialDurability = parseInt(brick.dataset.initialDurability || '3');
                if (initialDurability === 1) gameState.score += 100;      // 당첨 번호
                else if (initialDurability === 2) gameState.score += 75;  // 인접 번호
                else gameState.score += 50;                               // 기타 번호
                updateScore();
            } else {
                brick.dataset.durability = durability;
                updateBrickAppearance(brick, durability);
            }

            // 반사 위치 계산
            let reflectPosition;
            if (overlapX < overlapY) {
                // 수평 충돌
                reflectPosition = gameState.ball.dx > 0 ? 
                    brickRect.left - brickContainerRect.left - ballSize : // 오른쪽으로 이동 중이면 왼쪽으로 반사
                    brickRect.right - brickContainerRect.left; // 왼쪽으로 이동 중이면 오른쪽으로 반사
                
                // playArea 좌표계로 변환
                reflectPosition -= (brickContainerRect.left - playAreaRect.left);
                
                return {
                    hit: true,
                    direction: 'horizontal',
                    reflectPosition: reflectPosition
                };
            } else {
                // 수직 충돌
                reflectPosition = gameState.ball.dy > 0 ?
                    brickRect.top - brickContainerRect.top - ballSize : // 아래로 이동 중이면 위로 반사
                    brickRect.bottom - brickContainerRect.top; // 위로 이동 중이면 아래로 반사
                
                // playArea 좌표계로 변환
                reflectPosition -= (brickContainerRect.top - playAreaRect.top);
                
                return {
                    hit: true,
                    direction: 'vertical',
                    reflectPosition: reflectPosition
                };
            }
        }
    }
    return { hit: false };
}

// 벽돌 외관 업데이트
function updateBrickAppearance(brick, durability) {
    const initialDurability = parseInt(brick.dataset.initialDurability || '3');
    
    if (initialDurability === 1) {
        // 당첨번호 (빨간색)
        brick.style.backgroundColor = '#ff4444';
    } else if (initialDurability === 2) {
        // 인접번호 (주황색 -> 노란색)
        if (durability === 1) {
            brick.style.backgroundColor = '#ffff66';
        } else {
            brick.style.backgroundColor = '#ff9933';
        }
    } else {
        // 일반번호 (진한 회색 -> 연한 회색)
        if (durability === 2) {
            brick.style.backgroundColor = '#999999';
        } else if (durability === 1) {
            brick.style.backgroundColor = '#cccccc';
        } else {
            brick.style.backgroundColor = '#666666';
        }
    }
}

// 생명 잃었을 때
function handleLifeLost() {
    gameState.lives--;
    updateScore();
    
    if (gameState.lives <= 0) {
        handleGameOver();
    } else {
        resetBall();
    }
}

// 게임 오버
function handleGameOver() {
    gameState.gameOver = true;
    gameState.gameStarted = false;
    
    alert(`게임 오버! 최종 점수: ${gameState.score}`);
    resetGame();
}

// 점수 업데이트
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('level').textContent = gameState.level;
}

// 로또 볼 색상 결정
function getBallColor(number) {
    if (number <= 10) return '#D8334A'; // 빨강
    if (number <= 20) return '#F89B17'; // 주황
    if (number <= 30) return '#048882'; // 초록
    if (number <= 40) return '#06479E'; // 파랑
    return '#9937BC'; // 보라
}

// 효과음 재생
function playSound(type) {
    // 여기에 효과음 재생 코드 추가
}

// Firebase 실시간 업데이트 리스너
function setupRealtimeListeners() {
    console.log('Firebase 리스너 설정');
    const database = firebase.database();
    
    // 기존 리스너 제거
    database.ref('brickGame').off();
    
    // 새 리스너 설정
    database.ref('brickGame').on('value', snapshot => {
        console.log('Firebase 데이터 수신:', snapshot.val());
        if (snapshot.exists()) {
            const brickGame = snapshot.val();
            if (brickGame.numbers) {
                gameState.winningNumbers = {...defaultWinningNumbers, ...brickGame.numbers};
                initGame();
            }
        } else {
            console.log('Firebase 데이터 없음, 기본 데이터 사용');
            gameState.winningNumbers = defaultWinningNumbers;
            initGame();
        }
    }, error => {
        console.error('Firebase 오류:', error);
        console.log('Firebase 오류, 기본 데이터 사용');
        gameState.winningNumbers = defaultWinningNumbers;
        initGame();
    });
}

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    console.log('페이지 로드됨');
    setupRealtimeListeners();
    updateRoundDisplay();
});

// 게임 초기화 시 횟차 초기화
function initializeGame() {
    currentRound = 1;
    updateRoundDisplay();
    // ... 기존 초기화 코드 ...
}

// 게임 재시작 시 횟차 초기화
function restartGame() {
    currentRound = 1;
    updateRoundDisplay();
    // ... 기존 재시작 코드 ...
}

// 다음 라운드로 진행
function nextRound() {
    currentRound++;
    updateRoundDisplay();
    // ... 기존 다음 라운드 코드 ...
} 