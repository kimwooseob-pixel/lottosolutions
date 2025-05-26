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
        x: 0,
        y: 0,
        dx: 2,
        dy: -2,
        size: 6
    },
    paddle: {
        x: 0,
        y: 0,
        width: 70,
        height: 8,
        speed: 6
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

    // 회차 헤더 생성
    const roundHeader = document.createElement('div');
    roundHeader.className = 'round-header';
    brickContainer.parentElement.appendChild(roundHeader);

    // 상단 번호 행 추가 (1-45)
    for (let i = 1; i <= 45; i++) {
        const brick = document.createElement('div');
        brick.className = 'brick header-brick';
        brick.textContent = i;
        brickContainer.appendChild(brick);
    }

    // 회차 정보와 벽돌 추가
    const startRound = 1169; // 최신 회차
    for (let row = 0; row < 15; row++) {
        // 회차 번호 추가 (내림차순)
        const currentRound = startRound - row;
        const roundNumber = document.createElement('div');
        roundNumber.className = 'round-number';
        roundNumber.textContent = currentRound;
        roundHeader.appendChild(roundNumber);

        // 벽돌 추가
        const winningNumbers = defaultWinningNumbers[currentRound] || [];
        
        for (let col = 0; col < 45; col++) {
            const number = col + 1;
            const brick = document.createElement('div');
            brick.className = 'brick';
            brick.textContent = number;
            
            // 당첨번호인 경우 빨간색으로 표시
            if (winningNumbers.includes(number)) {
                brick.style.backgroundColor = '#ff4444';
            }
            
            brickContainer.appendChild(brick);
        }
    }
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

// 공 위치 초기화
function resetBall() {
    const container = gameState.container;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    gameState.ball.x = containerRect.width / 2;
    gameState.ball.y = containerRect.height - 40;
    gameState.ball.dx = 2;
    gameState.ball.dy = -2;
    
    const ball = document.getElementById('ball');
    ball.style.left = gameState.ball.x + 'px';
    ball.style.top = gameState.ball.y + 'px';
}

// 패들 위치 초기화
function resetPaddle() {
    const container = gameState.container;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    gameState.paddle.x = (containerRect.width - gameState.paddle.width) / 2;
    gameState.paddle.y = containerRect.height - 40;
    
    const paddle = document.getElementById('paddle');
    paddle.style.left = gameState.paddle.x + 'px';
    paddle.style.bottom = '20px';
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
    const container = gameState.container;
    
    container.addEventListener('mousemove', (e) => {
        if (gameState.gameStarted && !gameState.gamePaused) {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            movePaddle(x);
        }
    });
    
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('pauseButton').addEventListener('click', togglePause);
    document.getElementById('resetButton').addEventListener('click', resetGame);
}

// 패들 이동
function movePaddle(x) {
    const container = gameState.container;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const paddleHalfWidth = gameState.paddle.width / 2;
    
    // 마우스 위치에서 패들의 중앙이 오도록 조정
    let newX = x - containerRect.left - paddleHalfWidth;
    
    // 경계 체크
    newX = Math.max(0, Math.min(newX, containerRect.width - gameState.paddle.width));
    
    gameState.paddle.x = newX;
    const paddle = document.getElementById('paddle');
    paddle.style.left = newX + 'px';
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

// 공 이동
function moveBall() {
    const container = gameState.container;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // 새로운 위치 계산
    gameState.ball.x += gameState.ball.dx;
    gameState.ball.y += gameState.ball.dy;
    
    // 벽 충돌 체크
    if (gameState.ball.x <= 0 || gameState.ball.x >= containerRect.width - gameState.ball.size) {
        gameState.ball.dx *= -1;
    }
    
    if (gameState.ball.y <= 0) {
        gameState.ball.dy *= -1;
    }
    
    // 바닥에 닿았을 때
    if (gameState.ball.y >= containerRect.height - gameState.ball.size) {
        handleLifeLost();
        return;
    }
    
    const ball = document.getElementById('ball');
    ball.style.left = gameState.ball.x + 'px';
    ball.style.top = gameState.ball.y + 'px';
}

// 충돌 체크
function checkCollisions() {
    checkPaddleCollision();
    checkBrickCollision();
}

// 패들 충돌 체크
function checkPaddleCollision() {
    const ball = document.getElementById('ball');
    const paddle = document.getElementById('paddle');
    const ballRect = ball.getBoundingClientRect();
    const paddleRect = paddle.getBoundingClientRect();
    
    if (ballRect.bottom >= paddleRect.top &&
        ballRect.right >= paddleRect.left &&
        ballRect.left <= paddleRect.right &&
        ballRect.top <= paddleRect.bottom &&
        gameState.ball.dy > 0) {
        
        // 공이 패들 위에 있을 때만 반사
        gameState.ball.dy = -Math.abs(gameState.ball.dy);
        
        // 패들 위치에 따른 반사 각도 조정
        const hitPoint = (ballRect.left + ballRect.right) / 2;
        const paddleCenter = (paddleRect.left + paddleRect.right) / 2;
        const hitOffset = (hitPoint - paddleCenter) / (paddleRect.width / 2);
        
        // 반사 각도 조정 (-1.0 ~ 1.0 범위의 hitOffset을 사용)
        gameState.ball.dx = hitOffset * 3;
    }
}

// 벽돌 충돌 체크
function checkBrickCollision() {
    const ball = document.getElementById('ball');
    const ballRect = ball.getBoundingClientRect();
    const bricks = document.getElementsByClassName('brick');
    
    Array.from(bricks).forEach(brick => {
        const brickRect = brick.getBoundingClientRect();
        
        if (ballRect.right >= brickRect.left &&
            ballRect.left <= brickRect.right &&
            ballRect.bottom >= brickRect.top &&
            ballRect.top <= brickRect.bottom) {
            
            // 충돌 방향 결정
            const ballCenter = {
                x: (ballRect.left + ballRect.right) / 2,
                y: (ballRect.top + ballRect.bottom) / 2
            };
            
            const brickCenter = {
                x: (brickRect.left + brickRect.right) / 2,
                y: (brickRect.top + brickRect.bottom) / 2
            };
            
            // 수직 충돌이 더 가까우면 y방향 반전
            if (Math.abs(ballCenter.y - brickCenter.y) <= Math.abs(ballCenter.x - brickCenter.x)) {
                gameState.ball.dy *= -1;
            } else {
                gameState.ball.dx *= -1;
            }
            
            brick.remove();
            gameState.score += 10;
            updateScore();
        }
    });
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
}); 