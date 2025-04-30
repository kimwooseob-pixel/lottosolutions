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
        1017: [2, 9, 16, 25, 26, 40]
    }
};

// 그리드 생성 함수
function createGrid() {
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.innerHTML = '';

    // 빈 셀 (왼쪽 상단)
    gridContainer.appendChild(createCell('number-cell empty', ''));

    // 상단 회차 번호 (1003-1017)
    for (let i = gameState.startNumber; i <= gameState.endNumber; i++) {
        gridContainer.appendChild(createCell('number-cell', i));
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
            if (gameState.winningNumbers[col].includes(row)) {
                cell.classList.add('winning');
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

function 힌트5() {
    // 이전 점수와 그라데이션 원 표시 제거
    clearScoreDisplay();
    
    // 모든 셀과 당첨 셀 가져오기
    const allCells = document.querySelectorAll('.grid-cell');
    const winningCells = document.querySelectorAll('.grid-cell.winning');
    
    // 각 빈칸에 대해 점수 계산
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
            
            // 모든 점수(0 포함) 표시
            displayScore(cell, totalScore);
        }
    });
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
    // 그라데이션 원 생성
    if (score <= 1.5) {
        const gradientCircle = document.createElement('div');
        gradientCircle.className = 'hint5-gradient-circle';
        let size;
        let gradientColor;
        
        // 점수에 따른 원 크기 설정
        if (score === 0) {
            size = 72;  // 가장 큰 원
            gradientColor = 'rgba(0, 0, 0, 0.7)';
        } else if (score === 1) {
            size = 60;  // 중간 크기 원
            gradientColor = 'rgba(128, 128, 0, 0.7)';
        } else if (score === 1.5) {
            size = 48;  // 가장 작은 원
            gradientColor = 'rgba(255, 255, 0, 0.7)';
        }

        gradientCircle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, ${gradientColor} 0%, transparent 70%);
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
        `;
        cell.appendChild(gradientCircle);
    }

    // 점수 표시
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display';
    scoreDisplay.textContent = score.toFixed(1);
    scoreDisplay.style.cssText = `
        position: absolute;
        width: 12px;
        height: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${score > 0 ? '#1976D2' : '#999'};
        font-weight: bold;
        font-size: 7px;
        z-index: 2;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 2px;
        padding: 1px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    `;
    cell.style.position = 'relative';
    cell.appendChild(scoreDisplay);
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
    const template = document.getElementById('score-popup-template');
    const popup = template.content.cloneNode(true);
    
    popup.querySelector('.match-count').textContent = matchCount;
    popup.querySelector('.score-value').textContent = score;
    
    document.body.appendChild(popup);
}

function closeScorePopup() {
    const popup = document.querySelector('.score-popup');
    if (popup) {
        popup.remove();
    }
}

// 초기화 함수
function initGame() {
    // 페이지5에서 저장한 최신 winningNumbers가 있으면 마지막 회차에 반영
    const stored = localStorage.getItem('winningNumbers');
    if (stored) {
        gameState.winningNumbers[gameState.endNumber] = JSON.parse(stored);
    }
    createGrid();
    console.log("게임 초기화 완료");
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initGame);

let arrowAnimationRunning = false;

function runArrowPath(startRow) {
    if (arrowAnimationRunning) return;
    arrowAnimationRunning = true;
    // 기존 화살표/강조 제거
    document.querySelectorAll('.arrow-indicator, .arrow-target').forEach(el => el.remove());
    document.querySelectorAll('.number-cell.row-header').forEach(el => el.classList.remove('arrow-target-highlight'));

    let row = startRow;
    let col = gameState.startNumber;
    const path = [{ row, col }];
    while (col < gameState.endNumber) {
        const candidates = [
            { r: row - 1, c: col + 1, dir: '↗', angle: -45 },
            { r: row,     c: col + 1, dir: '→', angle: 0 },
            { r: row + 1, c: col + 1, dir: '↘', angle: 45 }
        ];
        let maxVal = -Infinity, maxIdx = 1;
        candidates.forEach((cand, idx) => {
            if (cand.r < 1 || cand.r > 45) return;
            const cell = document.querySelector(`.grid-cell[data-row='${cand.r}'][data-col='${cand.c}']`);
            let val = -Infinity;
            if (cell) {
                // 힌트5 점수 계산: score-display가 없으면 직접 계산
                let scoreEl = cell.querySelector('.score-display');
                if (scoreEl) {
                    val = parseFloat(scoreEl.textContent);
                } else {
                    // 직접 점수 계산 (힌트5와 동일 로직)
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
            if (val > maxVal || (val === maxVal && idx === 1)) {
                maxVal = val;
                maxIdx = idx;
            }
        });
        row = candidates[maxIdx].r;
        col = candidates[maxIdx].c;
        path.push({ row, col, dir: candidates[maxIdx].dir, angle: candidates[maxIdx].angle });
    }
    // 애니메이션: 한 칸씩 이동
    let i = 0;
    function animateStep() {
        // 이전 화살표 제거
        document.querySelectorAll('.arrow-indicator.anim-arrow').forEach(el => el.remove());
        if (i < path.length - 1) {
            const { row, col, dir, angle } = path[i + 1];
            const cell = document.querySelector(`.grid-cell[data-row='${row}'][data-col='${col}']`);
            if (cell) {
                const arrow = document.createElement('span');
                arrow.className = 'arrow-indicator anim-arrow';
                arrow.textContent = dir || '→';
                arrow.style.position = 'absolute';
                arrow.style.left = '50%';
                arrow.style.top = '50%';
                arrow.style.transform = `translate(-50%, -50%) rotate(${angle || 0}deg)`;
                arrow.style.fontSize = '2em';
                arrow.style.fontWeight = 'bold';
                arrow.style.color = '#ff9800';
                arrow.style.textShadow = '0 2px 8px #222, 0 0 4px #fff';
                arrow.style.pointerEvents = 'none';
                cell.appendChild(arrow);
            }
            i++;
            setTimeout(animateStep, 180);
        } else {
            // 마지막 오른쪽 번호 강조
            const lastRow = path[path.length - 1].row;
            const rightCell = Array.from(document.querySelectorAll('.number-cell.row-header')).filter(el => el.textContent == lastRow).pop();
            if (rightCell) {
                rightCell.classList.add('arrow-target-highlight');
                const mark = document.createElement('span');
                mark.className = 'arrow-target';
                mark.textContent = '★';
                mark.style.color = '#ff9800';
                mark.style.fontSize = '1.5em';
                mark.style.marginLeft = '4px';
                rightCell.appendChild(mark);
            }
            arrowAnimationRunning = false;
        }
    }
    animateStep();
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
  const archer = document.querySelector('.archer-container');
  if (!archer) return;
  let arrow;
  if (window.arrowImageExists) {
    arrow = document.createElement('img');
    arrow.src = '../images/arrow.png';
    arrow.className = 'arrow-fly';
  } else {
    arrow = document.createElement('div');
    arrow.className = 'arrow-fly noimg';
  }
  // 시작 위치
  arrow.style.left = getComputedStyle(arrow).left || '60px';
  arrow.style.top = getComputedStyle(arrow).top || '55px';
  archer.appendChild(arrow);

  // 그리드의 첫 번째 셀~마지막 셀 위치 계산
  let grid = document.querySelector('.grid-container');
  let firstCell = grid.querySelector('.grid-cell');
  let lastCol = gameState.endNumber;
  let lastCell = grid.querySelector(`.grid-cell[data-row='1'][data-col='${lastCol}']`);
  if (firstCell && lastCell) {
    const gridRect = grid.getBoundingClientRect();
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();
    // 시작점(궁수)에서 마지막 셀까지의 상대 거리(px)
    const gridLeft = gridRect.left;
    const startX = firstRect.left - gridLeft;
    const endX = lastRect.left - gridLeft;
    // 화살을 그리드 시작점에서 끝점까지 이동
    arrow.style.left = `${startX - 50}px`;
    setTimeout(() => {
      arrow.style.left = `${endX + 10}px`;
    }, 10);
    setTimeout(() => {
      arrow.remove();
    }, 600);
  } else {
    // fallback: 오른쪽으로만 이동
    setTimeout(() => { arrow.style.left = '600px'; }, 10);
    setTimeout(() => { arrow.remove(); }, 600);
  }
  // 사운드 효과
  if (window.arrowShootAudio) {
    window.arrowShootAudio.currentTime = 0;
    window.arrowShootAudio.play();
  }
}

// 화살 이미지 존재 여부 체크(최초 1회)
(function checkArrowImage() {
  const img = new Image();
  img.onload = () => { window.arrowImageExists = true; };
  img.onerror = () => { window.arrowImageExists = false; };
  img.src = '../images/arrow.png';
})();
// 사운드 효과 준비(옵션)
(function checkArrowAudio() {
  try {
    const audio = new Audio('../images/arrow_shoot.mp3');
    audio.volume = 0.5;
    window.arrowShootAudio = audio;
  } catch (e) {}
})();

function playArcherAnimationAtRow(row) {
  const archer = document.querySelector('.archer-container');
  const archerImg = document.getElementById('archer-img');
  if (!archer || !archerImg) return;

  // 해당 행의 ▶ 버튼 위치 찾기
  const gridContainer = document.querySelector('.grid-container');
  const leftCell = gridContainer.querySelectorAll('.number-cell.row-header')[row - 1];
  const btn = leftCell.querySelector('button');
  if (!btn) return;

  // 버튼의 위치(상대좌표) 계산
  const gridRect = gridContainer.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  const offsetTop = btnRect.top - gridRect.top + (btnRect.height / 2) - (archer.offsetHeight / 2) + 10;

  // 궁수 위치 이동 및 표시
  archer.style.top = `${offsetTop}px`;
  archer.style.display = 'flex';
  archerImg.src = '../images/ar2.png';

  setTimeout(() => {
    archerImg.src = '../images/ar1.png';
  }, 1000);

  // 애니메이션 끝나면 궁수 숨김
  setTimeout(() => {
    archer.style.display = 'none';
  }, 1200);
}

function onLeftButtonClick(row) {
  playArcherAnimationAtRow(row);
  setTimeout(() => shootArrow(), 100);
  setTimeout(() => runArrowPath(row), 200);
} 