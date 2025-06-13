// 벽돌깨기 게임 JavaScript
// Firebase 관련 코드 완전 제거 (로컬 데이터만 사용)

// 게임 상태
const gameState = {
    gameStarted: false,
    gamePaused: false,
    godMode: false, // 무적모드 상태 추가
    score: 0,
    lives: 3,
    level: 1,
    ballX: 360,
    ballY: 300,
    ballDX: 4,
    ballDY: -4,
    paddleX: 0,
    ballsLostToFirstRow: 0, // 첫 번째 줄 벽돌에 맞아 사라진 공의 수
    headerBrickHitStats: {}, // 첫 번째 줄 벽돌 번호별 공 충돌 횟수 통계
    rightPressed: false,
    leftPressed: false,
    brickWidth: 0,
    brickHeight: 0,
    brickRowCount: 15,
    brickColumnCount: 45,
    bricks: [],
    animationId: null,
    lastTime: 0,
    speed: 1,
    balls: [], // 여러 개의 공을 관리하기 위한 배열
    bricks: [],
    paddle: {
        width: 80,
        height: 10,
        speed: 8,
        element: null
    },
    winningNumbers: {},
    adjacentNumbers: [],
    currentDrawIndex: 0,
    draws: [],
    currentRound: 1,
    totalBalls: 45, // 무적모드 공 개수
    removedBalls: 0 // 무적모드에서 사라진 공 개수
};

// 무적모드 토글 함수
function toggleGodMode() {
    // 게임이 시작되지 않았으면 게임 시작
    if (!gameState.gameStarted) {
        startGame();
    }
    
    gameState.godMode = !gameState.godMode;
    const godModeButton = document.getElementById('godModeButton');
    const paddle = document.getElementById('paddle');
    const bottomWall = document.getElementById('bottomWall');
    
    if (gameState.godMode) {
        // 무적모드 ON
        godModeButton.textContent = '무적모드 ON';
        godModeButton.style.backgroundColor = '#ff4444';
        
        // 패들 숨기고 하단 벽 표시
        if (paddle) paddle.style.display = 'none';
        if (bottomWall) bottomWall.style.display = 'block';
        
        // 기존 공들 제거 (초기 정적 공 포함)
        document.querySelectorAll('.ball').forEach(el => el.remove());
        const staticBall = document.getElementById('ball');
        if (staticBall) staticBall.remove();
        
        // 공 45개 생성 (하단에 일렬로)
        gameState.balls = [];
        for (let i = 0; i < gameState.totalBalls; i++) {
            const ball = createBall(i, gameState.totalBalls);
            if (ball) {
                gameState.balls.push(ball);
            }
        }
        
        // 공이 움직이지 않으면 시작
        gameState.ballMoving = true;
        gameState.gameStarted = true; // 명시적으로 시작 상태 설정
        if (gameState.animationId) {
            cancelAnimationFrame(gameState.animationId);
        }
        gameLoop();
        
        // 게임 상태 메시지 표시
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            statusElement.textContent = '무적모드가 활성화되었습니다! 공 45개 생성!';
            setTimeout(() => {
                statusElement.textContent = '';
            }, 2000);
        }
    } else {
        // 무적모드 OFF
        godModeButton.textContent = '무적모드';
        godModeButton.style.backgroundColor = '';
        
        // 패들 표시하고 하단 벽 숨기기
        if (paddle) paddle.style.display = 'block';
        if (bottomWall) bottomWall.style.display = 'none';
        
        // 게임 상태 메시지 표시
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            statusElement.textContent = '무적모드가 비활성화되었습니다.';
            setTimeout(() => {
                statusElement.textContent = '';
            }, 2000);
        }
    }
}

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

// 로또 회차 표시 함수
function createRoundNumbers() {
    const roundHeader = document.querySelector('.round-header');
    if (!roundHeader) return;
    
    roundHeader.innerHTML = ''; // 기존 내용 초기화
    
    // 1170회부터 15회차까지 역순으로 표시
    for (let i = 0; i < 15; i++) {
        const roundNumber = document.createElement('div');
        roundNumber.className = 'round-number';
        roundNumber.textContent = 1170 - i; // 1170회부터 시작
        roundNumber.style.height = '19px'; // 벽돌 높이와 동일하게 조정
        roundNumber.style.display = 'flex';
        roundNumber.style.alignItems = 'center';
        roundNumber.style.justifyContent = 'flex-end';
        roundHeader.appendChild(roundNumber);
    }
}

// 벽돌 생성 함수
function createBricks() {
    const brickContainer = document.getElementById('brickContainer');
    if (!brickContainer) return;
    brickContainer.innerHTML = '';
    
    // 벽돌 그리드 스타일 설정
    brickContainer.style.display = 'grid';
    brickContainer.style.gridTemplateColumns = 'repeat(45, 1fr)';
    brickContainer.style.gridTemplateRows = 'repeat(15, 20px)';
    brickContainer.style.gap = '1px';
    brickContainer.style.position = 'absolute';
    brickContainer.style.top = '20px';
    brickContainer.style.left = '0';
    brickContainer.style.right = '0';
    brickContainer.style.bottom = '200px';
    brickContainer.style.overflow = 'hidden';
    
    // 로또 회차 표시 생성
    createRoundNumbers();
    
    // 15행(회차), 45열(번호)
    const startRound = 1170; // 1170회부터 시작
    const numRows = 15;
    const numCols = 45;
    
    // 1행: 1~45번 초록색 바탕의 벽돌 생성
    for (let c = 0; c < numCols; c++) {
        const number = c + 1;
        
        // 셀 생성
        const cell = document.createElement('div');
        cell.style.gridRow = 1;
        cell.style.gridColumn = c + 1;
        
        // 초록색 바탕의 벽돌 생성
        const brick = document.createElement('div');
        brick.className = 'brick header-brick';
        brick.textContent = number;
        brick.style.backgroundColor = '#2ecc71'; // 초록색
        brick.style.fontWeight = 'bold';
        brick.style.justifyContent = 'center';
        brick.style.alignItems = 'center';
        brick.style.display = 'flex';
        
        cell.appendChild(brick);
        brickContainer.appendChild(cell);
    }
    
    // 2행~15행: 기존 로직대로 벽돌 생성
    for (let r = 1; r < numRows; r++) {
        const currentRound = startRound - r + 1; // 1행이 1170회이므로 2행은 1169회가 되도록 조정
        const winningNumbers = defaultWinningNumbers[currentRound] || [];
        
        for (let c = 0; c < numCols; c++) {
            const number = c + 1;
            const isWinning = winningNumbers.includes(number);
            
            // 빈 셀 생성
            const cell = document.createElement('div');
            cell.style.gridRow = r + 1;
            cell.style.gridColumn = c + 1;
            
            // 벽돌 생성
            const brick = document.createElement('div');
            brick.className = 'brick';
            brick.textContent = number;
            brick.dataset.row = r;
            brick.dataset.col = c;
            
            if (isWinning) {
                // 당첨번호인 경우
                brick.dataset.durability = 1;
                brick.style.backgroundColor = '#ff4444'; // 빨간색
            } else {
                // 일반 번호인 경우
                brick.dataset.durability = 2;
                brick.style.backgroundColor = '#666666'; // 회색
            }
            
            brick.style.width = '100%';
            brick.style.height = '100%';
            brick.style.display = 'flex';
            brick.style.alignItems = 'center';
            brick.style.justifyContent = 'center';
            brick.style.fontSize = '10px';
            brick.style.color = 'white';
            cell.appendChild(brick);
            brickContainer.appendChild(cell);
        }
    }
}

// 공 생성 함수
function createBall(index, totalBalls) {
    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.style.width = '10px';
    ball.style.height = '10px';
    ball.style.backgroundColor = '#fff';
    ball.style.borderRadius = '50%';
    ball.style.position = 'absolute';
    
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return null;
    
    // 게임 화면 크기
    const gameWidth = gameContainer.offsetWidth;
    const gameHeight = gameContainer.offsetHeight;
    
    // 하단 벽 바로 위에 공 배치 (20px은 하단 벽 높이)
    const ballY = 30; // 하단에서 약간 위로
    
    // 공들을 가로로 균일하게 배치
    const spacing = gameWidth / (totalBalls + 1);
    const ballX = spacing * (index + 1) - 5; // 공의 반지름(5px) 고려
    
    // 공의 속도와 방향 설정
    const speed = 4 + Math.random() * 2; // 4~6 사이의 속도
    const angle = -Math.PI/2 + (Math.random() * Math.PI/2 - Math.PI/4); // 위쪽 방향으로
    
    const ballDX = Math.cos(angle) * speed;
    const ballDY = Math.sin(angle) * speed;
    
    // 공 위치 및 스타일 설정
    ball.style.left = `${ballX}px`;
    ball.style.bottom = `${ballY}px`;
    ball.dataset.dx = ballDX;
    ball.dataset.dy = ballDY;
    
    // 게임 컨테이너에 공 추가
    gameContainer.appendChild(ball);
    
    // 공 상태 반환
    return {
        element: ball,
        x: ballX,
        y: ballY,
        dx: ballDX,
        dy: ballDY
    };
}

// 게임 초기화 시 기본 공 생성
function createInitialBall() {
    const ball = document.createElement('div');
    ball.id = 'ball';
    ball.className = 'ball';
    ball.style.width = '10px';
    ball.style.height = '10px';
    ball.style.backgroundColor = '#ffffff';
    ball.style.borderRadius = '50%';
    ball.style.position = 'absolute';
    
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    // 게임 화면 아래쪽 200px은 플레이 영역 (패들 영역)
    const playAreaHeight = 200;
    const paddleHeight = 10; // 패들 높이
    
    // 패들 위에 공 위치 설정
    gameState.ballX = (gameContainer.offsetWidth / 2) - 5; // 화면 중앙, 5는 공의 반지름
    gameState.ballY = playAreaHeight - paddleHeight - 15; // 패들 위에 위치
    
    // 공 위치 및 스타일 설정
    ball.style.left = `${gameState.ballX}px`;
    ball.style.bottom = `${gameState.ballY}px`;
    
    // 게임 컨테이너에 공 추가
    gameContainer.appendChild(ball);
    
    gameState.ballMoving = false; // 시작 시에는 공이 움직이지 않음
}

// 목숨 UI 업데이트 함수 (없으면 오류 방지용)
function updateLives() {
    const livesEl = document.getElementById('livesDisplay');
    if (livesEl) {
        livesEl.textContent = `남은 목숨: ${gameState.lives}`;
    }
}

// 공 제거 실시간 통계 업데이트 함수
function updateBallRemovalStats() {
    if (!gameState.godMode) return;
    const statsPanel = document.getElementById('brickStatsPanel');
    const statsContent = document.getElementById('statsContent');
    if (!statsPanel || !statsContent) return;
    if (statsPanel.style.display !== 'block') {
        statsPanel.style.display = 'block';
    }
    let statsHTML = `<p>사라진 공 개수: ${gameState.removedBalls} / ${gameState.totalBalls}</p>`;
    // 첫 줄 벽돌 충돌 통계 실시간 표시 (4회 이상 빨간색)
    if (Object.keys(gameState.headerBrickHitStats).length > 0) {
        statsHTML += '<ul style="column-count:5; padding-left:20px;">';
        const entries = Object.entries(gameState.headerBrickHitStats).sort((a,b)=>b[1]-a[1]);
        for (const [brickNum,hits] of entries) {
            const style = hits>=4 ? 'color:red;font-weight:bold;' : '';
            statsHTML += `<li style="${style}">${brickNum}번 벽돌: ${hits}회</li>`;
        }
        statsHTML += '</ul>';
    }
    statsContent.innerHTML = statsHTML;
}

// 게임 초기화
function initGame() {
    console.log('게임 초기화 시작...');
    
    // 게임 요소 초기화
    const ball = document.getElementById('ball');
    const paddle = document.getElementById('paddle');
    
    if (!ball || !paddle) {
        console.error('게임 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 공 초기 위치 설정
    ball.style.width = '10px';
    ball.style.height = '10px';
    ball.style.backgroundColor = '#ffffff';
    ball.style.borderRadius = '50%';
    ball.style.position = 'absolute';
    ball.style.left = '360px';
    ball.style.bottom = '300px';
    
    // 패들 초기 위치 설정
    paddle.style.width = '80px';
    paddle.style.height = '10px';
    paddle.style.backgroundColor = '#ffffff';
    paddle.style.position = 'absolute';
    paddle.style.left = '320px';
    paddle.style.bottom = '20px';
    
    // 공 위치 초기화 (게임 시작 시에만)
    if (!gameState.godMode) {
        gameState.ballX = 360;
        gameState.ballY = 300;
        gameState.ballDX = 4;
        gameState.ballDY = -4;
    }
    gameState.ballMoving = false;
    gameState.paddleX = 320;
    
    // 벽돌 생성
    createBricks();
    
    console.log('게임 초기화 완료');
    return true;

    // 기본 당첨번호 데이터로 초기화
    if (Object.keys(gameState.winningNumbers).length === 0) {
        gameState.winningNumbers = defaultWinningNumbers;
    }
    
    gameState.container = document.querySelector('.game-container');
    if (!gameState.container) {
        console.error('게임 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    // 벽돌 초기화
    initBricks();
    
    // 게임 요소 초기화
    resetPaddle();
    updateScore();
    setupEventListeners();
    
    // 게임 루프 시작
    if (!gameState.animationId) {
        gameLoop();
    }
    
    console.log('게임 초기화 완료');
}

// 패들 초기 위치 설정
function resetPaddle() {
    const paddle = document.getElementById('paddle');
    if (paddle) {
        gameState.paddleX = (720 - gameState.paddle.width) / 2;
        paddle.style.left = `${gameState.paddleX}px`;
    }
}

// 게임 초기화
function resetGame() {
    gameState.gameStarted = false;
    gameState.gamePaused = false;
    gameState.godMode = false; // 무적모드 초기화
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false; // 게임 오버 플래그 초기화
    gameState.headerBrickHitStats = {}; // 첫 번째 줄 벽돌 충돌 통계 초기화
    
    // 무적모드 버튼 상태 초기화
    const godModeButton = document.getElementById('godModeButton');
    if (godModeButton) {
        godModeButton.textContent = '무적모드';
        godModeButton.style.backgroundColor = '';
    }
    
    // 패들 다시 표시
    const paddle = document.getElementById('paddle');
    if (paddle) {
        paddle.style.display = 'block';
    }
    gameState.level = 1;
    
    // Reset ball position
    gameState.ballX = 360;
    gameState.ballY = 300;
    gameState.ballDX = 4;
    gameState.ballDY = -4;
    gameState.ballMoving = false;
    
    // Reset UI
    updateScore();
    createBricks();
    resetPaddle();
    
    // Update button states
    const startBtn = document.getElementById('startButton');
    const pauseBtn = document.getElementById('pauseButton');
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) {
        pauseBtn.disabled = true;
        pauseBtn.textContent = '일시정지';
    }
    
    // Reset ball and paddle positions
    const ball = document.getElementById('ball');
    if (ball) {
        ball.style.left = `${gameState.ballX}px`;
        ball.style.bottom = `${gameState.ballY}px`;
    }
    
    // Cancel any existing animation frame
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
    
    // Start a new game loop
    gameLoop();
}

// 게임 일시정지/재개
function togglePause() {
    gameState.gamePaused = !gameState.gamePaused;
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.textContent = gameState.gamePaused ? '계속' : '일시정지';
    }
    if (!gameState.gamePaused) {
        gameLoop();
    }
}

// 게임 루프
function gameLoop() {
    if (!gameState.gamePaused && gameState.gameStarted) {
        moveBall();
    }
    gameState.animationId = requestAnimationFrame(gameLoop);
}

// 공 움직임 처리
function moveBall() {
    if (!gameState.ballMoving) return;
    
    // 모든 공에 대해 처리
    if (gameState.godMode && gameState.balls) {
        gameState.balls.forEach(ball => {
            // 공 위치 업데이트
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // 공 위치를 화면에 반영
            ball.element.style.left = `${ball.x}px`;
            ball.element.style.bottom = `${ball.y}px`;
            
            // 벽 충돌 체크 (왼쪽, 오른쪽 벽)
            if (ball.x <= 0 || ball.x >= 710) {
                ball.dx *= -1;
            }
            
            // 천장 충돌 체크
            if (ball.y >= 510) {
                ball.dy *= -1;
            }
            
            // 하단 벽 충돌 체크 (무적모드 전용)
            if (ball.y <= 20) {
                ball.dy = Math.abs(ball.dy);
                ball.y = 25; // 공이 벽에 박히지 않도록 조정
            }
        });
        
        // 무적모드에서 모든 공이 제거되면 바로 통계 표시
        if (gameState.godMode && gameState.removedBalls === gameState.totalBalls && !gameState.gameOver) {
            showScoreTable();
            return;
        }
        
        // 벽돌 충돌 체크
        checkBrickCollision();
        checkGameOverByNoBall();
        return;
    }
    
    // 기존 단일 공 움직임 처리 (일반 모드)
    gameState.ballX += gameState.ballDX;
    gameState.ballY += gameState.ballDY;
    
    // 공 위치를 화면에 반영
    const ball = document.getElementById('ball');
    if (ball) {
        ball.style.left = `${gameState.ballX}px`;
        ball.style.bottom = `${gameState.ballY}px`;
    }
    
    // 벽 충돌 체크 (왼쪽, 오른쪽 벽)
    if (gameState.ballX <= 0 || gameState.ballX >= 710) { // 720 - 10(공 너비)
        gameState.ballDX *= -1;
    }
    
    // 하단 벽 충돌 감지 (무적모드 전용)
    if (gameState.godMode) {
        const bottomWall = document.getElementById('bottomWall');
        if (bottomWall && bottomWall.style.display === 'block') {
            // play-area의 높이에서 공이 바닥에 닿는지 확인 (play-area 높이: 200px, 공 반지름: 10px)
            if (gameState.ballY <= 10) {
                gameState.ballDY = Math.abs(gameState.ballDY); // 아래로 튕기기 (절대값 사용)
                gameState.ballY = 15; // 공이 벽에 박히지 않도록 조정
            }
        }
    }
    
    // 공이 바닥에 닿았는지 확인 (무적모드가 아닐 때만 동작)
    if (gameState.ballY <= 0) {
        if (!gameState.godMode) {
            gameState.lives--;
            updateLives();
            
            if (gameState.lives <= 0) {
                // 게임 오버
                gameState.gameStarted = false;
                cancelAnimationFrame(gameState.animationId);
                showScoreTable(); // 통계 표시 함수 호출
                // resetGame(); // 통계 확인 후 사용자가 재시작하도록 resetGame 호출을 일단 주석 처리하거나, showScoreTable 내부에 재시작 버튼을 만들 수 있습니다.
                return;
            }
            
            // 공 재생성 및 위치 초기화
            const paddle = document.getElementById('paddle');
            const gameContainer = document.querySelector('.game-container');
            if (paddle && gameContainer) {
                const playAreaHeight = 200;
                const paddleHeight = 10;
                gameState.ballX = (gameContainer.offsetWidth / 2) - 5;
                gameState.ballY = playAreaHeight - paddleHeight - 15;
                gameState.ballDX = 4 * (Math.random() > 0.5 ? 1 : -1);
                gameState.ballDY = -4;
                
                // 목숨 감소 메시지 표시
                const statusElement = document.getElementById('gameStatus');
                if (statusElement) {
                    statusElement.textContent = `목숨이 ${gameState.lives}개 남았습니다!`;
                    setTimeout(() => {
                        statusElement.textContent = '';
                    }, 1500);
                }
            }
        } else {
            // 무적모드인 경우 공이 바닥에 닿으면 위로 튕기기
            gameState.ballDY = Math.abs(gameState.ballDY);
            gameState.ballY = 5;
        }
    }
    
    // 천장 충돌 체크
    if (gameState.ballY >= 510) { // 520 - 10(공 높이)
        gameState.ballDY *= -1;
        gameState.ballMoving = false;
        return;
    }
    
    // 패들 충돌 체크
    const paddle = document.getElementById('paddle');
    if (paddle) {
        const paddleRect = paddle.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();
        
        // 공이 패들에 닿았는지 확인
        if (ballRect.bottom >= paddleRect.top && 
            ballRect.top <= paddleRect.bottom &&
            ballRect.right >= paddleRect.left && 
            ballRect.left <= paddleRect.right) {
            
            // 공이 패들에 닿은 위치에 따라 반사 각도 조절
            const hitPosition = (ballRect.left + 5 - paddleRect.left) / paddleRect.width - 0.5;
            const maxBounceAngle = Math.PI * 5/12; // 75도
            const angle = hitPosition * maxBounceAngle * 2;
            
            // 공의 속도 계산 (속도 유지)
            const speed = Math.sqrt(gameState.ballDX * gameState.ballDX + gameState.ballDY * gameState.ballDY);
            gameState.ballDX = speed * Math.sin(angle);
            gameState.ballDY = speed * Math.cos(angle);
            
            // 공이 패들 안으로 들어가지 않도록 조정
            gameState.ballY = 25; // 패들 위쪽에 위치하도록
        }
    }
    
    // 벽돌 충돌 체크
    checkBrickCollision();
    checkGameOverByNoBall();
}

// 게임 종료 조건 확인 함수
function checkGameOverByNoBall() {
    if (gameState.gameOver) return; // 이미 종료 처리됨

    const activeBalls = document.querySelectorAll('.ball');

    // 1) 모든 공 DOM 요소가 사라진 경우
    if (activeBalls.length === 0) {
        showScoreTable();
        return;
    }

    // 2) 공은 하나만 남았지만 더 이상 움직이지 않는 경우(중앙에 멈춘 흰 점)
    if (activeBalls.length === 1 && !gameState.ballMoving && gameState.gameStarted) {
        showScoreTable();
    }

    // 3) 무적모드에서 관리 배열이 비거나 모든 공 DOM이 사라진 경우
    if (gameState.godMode && gameState.balls && gameState.balls.length === 0) {
        showScoreTable();
        return;
    }
}

// 벽돌 충돌 감지 및 처리
function checkBrickCollision() {
    if (!gameState.godMode || !gameState.balls || gameState.balls.length === 0) {
        // 일반 모드 또는 공이 없는 경우 (공 배열이 비어있는 경우 포함)
        const ballElement = document.getElementById('ball');
        if (!ballElement) return;

        const ballRect = ballElement.getBoundingClientRect();
        // 일반 모드에서는 ballIndexInGodMode를 전달할 필요 없음
        checkSingleBallCollision(ballElement, ballRect);
        return;
    }
    
    // 무적모드: 모든 공에 대해 충돌 검사
    // 배열을 순회하면서 요소를 제거할 때는 역순으로 순회하는 것이 안전합니다.
    for (let i = gameState.balls.length - 1; i >= 0; i--) {
        const ballObject = gameState.balls[i]; // gameState.balls의 요소는 공 객체
        if (ballObject && ballObject.element) { // 공 객체와 그 요소가 유효한지 확인
            const ballRect = ballObject.element.getBoundingClientRect();
            // ballObject를 전달하고, 제거를 위해 인덱스 i도 전달
            const collisionResult = checkSingleBallCollision(ballObject, ballRect, i);
            if (collisionResult === 'ball_removed') {
                gameState.removedBalls++;
                updateBallRemovalStats();
            }
        } else if (!ballObject || !ballObject.element) {
            // 유효하지 않은 공 객체나 요소가 있는 경우 배열에서 제거 (정리)
            gameState.balls.splice(i, 1);
        }
    }
    
    // 벽돌 충돌 체크 후 모든 벽돌이 제거되었는지 확인
    if (document.querySelectorAll('.brick').length === 0 && !gameState.gameOver) {
        showScoreTable();
    }
}

// 단일 공과 벽돌의 충돌 처리
function checkSingleBallCollision(collidingEntity, ballRect, ballIndexInGodMode = -1) {
    const bricks = document.querySelectorAll('.brick');

    for (const brick of bricks) {
        const brickRect = brick.getBoundingClientRect();

        // 공과 벽돌의 충돌 감지
        if (ballRect.bottom >= brickRect.top &&
            ballRect.top <= brickRect.bottom &&
            ballRect.right >= brickRect.left &&
            ballRect.left <= brickRect.right) {

            // 첫 번째 줄 벽돌 (녹색, 'header-brick' 클래스) 처리
            if (brick.classList.contains('header-brick')) {
                gameState.ballsLostToFirstRow++;
                const brickNumberText = brick.textContent;
                if (brickNumberText) {
                    gameState.headerBrickHitStats[brickNumberText] = (gameState.headerBrickHitStats[brickNumberText] || 0) + 1;
                }
                console.log(`첫 번째 줄 벽돌(${brickNumberText})과 충돌! 사라진 공 개수: ${gameState.ballsLostToFirstRow}, 통계:`, gameState.headerBrickHitStats);

                if (gameState.godMode && ballIndexInGodMode !== -1) {
                    // 무적 모드: collidingEntity는 ballObject
                    // gameState.balls 배열에서 해당 공 객체와 DOM 요소 제거
                    const ballToRemove = gameState.balls[ballIndexInGodMode];
                    if (ballToRemove && ballToRemove.element) {
                        ballToRemove.element.remove();
                    }
                    // ballIndexInGodMode를 사용하여 정확한 인덱스로 제거
                    if (gameState.balls[ballIndexInGodMode] === collidingEntity) {
                         gameState.balls.splice(ballIndexInGodMode, 1);
                    }
                   
                } else if (!gameState.godMode && collidingEntity.id === 'ball') {
                    // 일반 모드: collidingEntity는 ball DOM 요소
                    collidingEntity.remove();
                    // 일반 모드에서는 공이 하나뿐이므로, 이 경우 게임 로직에 따라 추가 처리 필요 (예: 목숨 감소)
                }

                // if (gameState.ballsLostToFirstRow >= 30) {
                //     showScoreTable(); // 게임 오버 시에만 통계를 보여주므로 이 부분은 주석 처리
                // }
                checkGameOverByNoBall();
                return 'ball_removed'; // 공이 제거되었음을 알리고, 이 공에 대한 추가 충돌 처리 중단
            } else {
                // 첫 번째 줄이 아닌 다른 벽돌 처리 (기존 로직과 유사)
                let durability = parseInt(brick.dataset.durability);
                const maxDurability = parseInt(brick.dataset.maxDurability) || durability; // maxDurability가 없으면 초기 내구도로 설정

                durability--;

                if (durability <= 0) {
                    brick.remove();
                    gameState.score += 10;
                } else {
                    brick.dataset.durability = durability;
                    // 내구도에 따른 시각적 변화 (예: opacity 또는 getBrickColor 사용)
                    brick.style.opacity = durability / maxDurability;
                    gameState.score += 5;
                }

                // 공 반사 로직
                const overlapX = Math.min(ballRect.right - brickRect.left, brickRect.right - ballRect.left);
                const overlapY = Math.min(ballRect.bottom - brickRect.top, brickRect.bottom - ballRect.top);

                if (gameState.godMode) {
                    // 무적 모드: collidingEntity는 ballObject
                    if (overlapX < overlapY) {
                        collidingEntity.dx *= -1;
                    } else {
                        collidingEntity.dy *= -1;
                    }
                    // 위치 조정 및 DOM 업데이트는 moveBall에서 처리
                } else {
                    // 일반 모드: gameState의 ballDX/DY 사용
                    if (overlapX < overlapY) {
                        gameState.ballDX *= -1;
                    } else {
                        gameState.ballDY *= -1;
                    }
                    // 위치 조정 및 DOM 업데이트는 moveBall에서 처리
                }
                updateScore();
                return 'bounced'; // 공이 반사되었음을 알리고, 이 공에 대한 추가 충돌 처리 중단
            }
        }
    }
    return 'no_collision'; // 이 호출에서 충돌 없음
}

// 점수 업데이트
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('level').textContent = gameState.level;
}

// 페이지 로드 시 게임 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM이 로드되었습니다. 게임을 초기화합니다.');
    
    initGame();
    
    // 페이지가 로드되면 즉시 무적모드(45개 공) 실행
    toggleGodMode();
});

// 게임 시작
function startGame() {
    console.log('게임 시작 함수 호출됨');
    if (gameState.gameStarted && !gameState.godMode) {
        console.log('게임이 이미 시작되었습니다.');
        alert('게임이 이미 진행 중입니다!');
        return;
    }
    
    // 사용자에게 게임 시작 메시지 표시
    const statusElement = document.getElementById('gameStatus');
    if (statusElement) {
        statusElement.textContent = '게임이 시작되었습니다! 공을 받아보세요!';
        setTimeout(() => {
            statusElement.textContent = '';
        }, 2000);
    }
    
    // 게임 상태 초기화
    gameState.gameStarted = true;
    gameState.gamePaused = false;
    gameState.ballMoving = true;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    
    // 공 재생성 및 위치 초기화 (패들 위로)
    const paddle = document.getElementById('paddle');
    const gameContainer = document.querySelector('.game-container');
    if (paddle && gameContainer) {
        const playAreaHeight = 200;
        const paddleHeight = 10;
        gameState.ballX = (gameContainer.offsetWidth / 2) - 5;
        gameState.ballY = playAreaHeight - paddleHeight - 15;
        gameState.ballDX = 4 * (Math.random() > 0.5 ? 1 : -1); // 랜덤한 방향으로
        gameState.ballDY = -4;
        
        // 사용자에게 목숨 감소 알림
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            statusElement.textContent = `목숨이 ${gameState.lives}개 남았습니다!`;
            setTimeout(() => {
                statusElement.textContent = '';
            }, 1500);
        }
    }
    
    // UI 업데이트
    updateScore();
    const startBtn = document.getElementById('startButton');
    const pauseBtn = document.getElementById('pauseButton');
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    
    // 공 생성 및 위치 설정
    const ball = document.getElementById('ball');
    if (ball) {
        ball.style.left = `${gameState.ballX}px`;
        ball.style.bottom = `${gameState.ballY}px`;
    }
    
    // 게임 루프 시작
    if (!gameState.animationId) {
        gameLoop();
    }
    
    console.log('게임이 시작되었습니다.');
}

// 최종 점수표 표시
function showScoreTable() {
    const statsPanel = document.getElementById('brickStatsPanel');
    const statsContent = document.getElementById('statsContent');
    const gameStatusElement = document.getElementById('gameStatus'); // 게임 상태 메시지 표시용

    if (!statsPanel || !statsContent) {
        console.error('통계 패널 또는 내용 요소를 찾을 수 없습니다. ID를 확인해주세요: brickStatsPanel, statsContent');
        // Fallback: 이전처럼 alert로 표시
        let statsMessage = "첫 번째 줄 벽돌 충돌 통계:\n";
        let hasStats = false;
        for (const brickNum in gameState.headerBrickHitStats) {
            if (gameState.headerBrickHitStats.hasOwnProperty(brickNum)) {
                statsMessage += `${brickNum}번 벽돌: ${gameState.headerBrickHitStats[brickNum]}회\n`;
                hasStats = true;
            }
        }
        if (!hasStats) {
            statsMessage += "충돌 기록 없음\n";
        }
        alert(`게임 오버! 최종 점수: ${gameState.score}\n\n${statsMessage}`);
        return;
    }

    let statsHTML = '<ul>';
    const entries = Object.entries(gameState.headerBrickHitStats).sort((a,b)=>b[1]-a[1]);
    const top4 = entries.slice(0,4).map(e=>e[0]);
    const maxHits = entries.length? entries[0][1]:0;
    statsHTML += '<ul style="column-count:5; padding-left:20px;">';
    for (const [brickNum,hits] of entries) {
        let style = hits>=4 ? 'color:red;font-weight:bold;' : '';
        statsHTML += `<li style="${style}">${brickNum}번 벽돌: ${hits}회</li>`;
    }
    statsHTML += '</ul>';

    // 무적모드 공 제거 통계 표시
    if (gameState.godMode) {
        const maxHits = Math.max(...Object.values(gameState.headerBrickHitStats || {0:0}));
        statsHTML += `<p>사라진 공 개수: ${gameState.removedBalls} / ${gameState.totalBalls}</p>`;
        statsHTML += '<ul style="column-count:5; padding-left:20px;">';
        for (const brickNum in gameState.headerBrickHitStats) {
            if (gameState.headerBrickHitStats.hasOwnProperty(brickNum)) {
                const hits = gameState.headerBrickHitStats[brickNum];
                const highlight = hits>=4 ? 'color:red;font-weight:bold;' : '';
                statsHTML += `<li style="${highlight}">${brickNum}번 벽돌: ${hits}회</li>`;
            }
        }
        statsHTML += '</ul>';
    }
    statsContent.innerHTML = statsHTML;
    statsPanel.style.display = 'block'; // 패널을 보이도록 설정

    // 모든 공 요소 제거 (멈춰있는 초기 공 포함)
    document.querySelectorAll('.ball').forEach(el => el.remove());
    if (gameState.balls) gameState.balls = [];

    gameState.gameOver = true; // 종료 플래그
    gameState.gameStarted = false;
    gameState.ballMoving = false;
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
    console.log('showScoreTable 호출됨. 통계가 패널에 표시되었습니다.', gameState.headerBrickHitStats);
    // 게임 재시작 로직은 사용자가 명시적으로 버튼을 누르거나, 
    // 통계 패널에 재시작 버튼을 추가하여 처리하는 것이 좋습니다.
    // resetGame(); // 일단 주석 처리
}

// 게임 재시작
function restartGame() {
    // 게임 상태 초기화
    gameState.balls = [];
    gameState.score = 0;
    gameState.lives = 999;
    gameState.gameOver = false;
    gameState.gameStarted = false;
    gameState.gamePaused = false;
    
    // 기존 애니메이션 정지
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
    }
    
    // 게임 초기화
    initializeGame();
}

// 다음 라운드로 진행
function nextRound() {
    gameState.currentRound++;
    updateRoundDisplay();
    
    // 공 초기화
    const existingBalls = document.querySelectorAll('.ball');
    existingBalls.forEach(ball => ball.remove());
    gameState.balls = [];
    
    // 새로운 공 생성
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createBall();
        }, i * 100);
    }
    
    // 벽돌 재생성
    initBricks();
} 

// 무적모드에서 공 45개 생성
function toggleGodMode() {
    // 게임이 시작되지 않았으면 게임 시작
    if (!gameState.gameStarted) {
        startGame();
    }
    
    gameState.godMode = !gameState.godMode;
    const godModeButton = document.getElementById('godModeButton');
    const paddle = document.getElementById('paddle');
    const bottomWall = document.getElementById('bottomWall');
    
    if (gameState.godMode) {
        // 무적모드 ON
        godModeButton.textContent = '무적모드 ON';
        godModeButton.style.backgroundColor = '#ff4444';
        
        // 패들 숨기고 하단 벽 표시
        if (paddle) paddle.style.display = 'none';
        if (bottomWall) bottomWall.style.display = 'block';
        
        // 기존 공들 제거 (초기 정적 공 포함)
        document.querySelectorAll('.ball').forEach(el => el.remove());
        const staticBall = document.getElementById('ball');
        if (staticBall) staticBall.remove();
        
        // 공 45개 생성 (하단에 일렬로)
        gameState.balls = [];
        for (let i = 0; i < gameState.totalBalls; i++) {
            const ball = createBall(i, gameState.totalBalls);
            if (ball) {
                gameState.balls.push(ball);
            }
        }
        
        // 공이 움직이지 않으면 시작
        gameState.ballMoving = true;
        gameState.gameStarted = true; // 명시적으로 시작 상태 설정
        if (gameState.animationId) {
            cancelAnimationFrame(gameState.animationId);
        }
        gameLoop();
        
        // 게임 상태 메시지 표시
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            statusElement.textContent = '무적모드가 활성화되었습니다! 공 45개 생성!';
            setTimeout(() => {
                statusElement.textContent = '';
            }, 2000);
        }
        
        // 초기 통계 패널 표시
        updateBallRemovalStats();
    } else {
        // 무적모드 OFF
        godModeButton.textContent = '무적모드';
        godModeButton.style.backgroundColor = '';
        
        // 패들 표시하고 하단 벽 숨기기
        if (paddle) paddle.style.display = 'block';
        if (bottomWall) bottomWall.style.display = 'none';
        
        // 게임 상태 메시지 표시
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            statusElement.textContent = '무적모드가 비활성화되었습니다.';
            setTimeout(() => {
                statusElement.textContent = '';
            }, 2000);
        }
    }
}