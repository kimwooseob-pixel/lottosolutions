// 벽돌깨기 게임 JavaScript

// 캔버스와 2D 컨텍스트 가져오기
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 게임 상태 변수
let gameStarted = false;
let gamePaused = false;
let gameOver = false;
let score = 0;
let lives = 3;
let level = 1;
let animationId;

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

// 공 상태
const ball = {
    x: 0,
    y: 0,
    radius: 4,
    dx: 2,
    dy: -2,
    color: '#f1c40f'
};

// 패들 상태
const paddle = {
    x: 0,
    y: 0,
    width: 60,
    height: 8,
    dx: 0,
    speed: 5,
    color: '#ecf0f1'
};

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

// 게임 초기화 함수
function initGame() {
    console.log('게임 초기화 시작');
    
    // 당첨번호 표시
    displayWinningNumbers();
    
    // 헤더 업데이트
    updateHeaders();
    
    // 캔버스 크기 설정
    resizeCanvas();
    console.log('캔버스 크기:', canvas.width, 'x', canvas.height);
    console.log('벽돌 크기:', brickWidth, 'x', brickHeight);

    // 벽돌 초기화
    initBricks();
    console.log('벽돌 초기화 완료, 벽돌 수:', bricks.length);

    // 공 초기 위치 (패들 중앙 위)
    resetBall();

    // 패들 초기 위치 (캔버스 아래쪽 중앙)
    resetPaddle();

    // 점수, 생명, 레벨 초기화
    resetStats();

    // 컨트롤 상태 초기화
    gameStarted = false;
    gamePaused = false;
    gameOver = false;
    
    // 초기 화면 그리기
    draw();
    console.log('게임 초기화 완료');

    // 이벤트 리스너 설정
    setupEventListeners();
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

// 캔버스 크기 조정
function resizeCanvas() {
    const container = document.querySelector('.container');
    const containerWidth = container ? container.clientWidth - 80 : 900; // 패딩 고려
    
    // 캔버스 너비 설정 (가로 모드에 맞게 넓게)
    canvas.width = Math.min(containerWidth, 800); // 최대 800px로 제한
    
    // 캔버스 높이 설정 (45열에 맞게 가로로 긴 형태)
    canvas.height = Math.floor(canvas.width * 0.4); // 높이를 너비의 40%로 설정
    
    // 벽돌 크기 업데이트
    updateBrickSize();
}

// 벽돌 크기 업데이트
function updateBrickSize() {
    const gameAreaWidth = canvas.width - brickOffsetLeft * 2;
    const gameAreaHeight = canvas.height - brickOffsetTop - 60; // 패들 공간 확보
    
    brickWidth = Math.max(8, (gameAreaWidth - brickPadding * (brickColumnCount - 1)) / brickColumnCount);
    brickHeight = Math.max(6, (gameAreaHeight - brickPadding * (brickRowCount - 1)) / brickRowCount);
    
    // 최대 크기 제한
    brickWidth = Math.min(brickWidth, 15);
    brickHeight = Math.min(brickHeight, 12);
}

// 공 초기화
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - paddle.height - ball.radius - 10;
    
    // 공 속도 설정
    const speedMultiplier = 1 + (level - 1) * 0.1;
    ball.dx = 2 * speedMultiplier * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -2 * speedMultiplier;
}

// 패들 초기화
function resetPaddle() {
    paddle.width = Math.min(60, canvas.width / 15);
    paddle.x = (canvas.width - paddle.width) / 2;
    paddle.y = canvas.height - paddle.height - 5;
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
    score = 0;
    lives = 3;
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    
    // 깨진 벽돌 및 예측 번호 초기화
    brokenBricks = [];
    updatePredictedNumbers();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 마우스 이동 이벤트
    canvas.addEventListener('mousemove', mouseMoveHandler);
    
    // 터치 이벤트
    canvas.addEventListener('touchmove', touchMoveHandler);
    
    // 키보드 이벤트
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    
    // 버튼 이벤트
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('close-popup').addEventListener('click', closePopup);
    
    // 화면 크기 변경 이벤트
    window.addEventListener('resize', handleResize);
}

// 마우스 이동 핸들러
function mouseMoveHandler(e) {
    if (!gameStarted || gamePaused) return;
    
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
        
        // 캔버스 경계 검사
        if (paddle.x < 0) {
            paddle.x = 0;
        } else if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    }
}

// 터치 이동 핸들러
function touchMoveHandler(e) {
    if (!gameStarted || gamePaused) return;
    
    e.preventDefault();
    const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
        
        // 캔버스 경계 검사
        if (paddle.x < 0) {
            paddle.x = 0;
        } else if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    }
}

// 키보드 입력 처리 - keydown
function keyDownHandler(e) {
    if (!gameStarted || gamePaused) return;
    
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = -paddle.speed;
    }
}

// 키보드 입력 처리 - keyup
function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = 0;
    }
}

// 화면 크기 변경 핸들러
function handleResize() {
    resizeCanvas();
    resetPaddle();
    updateBrickPositions();
    
    // 화면을 다시 그림
    if (!gameStarted || gamePaused) {
        draw();
    }
}

// 게임 시작
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameOver = false;
        document.getElementById('start-btn').textContent = '게임 중';
        document.getElementById('start-btn').disabled = true;
        
        // 게임 루프 시작
        gameLoop();
    }
}

// 게임 재시작
function restartGame() {
    // 이전 게임 루프 중지
    cancelAnimationFrame(animationId);
    
    // 게임 초기화
    initGame();
    
    // 게임 시작
    startGame();
}

// 게임 일시정지 토글
function togglePause() {
    if (!gameStarted || gameOver) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        document.getElementById('pause-btn').textContent = '계속하기';
        cancelAnimationFrame(animationId);
        
        // 일시 정지 메시지 표시
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('일시정지', canvas.width / 2, canvas.height / 2);
    } else {
        document.getElementById('pause-btn').textContent = '일시 정지';
        gameLoop();
    }
}

// 공과 패들 충돌 감지
function checkBallPaddleCollision() {
    if (ball.x + ball.radius > paddle.x && 
        ball.x - ball.radius < paddle.x + paddle.width && 
        ball.y + ball.radius > paddle.y) {
        
        // 패들의 어느 부분에 맞았는지 계산 (-1 ~ 1)
        const hitPosition = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        
        // 반사 각도 계산
        ball.dx = ball.dx + hitPosition * 1;
        ball.dy = -Math.abs(ball.dy); // 항상 위로 튕기도록
        
        // 공 속도 제한
        const maxSpeed = 4;
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed > maxSpeed) {
            ball.dx = (ball.dx / speed) * maxSpeed;
            ball.dy = (ball.dy / speed) * maxSpeed;
        }
        
        // 효과음 재생
        playSound('paddle');
    }
}

// 공과 벽돌 충돌 감지
function checkBallBrickCollision() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            
            if (brick && brick.status === 1) {
                if (ball.x + ball.radius > brick.x && 
                    ball.x - ball.radius < brick.x + brickWidth && 
                    ball.y + ball.radius > brick.y && 
                    ball.y - ball.radius < brick.y + brickHeight) {
                    
                    // 공 방향 반전
                    ball.dy = -ball.dy;
                    
                    // 벽돌 내구도 감소
                    brick.durability--;
                    
                    // 벽돌 색상 업데이트
                    brick.color = getBrickColor(brick.number, brick.drawIndex, brick.durability, brick.maxDurability);
                    
                    // 내구도가 0이 되면 벽돌 제거
                    if (brick.durability <= 0) {
                        brick.status = 0;
                        
                        // 점수 추가 (당첨번호는 더 높은 점수)
                        let points = isWinningNumberInDraw(brick.number, brick.drawIndex) ? 30 : 10;
                        
                        score += points;
                        document.getElementById('score').textContent = score;
                        
                        // 깨진 벽돌의 번호 저장
                        brokenBricks.push(brick.number);
                        
                        // 로또 번호 업데이트
                        updatePredictedNumbers();
                    }
                    
                    // 효과음 재생
                    playSound('brick');
                    
                    // 모든 벽돌이 깨졌는지 확인
                    checkLevelComplete();
                    
                    break; // 한 번에 하나의 벽돌만 처리
                }
            }
        }
    }
}

// 레벨 완료 확인
function checkLevelComplete() {
    let bricksRemaining = 0;
    
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r] && bricks[c][r].status === 1) {
                bricksRemaining++;
            }
        }
    }
    
    if (bricksRemaining === 0) {
        // 다음 레벨로 진행
        level++;
        document.getElementById('level').textContent = level;
        
        // 공 초기화
        resetBall();
        
        // 벽돌 다시 생성
        initBricks();
        
        // 게임 일시정지
        gamePaused = true;
        document.getElementById('pause-btn').textContent = '계속하기';
        
        // 다음 레벨 메시지 표시
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`레벨 ${level} 시작!`, canvas.width / 2, canvas.height / 2);
        
        // 자동으로 3초 후 계속
        setTimeout(() => {
            if (gamePaused) {
                gamePaused = false;
                document.getElementById('pause-btn').textContent = '일시 정지';
                gameLoop();
            }
        }, 3000);
    }
}

// 예상 로또 번호 업데이트
function updatePredictedNumbers() {
    // 깨진 벽돌 번호에서 6개 선택 (없으면 적은 수 선택)
    predictedNumbers = [];
    
    // 중복 제거
    const uniqueBrokenNumbers = [...new Set(brokenBricks)];
    
    // 깨진 벽돌이 6개 미만이면 모두 선택
    if (uniqueBrokenNumbers.length <= 6) {
        predictedNumbers = [...uniqueBrokenNumbers];
    } else {
        // 벽돌 번호 중에서 랜덤으로 6개 선택
        const shuffled = [...uniqueBrokenNumbers].sort(() => 0.5 - Math.random());
        predictedNumbers = shuffled.slice(0, 6);
    }
    
    // 오름차순 정렬
    predictedNumbers.sort((a, b) => a - b);
    
    // 화면에 표시
    displayPredictedNumbers();
}

// 로또 번호 표시
function displayPredictedNumbers() {
    const container = document.getElementById('predicted-numbers');
    container.innerHTML = '';
    
    predictedNumbers.forEach(number => {
        const ball = document.createElement('div');
        ball.className = 'lotto-ball';
        ball.textContent = number;
        ball.style.backgroundColor = getBallColor(number);
        container.appendChild(ball);
    });
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

// 게임 오버 처리
function handleGameOver() {
    gameOver = true;
    gameStarted = false;
    
    document.getElementById('start-btn').textContent = '시작하기';
    document.getElementById('start-btn').disabled = false;
    
    // 결과 팝업 표시
    showResultPopup();
}

// 결과 팝업 표시
function showResultPopup() {
    document.getElementById('final-score').textContent = score;
    
    // 팝업의 번호 표시
    const container = document.getElementById('popup-numbers');
    container.innerHTML = '';
    
    predictedNumbers.forEach(number => {
        const ball = document.createElement('div');
        ball.className = 'lotto-ball';
        ball.textContent = number;
        ball.style.backgroundColor = getBallColor(number);
        container.appendChild(ball);
    });
    
    // 팝업 표시
    document.getElementById('result-popup').style.display = 'block';
}

// 결과 팝업 닫기
function closePopup() {
    document.getElementById('result-popup').style.display = 'none';
}

// 그리기 함수
function draw() {
    // 캔버스 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 벽돌 그리기
    drawBricks();
    
    // 공 그리기
    drawBall();
    
    // 패들 그리기
    drawPaddle();
}

// 벽돌 그리기
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r] && bricks[c][r].status === 1) {
                const brick = bricks[c][r];
                
                // 벽돌 그리기
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
                ctx.fillStyle = brick.color;
                ctx.fill();
                
                // 당첨번호는 테두리 추가
                if (isWinningNumberInDraw(brick.number, brick.drawIndex)) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
                
                ctx.closePath();
            }
        }
    }
}

// 공 그리기
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// 패들 그리기
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

// 게임 로직 업데이트
function update() {
    // 패들 이동
    paddle.x += paddle.dx;
    
    // 패들이 캔버스 밖으로 나가지 않도록 제한
    if (paddle.x < 0) {
        paddle.x = 0;
    } else if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
    
    // 공 이동
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // 벽과 공 충돌 처리
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }
    
    // 공이 바닥에 닿았을 때
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        document.getElementById('lives').textContent = lives;
        
        if (lives <= 0) {
            // 게임 오버
            handleGameOver();
        } else {
            // 공과 패들 초기화
            resetBall();
        }
    }
    
    // 공과 패들 충돌 감지
    checkBallPaddleCollision();
    
    // 공과 벽돌 충돌 감지
    checkBallBrickCollision();
}

// 게임 루프
function gameLoop() {
    if (!gamePaused && !gameOver) {
        update();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }
}

// 게임 초기화 및 시작
window.onload = function() {
    console.log('DOM 로드 완료');
    setTimeout(() => {
        initGame();
    }, 100); // 약간의 지연을 두어 안정적인 초기화
};

// Firebase Realtime Database 참조
const database = firebase.database();

// 실시간 업데이트 리스너 설정
function setupRealtimeListeners() {
    // 1. 벽돌깨기 게임 정보 업데이트 감지
    database.ref('brickGame').on('value', snapshot => {
        if (snapshot.exists()) {
            const brickGame = snapshot.val();
            if (brickGame.currentDraw && brickGame.numbers) {
                // 게임 상태 업데이트
                gameState.currentDraw = brickGame.currentDraw;
                gameState.winningNumbers = brickGame.numbers;
                updateGameDisplay(); // 게임 화면 업데이트
            }
        }
    });

    // 2. 시스템 업데이트 감지
    database.ref('systemUpdate').on('value', snapshot => {
        if (snapshot.exists()) {
            const update = snapshot.val();
            if (update.type === 'drawUpdate') {
                location.reload(); // 페이지 새로고침
            }
        }
    });
}

// 페이지 로드 시 실시간 리스너 설정
window.addEventListener('load', function() {
    setupRealtimeListeners();
}); 