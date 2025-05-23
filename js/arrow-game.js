// 게임 상태 관리
let gameState = {
    currentHints: [],
    gridData: [],
    score: 0,
    currentTurn: 4,
    startNumber: 1003,
    endNumber: 1017,
    winningNumbers: {
        1003: [12, 15, 17, 24, 29, 45],
        1004: [1, 4, 13, 17, 34, 39],
        1005: [3, 19, 21, 25, 37, 45],
        1006: [12, 18, 22, 23, 30, 34],
        1007: [15, 26, 28, 34, 41, 42],
        1008: [14, 23, 26, 31, 39, 45],
        1009: [6, 12, 19, 24, 34, 41],
        1010: [5, 13, 17, 29, 34, 39],
        1011: [1, 2, 15, 19, 24, 36],
        1012: [2, 13, 25, 28, 29, 36],
        1013: [4, 7, 15, 18, 23, 26],
        1014: [9, 15, 21, 28, 34, 45],
        1015: [2, 4, 16, 17, 36, 39],
        1016: [8, 19, 25, 34, 37, 44],
        1017: [2, 9, 16, 25, 26, 40],
        // 1154-1168 회차 범위의 당첨번호 데이터 추가
        1154: [6, 10, 12, 14, 20, 42],
        1155: [17, 25, 33, 35, 38, 45],
        1156: [1, 4, 29, 39, 43, 45],
        1157: [7, 15, 30, 37, 39, 44],
        1158: [8, 13, 18, 24, 27, 29],
        1159: [8, 11, 15, 16, 17, 37],
        1160: [8, 11, 16, 19, 21, 25],
        1161: [9, 11, 30, 31, 41, 44],
        1162: [15, 23, 29, 34, 40, 44],
        1163: [9, 12, 15, 25, 34, 36],
        1164: [1, 9, 12, 26, 35, 38],
        1165: [5, 11, 18, 20, 35, 45],
        1166: [21, 22, 26, 34, 36, 41],
        1167: [3, 11, 14, 18, 26, 27],
        1168: [9, 21, 24, 30, 33, 37]
    }
};

// Firebase Realtime Database 참조
const database = firebase.database();

// 실시간 업데이트 리스너 설정
function setupRealtimeListeners() {
    // 1. 화살표 게임 정보 업데이트 감지
    database.ref('arrowGame').on('value', snapshot => {
        if (snapshot.exists()) {
            const arrowGame = snapshot.val();
            if (arrowGame.currentDraw && arrowGame.numbers) {
                // 게임 상태 업데이트
                gameState.currentDraw = arrowGame.currentDraw;
                gameState.winningNumbers[arrowGame.currentDraw] = arrowGame.numbers;
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

// 그리드 생성 함수
function createGrid() {
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = '';

    // 빈 셀 (왼쪽 상단)
    gridContainer.appendChild(createCell('number-cell empty', ''));

    // 상단 회차 번호 (1003-1017)
    for (let i = gameState.startNumber; i <= gameState.endNumber; i++) {
        gridContainer.appendChild(createCell('number-cell header', i));
    }
    // 오른쪽 상단 빈 셀
    gridContainer.appendChild(createCell('number-cell empty', ''));

    // 나머지 그리드
    for (let row = 1; row <= 45; row++) {
        // 왼쪽 세로 번호 (파란색) + 선택 버튼
        const leftCell = createCell('number-cell row-header', row);
        leftCell.style.position = 'relative';
        const selectBtn = document.createElement('button');
        selectBtn.textContent = '▶';
        selectBtn.style.position = 'absolute';
        selectBtn.style.right = '2px';
        selectBtn.style.top = '2px';
        selectBtn.style.fontSize = '0.8em';
        selectBtn.style.padding = '2px 6px';
        selectBtn.style.border = 'none';
        selectBtn.style.background = '#1976d2';
        selectBtn.style.color = '#fff';
        selectBtn.style.borderRadius = '4px';
        selectBtn.style.cursor = 'pointer';
        selectBtn.title = `${row}번에서 시작`;
        selectBtn.onclick = () => onLeftButtonClick(row);
        leftCell.appendChild(selectBtn);
        gridContainer.appendChild(leftCell);

        // 그리드 셀 (검은색)
        for (let col = gameState.startNumber; col <= gameState.endNumber; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = row; // 셀에 번호 표시
            
            // winningNumbers에 해당 회차 번호가 있는지 확인 후 winning 클래스 추가
            if (gameState.winningNumbers[col] && Array.isArray(gameState.winningNumbers[col]) && 
                gameState.winningNumbers[col].includes(row)) {
                cell.classList.add('winning');
                
                // 당첨번호 셀에 추가 스타일 적용
                const circle = document.createElement('div');
                circle.className = 'winning-circle';
                circle.style.cssText = `
                    position: absolute;
                    width: 26px;
                    height: 26px;
                    border: 2px solid #e74c3c;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 0;
                `;
                cell.style.position = 'relative';
                cell.style.color = '#e74c3c';
                cell.style.fontWeight = 'bold';
                cell.style.zIndex = '1';
                cell.appendChild(circle);
            }
            
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => toggleCell(cell));
            gridContainer.appendChild(cell);
        }
        // 오른쪽 세로 번호 (파란색)
        gridContainer.appendChild(createCell('number-cell row-header', row));
    }
}

// 셀 생성 헬퍼 함수
function createCell(className, text) {
    const cell = document.createElement('div');
    cell.className = className;
    cell.textContent = text;
    return cell;
}

// 셀 토글 함수
function toggleCell(cell) {
    cell.classList.toggle('selected');
    // 애니메이션 효과 추가
    if(cell.classList.contains('selected')) {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple-effect');
        cell.appendChild(ripple);
        setTimeout(() => {
            ripple.remove();
        }, 500);
    }
    updateGameState();
}

// 게임 상태 업데이트
function updateGameState() {
    const selectedCells = document.querySelectorAll('.grid-cell.selected');
    gameState.gridData = Array.from(selectedCells).map(cell => ({
        row: parseInt(cell.dataset.row),
        col: parseInt(cell.dataset.col)
    }));
}

// 힌트 함수들
function 힌트1() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        if (row >= 1 && row <= 10) {
            cell.classList.add('hint1');
        }
    });
}

function 힌트2() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        if (row >= 11 && row <= 20) {
            cell.classList.add('hint2');
        }
    });
}

function 힌트3() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        if (row >= 21 && row <= 30) {
            cell.classList.add('hint3');
        }
    });
}

function 힌트4() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        if (row >= 31 && row <= 40) {
            cell.classList.add('hint4');
        }
    });
}

let hint5Active = false;

function 힌트5() {
    if (hint5Active) {
        clearScoreDisplay();
        hint5Active = false;
        
        // 이전에 추가된 클릭 이벤트 리스너 제거
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.removeEventListener('click', onGridCellClick);
            cell.style.cursor = 'default';
        });
    } else {
        clearScoreDisplay();
        
        // 아처 컨테이너 표시 확인
        const archerContainer = document.querySelector('.archer-container');
        if (archerContainer) {
            archerContainer.style.display = 'flex';
            console.log("아처 컨테이너 표시됨");
        } else {
            console.error("아처 컨테이너를 찾을 수 없습니다");
        }
        
        // 모든 셀과 당첨 셀 가져오기
        const allCells = document.querySelectorAll('.grid-cell');
        const winningCells = document.querySelectorAll('.grid-cell.winning');
        
        console.log(`총 셀 개수: ${allCells.length}, 당첨 셀 개수: ${winningCells.length}`);
        
        // 각 빈칸에 대해 점수 계산
        let cellsWithScores = 0;
        allCells.forEach(cell => {
            if (!cell.classList.contains('winning')) {
                let totalScore = 0;
                const cellPos = getCellPosition(cell);
                // 각 당첨 셀에 대해 점수 계산
                winningCells.forEach(winningCell => {
                    const winningPos = getCellPosition(winningCell);
                    const score = calculatePositionScore(cellPos, winningPos);
                    totalScore += score;
                });
                
                // 모든 점수 표시 (0인 경우도 표시)
                displayScore(cell, totalScore);
                if (totalScore > 0) {
                    cellsWithScores++;
                }
                
                // 셀 클릭 시 해당 행에서 화살 발사
                cell.addEventListener('click', onGridCellClick);
                cell.style.cursor = 'pointer'; // 클릭 가능함을 표시
            }
        });
        
        console.log(`점수가 표시된 셀 개수: ${cellsWithScores}`);
        hint5Active = true;
        
        // 도움말 메시지 표시
        showHelpMessage("셀을 클릭하면 해당 행에서 화살이 발사됩니다.");
    }
}

// 셀 클릭 이벤트 핸들러
function onGridCellClick(event) {
    // 클릭한 셀에서 행 정보 가져오기
    const cell = event.currentTarget;
    const row = parseInt(cell.dataset.row);
    
    if (!isNaN(row) && row >= 1 && row <= 45) {
        console.log(`셀 클릭: 행=${row} 열=${cell.dataset.col}`);
        onLeftButtonClick(row);
    }
}

// 도움말 메시지 표시 함수
function showHelpMessage(message) {
    // 이전 메시지 제거
    const existingMsg = document.getElementById('help-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // 새 메시지 생성
    const msgElement = document.createElement('div');
    msgElement.id = 'help-message';
    msgElement.style.position = 'fixed';
    msgElement.style.top = '10px';
    msgElement.style.left = '50%';
    msgElement.style.transform = 'translateX(-50%)';
    msgElement.style.background = 'rgba(33, 150, 243, 0.9)';
    msgElement.style.color = 'white';
    msgElement.style.padding = '8px 16px';
    msgElement.style.borderRadius = '4px';
    msgElement.style.zIndex = '1000';
    msgElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    msgElement.style.fontSize = '14px';
    msgElement.style.fontWeight = 'bold';
    msgElement.textContent = message;
    
    // 문서에 추가
    document.body.appendChild(msgElement);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (msgElement.parentNode) {
            msgElement.remove();
        }
    }, 5000);
}

function clearScoreDisplay() {
    // 점수 표시와 그라데이션 원 모두 제거
    document.querySelectorAll('.score-display').forEach(el => el.remove());
    document.querySelectorAll('.hint5-gradient-circle').forEach(el => el.remove());
    
    // 혹시 모를 남은 그라데이션 원들도 제거
    document.querySelectorAll('[style*="radial-gradient"]').forEach(el => {
        if (el.parentElement && el.parentElement.classList.contains('grid-cell')) {
            el.remove();
        }
    });
}

function getCellPosition(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    return { row, col };
}

function calculatePositionScore(pos1, pos2) {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    
    // 상하좌우 인접
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
        return 2;
    }
    // 대각선 인접
    if (rowDiff === 1 && colDiff === 1) {
        return 1.5;
    }
    // 2칸 떨어진 상하좌우
    if ((rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2)) {
        return 1;
    }
    
    return 0;
}

function displayScore(cell, score) {
    if (!cell) return;

    // 셀 정보 가져오기
    const cellRect = cell.getBoundingClientRect();
    
    // 점수 표시 요소 생성
    const scoreDisplay = document.createElement('div');
    scoreDisplay.classList.add('score-display');
    
    // 점수에 따라 색상 설정
    if (score > 80) {
        scoreDisplay.style.color = '#4CAF50'; // 높은 점수는 초록색
        scoreDisplay.textContent = `+${score}`;
    } else if (score > 50) {
        scoreDisplay.style.color = '#FFC107'; // 중간 점수는 노란색
        scoreDisplay.textContent = `+${score}`;
    } else if (score > 30) {
        scoreDisplay.style.color = '#FF9800'; // 낮은 점수는 주황색
        scoreDisplay.textContent = `+${score}`;
    } else if (score > 0) {
        scoreDisplay.style.color = '#F44336'; // 매우 낮은 점수는 빨간색
        scoreDisplay.textContent = `+${score}`;
    } else {
        // 0점인 경우에도 표시 (회색)
        scoreDisplay.style.color = '#9E9E9E';
        scoreDisplay.textContent = `0`;
    }
    
    // 점수 표시 위치 설정
    scoreDisplay.style.left = `${cellRect.left + window.scrollX + cellRect.width / 2 - 15}px`;
    scoreDisplay.style.top = `${cellRect.top + window.scrollY - 20}px`;
    
    // 문서에 추가
    document.body.appendChild(scoreDisplay);
    
    // 점수 표시 요소 유지 시간 연장 (5초로 변경)
    // 힌트5 함수에서 clearScoreDisplay를 호출하므로 자동 제거는 비활성화
    // 단, 안전장치로 5초 후 제거하는 타이머는 유지
    setTimeout(() => {
        if (scoreDisplay.parentNode && !hint5Active) {
            scoreDisplay.remove();
        }
    }, 5000);
}

function 힌트6() {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.classList.remove('hint1', 'hint2', 'hint3', 'hint4', 'hint5');
    });
}

function 다음턴() {
    console.log("다음턴 실행");
    gameState.currentTurn++;
    gameState.startNumber += 15;
    gameState.endNumber += 15;
    // 힌트 효과 초기화
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.classList.remove('hint1', 'hint2', 'hint3', 'hint4', 'hint5', 'hint6');
    });
    createGrid(); // 새로운 그리드 생성
}

// 점수 팝업 관련 함수들
function showScorePopup(matchCount, score) {
    // 팝업 템플릿 복제
    const template = document.getElementById('score-popup-template');
    const popup = template.content.cloneNode(true);
    
    // 점수 정보 업데이트
    popup.querySelector('.match-count').textContent = matchCount;
    popup.querySelector('.score-value').textContent = score;
    
    // 번호 추가
    const numbersColumn = popup.querySelector('.numbers-column');
    const winningNumbers = gameState.winningNumbers[gameState.currentTurn];
    
    if (winningNumbers && Array.isArray(winningNumbers)) {
        // 당첨 번호 출력
        winningNumbers.forEach(num => {
            const ball = document.createElement('div');
            ball.classList.add('number-ball');
            
            // 맞춘 번호에 matched 클래스 추가
            if (gameState.gridData.some(cell => parseInt(cell.row) === num)) {
                ball.classList.add('matched');
            }
            
            ball.textContent = num;
            numbersColumn.appendChild(ball);
        });
    }
    
    // 팝업 표시
    document.body.appendChild(popup);
    document.querySelector('.score-popup').style.display = 'block';
}

function closeScorePopup() {
    const popup = document.querySelector('.score-popup');
    if (popup) {
        popup.remove();
    }
}

// 자동 화살 발사 관련 변수
let autoFireEnabled = true;
let autoFireInterval = 5000; // 5초마다 자동 발사
let autoFireTimer = null;

// 자동 화살 발사 함수
function startAutoFire() {
    if (!autoFireEnabled) return;
    
    // 이전 타이머가 있으면 정리
    if (autoFireTimer) {
        clearInterval(autoFireTimer);
    }
    
    console.log("자동 화살 발사 시작");
    
    // 자동 발사 타이머 설정
    autoFireTimer = setInterval(() => {
        // 랜덤한 행 선택 (1-45)
        const randomRow = Math.floor(Math.random() * 45) + 1;
        console.log(`자동 화살 발사: 행=${randomRow}`);
        
        // 화살 발사
        onLeftButtonClick(randomRow);
    }, autoFireInterval);
}

// 자동 발사 중지 함수
function stopAutoFire() {
    if (autoFireTimer) {
        clearInterval(autoFireTimer);
        autoFireTimer = null;
        console.log("자동 화살 발사 중지");
    }
}

// 자동 발사 토글 함수
function toggleAutoFire() {
    autoFireEnabled = !autoFireEnabled;
    
    if (autoFireEnabled) {
        startAutoFire();
    } else {
        stopAutoFire();
    }
    
    // UI 업데이트
    const autoFireButton = document.querySelector('.auto-fire-button');
    if (autoFireButton) {
        autoFireButton.textContent = autoFireEnabled ? '자동발사 중지' : '자동발사 시작';
    }
    
    return autoFireEnabled;
}

// 초기화 함수 수정
function initGame() {
    // 페이지5에서 저장한 최신 winningNumbers가 있으면 마지막 회차에 반영
    const stored = localStorage.getItem('winningNumbers');
    if (stored) {
        gameState.winningNumbers[gameState.endNumber] = JSON.parse(stored);
    }

    // 페이지4의 회차 범위가 업데이트되었는지 확인
    const drawRange = localStorage.getItem('drawRange');
    if (drawRange) {
        try {
            const rangeData = JSON.parse(drawRange);
            if (rangeData && rangeData.start && rangeData.end) {
                // 회차 범위 업데이트
                const oldStart = gameState.startNumber;
                const oldEnd = gameState.endNumber;
                
                gameState.startNumber = rangeData.start;
                gameState.endNumber = rangeData.end;
                console.log(`화살표 게임 회차 범위 업데이트: ${gameState.startNumber}-${gameState.endNumber}`);
                
                // 새 범위에 해당하는 winningNumbers 데이터 초기화
                for (let i = gameState.startNumber; i <= gameState.endNumber; i++) {
                    if (!gameState.winningNumbers[i]) {
                        gameState.winningNumbers[i] = [];
                    }
                }
                
                // 새로운 회차에 대한 당첨번호가 있는지 확인
                const latestWinningNumber = localStorage.getItem('latestWinningNumber');
                if (latestWinningNumber) {
                    try {
                        const winningData = JSON.parse(latestWinningNumber);
                        if (winningData && winningData.drawNumber && winningData.numbers) {
                            // 새 회차 당첨번호 추가
                            gameState.winningNumbers[winningData.drawNumber] = winningData.numbers;
                            console.log(`${winningData.drawNumber}회 당첨번호 업데이트됨:`, winningData.numbers);
                        }
                    } catch (e) {
                        console.error('당첨번호 파싱 오류:', e);
                    }
                }
            }
        } catch (e) {
            console.error('회차 범위 파싱 오류:', e);
        }
    }
    
    // 누락된 winningNumbers 데이터 초기화
    for (let i = gameState.startNumber; i <= gameState.endNumber; i++) {
        if (!gameState.winningNumbers[i]) {
            gameState.winningNumbers[i] = [];
        }
    }
    
    createGrid();
    console.log("게임 초기화 완료");
    
    // 자동 화살 발사 시작
    startAutoFire();
}

// 페이지 로드 시 초기화 함수 수정
document.addEventListener('DOMContentLoaded', function() {
    console.log("페이지 로드됨");
    
    // 패널 초기화
    window.arrowPanelNumbers = [];
    const panels = document.querySelectorAll('.arrow-panel');
    if (panels.length > 0) {
        console.log(`패널 개수: ${panels.length}`);
        
        // 각 패널의 원 개수 출력
        panels.forEach((panel, index) => {
            console.log(`패널 ${index+1}의 원 개수: ${panel.children.length}`);
        });
    }
    
    // localStorage에서 현재 회차 정보 확인
    const drawRange = localStorage.getItem('drawRange');
    if (drawRange) {
        try {
            const rangeData = JSON.parse(drawRange);
            if (rangeData && rangeData.start && rangeData.end) {
                // 메인 페이지 로드 시 즉시 회차 범위 업데이트
                gameState.startNumber = rangeData.start;
                gameState.endNumber = rangeData.end;
                console.log(`초기 화면 회차 범위 설정: ${gameState.startNumber}-${gameState.endNumber}`);
            }
        } catch (e) {
            console.error('회차 범위 파싱 오류:', e);
        }
    }
    
    initGame();
    updateArrowPanels();
    updateGameTitle(); // 제목 업데이트
    
    // 자동발사 버튼 생성
    createAutoFireButton();
    
    // 화살표 게임 회차 범위 업데이트 이벤트 리스너
    window.addEventListener('arrowGameRangeUpdate', function(event) {
        if (event.detail && event.detail.startNumber && event.detail.endNumber) {
            gameState.startNumber = event.detail.startNumber;
            gameState.endNumber = event.detail.endNumber;
            console.log(`이벤트로 회차 범위 업데이트: ${gameState.startNumber}-${gameState.endNumber}`);
            
            // 누락된 winningNumbers 데이터 초기화
            for (let i = gameState.startNumber; i <= gameState.endNumber; i++) {
                if (!gameState.winningNumbers[i]) {
                    gameState.winningNumbers[i] = [];
                }
            }
            
            createGrid(); // 그리드 다시 생성
            updateGameTitle(); // 제목 업데이트
        }
    });
    
    // 다른 탭/창에서 발생한 업데이트 감지를 위한 이벤트 리스너
    window.addEventListener('storage', function(event) {
        if (event.key === 'drawRange') {
            try {
                const rangeData = JSON.parse(event.newValue);
                if (rangeData && rangeData.start && rangeData.end) {
                    gameState.startNumber = rangeData.start;
                    gameState.endNumber = rangeData.end;
                    console.log(`localStorage 이벤트로 회차 범위 업데이트: ${gameState.startNumber}-${gameState.endNumber}`);
                    
                    // 누락된 winningNumbers 데이터 초기화
                    for (let i = gameState.startNumber; i <= gameState.endNumber; i++) {
                        if (!gameState.winningNumbers[i]) {
                            gameState.winningNumbers[i] = [];
                        }
                    }
                    
                    createGrid(); // 그리드 다시 생성
                    updateGameTitle(); // 제목 업데이트
                }
            } catch (e) {
                console.error('회차 범위 파싱 오류:', e);
            }
        } else if (event.key === 'latestWinningNumber') {
            try {
                const winningData = JSON.parse(event.newValue);
                if (winningData && winningData.drawNumber && winningData.numbers) {
                    gameState.winningNumbers[winningData.drawNumber] = winningData.numbers;
                    console.log(`${winningData.drawNumber}회 당첨번호 업데이트됨:`, winningData.numbers);
                    createGrid(); // 그리드 다시 생성
                }
            } catch (e) {
                console.error('당첨번호 파싱 오류:', e);
            }
        } else if (event.key === 'lastDrawRangeUpdate') {
            // 다른 탭/창에서 회차 범위가 업데이트되었음을 감지
            console.log('다른 탭/창에서 회차 범위 업데이트 감지됨');
            // localStorage에서 최신 정보 가져와서 적용
            const drawRange = localStorage.getItem('drawRange');
            if (drawRange) {
                try {
                    const rangeData = JSON.parse(drawRange);
                    if (rangeData && rangeData.start && rangeData.end) {
                        gameState.startNumber = rangeData.start;
                        gameState.endNumber = rangeData.end;
                        console.log(`다른 탭 업데이트로 회차 범위 갱신: ${gameState.startNumber}-${gameState.endNumber}`);
                        
                        // 누락된 winningNumbers 데이터 초기화
                        for (let i = gameState.startNumber; i <= gameState.endNumber; i++) {
                            if (!gameState.winningNumbers[i]) {
                                gameState.winningNumbers[i] = [];
                            }
                        }
                        
                        createGrid(); // 그리드 다시 생성
                        updateGameTitle(); // 제목 업데이트
                    }
                } catch (e) {
                    console.error('회차 범위 파싱 오류:', e);
                }
            }
        }
    });
});

// 자동발사 버튼 생성 함수
function createAutoFireButton() {
    // 이미 버튼이 있는지 확인
    if (document.querySelector('.auto-fire-button')) return;
    
    // title-box 요소 찾기
    const titleBox = document.querySelector('.title-box');
    if (!titleBox) return;
    
    // 버튼 생성
    const autoFireButton = document.createElement('button');
    autoFireButton.className = 'hint-button small auto-fire-button';
    autoFireButton.textContent = autoFireEnabled ? '자동발사 중지' : '자동발사 시작';
    autoFireButton.onclick = toggleAutoFire;
    
    // 버튼 추가
    titleBox.appendChild(autoFireButton);
}

// 게임 제목 업데이트 함수
function updateGameTitle() {
    const titleElement = document.querySelector('.title-box h1');
    if (titleElement) {
        titleElement.textContent = `화살표 (${gameState.startNumber}회-${gameState.endNumber}회)`;
    }
}

let arrowAnimationRunning = false;

// 별표시 번호 저장용 배열 (단일 배열로 관리)
window.arrowPanelNumbers = [];

function updateArrowPanels() {
    console.log("updateArrowPanels 호출됨");
    
    // 패널 직접 선택
    const panel = document.querySelector('.arrow-panel');
    if (!panel) {
        console.error('패널을 찾을 수 없습니다.');
        return;
    }
    
    // 패널의 모든 원 요소 선택
    const allCircles = Array.from(panel.children).slice(0, 10);
    console.log("총 원 개수:", allCircles.length);
    
    // 모든 원 초기화
    allCircles.forEach(circle => {
        circle.textContent = '';
        circle.classList.remove('arrow-num-red1', 'arrow-num-red2', 'arrow-num-red3');
    });
    
    // 숫자가 없으면 종료
    if (window.arrowPanelNumbers.length === 0) {
        console.log("표시할 숫자가 없습니다.");
        return;
    }
    
    console.log("숫자 배열:", window.arrowPanelNumbers);
    
    // 숫자 빈도수 계산 (강조 표시용)
    const countMap = {};
    window.arrowPanelNumbers.forEach(n => {
        countMap[n] = (countMap[n] || 0) + 1;
    });
    
    // 최신 순서대로 처리 (최대 10개)
    const numCount = Math.min(window.arrowPanelNumbers.length, allCircles.length);
    console.log("표시할 숫자 개수:", numCount);
    
    // 각 원에 숫자 할당
    for (let i = 0; i < numCount; i++) {
        const circle = allCircles[i];
        // 최신 숫자부터 표시
        const numIndex = window.arrowPanelNumbers.length - 1 - i;
        const num = window.arrowPanelNumbers[numIndex];
        
        console.log(`원 ${i+1}에 숫자 ${num} 할당 (배열 인덱스: ${numIndex})`);
        
        if (circle) {
            circle.textContent = num;
            
            // 등장 횟수에 따라 색상 적용
            const cnt = countMap[num];
            if (cnt === 2) circle.classList.add('arrow-num-red1');
            else if (cnt === 3) circle.classList.add('arrow-num-red2');
            else if (cnt >= 4) circle.classList.add('arrow-num-red3');
        } else {
            console.error(`인덱스 ${i}의 원 요소가 없습니다.`);
        }
    }
}

// 규칙별로 패널 인덱스 반환
function getPanelIndexByRule(ruleIndex) {
    if (ruleIndex === 0) return 0; // 3칸 최대
    if (ruleIndex === 1) return 1; // 3칸 최소
    return 2; // 5칸 최대
}

// 3가지 경로 규칙 함수
function findNextCellMax3(row, col) {
    // 오른쪽 3칸(↗, →, ↘) 중 점수가 가장 높은 칸
    const candidates = [
        { r: row - 1, c: col + 1, dir: '↗', angle: -45 },
        { r: row,     c: col + 1, dir: '→', angle: 0 },
        { r: row + 1, c: col + 1, dir: '↘', angle: 45 }
    ];
    
    // 유효하지 않은 행 범위 필터링
    const validCandidates = candidates.filter(cand => cand.r >= 1 && cand.r <= 45);
    
    if (validCandidates.length === 0) {
        // 유효한 후보가 없으면 기본값으로 오른쪽 방향 반환
        return { r: row, c: col + 1, dir: '→', angle: 0 };
    }
    
    let maxVal = -Infinity, maxIdx = 0;
    
    validCandidates.forEach((cand, idx) => {
        const cell = document.querySelector(`.grid-cell[data-row='${cand.r}'][data-col='${cand.c}']`);
        let val = -Infinity;
        
        if (cell) {
            // 점수 계산 (기존 로직 유지)
            let totalScore = 0;
            const cellPos = { row: cand.r, col: cand.c };
            const winningCells = document.querySelectorAll('.grid-cell.winning');
            
            winningCells.forEach(winningCell => {
                const winningPos = {
                    row: parseInt(winningCell.dataset.row),
                    col: parseInt(winningCell.dataset.col)
                };
                const rowDiff = Math.abs(cellPos.row - winningPos.row);
                const colDiff = Math.abs(cellPos.col - winningPos.col);
                
                if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                    totalScore += 2;
                } else if (rowDiff === 1 && colDiff === 1) {
                    totalScore += 1.5;
                } else if ((rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2)) {
                    totalScore += 1;
                }
            });
            
            val = totalScore;
            
            // 기본적으로 가운데 방향(→)을 선호하도록 약간의 가중치 추가
            if (idx === 1) { // 가운데 후보
                val += 0.1;
            }
        }
        
        if (val > maxVal) {
            maxVal = val;
            maxIdx = idx;
        }
    });
    
    return validCandidates[maxIdx];
}

function findNextCellMin3(row, col) {
    // 오른쪽 3칸(↗, →, ↘) 중 점수가 가장 낮은 칸
    const candidates = [
        { r: row - 1, c: col + 1, dir: '↗', angle: -45 },
        { r: row,     c: col + 1, dir: '→', angle: 0 },
        { r: row + 1, c: col + 1, dir: '↘', angle: 45 }
    ];
    let minVal = Infinity, minIdx = 1;
    candidates.forEach((cand, idx) => {
        if (cand.r < 1 || cand.r > 45) return;
        const cell = document.querySelector(`.grid-cell[data-row='${cand.r}'][data-col='${cand.c}']`);
        let val = Infinity;
        if (cell) {
            let scoreEl = cell.querySelector('.score-display');
            if (scoreEl) {
                val = parseFloat(scoreEl.textContent);
            } else {
                let totalScore = 0;
                const cellPos = { row: cand.r, col: cand.c };
                const winningCells = document.querySelectorAll('.grid-cell.winning');
                winningCells.forEach(winningCell => {
                    const winningPos = {
                        row: parseInt(winningCell.dataset.row),
                        col: parseInt(winningCell.dataset.col)
                    };
                    const rowDiff = Math.abs(cellPos.row - winningPos.row);
                    const colDiff = Math.abs(cellPos.col - winningPos.col);
                    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                        totalScore += 2;
                    } else if (rowDiff === 1 && colDiff === 1) {
                        totalScore += 1.5;
                    } else if ((rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2)) {
                        totalScore += 1;
                    }
                });
                val = totalScore;
            }
        }
        if (val < minVal || (val === minVal && idx === 1)) {
            minVal = val;
            minIdx = idx;
        }
    });
    return candidates[minIdx];
}

function findNextCellMax5(row, col) {
    // 오른쪽 5칸(↖, ↗, →, ↘, ↙) 중 점수가 가장 높은 칸
    const candidates = [
        { r: row - 2, c: col + 1, dir: '↖', angle: -70 },
        { r: row - 1, c: col + 1, dir: '↗', angle: -45 },
        { r: row,     c: col + 1, dir: '→', angle: 0 },
        { r: row + 1, c: col + 1, dir: '↘', angle: 45 },
        { r: row + 2, c: col + 1, dir: '↙', angle: 70 }
    ];
    let maxVal = -Infinity, maxIdx = 2;
    candidates.forEach((cand, idx) => {
        if (cand.r < 1 || cand.r > 45) return;
        const cell = document.querySelector(`.grid-cell[data-row='${cand.r}'][data-col='${cand.c}']`);
        let val = -Infinity;
        if (cell) {
            let scoreEl = cell.querySelector('.score-display');
            if (scoreEl) {
                val = parseFloat(scoreEl.textContent);
            } else {
                let totalScore = 0;
                const cellPos = { row: cand.r, col: cand.c };
                const winningCells = document.querySelectorAll('.grid-cell.winning');
                winningCells.forEach(winningCell => {
                    const winningPos = {
                        row: parseInt(winningCell.dataset.row),
                        col: parseInt(winningCell.dataset.col)
                    };
                    const rowDiff = Math.abs(cellPos.row - winningPos.row);
                    const colDiff = Math.abs(cellPos.col - winningPos.col);
                    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                        totalScore += 2;
                    } else if (rowDiff === 1 && colDiff === 1) {
                        totalScore += 1.5;
                    } else if ((rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2)) {
                        totalScore += 1;
                    }
                });
                val = totalScore;
            }
        }
        if (val > maxVal || (val === maxVal && idx === 2)) {
            maxVal = val;
            maxIdx = idx;
        }
    });
    return candidates[maxIdx];
}

// runArrowPath 함수 내에서 push 부분을 수정
function runArrowPath(startRow) {
    // 아처 애니메이션 먼저 실행
    playArcherAnimationAtRow(startRow);
    
    // 이전 경로 표시 제거
    const existingPaths = document.querySelectorAll('.arrow-path');
    existingPaths.forEach(path => path.remove());
    
    // 이전 하이라이트 및 선택 제거
    document.querySelectorAll('.path-highlight, .selected').forEach(cell => {
        cell.classList.remove('path-highlight', 'selected');
    });
    
    console.log(`경로 계산 시작: 행=${startRow}, 열=${gameState.startNumber}에서 ${gameState.endNumber}까지`);
    
    // 현재 그리드 상태 캡처
    const gridState = [...document.querySelectorAll('.grid-cell')].map(cell => {
        return {
            element: cell,
            row: parseInt(cell.dataset.row),
            col: parseInt(cell.dataset.col),
            rect: cell.getBoundingClientRect()
        };
    });
    
    // 시작 셀 찾기
    const startCol = gameState.startNumber;
    let currentCell = gridState.find(cell => cell.row === startRow && cell.col === startCol);
    
    if (!currentCell) {
        console.error(`시작 셀을 찾을 수 없습니다: 행=${startRow}, 열=${startCol}`);
        
        // 대체 방법: 첫 번째 열에서 가장 가까운 행 사용
        const firstColCells = gridState.filter(cell => cell.col === startCol);
        if (firstColCells.length > 0) {
            // 가장 가까운 행 찾기
            firstColCells.sort((a, b) => Math.abs(a.row - startRow) - Math.abs(b.row - startRow));
            currentCell = firstColCells[0];
            console.log(`대체 시작 셀 사용: 행=${currentCell.row}, 열=${currentCell.col}`);
        } else {
            console.error('첫 번째 열에 유효한 셀이 없습니다.');
            return;
        }
    }
    
    // 경로 포인트 배열
    const pathPoints = [];
    let previousCell = null;
    
    // 경로 추적 (최대 열까지)
    const maxCol = gameState.endNumber; // 마지막 열 번호 설정
    let iterations = 0; // 무한 루프 방지용 카운터
    let currentCol = startCol;
    
    console.log(`경로 탐색 시작: 시작위치(${currentCell.row}, ${currentCell.col}), 종료열=${maxCol}`);
    
    // 마지막 열에 도달할 때까지 반복
    while (currentCell && currentCol < maxCol && iterations < 50) {
        iterations++;
        
        // 현재 셀 하이라이트
        currentCell.element.classList.add('path-highlight');
        console.log(`경로 포인트 ${iterations}: 행=${currentCell.row}, 열=${currentCell.col}`);
        
        // 이전 셀이 있는 경우 연결 화살표 생성
        if (previousCell) {
            const prevRect = previousCell.rect;
            const currentRect = currentCell.rect;
            
            // 중심점 계산
            const prevCenterX = prevRect.left + prevRect.width / 2 + window.scrollX;
            const prevCenterY = prevRect.top + prevRect.height / 2 + window.scrollY;
            const currentCenterX = currentRect.left + currentRect.width / 2 + window.scrollX;
            const currentCenterY = currentRect.top + currentRect.height / 2 + window.scrollY;
            
            // 거리와 각도 계산
            const dx = currentCenterX - prevCenterX;
            const dy = currentCenterY - prevCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // 화살표 경로 생성
            const path = document.createElement('div');
            path.classList.add('arrow-path');
            path.style.position = 'absolute';
            path.style.width = `${distance}px`;
            path.style.left = `${prevCenterX}px`;
            path.style.top = `${prevCenterY}px`;
            path.style.transform = `rotate(${angle}deg)`;
            path.style.zIndex = '50';
            path.style.opacity = '0';  // 초기에는 숨김
            
            document.body.appendChild(path);
            pathPoints.push({
                element: path,
                delay: pathPoints.length * 100  // 각 경로마다 지연 시간 증가
            });
        }
        
        previousCell = currentCell;
        currentCol = currentCell.col;
        
        // 다음 열로 이동할 방향 결정
        const nextCol = currentCol + 1;
        let nextRow = currentCell.row;
        
        // 다음 방향 결정
        const next = findNextCellMax3(currentCell.row, currentCol);
        if (next && next.c > currentCol) {
            nextRow = next.r;
        }
        
        // 행이 유효한지 확인하고 조정
        nextRow = Math.max(1, Math.min(45, nextRow));
        
        // 다음 셀 찾기
        const nextCell = gridState.find(cell => cell.row === nextRow && cell.col === nextCol);
        
        if (nextCell) {
            currentCell = nextCell;
        } else {
            console.error(`다음 셀을 찾을 수 없습니다: 행=${nextRow}, 열=${nextCol}`);
            
            // 동일한 행에서 다음 열의 셀 시도
            const sameRowNextCell = gridState.find(cell => cell.row === currentCell.row && cell.col === nextCol);
            if (sameRowNextCell) {
                currentCell = sameRowNextCell;
                console.log(`대체 경로 사용: 행=${currentCell.row}, 열=${currentCell.col}`);
            } else {
                // 다음 열에서 가장 가까운 셀 찾기
                const nextColCells = gridState.filter(cell => cell.col === nextCol);
                if (nextColCells.length > 0) {
                    nextColCells.sort((a, b) => 
                        Math.abs(a.row - currentCell.row) - Math.abs(b.row - currentCell.row)
                    );
                    currentCell = nextColCells[0];
                    console.log(`가장 가까운 대체 셀 사용: 행=${currentCell.row}, 열=${currentCell.col}`);
                } else {
                    console.error(`다음 열(${nextCol})에 유효한 셀이 없습니다. 경로 종료.`);
                    break;
                }
            }
        }
    }
    
    // 모든 선택 상태 초기화
    document.querySelectorAll('.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    
    // 마지막 열 셀을 강제로 찾아서 추가
    let finalCell = null;
    if (currentCell) {
        console.log(`경로 추적 종료: 현재 위치(${currentCell.row}, ${currentCell.col}), 목표 열=${maxCol}`);
        
        // 현재 행과 동일한 마지막 열의 셀 찾기
        const lastColCell = gridState.find(cell => cell.row === currentCell.row && cell.col === maxCol);
        
        if (lastColCell) {
            // 마지막 경로 추가
            if (currentCell) {
                const prevRect = currentCell.rect;
                const currentRect = lastColCell.rect;
                
                // 중심점 계산
                const prevCenterX = prevRect.left + prevRect.width / 2 + window.scrollX;
                const prevCenterY = prevRect.top + prevRect.height / 2 + window.scrollY;
                const currentCenterX = currentRect.left + currentRect.width / 2 + window.scrollX;
                const currentCenterY = currentRect.top + currentRect.height / 2 + window.scrollY;
                
                // 거리와 각도 계산
                const dx = currentCenterX - prevCenterX;
                const dy = currentCenterY - prevCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                // 화살표 경로 생성
                const path = document.createElement('div');
                path.classList.add('arrow-path');
                path.style.position = 'absolute';
                path.style.width = `${distance}px`;
                path.style.left = `${prevCenterX}px`;
                path.style.top = `${prevCenterY}px`;
                path.style.transform = `rotate(${angle}deg)`;
                path.style.zIndex = '50';
                path.style.opacity = '0';  // 초기에는 숨김
                
                document.body.appendChild(path);
                pathPoints.push({
                    element: path,
                    delay: pathPoints.length * 100  // 각 경로마다 지연 시간 증가
                });
            }
            
            // 마지막 셀 하이라이트 및 선택
            lastColCell.element.classList.add('path-highlight');
            
            // 직접 DOM에서 마지막 열의 셀을 찾아 클래스 추가
            const actualLastColElement = document.querySelector(`.grid-cell[data-row='${lastColCell.row}'][data-col='${maxCol}']`);
            if (actualLastColElement) {
                actualLastColElement.classList.add('path-highlight');
                actualLastColElement.classList.add('selected');
                console.log(`실제 DOM에서 마지막 열 셀에 선택 클래스 추가: 행=${lastColCell.row}, 열=${maxCol}`);
            }
            
            finalCell = lastColCell;
            console.log(`마지막 열 셀 추가: 행=${lastColCell.row}, 열=${lastColCell.col}`);
        } else {
            // 마지막 열에서 가장 가까운 행 찾기
            const lastColCells = gridState.filter(cell => cell.col === maxCol);
            if (lastColCells.length > 0) {
                lastColCells.sort((a, b) => 
                    Math.abs(a.row - currentCell.row) - Math.abs(b.row - currentCell.row)
                );
                const closestLastColCell = lastColCells[0];
                
                // 마지막 경로 추가
                if (currentCell) {
                    const prevRect = currentCell.rect;
                    const currentRect = closestLastColCell.rect;
                    
                    // 중심점 계산
                    const prevCenterX = prevRect.left + prevRect.width / 2 + window.scrollX;
                    const prevCenterY = prevRect.top + prevRect.height / 2 + window.scrollY;
                    const currentCenterX = currentRect.left + currentRect.width / 2 + window.scrollX;
                    const currentCenterY = currentRect.top + currentRect.height / 2 + window.scrollY;
                    
                    // 거리와 각도 계산
                    const dx = currentCenterX - prevCenterX;
                    const dy = currentCenterY - prevCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    // 화살표 경로 생성
                    const path = document.createElement('div');
                    path.classList.add('arrow-path');
                    path.style.position = 'absolute';
                    path.style.width = `${distance}px`;
                    path.style.left = `${prevCenterX}px`;
                    path.style.top = `${prevCenterY}px`;
                    path.style.transform = `rotate(${angle}deg)`;
                    path.style.zIndex = '50';
                    path.style.opacity = '0';  // 초기에는 숨김
                    
                    document.body.appendChild(path);
                    pathPoints.push({
                        element: path,
                        delay: pathPoints.length * 100  // 각 경로마다 지연 시간 증가
                    });
                }
                
                // 마지막 셀 하이라이트 및 선택
                closestLastColCell.element.classList.add('path-highlight');
                
                // 직접 DOM에서 마지막 열의 셀을 찾아 클래스 추가
                const actualLastColElement = document.querySelector(`.grid-cell[data-row='${closestLastColCell.row}'][data-col='${maxCol}']`);
                if (actualLastColElement) {
                    actualLastColElement.classList.add('path-highlight');
                    actualLastColElement.classList.add('selected');
                    console.log(`실제 DOM에서 마지막 열 셀에 선택 클래스 추가: 행=${closestLastColCell.row}, 열=${maxCol}`);
                }
                
                finalCell = closestLastColCell;
                console.log(`가장 가까운 마지막 열 셀 추가: 행=${closestLastColCell.row}, 열=${closestLastColCell.col}`);
            }
        }
    }
    
    // 최종 선택된 번호를 패널에 추가
    if (finalCell && finalCell.row >= 1 && finalCell.row <= 45) {
        console.log(`최종 선택된 번호: ${finalCell.row}`);
        
        // 숫자를 단일 배열에 추가
        window.arrowPanelNumbers.push(finalCell.row);
        
        // 배열이 10개를 초과하면 가장 오래된 것 제거
        if (window.arrowPanelNumbers.length > 10) {
            const removed = window.arrowPanelNumbers.shift();
            console.log(`가장 오래된 숫자 제거: ${removed}`);
        }
        
        updateArrowPanels(); // 패널 업데이트
    } else {
        console.error('유효한 최종 셀이 없습니다.');
    }
    
    // 애니메이션 시작
    pathPoints.forEach((point, index) => {
        setTimeout(() => {
            point.element.style.opacity = '1';  // 표시
            
            // 점프 효과 애니메이션
            if (index < pathPoints.length - 1) {
                // 각 지점에 도달할 때 효과 표시
                setTimeout(() => {
                    const effect = document.createElement('div');
                    effect.classList.add('path-effect');
                    effect.style.position = 'absolute';
                    effect.style.width = '20px';
                    effect.style.height = '20px';
                    effect.style.borderRadius = '50%';
                    effect.style.background = 'radial-gradient(circle, rgba(33, 150, 243, 0.8) 0%, transparent 70%)';
                    effect.style.left = `${parseFloat(point.element.style.left) + parseFloat(point.element.style.width)}px`;
                    effect.style.top = `${parseFloat(point.element.style.top)}px`;
                    effect.style.transform = 'translate(-50%, -50%)';
                    effect.style.zIndex = '60';
                    effect.style.animation = 'pulse 0.5s forwards';
                    
                    document.body.appendChild(effect);
                    
                    // 효과 제거
                    setTimeout(() => {
                        effect.remove();
                    }, 500);
                }, point.delay + 200);
            }
        }, point.delay);
    });
    
    // 마지막 애니메이션 효과 - 타이머를 사용하여 최종 선택 상태 재확인
    setTimeout(() => {
        // 모든 selected 클래스 제거
        document.querySelectorAll('.selected').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // 마지막 열 셀에만 selected 클래스 추가
        if (finalCell) {
            // 마지막 열의 셀 강제 선택
            const lastElement = document.querySelector(`.grid-cell[data-row='${finalCell.row}'][data-col='${maxCol}']`);
            if (lastElement) {
                lastElement.classList.add('selected');
                console.log(`최종 선택 재확인: 행=${finalCell.row}, 열=${maxCol}`);
                
                // 선택 애니메이션 실행
                displayScore(lastElement, 100);
            }
        }
    }, 300);
    
    // 경로 정리 타이머
    setTimeout(() => {
        pathPoints.forEach((point, index) => {
            setTimeout(() => {
                point.element.style.opacity = '0';
                setTimeout(() => {
                    if (point.element.parentNode) {
                        point.element.remove();
                    }
                }, 500);
            }, index * 50);
        });
    }, pathPoints.length * 100 + 3000);
}

// 궁수/화살 애니메이션 및 사운드 효과
function playArcherAnimation() {
  const archerImg = document.getElementById('archer-img');
  if (!archerImg) return;
  archerImg.src = '../images/ar2.png';
  setTimeout(() => {
    archerImg.src = '../images/ar1.png';
  }, 1000); // 1초 동안 활을 당긴 모습 유지
}

function shootArrow(gridTargetSelector) {
    // 아처 이미지 참조
    const archerImg = document.getElementById('archer-img');
    
    // 아처 애니메이션 클래스 추가
    archerImg.classList.add('archer-animation');
    
    // 오디오 파일이 없으므로 재생 시도하지 않음
    // const bowSound = new Audio('../sounds/bow-sound.mp3');
    
    // 대상 선택자가 없는 경우 기본 셀 타겟팅
    if (!gridTargetSelector) {
        const firstCol = gameState.startNumber;
        gridTargetSelector = `.grid-cell[data-row="1"][data-col="${firstCol}"]`;
    }
    
    // 대상 요소 가져오기
    const targetCell = document.querySelector(gridTargetSelector);
    if (!targetCell) {
        console.log('대상 셀을 찾을 수 없습니다:', gridTargetSelector);
        return;
    }
    
    // 아처 컨테이너와 대상 셀의 위치 정보 계산
    const archerContainer = document.querySelector('.archer-container');
    if (!archerContainer) {
        console.log('아처 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    const archerRect = archerContainer.getBoundingClientRect();
    const targetRect = targetCell.getBoundingClientRect();
    
    // 화살 요소 생성
    const arrow = document.createElement('div');
    arrow.classList.add('arrow');
    
    // 화살 초기 위치 설정
    arrow.style.left = `${archerRect.right}px`;
    arrow.style.top = `${archerRect.top + archerRect.height / 2 - 3}px`;
    document.body.appendChild(arrow);
    
    // 화살 날아가는 거리와 각도 계산
    const dx = targetRect.left + targetRect.width / 2 - archerRect.right;
    const dy = targetRect.top + targetRect.height / 2 - (archerRect.top + archerRect.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // 화살 애니메이션 적용
    arrow.style.transform = `rotate(${angle}deg)`;
    arrow.style.transition = `left ${distance / 1000}s linear, top ${distance / 1000}s linear`;
    
    // 화살 날아가는 애니메이션
    setTimeout(() => {
        arrow.style.left = `${targetRect.left + targetRect.width / 2}px`;
        arrow.style.top = `${targetRect.top + targetRect.height / 2}px`;
        
        // 타겟 셀에 히트 효과 추가
        setTimeout(() => {
            targetCell.classList.add('path-highlight');
            
            // 오디오 파일이 없으므로 재생 시도하지 않음
            // const hitSound = new Audio('../sounds/hit-sound.mp3');
            
            // 화살 제거
            setTimeout(() => {
                arrow.remove();
                // 아처 애니메이션 클래스 제거
                archerImg.classList.remove('archer-animation');
            }, 200);
        }, distance / 1000 * 1000);
    }, 100);
}

// 화살 이미지 존재 여부 체크(최초 1회) - 에러 처리 추가
(function checkArrowImage() {
    const img = new Image();
    img.onload = () => { window.arrowImageExists = true; };
    img.onerror = () => { window.arrowImageExists = false; };
    img.src = '../images/arrow.png';
})();

// 오디오 로드 시도하지 않음
window.arrowShootAudio = null;

function playArcherAnimationAtRow(row) {
    const archer = document.querySelector('.archer-container');
    const archerImg = document.getElementById('archer-img');
    
    if (!archer || !archerImg) {
        console.error('아처 요소를 찾을 수 없습니다');
        return;
    }

    // 아처 컨테이너가 감춰져 있을 경우 표시
    archer.style.display = 'flex';
    archer.style.opacity = '1';
    archer.style.visibility = 'visible';
    
    console.log(`행 ${row}에서 아처 애니메이션 시작`);
    
    // 위치를 조정하기 전에 약간의 딜레이를 줌
    setTimeout(() => {
        try {
            const gridContainer = document.querySelector('.grid-container');
            if (!gridContainer) {
                console.error('그리드 컨테이너를 찾을 수 없습니다');
                return;
            }
            
            // 행 인덱스 확인
            const rowIndex = Math.min(Math.max(1, row), 45) - 1;
            const headerCells = gridContainer.querySelectorAll('.number-cell.row-header');
            
            if (!headerCells || headerCells.length === 0) {
                console.error('헤더 셀을 찾을 수 없습니다');
                
                // 대체 방법: 기본 위치에 아처 배치
                archer.style.top = `${(row - 1) * 29 + 40}px`;
                console.log(`헤더 셀을 찾을 수 없어 기본 위치에 배치: top=${archer.style.top}`);
            } else if (rowIndex >= headerCells.length) {
                console.error(`행 인덱스(${rowIndex})가 헤더 셀 개수(${headerCells.length})를 초과합니다`);
                
                // 대체 방법: 마지막 행 사용
                const lastCell = headerCells[headerCells.length - 1];
                const lastCellRect = lastCell.getBoundingClientRect();
                const gridRect = gridContainer.getBoundingClientRect();
                
                const offsetTop = lastCellRect.top - gridRect.top + (lastCellRect.height / 2) - (archer.offsetHeight / 2);
                archer.style.top = `${offsetTop}px`;
                console.log(`마지막 행을 사용하여 아처 위치 설정: top=${offsetTop}px`);
            } else {
                const headerCell = headerCells[rowIndex];
                if (!headerCell) {
                    console.error(`행 ${row}의 헤더 셀을 찾을 수 없습니다`);
                    return;
                }
                
                // 그리드 및 셀 위치 계산
                const gridRect = gridContainer.getBoundingClientRect();
                const cellRect = headerCell.getBoundingClientRect();
                
                // 아처 위치 설정 - 셀 중앙에 맞춤
                const offsetTop = cellRect.top - gridRect.top + (cellRect.height / 2) - (archer.offsetHeight / 2);
                archer.style.top = `${offsetTop}px`;
                console.log(`아처 위치 설정됨: top=${offsetTop}px`);
            }
            
            // 애니메이션 효과
            archerImg.src = '../images/ar2.png';
            
            // 1초 후 원래 이미지로 복원
            setTimeout(() => {
                archerImg.src = '../images/ar1.png';
            }, 1000);
        } catch (e) {
            console.error('아처 애니메이션 오류:', e);
        }
    }, 100);
}

function onLeftButtonClick(row) {
    // 힌트5가 활성화되어 있지 않을 때만 실행
    if (!hint5Active) {
        console.log('힌트5 비활성화 상태에서 행 버튼 클릭됨:', row);
    }
    
    console.log('행 버튼 클릭됨:', row);
    
    // 유효한 행 번호인지 확인
    if (row < 1 || row > 45) {
        console.error('유효하지 않은 행 번호:', row);
        return;
    }
    
    // 아처 애니메이션 실행
    playArcherAnimationAtRow(row);
    
    // 첫 번째 열의 셀 선택자 생성
    const firstCol = gameState.startNumber;
    const targetSelector = `.grid-cell[data-row="${row}"][data-col="${firstCol}"]`;
    
    // 대상 셀 확인
    const targetCell = document.querySelector(targetSelector);
    if (!targetCell) {
        console.error(`대상 셀을 찾을 수 없습니다: ${targetSelector}`);
        return;
    }
    
    // 화살 발사 -> 경로 계산 순서로 실행
    setTimeout(() => {
        try {
            shootArrow(targetSelector);
            
            // 화살이 발사된 후 경로 계산 실행
            setTimeout(() => {
                try {
                    runArrowPath(row);
                } catch (err) {
                    console.error("경로 계산 중 오류 발생:", err);
                }
            }, 700);
        } catch (err) {
            console.error("화살 발사 중 오류 발생:", err);
        }
    }, 300);
} 