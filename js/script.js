// 당첨 번호를 저장할 변수
let 당첨번호 = [];

// 로또 당첨번호 데이터 배열
const 로또데이터 = [
    [2, 8, 19, 22, 32, 42],  // 1000회
    [6, 10, 12, 14, 20, 42], // 1001회
    [17, 25, 33, 35, 38, 45], // 1002회
    [1, 4, 29, 39, 43, 45],   // 1003회
    [7, 15, 30, 37, 39, 44],  // 1004회
    [8, 13, 18, 24, 27, 29],  // 1005회
    [8, 11, 15, 16, 17, 37],  // 1006회
    [8, 11, 16, 19, 21, 25],  // 1007회
    [9, 11, 30, 31, 41, 44],  // 1008회
    [15, 23, 29, 34, 40, 44], // 1009회
    [9, 12, 15, 25, 34, 36],  // 1010회
    [1, 9, 12, 26, 35, 38],   // 1011회
    [5, 11, 18, 20, 35, 45],  // 1012회
    [21, 22, 26, 34, 36, 41], // 1013회
    [3, 11, 14, 18, 26, 27]   // 1014회
];

// 로또 당첨번호 데이터 (1000회차부터 1167회차)
const 실제당첨번호 = {
    '1000': [2, 8, 19, 22, 32, 42],
    '1001': [6, 10, 12, 14, 20, 42],
    '1002': [17, 25, 33, 35, 38, 45],
    '1003': [1, 4, 29, 39, 43, 45],
    '1004': [7, 15, 30, 37, 39, 44],
    '1005': [8, 13, 18, 24, 27, 29],
    '1006': [8, 11, 15, 16, 17, 37],
    '1007': [8, 11, 16, 19, 21, 25],
    '1008': [9, 11, 30, 31, 41, 44],
    '1009': [15, 23, 29, 34, 40, 44],
    '1010': [9, 12, 15, 25, 34, 36],
    '1011': [1, 9, 12, 26, 35, 38],
    '1012': [5, 11, 18, 20, 35, 45],
    '1013': [21, 22, 26, 34, 36, 41],
    '1014': [3, 11, 14, 18, 26, 27],
    '1015': [14, 23, 31, 33, 37, 40],
    '1016': [15, 26, 28, 34, 41, 42],
    '1017': [12, 18, 22, 23, 30, 34],
    '1018': [8, 14, 17, 27, 36, 45],
    '1019': [1, 4, 13, 17, 34, 39],
    '1020': [12, 27, 29, 38, 41, 45],
    '1021': [12, 15, 17, 24, 29, 45],
    '1022': [5, 6, 11, 29, 42, 45],
    '1023': [10, 14, 16, 18, 29, 35],
    '1024': [9, 18, 20, 22, 38, 44],
    '1025': [8, 9, 20, 25, 29, 33],
    '1026': [5, 12, 13, 31, 32, 41],
    '1027': [14, 16, 27, 35, 39, 45],
    '1028': [5, 7, 12, 13, 18, 35],
    '1029': [12, 30, 32, 37, 39, 41],
    '1030': [2, 5, 11, 17, 24, 29],
    '1031': [6, 7, 22, 32, 35, 36],
    '1032': [1, 6, 12, 19, 36, 42],
    '1033': [3, 11, 15, 20, 35, 44],
    '1034': [26, 31, 32, 33, 38, 40],
    '1035': [9, 14, 34, 35, 41, 42],
    '1036': [2, 5, 22, 32, 34, 45],
    '1037': [2, 14, 15, 22, 27, 33],
    '1038': [7, 16, 24, 27, 37, 44],
    '1039': [2, 3, 6, 19, 36, 39],
    '1040': [8, 16, 26, 29, 31, 36],
    '1041': [6, 7, 9, 11, 17, 18],
    '1042': [5, 14, 15, 23, 34, 43],
    '1043': [3, 5, 12, 22, 26, 31],
    '1044': [7, 9, 22, 27, 37, 42]
    // ... 나머지 회차는 유지
};

// 턴 관련 변수들
let 현재턴 = parseInt(localStorage.getItem('현재턴')) || 1;
const 총턴수 = 30;  // 30턴으로 변경
const 체크포인트턴 = 10; // 10턴마다 체크포인트

// 턴 정보 설정
function get턴정보() {
    const 시작회차 = 1000 + (현재턴 - 1);  // 1턴은 1000회차, 2턴은 1001회차부터 시작
    const 종료회차 = 시작회차 + 14;  // 15회차를 보여주므로 시작회차 + 14
    const 예측회차 = 종료회차 + 1;  // 예측은 종료회차 다음 회차
    
    console.log(`현재 턴: ${현재턴}`);
    console.log(`시작회차: ${시작회차}, 종료회차: ${종료회차}, 예측회차: ${예측회차}`);
    
    return {
        시작회차: 시작회차,
        종료회차: 종료회차,
        예측회차: 예측회차
    };
}

// 연결선 표시 상태
let currentConnectionType = null;

// 힌트 활성화 상태 변수들
let 힌트1활성화 = false;
let 힌트2활성화 = false;
let 힌트3활성화 = false;
let 힌트4활성화 = false;
let 힌트5활성화 = false;
let 힌트6활성화 = false;

// 연결선 표시 함수들
function showHorizontalConnections() {
    if (힌트1활성화) {
        clearConnections();
        힌트1활성화 = false;
        return;
    }

    clearConnections();
    힌트1활성화 = true;
    
    const 격자 = document.querySelector('.grid-container');
    const 격자Rect = 격자.getBoundingClientRect();
    const 모든당첨셀 = document.querySelectorAll('.grid-cell.marked');
    const 셀배열 = Array.from(모든당첨셀);
    
    셀배열.forEach((셀1, 인덱스) => {
        셀배열.slice(인덱스 + 1).forEach(셀2 => {
            const 셀1Rect = 셀1.getBoundingClientRect();
            const 셀2Rect = 셀2.getBoundingClientRect();
            
            const x1 = 셀1Rect.left - 격자Rect.left;
            const y1 = 셀1Rect.top - 격자Rect.top;
            const x2 = 셀2Rect.left - 격자Rect.left;
            const y2 = 셀2Rect.top - 격자Rect.top;
            
            // 격자 위치 차이 계산
            const col1 = Math.floor(x1 / (셀1Rect.width + 2));
            const col2 = Math.floor(x2 / (셀2Rect.width + 2));
            const rowDiff = Math.abs(
                Math.floor(y1 / (셀1Rect.height + 2)) - 
                Math.floor(y2 / (셀2Rect.height + 2))
            );
            
            // 인접한 셀들만 연결 (가로로 한 칸 차이)
            if (Math.abs(col2 - col1) === 1 && rowDiff === 0) {
                const 거리 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const 각도 = Math.atan2(y2 - y1, x2 - x1);
                
                // 연결선 생성
                const 연결선 = document.createElement('div');
                연결선.className = 'connection-line';
                연결선.style.cssText = `
                    width: ${거리}px;
                    height: 6px;
                    position: absolute;
                    left: ${x1 + 셀1Rect.width/2}px;
                    top: ${y1 + 셀1Rect.height/2 - 3}px;
                    transform-origin: left center;
                    transform: rotate(${각도}rad);
                    z-index: 3;
                `;
                격자.appendChild(연결선);

                // 점 컨테이너 생성
                const 점컨테이너 = document.createElement('div');
                점컨테이너.className = 'dot-container';
                점컨테이너.style.cssText = `
                    width: ${거리}px;
                    height: 6px;
                    position: absolute;
                    left: ${x1 + 셀1Rect.width/2}px;
                    top: ${y1 + 셀1Rect.height/2 - 3}px;
                    transform-origin: left center;
                    transform: rotate(${각도}rad);
                    z-index: 5;
                `;

                // 움직이는 점들 생성 (3개로 증가)
                for (let i = 0; i < 3; i++) {
                    const 점 = document.createElement('div');
                    점.className = 'moving-dot';
                    점.style.animationDelay = `${i * 1.0}s`;  // 간격 조정
                    점컨테이너.appendChild(점);
                }

                격자.appendChild(점컨테이너);
            }
        });
    });
}

function showVerticalConnections() {
    clearConnections();
    currentConnectionType = 'vertical';
    showConnections();
}

function showDiagonalConnections() {
    clearConnections();
    currentConnectionType = 'diagonal';
    showConnections();
}

function clearConnections() {
    document.querySelectorAll('.connection-line, .dot-container, .angle-connection, .gradient-circle').forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
}

function showConnections() {
    const markedCells = document.querySelectorAll('.grid-cell.marked');
    const cellPositions = Array.from(markedCells).map(cell => {
        const rect = cell.getBoundingClientRect();
        const gridRect = document.querySelector('.grid-container').getBoundingClientRect();
        return {
            cell,
            x: rect.left - gridRect.left + rect.width / 2,
            y: rect.top - gridRect.top + rect.height / 2
        };
    });

    for (let i = 0; i < cellPositions.length - 1; i++) {
        const start = cellPositions[i];
        const end = cellPositions[i + 1];
        
        if (shouldConnect(start, end)) {
            drawLine(start, end);
        }
    }
}

function shouldConnect(start, end) {
    const startRow = parseInt(start.cell.dataset.row);
    const startCol = parseInt(start.cell.dataset.col);
    const endRow = parseInt(end.cell.dataset.row);
    const endCol = parseInt(end.cell.dataset.col);

    switch (currentConnectionType) {
        case 'horizontal':
            return startRow === endRow;
        case 'vertical':
            return startCol === endCol;
        case 'diagonal':
            return Math.abs(endRow - startRow) === Math.abs(endCol - startCol);
        default:
            return false;
    }
}

function drawLine(start, end) {
    const line = document.createElement('div');
    line.className = 'connection-line';
    
    const length = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    
    line.style.width = `${length}px`;
    line.style.left = `${start.x}px`;
    line.style.top = `${start.y}px`;
    line.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
    
    document.querySelector('.grid-container').appendChild(line);
}

// 모바일 터치 이벤트 처리
function initTouchEvents() {
    const gridContainer = document.querySelector('.grid-container');
    let touchStartX = 0;
    let touchStartY = 0;
    let scrolling = false;

    gridContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        scrolling = false;
    });

    gridContainer.addEventListener('touchmove', (e) => {
        if (scrolling) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = Math.abs(touchX - touchStartX);
        const deltaY = Math.abs(touchY - touchStartY);

        if (deltaX > 5 || deltaY > 5) {
            scrolling = true;
        }
    });

    gridContainer.addEventListener('touchend', (e) => {
        if (!scrolling) {
            const touch = e.changedTouches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (element && element.classList.contains('prediction-button')) {
                element.click();
            }
        }
    });
}

// 페이지 로드 시 패턴 분석 실행
window.onload = 패턴분석;

// 게임 초기화
function 게임초기화() {
    // localStorage에서 현재턴 가져오기
    현재턴 = parseInt(localStorage.getItem('현재턴')) || 1;
    console.log('게임 초기화 - 현재턴:', 현재턴);
    
    선택된번호들 = [];
    입력값초기화();
    격자초기화();
    턴표시업데이트();
}

// 로또 번호 생성
function 로또번호생성() {
    const 번호목록 = [];
    while (번호목록.length < 6) {
        const 번호 = Math.floor(Math.random() * 45) + 1;
        if (!번호목록.includes(번호)) {
            번호목록.push(번호);
        }
    }
    return 번호목록.sort((a, b) => a - b);
}

// 입력 필드 초기화
function 입력값초기화() {
    const 입력필드들 = document.querySelectorAll('.number-input input');
    입력필드들.forEach(입력필드 => {
        입력필드.value = '';
        입력필드.style.borderColor = '#ddd';
    });
}

// 자동 번호 생성
function 자동생성() {
    const 번호목록 = 로또번호생성();
    const 입력필드들 = document.querySelectorAll('.number-input input');
    입력필드들.forEach((입력필드, 인덱스) => {
        입력필드.value = 번호목록[인덱스];
    });
}

// 번호 확인
function 번호확인() {
    const 입력필드들 = document.querySelectorAll('.number-input input');
    const 사용자번호 = [];
    let 유효성검사 = true;

    // 입력값 검증
    입력필드들.forEach(입력필드 => {
        const 번호 = parseInt(입력필드.value);
        if (isNaN(번호) || 번호 < 1 || 번호 > 45) {
            입력필드.style.borderColor = 'red';
            유효성검사 = false;
        } else if (사용자번호.includes(번호)) {
            입력필드.style.borderColor = 'red';
            유효성검사 = false;
        } else {
            입력필드.style.borderColor = '#ddd';
            사용자번호.push(번호);
        }
    });

    if (!유효성검사 || 사용자번호.length !== 6) {
        alert('1부터 45까지의 중복되지 않는 번호를 입력해주세요.');
        return;
    }

    // 결과 표시
    결과표시(사용자번호.sort((a, b) => a - b));
}

// 결과 표시
function 결과표시(사용자번호) {
    const 맞은개수 = 사용자번호.filter(번호 => 당첨번호.includes(번호)).length;
    const 점수 = 계산점수(맞은개수);
    
    // 팝업 생성
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    
    // 선택한 번호들 표시
    const numbersDisplay = document.createElement('div');
    numbersDisplay.className = 'number-display';
    numbersDisplay.innerHTML = `
        <div class="selected-numbers">
            ${사용자번호.map(번호 => `
                <div class="number-ball ${당첨번호.includes(번호) ? 'correct' : 'user'}">${번호}</div>
            `).join('')}
        </div>
    `;
    
    // 점수 텍스트
    const scoreText = document.createElement('div');
    scoreText.className = 'score-text';
    scoreText.innerHTML = `맞은 개수: ${맞은개수}개 / 점수: ${점수}점`;
    
    // 동물 이미지와 말풍선
    const animalContainer = document.createElement('div');
    animalContainer.className = 'animal-container';
    
    const animal = document.createElement('img');
    animal.className = 'animal-image bounce-in';
    animal.src = getAnimalImage(맞은개수);
    animal.alt = '동물 캐릭터';
    
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble fade-in';
    speechBubble.textContent = getAnimalMessage(맞은개수);
    
    animalContainer.appendChild(animal);
    animalContainer.appendChild(speechBubble);
    
    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '닫기';
    closeButton.onclick = closeScorePopup;
    
    // 팝업에 요소들 추가
    popup.appendChild(numbersDisplay);
    popup.appendChild(scoreText);
    popup.appendChild(animalContainer);
    popup.appendChild(closeButton);
    
    // 기존 팝업 제거 후 새 팝업 추가
    const existingPopup = document.querySelector('.score-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    document.body.appendChild(popup);
    
    // 턴 업데이트
    현재턴++;
    턴표시업데이트();
}

function getAnimalImage(맞은개수) {
    if (맞은개수 >= 5) return 'images/happy_animal.png';
    if (맞은개수 >= 3) return 'images/normal_animal.png';
    return 'images/sad_animal.png';
}

function getAnimalMessage(맞은개수) {
    if (맞은개수 >= 5) return '대단해요! 축하드립니다! 🎉';
    if (맞은개수 >= 3) return '좋은 성적이네요! 👍';
    return '다음에는 더 잘할 수 있을 거예요! 💪';
}

function closeScorePopup() {
    const popup = document.querySelector('.score-popup');
    if (popup) {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }
}

function 계산점수(맞은개수) {
    switch (맞은개수) {
        case 6: return 1000;
        case 5: return 500;
        case 4: return 300;
        case 3: return 200;
        case 2: return 100;
        default: return 0;
    }
}

// 게임 리셋
function 게임리셋() {
    게임초기화();
}

// 격자 초기화 (턴에 따라 다른 회차 표시)
function 격자초기화() {
    const gridContainer = document.querySelector('.grid-container');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    // 셀 크기와 원 크기를 30% 감소
    const 셀크기 = 21;
    const 원크기 = 17;
    const 폰트크기 = 7;  // 폰트 크기도 조정
    
    // 그리드 컨테이너 스타일 설정
    gridContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(16, ${셀크기}px);
        grid-auto-rows: ${셀크기}px;
        column-gap: 0;
        row-gap: 1px;
        margin: 14px auto;
        justify-content: center;
        width: fit-content;
        height: fit-content;
        padding: 7px;
        position: relative;
        overflow: visible;
    `;

    const 턴정보 = get턴정보();
    console.log('현재 턴 정보:', 턴정보);

    // 턴 표시 업데이트
    턴표시업데이트();

    // 헤더 행 추가 (회차 번호)
    for (let i = 0; i < 16; i++) {
        const header = document.createElement('div');
        header.className = 'grid-cell header';
        if (i < 15) {
            const 회차번호 = 턴정보.시작회차 + i;
            header.textContent = 회차번호;
            header.style.cssText = `
                height: ${셀크기}px;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(-45deg);
                font-size: 8px;
                font-weight: bold;
                white-space: nowrap;
                padding: 0;
                color: #333;
            `;
        } else {
            header.textContent = '예상';
            header.style.cssText = `
                border-left: 1px solid #3498db;
                background-color: #f8f9fa;
                font-weight: bold;
                color: #3498db;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                height: ${셀크기}px;
                width: ${셀크기}px;
                padding: 0;
                margin: 0;
                white-space: nowrap;
                overflow: visible;
                position: relative;
                z-index: 2;
                font-size: 8px;
            `;
        }
        gridContainer.appendChild(header);
    }

    // 1-45까지의 번호에 대한 그리드 셀 생성
    for (let num = 1; num <= 45; num++) {
        for (let col = 0; col < 16; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.setAttribute('data-number', num);
            cell.setAttribute('data-row', num);
            cell.setAttribute('data-col', col);
            
            if (col === 15) {
                // 예상 열
                cell.textContent = num;
                cell.classList.add('prediction-cell');
                cell.style.cssText = `
                    border-left: 1px solid #3498db;
                    background-color: #f8f9fa;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    height: ${셀크기}px;
                    width: ${셀크기}px;
                    line-height: ${셀크기}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    position: relative;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                    border-radius: 3px;
                    margin: 0;
                    padding: 0;
                    z-index: 3;
                    font-size: 8px;
                `;
                
                if (선택된번호들.includes(num)) {
                    cell.classList.add('selected');
                    cell.style.backgroundColor = '#3498db';
                    cell.style.color = '#fff';
                }
                
                cell.addEventListener('click', () => 셀클릭(cell));
            } else {
                cell.style.cssText = `
                    height: ${셀크기}px;
                    width: ${셀크기}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                    padding: 0;
                    font-size: ${폰트크기}px;
                    position: relative;
                `;
                
                const 현재회차 = 턴정보.시작회차 + col;
                const 해당회차번호들 = 실제당첨번호[현재회차];
                
                if (해당회차번호들 && 해당회차번호들.includes(num)) {
                    cell.classList.add('marked');
                    const circle = document.createElement('div');
                    circle.className = 'number-circle';
                    circle.textContent = num;
                    
                    // 원 스타일을 명시적으로 설정
                    circle.style.cssText = `
                        width: ${원크기}px;
                        height: ${원크기}px;
                        border: 1px solid #e74c3c;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${폰트크기}px;
                        color: #e74c3c;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 1;
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        background: transparent;
                    `;
                    cell.appendChild(circle);
                }
            }
            
            gridContainer.appendChild(cell);
        }
    }
    
    console.log('격자 초기화 완료, 현재턴:', 현재턴);
}

// 선택된 번호를 저장할 변수
// let 선택된번호들 = [];

function 셀클릭(cell) {
    if (!cell.classList.contains('prediction-cell')) return;
    
    const 번호 = parseInt(cell.getAttribute('data-number'));
    if (isNaN(번호)) return;

    console.log('셀클릭 - 현재 선택된 번호들:', 선택된번호들);

    if (cell.classList.contains('selected')) {
        // 선택 해제
        cell.classList.remove('selected');
        cell.style.backgroundColor = '#f8f9fa';
        cell.style.color = '#000';
        선택된번호들 = 선택된번호들.filter(n => n !== 번호);
        console.log('번호 선택 해제:', 번호);
        console.log('남은 선택된 번호들:', 선택된번호들);
    } else {
        // 새로운 번호 선택
        if (선택된번호들.length >= 8) {
            alert('최대 8개의 번호만 선택할 수 있습니다.');
            return;
        }
        cell.classList.add('selected');
        cell.style.backgroundColor = '#3498db';
        cell.style.color = '#fff';
        선택된번호들.push(번호);
        console.log('번호 선택:', 번호);
        console.log('현재 선택된 번호들:', 선택된번호들);
        
        // 8개가 선택되면 자동으로 턴완료 실행
        if (선택된번호들.length === 8) {
            console.log('8개 선택 완료, 턴완료 실행');
            턴완료();
        }
    }
}

// 점수 계산 함수
function 점수계산(맞춘개수) {
    // 8개 중에서 맞춘 개수에 따른 점수 계산
    switch(맞춘개수) {
        case 6: return 10;  // 6개 모두 맞춤
        case 5: return 8;   // 5개 맞춤
        case 4: return 6;   // 4개 맞춤
        case 3: return 4;   // 3개 맞춤
        case 2: return 2;   // 2개 맞춤
        case 1: return 1;   // 1개 맞춤
        default: return 0;  // 0개 맞춤
    }
}

// 동물 이미지 배열 추가
// const 동물이미지들 = ['fa1.png', 'fa2.png', 'fa3.png'];

// 턴완료 함수 수정
function 턴완료() {
    console.log('턴완료 함수 실행 시작');
    
    if (선택된번호들.length !== 8) {
        alert('8개의 번호를 선택해주세요.');
        return;
    }

    // 현재 턴의 회차 정보 가져오기
    const 턴정보 = get턴정보();
    console.log('현재 선택된 번호들:', 선택된번호들);
    console.log('턴정보:', 턴정보);

    // 예측 회차의 당첨번호 가져오기 (종료회차 + 1)
    const 예측회차 = 턴정보.예측회차;
    const 당첨번호 = 실제당첨번호[예측회차.toString()];
    console.log(`예측 회차(${예측회차})의 당첨번호:`, 당첨번호);

    if (!당첨번호) {
        console.error(`${예측회차} 회차의 당첨번호를 찾을 수 없습니다.`);
        return;
    }

    // 선택된 번호들 중에서 당첨번호와 일치하는 것을 찾음
    const 맞은번호들 = 선택된번호들.filter(번호 => 당첨번호.includes(번호));
    const 맞은개수 = 맞은번호들.length;

    console.log('체점 결과:');
    console.log('맞은 번호들:', 맞은번호들);
    console.log('맞은 개수:', 맞은개수);

    // 점수 계산
    const 획득점수 = 점수계산(맞은개수);

    // 현재 체크포인트 계산 (1-3)
    const 체크포인트 = Math.ceil(현재턴 / 10);
    
    // 현재 체크포인트의 시작 턴
    const 시작턴 = (체크포인트 - 1) * 10 + 1;
    
    // 턴 결과 저장
    const 턴결과 = {
        선택번호들: 선택된번호들,
        맞은번호들: 맞은번호들,
        맞은개수: 맞은개수,
        점수: 획득점수,
        회차: 예측회차,
        당첨번호: 당첨번호
    };
    
    // localStorage에 턴 결과 저장
    localStorage.setItem(`turn${현재턴}_result`, JSON.stringify(턴결과));
    localStorage.setItem(`turn${현재턴}_score`, 획득점수.toString());
    
    // 체크포인트 정보 저장
    localStorage.setItem('current_checkpoint', 체크포인트.toString());
    localStorage.setItem('checkpoint_start_turn', 시작턴.toString());

    // 결과 표시
    showScorePopup(
        선택된번호들,
        맞은번호들,
        맞은개수,
        획득점수,
        {
            회차: 예측회차,
            당첨번호: 당첨번호,
            맞은번호: 맞은번호들
        }
    );
}

function showScorePopup(selectedNumbers, matchedNumbers, matchCount, score, roundInfo) {
    // 기존 팝업이 있다면 제거
    const existingPopup = document.querySelector('.score-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // 새로운 팝업 요소 생성
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    
    // 결과 컨테이너 생성
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    
    // 점수 텍스트 추가
    const scoreText = document.createElement('div');
    scoreText.className = 'score-text';
    scoreText.innerHTML = `맞춘 개수: <span class="match-count">${matchCount}</span>개 
                          &nbsp;&nbsp;/&nbsp;&nbsp; 
                          획득 점수: <span class="score-value">${score}</span>점`;
    resultContainer.appendChild(scoreText);
    
    // 번호 컨테이너 생성
    const numbersColumn = document.createElement('div');
    numbersColumn.className = 'numbers-column';
    
    // 번호 볼 추가 (OK/NO 이미지 포함)
    selectedNumbers.sort((a, b) => a - b).forEach((num, index) => {
        const ball = document.createElement('div');
        ball.className = 'number-ball';
        ball.style.display = 'flex';
        ball.style.flexDirection = 'column';
        ball.style.alignItems = 'center';
        ball.style.justifyContent = 'center';
        ball.style.position = 'relative';

        // 번호를 span으로 추가 (항상 보이게, 원 중앙)
        const numSpan = document.createElement('span');
        numSpan.textContent = num;
        numSpan.style.fontWeight = 'bold';
        numSpan.style.fontSize = '1.1em';
        numSpan.style.position = 'absolute';
        numSpan.style.top = '50%';
        numSpan.style.left = '50%';
        numSpan.style.transform = 'translate(-50%, -50%)';
        numSpan.style.pointerEvents = 'none';
        numSpan.style.color = matchedNumbers.includes(num) ? '#e74c3c' : '#1976D2';
        ball.appendChild(numSpan);

        // 이미지 추가 (20% 줄여서 40px)
        const img = document.createElement('img');
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.display = 'block';
        img.style.margin = '2px auto 0 auto';
        if (matchedNumbers.includes(num)) {
            img.src = '../images/ok.png';
            img.alt = '맞춤';
        } else {
            img.src = '../images/no.png';
            img.alt = '틀림';
        }
        ball.appendChild(img);

        ball.style.animationDelay = `${index * 0.1}s`;
        numbersColumn.appendChild(ball);
    });
    resultContainer.appendChild(numbersColumn);
    
    // 동물 컨테이너 생성
    const animalContainer = document.createElement('div');
    animalContainer.className = 'animal-container';
    
    // 동물 이미지 추가
    const animalImage = document.createElement('img');
    animalImage.className = 'animal-image';
    animalImage.src = `../images/${getRandomImage(matchCount)}`;
    animalImage.alt = '캐릭터';
    
    // 말풍선 추가
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble';
    speechBubble.textContent = matchCount <= 2 ? 
        '다시 한번 도전해보세요!' :
        '잘했어요! 다음 턴으로 갈까요?';
    
    animalContainer.appendChild(animalImage);
    animalContainer.appendChild(speechBubble);
    
    // 닫기 버튼 추가
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = matchCount <= 2 ? '다시 도전하기' : '다음 턴으로';
    
    // 버튼 클릭 이벤트 수정
    closeButton.onclick = () => {
        if (matchCount > 2) {
            // 팝업 닫기
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.remove();
                
                // 20턴이나 30턴인 경우 체크포인트 정보 저장 후 페이지3으로 이동
                if (현재턴 === 20 || 현재턴 === 30) {
                    const 체크포인트 = Math.ceil(현재턴 / 10);  // 20턴은 2, 30턴은 3
                    const 시작턴 = (체크포인트 - 1) * 10 + 1;  // 체크포인트에 따른 시작턴
                    
                    // 체크포인트 정보 저장
                    localStorage.setItem('current_checkpoint', 체크포인트.toString());
                    localStorage.setItem('checkpoint_start_turn', 시작턴.toString());
                    
                    // 현재 턴의 점수 저장
                    localStorage.setItem(`turn${현재턴}_score`, score.toString());
                    
                    console.log('체크포인트 도달. 페이지3으로 이동:', {
                        체크포인트: 체크포인트,
                        시작턴: 시작턴,
                        현재턴: 현재턴,
                        점수: score
                    });
                    
                    window.location.href = '../pages/page3.html';
                } else {
                    // 다른 턴의 경우 기존 로직 유지
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const 다음턴버튼 = buttons.find(button => button.textContent.includes('다음턴'));
                    
                    if (다음턴버튼) {
                        console.log('다음턴 버튼 찾음:', 다음턴버튼);
                        다음턴버튼.click();
                    } else {
                        console.log('다음턴 버튼을 찾지 못했습니다. 직접 다음턴 함수 호출');
                        다음턴();
                    }
                }
            }, 300);
        } else {
            // 2개 이하 맞춘 경우는 기존대로 동작
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.remove();
                선택된번호들 = [];
                격자초기화();
            }, 300);
        }
    };
    
    // 모든 요소를 팝업에 추가
    popup.appendChild(resultContainer);
    popup.appendChild(animalContainer);
    popup.appendChild(closeButton);
    
    // 팝업을 페이지에 추가
    document.body.appendChild(popup);

    // 턴 점수 박스에 점수 표시
    const scoreBox = document.getElementById('turn-score-value');
    if (scoreBox) scoreBox.textContent = score;
}

function getRandomImage(matchCount) {
    if (matchCount <= 2) {
        // fa 시리즈 중 랜덤 선택 (2개 이하 맞췄을 때)
        const faIndex = Math.floor(Math.random() * 3) + 1;
        return `fa${faIndex}.png`;
    } else {
        // su 시리즈 중 랜덤 선택 (3개 이상 맞췄을 때)
        const suIndex = Math.floor(Math.random() * 4) + 1;
        return `su${suIndex}.png`;
    }
}

function closeScorePopup() {
    const popup = document.querySelector('.score-popup');
    if (popup) {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드됨');
    
    // localStorage에서 현재턴 가져오기
    현재턴 = parseInt(localStorage.getItem('현재턴')) || 1;
    console.log('시작 턴:', 현재턴);
    
    초기화();
    턴표시업데이트();
    격자초기화();
    initTouchEvents();
});

function 초기화() {
    선택된번호들 = [];
    격자초기화();
    document.querySelectorAll('.prediction-cell').forEach(cell => {
        cell.classList.remove('selected');
        cell.style.backgroundColor = '#f8f9fa';
        cell.style.color = '#000';
    });
}

function 결과화면표시() {
    // 기존 화면 숨기기
    document.querySelector('.grid-container').style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
    document.querySelector('.heatmap-container').style.display = 'none';
    
    // 결과 화면 컨테이너 생성
    const 결과컨테이너 = document.createElement('div');
    결과컨테이너.className = 'result-container';
    
    // 총점 계산
    const 총점 = 턴점수들.reduce((a, b) => a + b, 0);
    
    // 결과 화면 HTML 생성
    결과컨테이너.innerHTML = `
        <h2>게임 결과</h2>
        <div class="total-score">총점: ${총점}점</div>
        <div class="turn-scores">
            ${턴점수들.map((점수, 인덱스) => `
                <div class="turn-score">
                    ${인덱스 + 1}턴: ${점수}점
                </div>
            `).join('')}
        </div>
        <button onclick="location.reload()" class="restart-button">다음판으로</button>
    `;
    
    document.body.appendChild(결과컨테이너);
}

// 턴 이동 함수들
function 이전턴() {
    if (현재턴 > 1) {
        현재턴--;
        초기화();
        업데이트턴표시();
    }
}

function 다음턴() {
    if (현재턴 >= 총턴수) {
        alert('마지막 턴입니다!');
        return;
    }
    
    // 현재 턴이 체크포인트 턴인지 확인
    if (현재턴 === 체크포인트턴) {
        console.log('체크포인트 턴 도달. 페이지3으로 이동합니다.');
        window.location.href = '../pages/page3.html';
        return;
    }
    
    현재턴++;
    console.log(`다음 턴으로 이동: ${현재턴}턴`);
    
    // 턴 정보 업데이트
    const 턴정보 = get턴정보();
    console.log('새로운 턴 정보:', 턴정보);
    
    // 화면 초기화 및 업데이트
    입력값초기화();
    격자초기화();
    턴표시업데이트();
    
    // localStorage에 현재 턴 저장
    localStorage.setItem('현재턴', 현재턴.toString());
}

function 턴표시업데이트() {
    const 턴정보 = get턴정보();
    const 턴표시엘리먼트 = document.querySelector('.turn-display');
    if (턴표시엘리먼트) {
        턴표시엘리먼트.innerHTML = `
            <div>${현재턴}턴</div>
            <div>${턴정보.시작회차}-${턴정보.종료회차}</div>
        `;
    }
    updateTurnScoreBox();
}

// 패턴 분석
function 패턴분석() {
    격자초기화();
}

// 힌트1: 가까운 번호 연결
function 힌트1() {
    // 다른 힌트들 비활성화
    힌트2활성화 = false;
    힌트3활성화 = false;
    힌트4활성화 = false;
    힌트5활성화 = false;
    힌트6활성화 = false;
    
    // 기존 연결선들 제거
    clearConnections();
    clearScoreDisplay();
    
    if (힌트1활성화) {
        clearConnections();
        힌트1활성화 = false;
        return;
    }

    힌트1활성화 = true;
    
    const 격자 = document.querySelector('.grid-container');
    const 격자Rect = 격자.getBoundingClientRect();
    const 모든당첨셀 = document.querySelectorAll('.grid-cell.marked');
    const 셀배열 = Array.from(모든당첨셀);
    
    셀배열.forEach((셀1, 인덱스) => {
        셀배열.slice(인덱스 + 1).forEach(셀2 => {
            const 셀1Rect = 셀1.getBoundingClientRect();
            const 셀2Rect = 셀2.getBoundingClientRect();
            
            const x1 = 셀1Rect.left - 격자Rect.left;
            const y1 = 셀1Rect.top - 격자Rect.top;
            const x2 = 셀2Rect.left - 격자Rect.left;
            const y2 = 셀2Rect.top - 격자Rect.top;
            
            // 격자 위치 차이 계산
            const col1 = Math.floor(x1 / (셀1Rect.width + 2));
            const col2 = Math.floor(x2 / (셀2Rect.width + 2));
            const rowDiff = Math.abs(
                Math.floor(y1 / (셀1Rect.height + 2)) - 
                Math.floor(y2 / (셀2Rect.height + 2))
            );
            
            // 인접한 셀들만 연결 (가로로 한 칸 차이)
            if (Math.abs(col2 - col1) === 1 && rowDiff === 0) {
                const 거리 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const 각도 = Math.atan2(y2 - y1, x2 - x1);
                
                // 연결선 생성
                const 연결선 = document.createElement('div');
                연결선.className = 'connection-line';
                연결선.style.cssText = `
                    width: ${거리}px;
                    height: 6px;
                    position: absolute;
                    left: ${x1 + 셀1Rect.width/2}px;
                    top: ${y1 + 셀1Rect.height/2 - 3}px;
                    transform-origin: left center;
                    transform: rotate(${각도}rad);
                    z-index: 3;
                `;
                격자.appendChild(연결선);

                // 점 컨테이너 생성
                const 점컨테이너 = document.createElement('div');
                점컨테이너.className = 'dot-container';
                점컨테이너.style.cssText = `
                    width: ${거리}px;
                    height: 6px;
                    position: absolute;
                    left: ${x1 + 셀1Rect.width/2}px;
                    top: ${y1 + 셀1Rect.height/2 - 3}px;
                    transform-origin: left center;
                    transform: rotate(${각도}rad);
                    z-index: 5;
                `;

                // 움직이는 점들 생성 (3개로 증가)
                for (let i = 0; i < 3; i++) {
                    const 점 = document.createElement('div');
                    점.className = 'moving-dot';
                    점.style.animationDelay = `${i * 1.0}s`;  // 간격 조정
                    점컨테이너.appendChild(점);
                }

                격자.appendChild(점컨테이너);
            }
        });
    });
}

function showVerticalConnections() {
    clearConnections();
    currentConnectionType = 'vertical';
    showConnections();
}

function showDiagonalConnections() {
    clearConnections();
    currentConnectionType = 'diagonal';
    showConnections();
}

function clearConnections() {
    document.querySelectorAll('.connection-line, .dot-container, .angle-connection, .gradient-circle').forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
}

function showConnections() {
    const markedCells = document.querySelectorAll('.grid-cell.marked');
    const cellPositions = Array.from(markedCells).map(cell => {
        const rect = cell.getBoundingClientRect();
        const gridRect = document.querySelector('.grid-container').getBoundingClientRect();
        return {
            cell,
            x: rect.left - gridRect.left + rect.width / 2,
            y: rect.top - gridRect.top + rect.height / 2
        };
    });

    for (let i = 0; i < cellPositions.length - 1; i++) {
        const start = cellPositions[i];
        const end = cellPositions[i + 1];
        
        if (shouldConnect(start, end)) {
            drawLine(start, end);
        }
    }
}

function shouldConnect(start, end) {
    const startRow = parseInt(start.cell.dataset.row);
    const startCol = parseInt(start.cell.dataset.col);
    const endRow = parseInt(end.cell.dataset.row);
    const endCol = parseInt(end.cell.dataset.col);

    switch (currentConnectionType) {
        case 'horizontal':
            return startRow === endRow;
        case 'vertical':
            return startCol === endCol;
        case 'diagonal':
            return Math.abs(endRow - startRow) === Math.abs(endCol - startCol);
        default:
            return false;
    }
}

function drawLine(start, end) {
    const line = document.createElement('div');
    line.className = 'connection-line';
    
    const length = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    
    line.style.width = `${length}px`;
    line.style.left = `${start.x}px`;
    line.style.top = `${start.y}px`;
    line.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
    
    document.querySelector('.grid-container').appendChild(line);
}

// 모바일 터치 이벤트 처리
function initTouchEvents() {
    const gridContainer = document.querySelector('.grid-container');
    let touchStartX = 0;
    let touchStartY = 0;
    let scrolling = false;

    gridContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        scrolling = false;
    });

    gridContainer.addEventListener('touchmove', (e) => {
        if (scrolling) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = Math.abs(touchX - touchStartX);
        const deltaY = Math.abs(touchY - touchStartY);

        if (deltaX > 5 || deltaY > 5) {
            scrolling = true;
        }
    });

    gridContainer.addEventListener('touchend', (e) => {
        if (!scrolling) {
            const touch = e.changedTouches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (element && element.classList.contains('prediction-button')) {
                element.click();
            }
        }
    });
}

// 페이지 로드 시 패턴 분석 실행
window.onload = 패턴분석;

// 게임 초기화
function 게임초기화() {
    // localStorage에서 현재턴 가져오기
    현재턴 = parseInt(localStorage.getItem('현재턴')) || 1;
    console.log('게임 초기화 - 현재턴:', 현재턴);
    
    선택된번호들 = [];
    입력값초기화();
    격자초기화();
    턴표시업데이트();
}

// 로또 번호 생성
function 로또번호생성() {
    const 번호목록 = [];
    while (번호목록.length < 6) {
        const 번호 = Math.floor(Math.random() * 45) + 1;
        if (!번호목록.includes(번호)) {
            번호목록.push(번호);
        }
    }
    return 번호목록.sort((a, b) => a - b);
}

// 입력 필드 초기화
function 입력값초기화() {
    const 입력필드들 = document.querySelectorAll('.number-input input');
    입력필드들.forEach(입력필드 => {
        입력필드.value = '';
        입력필드.style.borderColor = '#ddd';
    });
}

// 자동 번호 생성
function 자동생성() {
    const 번호목록 = 로또번호생성();
    const 입력필드들 = document.querySelectorAll('.number-input input');
    입력필드들.forEach((입력필드, 인덱스) => {
        입력필드.value = 번호목록[인덱스];
    });
}

// 번호 확인
function 번호확인() {
    const 입력필드들 = document.querySelectorAll('.number-input input');
    const 사용자번호 = [];
    let 유효성검사 = true;

    // 입력값 검증
    입력필드들.forEach(입력필드 => {
        const 번호 = parseInt(입력필드.value);
        if (isNaN(번호) || 번호 < 1 || 번호 > 45) {
            입력필드.style.borderColor = 'red';
            유효성검사 = false;
        } else if (사용자번호.includes(번호)) {
            입력필드.style.borderColor = 'red';
            유효성검사 = false;
        } else {
            입력필드.style.borderColor = '#ddd';
            사용자번호.push(번호);
        }
    });

    if (!유효성검사 || 사용자번호.length !== 6) {
        alert('1부터 45까지의 중복되지 않는 번호를 입력해주세요.');
        return;
    }

    // 결과 표시
    결과표시(사용자번호.sort((a, b) => a - b));
}

// 결과 표시
function 결과표시(사용자번호) {
    const 맞은개수 = 사용자번호.filter(번호 => 당첨번호.includes(번호)).length;
    const 점수 = 계산점수(맞은개수);
    
    // 팝업 생성
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    
    // 선택한 번호들 표시
    const numbersDisplay = document.createElement('div');
    numbersDisplay.className = 'number-display';
    numbersDisplay.innerHTML = `
        <div class="selected-numbers">
            ${사용자번호.map(번호 => `
                <div class="number-ball ${당첨번호.includes(번호) ? 'correct' : 'user'}">${번호}</div>
            `).join('')}
        </div>
    `;
    
    // 점수 텍스트
    const scoreText = document.createElement('div');
    scoreText.className = 'score-text';
    scoreText.innerHTML = `맞은 개수: ${맞은개수}개 / 점수: ${점수}점`;
    
    // 동물 이미지와 말풍선
    const animalContainer = document.createElement('div');
    animalContainer.className = 'animal-container';
    
    const animal = document.createElement('img');
    animal.className = 'animal-image bounce-in';
    animal.src = getAnimalImage(맞은개수);
    animal.alt = '동물 캐릭터';
    
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble fade-in';
    speechBubble.textContent = getAnimalMessage(맞은개수);
    
    animalContainer.appendChild(animal);
    animalContainer.appendChild(speechBubble);
    
    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '닫기';
    closeButton.onclick = closeScorePopup;
    
    // 팝업에 요소들 추가
    popup.appendChild(numbersDisplay);
    popup.appendChild(scoreText);
    popup.appendChild(animalContainer);
    popup.appendChild(closeButton);
    
    // 기존 팝업 제거 후 새 팝업 추가
    const existingPopup = document.querySelector('.score-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    document.body.appendChild(popup);
    
    // 턴 업데이트
    현재턴++;
    턴표시업데이트();
}

function getAnimalImage(맞은개수) {
    if (맞은개수 >= 5) return 'images/happy_animal.png';
    if (맞은개수 >= 3) return 'images/normal_animal.png';
    return 'images/sad_animal.png';
}

function getAnimalMessage(맞은개수) {
    if (맞은개수 >= 5) return '대단해요! 축하드립니다! 🎉';
    if (맞은개수 >= 3) return '좋은 성적이네요! 👍';
    return '다음에는 더 잘할 수 있을 거예요! 💪';
}

function closeScorePopup() {
    const popup = document.querySelector('.score-popup');
    if (popup) {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }
}

function 계산점수(맞은개수) {
    switch (맞은개수) {
        case 6: return 1000;
        case 5: return 500;
        case 4: return 300;
        case 3: return 200;
        case 2: return 100;
        default: return 0;
    }
}

// 게임 리셋
function 게임리셋() {
    게임초기화();
}

// 격자 초기화 (턴에 따라 다른 회차 표시)
function 격자초기화() {
    const gridContainer = document.querySelector('.grid-container');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    // 셀 크기와 원 크기를 30% 감소
    const 셀크기 = 21;
    const 원크기 = 17;
    const 폰트크기 = 7;  // 폰트 크기도 조정
    
    // 그리드 컨테이너 스타일 설정
    gridContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(16, ${셀크기}px);
        grid-auto-rows: ${셀크기}px;
        column-gap: 0;
        row-gap: 1px;
        margin: 14px auto;
        justify-content: center;
        width: fit-content;
        height: fit-content;
        padding: 7px;
        position: relative;
        overflow: visible;
    `;

    const 턴정보 = get턴정보();
    console.log('현재 턴 정보:', 턴정보);

    // 턴 표시 업데이트
    턴표시업데이트();

    // 헤더 행 추가 (회차 번호)
    for (let i = 0; i < 16; i++) {
        const header = document.createElement('div');
        header.className = 'grid-cell header';
        if (i < 15) {
            const 회차번호 = 턴정보.시작회차 + i;
            header.textContent = 회차번호;
            header.style.cssText = `
                height: ${셀크기}px;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(-45deg);
                font-size: 8px;
                font-weight: bold;
                white-space: nowrap;
                padding: 0;
                color: #333;
            `;
        } else {
            header.textContent = '예상';
            header.style.cssText = `
                border-left: 1px solid #3498db;
                background-color: #f8f9fa;
                font-weight: bold;
                color: #3498db;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                height: ${셀크기}px;
                width: ${셀크기}px;
                padding: 0;
                margin: 0;
                white-space: nowrap;
                overflow: visible;
                position: relative;
                z-index: 2;
                font-size: 8px;
            `;
        }
        gridContainer.appendChild(header);
    }

    // 1-45까지의 번호에 대한 그리드 셀 생성
    for (let num = 1; num <= 45; num++) {
        for (let col = 0; col < 16; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.setAttribute('data-number', num);
            cell.setAttribute('data-row', num);
            cell.setAttribute('data-col', col);
            
            if (col === 15) {
                // 예상 열
                cell.textContent = num;
                cell.classList.add('prediction-cell');
                cell.style.cssText = `
                    border-left: 1px solid #3498db;
                    background-color: #f8f9fa;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    height: ${셀크기}px;
                    width: ${셀크기}px;
                    line-height: ${셀크기}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    position: relative;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                    border-radius: 3px;
                    margin: 0;
                    padding: 0;
                    z-index: 3;
                    font-size: 8px;
                `;
                
                if (선택된번호들.includes(num)) {
                    cell.classList.add('selected');
                    cell.style.backgroundColor = '#3498db';
                    cell.style.color = '#fff';
                }
                
                cell.addEventListener('click', () => 셀클릭(cell));
            } else {
                cell.style.cssText = `
                    height: ${셀크기}px;
                    width: ${셀크기}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                    padding: 0;
                    font-size: ${폰트크기}px;
                    position: relative;
                `;
                
                const 현재회차 = 턴정보.시작회차 + col;
                const 해당회차번호들 = 실제당첨번호[현재회차];
                
                if (해당회차번호들 && 해당회차번호들.includes(num)) {
                    cell.classList.add('marked');
                    const circle = document.createElement('div');
                    circle.className = 'number-circle';
                    circle.textContent = num;
                    
                    // 원 스타일을 명시적으로 설정
                    circle.style.cssText = `
                        width: ${원크기}px;
                        height: ${원크기}px;
                        border: 1px solid #e74c3c;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${폰트크기}px;
                        color: #e74c3c;
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 1;
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        background: transparent;
                    `;
                    cell.appendChild(circle);
                }
            }
            
            gridContainer.appendChild(cell);
        }
    }
    
    console.log('격자 초기화 완료, 현재턴:', 현재턴);
}

// 선택된 번호를 저장할 변수
// let 선택된번호들 = [];

function 셀클릭(cell) {
    if (!cell.classList.contains('prediction-cell')) return;
    
    const 번호 = parseInt(cell.getAttribute('data-number'));
    if (isNaN(번호)) return;

    console.log('셀클릭 - 현재 선택된 번호들:', 선택된번호들);

    if (cell.classList.contains('selected')) {
        // 선택 해제
        cell.classList.remove('selected');
        cell.style.backgroundColor = '#f8f9fa';
        cell.style.color = '#000';
        선택된번호들 = 선택된번호들.filter(n => n !== 번호);
        console.log('번호 선택 해제:', 번호);
        console.log('남은 선택된 번호들:', 선택된번호들);
    } else {
        // 새로운 번호 선택
        if (선택된번호들.length >= 8) {
            alert('최대 8개의 번호만 선택할 수 있습니다.');
            return;
        }
        cell.classList.add('selected');
        cell.style.backgroundColor = '#3498db';
        cell.style.color = '#fff';
        선택된번호들.push(번호);
        console.log('번호 선택:', 번호);
        console.log('현재 선택된 번호들:', 선택된번호들);
        
        // 8개가 선택되면 자동으로 턴완료 실행
        if (선택된번호들.length === 8) {
            console.log('8개 선택 완료, 턴완료 실행');
            턴완료();
        }
    }
}

// 점수 계산 함수
function 점수계산(맞춘개수) {
    // 8개 중에서 맞춘 개수에 따른 점수 계산
    switch(맞춘개수) {
        case 6: return 10;  // 6개 모두 맞춤
        case 5: return 8;   // 5개 맞춤
        case 4: return 6;   // 4개 맞춤
        case 3: return 4;   // 3개 맞춤
        case 2: return 2;   // 2개 맞춤
        case 1: return 1;   // 1개 맞춤
        default: return 0;  // 0개 맞춤
    }
}

// 동물 이미지 배열 추가
// const 동물이미지들 = ['fa1.png', 'fa2.png', 'fa3.png'];

// 턴완료 함수 수정
function 턴완료() {
    console.log('턴완료 함수 실행 시작');
    
    if (선택된번호들.length !== 8) {
        alert('8개의 번호를 선택해주세요.');
        return;
    }

    // 현재 턴의 회차 정보 가져오기
    const 턴정보 = get턴정보();
    console.log('현재 선택된 번호들:', 선택된번호들);
    console.log('턴정보:', 턴정보);

    // 예측 회차의 당첨번호 가져오기 (종료회차 + 1)
    const 예측회차 = 턴정보.예측회차;
    const 당첨번호 = 실제당첨번호[예측회차.toString()];
    console.log(`예측 회차(${예측회차})의 당첨번호:`, 당첨번호);

    if (!당첨번호) {
        console.error(`${예측회차} 회차의 당첨번호를 찾을 수 없습니다.`);
        return;
    }

    // 선택된 번호들 중에서 당첨번호와 일치하는 것을 찾음
    const 맞은번호들 = 선택된번호들.filter(번호 => 당첨번호.includes(번호));
    const 맞은개수 = 맞은번호들.length;

    console.log('체점 결과:');
    console.log('맞은 번호들:', 맞은번호들);
    console.log('맞은 개수:', 맞은개수);

    // 점수 계산
    const 획득점수 = 점수계산(맞은개수);

    // 현재 체크포인트 계산 (1-3)
    const 체크포인트 = Math.ceil(현재턴 / 10);
    
    // 현재 체크포인트의 시작 턴
    const 시작턴 = (체크포인트 - 1) * 10 + 1;
    
    // 턴 결과 저장
    const 턴결과 = {
        선택번호들: 선택된번호들,
        맞은번호들: 맞은번호들,
        맞은개수: 맞은개수,
        점수: 획득점수,
        회차: 예측회차,
        당첨번호: 당첨번호
    };
    
    // localStorage에 턴 결과 저장
    localStorage.setItem(`turn${현재턴}_result`, JSON.stringify(턴결과));
    localStorage.setItem(`turn${현재턴}_score`, 획득점수.toString());
    
    // 체크포인트 정보 저장
    localStorage.setItem('current_checkpoint', 체크포인트.toString());
    localStorage.setItem('checkpoint_start_turn', 시작턴.toString());

    // 결과 표시
    showScorePopup(
        선택된번호들,
        맞은번호들,
        맞은개수,
        획득점수,
        {
            회차: 예측회차,
            당첨번호: 당첨번호,
            맞은번호: 맞은번호들
        }
    );
}

function showScorePopup(selectedNumbers, matchedNumbers, matchCount, score, roundInfo) {
    // 기존 팝업이 있다면 제거
    const existingPopup = document.querySelector('.score-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // 새로운 팝업 요소 생성
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    
    // 결과 컨테이너 생성
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    
    // 점수 텍스트 추가
    const scoreText = document.createElement('div');
    scoreText.className = 'score-text';
    scoreText.innerHTML = `맞춘 개수: <span class="match-count">${matchCount}</span>개 
                          &nbsp;&nbsp;/&nbsp;&nbsp; 
                          획득 점수: <span class="score-value">${score}</span>점`;
    resultContainer.appendChild(scoreText);
    
    // 번호 컨테이너 생성
    const numbersColumn = document.createElement('div');
    numbersColumn.className = 'numbers-column';
    
    // 번호 볼 추가 (OK/NO 이미지 포함)
    selectedNumbers.sort((a, b) => a - b).forEach((num, index) => {
        const ball = document.createElement('div');
        ball.className = 'number-ball';
        ball.style.display = 'flex';
        ball.style.flexDirection = 'column';
        ball.style.alignItems = 'center';
        ball.style.justifyContent = 'center';
        ball.style.position = 'relative';

        // 번호를 span으로 추가 (항상 보이게, 원 중앙)
        const numSpan = document.createElement('span');
        numSpan.textContent = num;
        numSpan.style.fontWeight = 'bold';
        numSpan.style.fontSize = '1.1em';
        numSpan.style.position = 'absolute';
        numSpan.style.top = '50%';
        numSpan.style.left = '50%';
        numSpan.style.transform = 'translate(-50%, -50%)';
        numSpan.style.pointerEvents = 'none';
        numSpan.style.color = matchedNumbers.includes(num) ? '#e74c3c' : '#1976D2';
        ball.appendChild(numSpan);

        // 이미지 추가 (20% 줄여서 40px)
        const img = document.createElement('img');
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.display = 'block';
        img.style.margin = '2px auto 0 auto';
        if (matchedNumbers.includes(num)) {
            img.src = '../images/ok.png';
            img.alt = '맞춤';
        } else {
            img.src = '../images/no.png';
            img.alt = '틀림';
        }
        ball.appendChild(img);

        ball.style.animationDelay = `${index * 0.1}s`;
        numbersColumn.appendChild(ball);
    });
    resultContainer.appendChild(numbersColumn);
    
    // 동물 컨테이너 생성
    const animalContainer = document.createElement('div');
    animalContainer.className = 'animal-container';
    
    // 동물 이미지 추가
    const animalImage = document.createElement('img');
    animalImage.className = 'animal-image';
    animalImage.src = `../images/${getRandomImage(matchCount)}`;
    animalImage.alt = '캐릭터';
    
    // 말풍선 추가
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble';
    speechBubble.textContent = matchCount <= 2 ? 
        '다시 한번 도전해보세요!' :
        '잘했어요! 다음 턴으로 갈까요?';
    
    animalContainer.appendChild(animalImage);
    animalContainer.appendChild(speechBubble);
    
    // 닫기 버튼 추가
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = matchCount <= 2 ? '다시 도전하기' : '다음 턴으로';
    
    // 버튼 클릭 이벤트 수정
    closeButton.onclick = () => {
        if (matchCount > 2) {
            // 팝업 닫기
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.remove();
                
                // 20턴이나 30턴인 경우 체크포인트 정보 저장 후 페이지3으로 이동
                if (현재턴 === 20 || 현재턴 === 30) {
                    const 체크포인트 = Math.ceil(현재턴 / 10);  // 20턴은 2, 30턴은 3
                    const 시작턴 = (체크포인트 - 1) * 10 + 1;  // 체크포인트에 따른 시작턴
                    
                    // 체크포인트 정보 저장
                    localStorage.setItem('current_checkpoint', 체크포인트.toString());
                    localStorage.setItem('checkpoint_start_turn', 시작턴.toString());
                    
                    // 현재 턴의 점수 저장
                    localStorage.setItem(`turn${현재턴}_score`, score.toString());
                    
                    console.log('체크포인트 도달. 페이지3으로 이동:', {
                        체크포인트: 체크포인트,
                        시작턴: 시작턴,
                        현재턴: 현재턴,
                        점수: score
                    });
                    
                    window.location.href = '../pages/page3.html';
                } else {
                    // 다른 턴의 경우 기존 로직 유지
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const 다음턴버튼 = buttons.find(button => button.textContent.includes('다음턴'));
                    
                    if (다음턴버튼) {
                        console.log('다음턴 버튼 찾음:', 다음턴버튼);
                        다음턴버튼.click();
                    } else {
                        console.log('다음턴 버튼을 찾지 못했습니다. 직접 다음턴 함수 호출');
                        다음턴();
                    }
                }
            }, 300);
        } else {
            // 2개 이하 맞춘 경우는 기존대로 동작
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.remove();
                선택된번호들 = [];
                격자초기화();
            }, 300);
        }
    };
    
    // 모든 요소를 팝업에 추가
    popup.appendChild(resultContainer);
    popup.appendChild(animalContainer);
    popup.appendChild(closeButton);
    
    // 팝업을 페이지에 추가
    document.body.appendChild(popup);

    // 턴 점수 박스에 점수 표시
    const scoreBox = document.getElementById('turn-score-value');
    if (scoreBox) scoreBox.textContent = score;
}

function getRandomImage(matchCount) {
    if (matchCount <= 2) {
        // fa 시리즈 중 랜덤 선택 (2개 이하 맞췄을 때)
        const faIndex = Math.floor(Math.random() * 3) + 1;
        return `fa${faIndex}.png`;
    } else {
        // su 시리즈 중 랜덤 선택 (3개 이상 맞췄을 때)
        const suIndex = Math.floor(Math.random() * 4) + 1;
        return `su${suIndex}.png`;
    }
}

function closeScorePopup() {
    const popup = document.querySelector('.score-popup');
    if (popup) {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드됨');
    
    // localStorage에서 현재턴 가져오기
    현재턴 = parseInt(localStorage.getItem('현재턴')) || 1;
    console.log('시작 턴:', 현재턴);
    
    초기화();
    턴표시업데이트();
    격자초기화();
    initTouchEvents();
});

function 초기화() {
    선택된번호들 = [];
    격자초기화();
    document.querySelectorAll('.prediction-cell').forEach(cell => {
        cell.classList.remove('selected');
        cell.style.backgroundColor = '#f8f9fa';
        cell.style.color = '#000';
    });
}

function 결과화면표시() {
    // 기존 화면 숨기기
    document.querySelector('.grid-container').style.display = 'none';
    document.querySelector('.controls').style.display = 'none';
    document.querySelector('.heatmap-container').style.display = 'none';
    
    // 결과 화면 컨테이너 생성
    const 결과컨테이너 = document.createElement('div');
    결과컨테이너.className = 'result-container';
    
    // 총점 계산
    const 총점 = 턴점수들.reduce((a, b) => a + b, 0);
    
    // 결과 화면 HTML 생성
    결과컨테이너.innerHTML = `
        <h2>게임 결과</h2>
        <div class="total-score">총점: ${총점}점</div>
        <div class="turn-scores">
            ${턴점수들.map((점수, 인덱스) => `
                <div class="turn-score">
                    ${인덱스 + 1}턴: ${점수}점
                </div>
            `).join('')}
        </div>
        <button onclick="location.reload()" class="restart-button">다음판으로</button>
    `;
    
    document.body.appendChild(결과컨테이너);
}

// 턴 이동 함수들
function 이전턴() {
    if (현재턴 > 1) {
        현재턴--;
        초기화();
        업데이트턴표시();
    }
}

function 다음턴() {
    if (현재턴 >= 총턴수) {
        alert('마지막 턴입니다!');
        return;
    }
    
    // 현재 턴이 체크포인트 턴인지 확인
    if (현재턴 === 체크포인트턴) {
        console.log('체크포인트 턴 도달. 페이지3으로 이동합니다.');
        window.location.href = '../pages/page3.html';
        return;
    }
    
    현재턴++;
    console.log(`다음 턴으로 이동: ${현재턴}턴`);
    
    // 턴 정보 업데이트
    const 턴정보 = get턴정보();
    console.log('새로운 턴 정보:', 턴정보);
    
    // 화면 초기화 및 업데이트
    입력값초기화();
    격자초기화();
    턴표시업데이트();
    
    // localStorage에 현재 턴 저장
    localStorage.setItem('현재턴', 현재턴.toString());
}

function 턴표시업데이트() {
    const 턴정보 = get턴정보();
    const 턴표시엘리먼트 = document.querySelector('.turn-display');
    if (턴표시엘리먼트) {
        턴표시엘리먼트.innerHTML = `
            <div>${현재턴}턴</div>
            <div>${턴정보.시작회차}-${턴정보.종료회차}</div>
        `;
    }
    updateTurnScoreBox();
}

// 패턴 분석
function 패턴분석() {
    격자초기화();
}

// 힌트1: 가까운 번호 연결
function 힌트1() {
    // 다른 힌트들 비활성화
    힌트2활성화 = false;
    힌트3활성화 = false;
    힌트4활성화 = false;
    힌트5활성화 = false;
    힌트6활성화 = false;
    
    // 기존 연결선들 제거
    clearConnections();
    clearScoreDisplay();
    
    if (힌트1활성화) {
        clearConnections();
        힌트1활성화 = false;
        return;
    }

    힌트1활성화 = true;
    
    const 격자 = document.querySelector('.grid-container');
    const 격자Rect = 격자.getBoundingClientRect();
    const 모든당첨셀 = document.querySelectorAll('.grid-cell.marked');
    const 셀배열 = Array.from(모든당첨셀);
    
    셀배열.forEach((셀1, 인덱스) => {
        셀배열.slice(인덱스 + 1).forEach(셀2 => {
            const 셀1Rect = 셀1.getBoundingClientRect();
            const 셀2Rect = 셀2.getBoundingClientRect();
            
            const x1 = 셀1Rect.left - 격자Rect.left;
            const y1 = 셀1Rect.top - 격자Rect.top;
            const x2 = 셀2Rect.left - 격자Rect.left;
            const y2 = 셀2Rect.top - 격자Rect.top;
            
            // 격자 위치 차이 계산
            const col1 = Math.floor(x1 / (셀1Rect.width + 2));
            const col2 = Math.floor(x2 / (셀2Rect.width + 2));
            const rowDiff = Math.abs(
                Math.floor(y1 / (셀1Rect.height + 2)) - 
                Math.floor(y2 / (셀2Rect.height + 2))
            );
            
            // 인접한 셀들만 연결 (가로로 한 칸 차이)
            if (Math.abs(col2 - col1) === 1 && rowDiff === 0) {
                const 거리 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const 각도 = Math.atan2(y2 - y1, x2 - x1);
                
                // 연결선 생성
                const 연결선 = document.createElement('div');
                연결선.className = 'connection-line';
                연결선.style.cssText = `
                    width: ${거리}px;
                    height: 6px;
                    position: absolute;
                    left: ${x1 + 셀1Rect.width/2}px;
                    top: ${y1 + 셀1Rect.height/2 - 3}px;
                    transform-origin: left center;
                    transform: rotate(${각도}rad);
                    z-index: 3;
                `;
                격자.appendChild(연결선);

                // 점 컨테이너 생성
                const 점컨테이너 = document.createElement('div');
                점컨테이너.className = 'dot-container';
                점컨테이너.style.cssText = `
                    width: ${거리}px;
                    height: 6px;
                    position: absolute;
                    left: ${x1 + 셀1Rect.width/2}px;
                    top: ${y1 + 셀1Rect.height/2 - 3}px;
                    transform-origin: left center;
                    transform: rotate(${각도}rad);
                    z-index: 5;
                `;

                // 움직이는 점들 생성 (3개로 증가)
                for (let i = 0; i < 3; i++) {
                    const 점 = document.createElement('div');
                    점.className = 'moving-dot';
                    점.style.animationDelay = `${i * 1.0}s`;  // 간격 조정
                    점컨테이너.appendChild(점);
                }

                격자.appendChild(점컨테이너);
            }
        });
    });
}

// 힌트2: 큰 각도 연결
function 힌트2() {
    if (힌트2활성화) {
        document.querySelectorAll('.angle-connection').forEach(선 => 선.remove());
        힌트2활성화 = false;
        return;
    }

    힌트2활성화 = true;
    const 격자 = document.querySelector('.grid-container');
    const 격자Rect = 격자.getBoundingClientRect();
    const 모든당첨셀 = document.querySelectorAll('.grid-cell.marked');
    const 셀배열 = Array.from(모든당첨셀);

    셀배열.forEach((셀1, i) => {
        const 셀1Rect = 셀1.getBoundingClientRect();
        const x1 = 셀1Rect.left + 셀1Rect.width / 2;
        const y1 = 셀1Rect.top + 셀1Rect.height / 2;

        셀배열.forEach((셀2, j) => {
            if (i >= j) return;

                const 셀2Rect = 셀2.getBoundingClientRect();
                const x2 = 셀2Rect.left + 셀2Rect.width / 2;
                const y2 = 셀2Rect.top + 셀2Rect.height / 2;

            셀배열.forEach((셀3, k) => {
                if (j >= k) return;

                const 셀3Rect = 셀3.getBoundingClientRect();
                const x3 = 셀3Rect.left + 셀3Rect.width / 2;
                const y3 = 셀3Rect.top + 셀3Rect.height / 2;

                // 세 점 사이의 거리 계산
                const 거리12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const 거리23 = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));
                const 거리13 = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));

                // 모든 거리가 120px 이하인 경우에만 검사
                if (거리12 <= 120 && 거리23 <= 120 && 거리13 <= 120) {
                    // 세 점이 이루는 각도 계산
                    const 각도1 = Math.acos((거리12 * 거리12 + 거리23 * 거리23 - 거리13 * 거리13) / (2 * 거리12 * 거리23));
                    const 각도2 = Math.acos((거리23 * 거리23 + 거리13 * 거리13 - 거리12 * 거리12) / (2 * 거리23 * 거리13));
                    const 각도3 = Math.acos((거리13 * 거리13 + 거리12 * 거리12 - 거리23 * 거리23) / (2 * 거리13 * 거리12));

                    // 각도를 도(degree)로 변환
                    const 각도1도 = 각도1 * 180 / Math.PI;
                    const 각도2도 = 각도2 * 180 / Math.PI;
                    const 각도3도 = 각도3 * 180 / Math.PI;

                    // 140도 이상인 각도가 있는 경우 연결선 그리기
                    if (각도1도 >= 140 || 각도2도 >= 140 || 각도3도 >= 140) {
                        // 첫 번째 연결선
                        const 연결선1 = document.createElement('div');
                        연결선1.className = 'angle-connection';
                        연결선1.style.cssText = `
                            width: ${거리12}px;
                            height: 4px;
                            background-color: rgba(76, 175, 80, 0.8);
                            position: absolute;
                            left: ${x1 - 격자Rect.left}px;
                            top: ${y1 - 격자Rect.top}px;
                            transform: rotate(${Math.atan2(y2 - y1, x2 - x1)}rad);
                            transform-origin: left center;
                            z-index: 2;
                        `;
                        격자.appendChild(연결선1);

                        // 두 번째 연결선
                        const 연결선2 = document.createElement('div');
                        연결선2.className = 'angle-connection';
                        연결선2.style.cssText = `
                            width: ${거리23}px;
                            height: 4px;
                            background-color: rgba(76, 175, 80, 0.8);
                            position: absolute;
                            left: ${x2 - 격자Rect.left}px;
                            top: ${y2 - 격자Rect.top}px;
                            transform: rotate(${Math.atan2(y3 - y2, x3 - x2)}rad);
                            transform-origin: left center;
                            z-index: 2;
                        `;
                        격자.appendChild(연결선2);
                    }
                }
            });
        });
    });
}

// 힌트3: 주황색 그라데이션 원 표시
function 힌트3() {
    // 이미 활성화된 경우 효과 제거
    if (힌트3활성화) {
        document.querySelectorAll('.gradient-circle').forEach(원 => 원.remove());
        힌트3활성화 = false;
        return;
    }

    힌트3활성화 = true;
    const 모든당첨셀 = document.querySelectorAll('.grid-cell.marked');
    const 셀배열 = Array.from(모든당첨셀);
    
    const 번호정보 = {};
    
    셀배열.forEach((셀1, 인덱스1) => {
        const 번호1 = parseInt(셀1.querySelector('.number-circle')?.textContent);
        const 셀1Rect = 셀1.getBoundingClientRect();
        const 셀1중심X = 셀1Rect.left + 셀1Rect.width / 2;
        const 셀1중심Y = 셀1Rect.top + 셀1Rect.height / 2;
        
        if (!번호정보[번호1]) {
            번호정보[번호1] = {
                연결선들: [],
                연결된셀들: new Set()
            };
        }
        
        셀배열.forEach((셀2, 인덱스2) => {
            if (인덱스1 >= 인덱스2) return;
            
            const 셀2Rect = 셀2.getBoundingClientRect();
            const 셀2중심X = 셀2Rect.left + 셀2Rect.width / 2;
            const 셀2중심Y = 셀2Rect.top + 셀2Rect.height / 2;
            
            const 거리 = Math.sqrt(
                Math.pow(셀2중심X - 셀1중심X, 2) + 
                Math.pow(셀2중심Y - 셀1중심Y, 2)
            );
            
            if (거리 <= 60) {
                번호정보[번호1].연결선들.push(거리);
                번호정보[번호1].연결된셀들.add(셀1);
                
                const 번호2 = parseInt(셀2.querySelector('.number-circle')?.textContent);
                if (!번호정보[번호2]) {
                    번호정보[번호2] = {
                        연결선들: [거리],
                        연결된셀들: new Set([셀2])
                    };
                } else {
                    번호정보[번호2].연결선들.push(거리);
                    번호정보[번호2].연결된셀들.add(셀2);
                }
            }
        });
    });

    Object.entries(번호정보).forEach(([번호, 정보]) => {
        if (정보.연결선들.length > 0) {
            정보.연결된셀들.forEach(셀 => {
                const 그라데이션원 = document.createElement('div');
                그라데이션원.className = 'gradient-circle';
                
                // 연결선 수와 거리에 따른 반지름 계산 수정
                const 연결선수 = 정보.연결선들.length;
                const 평균거리 = 정보.연결선들.reduce((a, b) => a + b, 0) / 연결선수;
                
                // 기본 반지름을 더 크게 설정
                let 반지름 = 35; // 기본 반지름을 35로 증가
                
                // 연결선 수에 따른 추가 반지름 (로그 스케일)
                반지름 += Math.log2(연결선수 + 1) * 12; // 증가 비율을 12로 증가
                
                // 평균 거리에 따른 반지름 감소 비율 조정
                반지름 *= Math.max(0.9, 1 - 평균거리 / 250); // 최소 크기를 0.9로 증가, 거리 영향 감소
                
                그라데이션원.style.cssText = `
                    position: absolute;
                    width: ${반지름 * 2}px;
                    height: ${반지름 * 2}px;
                    background: radial-gradient(circle, rgba(255, 140, 0, 0.4) 0%, rgba(255, 140, 0, 0) 90%);
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1;
                    pointer-events: none;
                `;
                
                const 기존원 = 셀.querySelector('.gradient-circle');
                if (기존원) {
                    기존원.remove();
                }
                
                셀.style.position = 'relative';
                셀.appendChild(그라데이션원);
            });
        }
    });
    히트맵표시();
}

// 힌트4: 히트맵 표시
function 힌트4() {
    const 예상열셀들 = document.querySelectorAll('.prediction-cell');
    const 패턴강도 = new Array(46).fill(0);
    let 최대강도 = 0;

    // 패턴 강도 계산
    document.querySelectorAll('.grid-cell.marked').forEach(cell => {
        const num = parseInt(cell.querySelector('.number-circle')?.textContent);
        if (num > 0 && num <= 45) {
            패턴강도[num] += 1;
                최대강도 = Math.max(최대강도, 패턴강도[num]);
        }
    });

    // 히트맵 활성화 상태 토글
    const 힌트4버튼 = document.querySelector('.hint-button:nth-child(4)');
    힌트4버튼.classList.toggle('active');
    const isActive = 힌트4버튼.classList.contains('active');

    // 예상 열에 히트맵 스타일 적용
    예상열셀들.forEach(cell => {
        const num = parseInt(cell.textContent);
        if (num > 0 && num <= 45) {
            // 선택된 상태일 때는 원래 스타일 유지
            if (cell.classList.contains('selected')) {
                cell.style.backgroundColor = '#3498db';
                cell.style.color = '#fff';
                return;
            }
            if (isActive) {
                // 히트맵 활성화: 보라색 히트맵 적용
                const 강도비율 = 패턴강도[num] / (최대강도 || 1);
                const 강화된강도 = Math.pow(강도비율, 0.7);
                cell.style.backgroundColor = `rgba(128, 0, 128, ${강화된강도.toFixed(2)})`;
                cell.style.color = 강화된강도 > 0.5 ? '#fff' : '#000';
                // 펄스 효과 추가
                cell.classList.remove('pulse');
                void cell.offsetWidth;
                cell.classList.add('pulse');
            } else {
                // 히트맵 비활성화: 원래 스타일로 복원
                cell.style.backgroundColor = '#f8f9fa';
                cell.style.color = '#000';
                cell.classList.remove('pulse');
            }
            cell.style.transition = 'all 0.3s ease';
        }
    });
}

// 기존 히트맵 표시 함수 수정
function 히트맵표시() {
    // 히트맵 표시 기능 비활성화
    return;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initTouchEvents();
    패턴분석();
    히트맵표시();
});

// 4월 2일차 상태 저장
saveGameState('2024-04-02', {
    selectedNumbers: selectedNumbers,
    currentTurn: currentTurn,
    hint1Active: hint1Active,
    hint2Active: hint2Active,
    hint3Active: hint3Active,
    hint1Shown: hint1Shown,
    hint2Shown: hint2Shown,
    hint3Shown: hint3Shown
});

function 거리계산(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function 각도계산(x1, y1, x2, y2, x3, y3) {
    const a = 거리계산(x2, y2, x3, y3);
    const b = 거리계산(x1, y1, x3, y3);
    const c = 거리계산(x1, y1, x2, y2);
    
    return Math.acos((a * a + c * c - b * b) / (2 * a * c));
}

function 힌트1() {
    // 이미 활성화된 경우 효과 제거
    if (힌트1활성화) {
        document.querySelectorAll('.connection-line').forEach(선 => 선.remove());
        힌트1활성화 = false;
        return;
    }

    힌트1활성화 = true;
    const 격자 = document.querySelector('.grid-container');
    const 격자Rect = 격자.getBoundingClientRect();
    const 모든당첨셀 = document.querySelectorAll('.grid-cell.marked');
    const 셀배열 = Array.from(모든당첨셀);

    셀배열.forEach((셀1, 인덱스1) => {
        const 셀1Rect = 셀1.getBoundingClientRect();
        const 시작X = 셀1Rect.left + 셀1Rect.width / 2;
        const 시작Y = 셀1Rect.top + 셀1Rect.height / 2;

        셀배열.forEach((셀2, 인덱스2) => {
            if (인덱스1 >= 인덱스2) return;

            const 셀2Rect = 셀2.getBoundingClientRect();
            const 끝X = 셀2Rect.left + 셀2Rect.width / 2;
            const 끝Y = 셀2Rect.top + 셀2Rect.height / 2;

            const 거리 = 거리계산(시작X, 시작Y, 끝X, 끝Y);
            if (거리 <= 60) {
                const 각도 = Math.atan2(끝Y - 시작Y, 끝X - 시작X);
                const 길이 = 거리;
                const 두께 = Math.max(8, Math.min(16, 24 - 거리 / 5));
                const 투명도 = Math.max(0.4, Math.min(1, 1.2 - 거리 / 100));

                const 연결선 = document.createElement('div');
                연결선.className = 'connection-line';
                연결선.style.cssText = `
                    width: ${길이}px;
                    height: ${두께}px;
                    opacity: ${투명도};
                    background-color: #007bff;
                    position: absolute;
                    left: ${시작X - 격자Rect.left}px;
                    top: ${시작Y - 격자Rect.top - 두께/2}px;
                    transform: rotate(${각도 * 180 / Math.PI}deg)`;
                연결선.style.transformOrigin = 'left center';
                연결선.style.zIndex = '2';
                연결선.style.position = 'absolute';

                격자.appendChild(연결선);
            }
        });
    });
    히트맵표시();
}

function 힌트3() {
    // 이미 활성화된 경우 효과 제거
    if (힌트3활성화) {
        document.querySelectorAll('.gradient-circle').forEach(원 => 원.remove());
        힌트3활성화 = false;
        return;
    }

    힌트3활성화 = true;
    const 모든당첨셀 = document.querySelectorAll('.grid-cell.marked');
    const 셀배열 = Array.from(모든당첨셀);
    
    const 번호정보 = {};
    
    셀배열.forEach((셀1, 인덱스1) => {
        const 번호1 = parseInt(셀1.querySelector('.number-circle')?.textContent);
        const 셀1Rect = 셀1.getBoundingClientRect();
        const 셀1중심X = 셀1Rect.left + 셀1Rect.width / 2;
        const 셀1중심Y = 셀1Rect.top + 셀1Rect.height / 2;
        
        if (!번호정보[번호1]) {
            번호정보[번호1] = {
                연결선들: [],
                연결된셀들: new Set()
            };
        }
        
        셀배열.forEach((셀2, 인덱스2) => {
            if (인덱스1 >= 인덱스2) return;
            
            const 셀2Rect = 셀2.getBoundingClientRect();
            const 셀2중심X = 셀2Rect.left + 셀2Rect.width / 2;
            const 셀2중심Y = 셀2Rect.top + 셀2Rect.height / 2;
            
            const 거리 = Math.sqrt(
                Math.pow(셀2중심X - 셀1중심X, 2) + 
                Math.pow(셀2중심Y - 셀1중심Y, 2)
            );
            
            if (거리 <= 60) {
                번호정보[번호1].연결선들.push(거리);
                번호정보[번호1].연결된셀들.add(셀1);
                
                const 번호2 = parseInt(셀2.querySelector('.number-circle')?.textContent);
                if (!번호정보[번호2]) {
                    번호정보[번호2] = {
                        연결선들: [거리],
                        연결된셀들: new Set([셀2])
                    };
                } else {
                    번호정보[번호2].연결선들.push(거리);
                    번호정보[번호2].연결된셀들.add(셀2);
                }
            }
        });
    });

    Object.entries(번호정보).forEach(([번호, 정보]) => {
        if (정보.연결선들.length > 0) {
            정보.연결된셀들.forEach(셀 => {
                const 그라데이션원 = document.createElement('div');
                그라데이션원.className = 'gradient-circle';
                
                // 연결선 수와 거리에 따른 반지름 계산 수정
                const 연결선수 = 정보.연결선들.length;
                const 평균거리 = 정보.연결선들.reduce((a, b) => a + b, 0) / 연결선수;
                
                // 기본 반지름을 더 크게 설정
                let 반지름 = 35; // 기본 반지름을 35로 증가
                
                // 연결선 수에 따른 추가 반지름 (로그 스케일)
                반지름 += Math.log2(연결선수 + 1) * 12; // 증가 비율을 12로 증가
                
                // 평균 거리에 따른 반지름 감소 비율 조정
                반지름 *= Math.max(0.9, 1 - 평균거리 / 250); // 최소 크기를 0.9로 증가, 거리 영향 감소
                
                그라데이션원.style.cssText = `
                    position: absolute;
                    width: ${반지름 * 2}px;
                    height: ${반지름 * 2}px;
                    background: radial-gradient(circle, rgba(255, 140, 0, 0.4) 0%, rgba(255, 140, 0, 0) 90%);
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1;
                    pointer-events: none;
                `;
                
                const 기존원 = 셀.querySelector('.gradient-circle');
                if (기존원) {
                    기존원.remove();
                }
                
                셀.style.position = 'relative';
                셀.appendChild(그라데이션원);
            });
        }
    });
    히트맵표시();
}

function getRandomImage(matchCount) {
    if (matchCount <= 2) {
        // fa 시리즈 중 랜덤 선택 (2개 이하 맞췄을 때)
        const faIndex = Math.floor(Math.random() * 3) + 1;
        return `fa${faIndex}.png`;
    } else {
        // su 시리즈 중 랜덤 선택 (3개 이상 맞췄을 때)
        const suIndex = Math.floor(Math.random() * 4) + 1;
        return `su${suIndex}.png`;
    }
}

function showScorePopup(selectedNumbers, matchedNumbers, matchCount, score, roundInfo) {
    // 기존 팝업이 있다면 제거
    const existingPopup = document.querySelector('.score-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // 새로운 팝업 요소 생성
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    
    // 결과 컨테이너 생성
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    
    // 점수 텍스트 추가
    const scoreText = document.createElement('div');
    scoreText.className = 'score-text';
    scoreText.innerHTML = `맞춘 개수: <span class="match-count">${matchCount}</span>개 
                          &nbsp;&nbsp;/&nbsp;&nbsp; 
                          획득 점수: <span class="score-value">${score}</span>점`;
    resultContainer.appendChild(scoreText);
    
    // 번호 컨테이너 생성
    const numbersColumn = document.createElement('div');
    numbersColumn.className = 'numbers-column';
    
    // 번호 볼 추가 (OK/NO 이미지 포함)
    selectedNumbers.sort((a, b) => a - b).forEach((num, index) => {
        const ball = document.createElement('div');
        ball.className = 'number-ball';
        ball.style.display = 'flex';
        ball.style.flexDirection = 'column';
        ball.style.alignItems = 'center';
        ball.style.justifyContent = 'center';
        ball.style.position = 'relative';

        // 번호를 span으로 추가 (항상 보이게, 원 중앙)
        const numSpan = document.createElement('span');
        numSpan.textContent = num;
        numSpan.style.fontWeight = 'bold';
        numSpan.style.fontSize = '1.1em';
        numSpan.style.position = 'absolute';
        numSpan.style.top = '50%';
        numSpan.style.left = '50%';
        numSpan.style.transform = 'translate(-50%, -50%)';
        numSpan.style.pointerEvents = 'none';
        numSpan.style.color = matchedNumbers.includes(num) ? '#e74c3c' : '#1976D2';
        ball.appendChild(numSpan);

        // 이미지 추가 (20% 줄여서 40px)
        const img = document.createElement('img');
        img.style.width = '40px';
        img.style.height = '40px';
        img.style.display = 'block';
        img.style.margin = '2px auto 0 auto';
        if (matchedNumbers.includes(num)) {
            img.src = '../images/ok.png';
            img.alt = '맞춤';
        } else {
            img.src = '../images/no.png';
            img.alt = '틀림';
        }
        ball.appendChild(img);

        ball.style.animationDelay = `${index * 0.1}s`;
        numbersColumn.appendChild(ball);
    });
    resultContainer.appendChild(numbersColumn);
    
    // 동물 컨테이너 생성
    const animalContainer = document.createElement('div');
    animalContainer.className = 'animal-container';
    
    // 동물 이미지 추가
    const animalImage = document.createElement('img');
    animalImage.className = 'animal-image';
    animalImage.src = `../images/${getRandomImage(matchCount)}`;
    animalImage.alt = '캐릭터';
    
    // 말풍선 추가
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble';
    speechBubble.textContent = matchCount <= 2 ? 
        '다시 한번 도전해보세요!' :
        '잘했어요! 다음 턴으로 갈까요?';
    
    animalContainer.appendChild(animalImage);
    animalContainer.appendChild(speechBubble);
    
    // 닫기 버튼 추가
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = matchCount <= 2 ? '다시 도전하기' : '다음 턴으로';
    
    // 버튼 클릭 이벤트 수정
    closeButton.onclick = () => {
        if (matchCount > 2) {
            // 팝업 닫기
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.remove();
                
                // 20턴이나 30턴인 경우 체크포인트 정보 저장 후 페이지3으로 이동
                if (현재턴 === 20 || 현재턴 === 30) {
                    const 체크포인트 = Math.ceil(현재턴 / 10);  // 20턴은 2, 30턴은 3
                    const 시작턴 = (체크포인트 - 1) * 10 + 1;  // 체크포인트에 따른 시작턴
                    
                    // 체크포인트 정보 저장
                    localStorage.setItem('current_checkpoint', 체크포인트.toString());
                    localStorage.setItem('checkpoint_start_turn', 시작턴.toString());
                    
                    // 현재 턴의 점수 저장
                    localStorage.setItem(`turn${현재턴}_score`, score.toString());
                    
                    console.log('체크포인트 도달. 페이지3으로 이동:', {
                        체크포인트: 체크포인트,
                        시작턴: 시작턴,
                        현재턴: 현재턴,
                        점수: score
                    });
                    
                    window.location.href = '../pages/page3.html';
                } else {
                    // 다른 턴의 경우 기존 로직 유지
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const 다음턴버튼 = buttons.find(button => button.textContent.includes('다음턴'));
                    
                    if (다음턴버튼) {
                        console.log('다음턴 버튼 찾음:', 다음턴버튼);
                        다음턴버튼.click();
                    } else {
                        console.log('다음턴 버튼을 찾지 못했습니다. 직접 다음턴 함수 호출');
                        다음턴();
                    }
                }
            }, 300);
        } else {
            // 2개 이하 맞춘 경우는 기존대로 동작
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.remove();
                선택된번호들 = [];
                격자초기화();
            }, 300);
        }
    };
    
    // 모든 요소를 팝업에 추가
    popup.appendChild(resultContainer);
    popup.appendChild(animalContainer);
    popup.appendChild(closeButton);
    
    // 팝업을 페이지에 추가
    document.body.appendChild(popup);
}

function closeScorePopup() {
    const popup = document.querySelector('.score-popup');
    if (popup) {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }
}

// 페이지3 초기화 함수 수정
document.addEventListener('DOMContentLoaded', function() {
    // 현재 페이지가 page3.html인 경우에만 실행
    if (window.location.pathname.includes('page3.html')) {
        // 현재 체크포인트와 시작 턴 가져오기
        const 현재체크포인트 = parseInt(localStorage.getItem('current_checkpoint')) || 1;
        const 시작턴 = parseInt(localStorage.getItem('checkpoint_start_turn')) || 1;
        const 종료턴 = Math.min(시작턴 + 9, 현재체크포인트 * 10);
        
        console.log('체크포인트 정보:', { 현재체크포인트, 시작턴, 종료턴 });
        
        // 체크포인트 표시
        document.getElementById('checkpoint-number').textContent = 현재체크포인트;
        
        // 점수 계산 및 표시
        let 총점 = 0;
        const 턴점수컨테이너 = document.getElementById('turn-scores');
        
        // 이전 턴 점수들 초기화
        턴점수컨테이너.innerHTML = '';
        
        // 각 턴의 점수 표시
        for (let i = 시작턴; i <= 종료턴; i++) {
            const 턴점수 = parseInt(localStorage.getItem(`turn${i}_score`)) || 0;
            총점 += 턴점수;
            
            const 턴점수요소 = document.createElement('div');
            턴점수요소.className = 'turn-score';
            턴점수요소.textContent = `${i}턴: ${턴점수}점`;
            턴점수컨테이너.appendChild(턴점수요소);
        }
        
        // 총점 표시
        document.getElementById('total-score').textContent = 총점;
        
        console.log('페이지3 초기화 완료:', { 총점, 턴수: 종료턴 - 시작턴 + 1 });
    }
});

function 힌트표시(type) {
    const gridCells = document.querySelectorAll('.grid-cell');
    const markedCells = Array.from(gridCells).filter(cell => cell.classList.contains('marked'));
    
    // 기존 힌트 요소들 제거
    document.querySelectorAll('.connection-line, .gradient-circle, .angle-connection').forEach(el => el.remove());
    
    if (markedCells.length < 2) return;
    
    switch(type) {
        case '연결선':
            showConnectionLines(markedCells);
            break;
        case '그라데이션':
            showGradientCircles(markedCells);
            break;
        case '각도':
            showAngleConnections(markedCells);
            break;
        case '히트맵':
            showHeatmap(markedCells);
            break;
    }
}

function showConnectionLines(markedCells) {
    for (let i = 0; i < markedCells.length - 1; i++) {
        const cell1 = markedCells[i];
        const cell2 = markedCells[i + 1];
        const rect1 = cell1.getBoundingClientRect();
        const rect2 = cell2.getBoundingClientRect();
        
        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;
        const x2 = rect2.left + rect2.width / 2;
        const y2 = rect2.top + rect2.height / 2;
        
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        const line = document.createElement('div');
        line.className = 'connection-line';
        line.style.width = `${length}px`;
        line.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
        document.body.appendChild(line);
    }
}

function showGradientCircles(markedCells) {
    markedCells.forEach(cell => {
        const circle = document.createElement('div');
        circle.className = 'gradient-circle';
        cell.appendChild(circle);
    });
}

function showAngleConnections(markedCells) {
    if (markedCells.length < 3) return;
    
    for (let i = 1; i < markedCells.length - 1; i++) {
        const prev = markedCells[i - 1].getBoundingClientRect();
        const curr = markedCells[i].getBoundingClientRect();
        const next = markedCells[i + 1].getBoundingClientRect();
        
        const angle1 = Math.atan2(
            prev.top + prev.height/2 - (curr.top + curr.height/2),
            prev.left + prev.width/2 - (curr.left + curr.width/2)
        );
        
        const angle2 = Math.atan2(
            next.top + next.height/2 - (curr.top + curr.height/2),
            next.left + next.width/2 - (curr.left + curr.width/2)
        );
        
        const angleDiff = ((angle2 - angle1) * 180 / Math.PI + 360) % 360;
        
        const connection = document.createElement('div');
        connection.className = 'angle-connection';
        connection.style.width = '40px';
        connection.style.transform = `translate(${curr.left + curr.width/2}px, ${curr.top + curr.height/2}px) rotate(${angle1 * 180 / Math.PI}deg)`;
        document.body.appendChild(connection);
    }
}

function showHeatmap(markedCells) {
    const heatmapData = new Array(45).fill(0);
    markedCells.forEach(cell => {
        const number = parseInt(cell.textContent);
        if (!isNaN(number)) {
            heatmapData[number - 1]++;
        }
    });
    
    document.querySelectorAll('.grid-cell').forEach(cell => {
        const number = parseInt(cell.textContent);
        if (!isNaN(number)) {
            const intensity = heatmapData[number - 1];
            const alpha = Math.min(intensity * 0.2, 0.8);
            cell.style.backgroundColor = `rgba(255, 140, 0, ${alpha})`;
        }
    });
}

function 이번주번호도전() {
    window.location.href = '../pages/page4.html';
}

function 랭킹확인() {
    window.location.href = '../pages/page5.html';
}

// 기본 상태 저장 함수
function saveBaseState() {
    const baseState = {
        현재턴: 현재턴,
        힌트1활성화: 힌트1활성화,
        힌트2활성화: 힌트2활성화,
        힌트3활성화: 힌트3활성화,
        currentConnectionType: currentConnectionType
    };
    localStorage.setItem('gameBaseState', JSON.stringify(baseState));
}

// 기본 상태 불러오기 함수
function loadBaseState() {
    const savedState = localStorage.getItem('gameBaseState');
    const isPage2 = typeof window !== 'undefined' && window.location.href.indexOf('page2.html') !== -1;
    if (savedState) {
        const state = JSON.parse(savedState);
        현재턴 = state.현재턴 || 1;
        if (isPage2) {
            // page2: 저장된 힌트 상태는 복원하지 않고 항상 전부 끔으로 시작
            힌트1활성화 = false;
            힌트2활성화 = false;
            힌트3활성화 = false;
            힌트4활성화 = false;
            힌트5활성화 = false;
            힌트6활성화 = false;
        } else {
            힌트1활성화 = state.힌트1활성화 || false;
            힌트2활성화 = state.힌트2활성화 || false;
            힌트3활성화 = state.힌트3활성화 || false;
        }
        currentConnectionType = state.currentConnectionType || null;
    } else if (isPage2) {
        힌트1활성화 = false;
        힌트2활성화 = false;
        힌트3활성화 = false;
        힌트4활성화 = false;
        힌트5활성화 = false;
        힌트6활성화 = false;
    }
}

// 초기화 시 상태 불러오기
document.addEventListener('DOMContentLoaded', function() {
    loadBaseState();
    if (typeof window !== 'undefined' && window.location.href.indexOf('page2.html') !== -1) {
        if (typeof clearConnections === 'function') clearConnections();
        if (typeof clearScoreDisplay === 'function') clearScoreDisplay();
        if (typeof clearMovingDots === 'function') clearMovingDots();
        document.querySelectorAll('.angle-connection, .gradient-circle').forEach(function (n) {
            n.remove();
        });
    }
    격자초기화();
});

function 힌트5() {
    clearMovingDots(); // 힌트6의 점(움직이는 점) 완전히 제거
    힌트5활성화 = !힌트5활성화;  // 상태 토글
    clearScoreDisplay();
    if (!힌트5활성화) {
        return;
    }
    // DOM 조작 최소화: 셀 목록을 미리 캐싱
    const allCells = Array.from(document.querySelectorAll('.grid-cell'));
    const markedCells = Array.from(document.querySelectorAll('.grid-cell.marked'));
    // 점수 계산을 위한 위치 정보 미리 캐싱
    const markedPositions = markedCells.map(getCellPosition);
    allCells.forEach(cell => {
        if (!cell.classList.contains('marked') && !cell.classList.contains('prediction-cell')) {
            const cellPos = getCellPosition(cell);
            let totalScore = 0;
            for (let i = 0; i < markedPositions.length; i++) {
                totalScore += calculatePositionScore(cellPos, markedPositions[i]);
            }
            // 점수(숫자)는 표시하지 않고, 그라데이션 원만 표시
            if (totalScore <= 1.5) {
                const gradientCircle = document.createElement('div');
                gradientCircle.className = 'hint5-gradient-circle';
                let size, gradientColor;
                if (totalScore === 0) { size = 72; gradientColor = 'rgba(0,0,0,0.7)'; }
                else if (totalScore === 1) { size = 60; gradientColor = 'rgba(128,128,0,0.7)'; }
                else if (totalScore === 1.5) { size = 48; gradientColor = 'rgba(255,255,0,0.7)'; }
                gradientCircle.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:radial-gradient(circle,${gradientColor} 0%,transparent 70%);border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);z-index:1;`;
                cell.appendChild(gradientCircle);
            }
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
    const gridSize = 16; // 실제 그리드 크기로 수정
    const cells = Array.from(document.querySelectorAll('.grid-cell'));
    const index = cells.indexOf(cell);
    const row = Math.floor((index - gridSize) / gridSize); // 헤더 행을 제외
    const col = index % gridSize;
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
        gradientCircle.className = 'hint5-gradient-circle';  // 클래스 이름 추가
        let size;
        let gradientColor;
        
        // 점수에 따른 원 크기 설정 (역순, 3배 크기)
        if (score === 0) {
            size = 72;  // 24 * 3 (가장 큰 원)
            gradientColor = 'rgba(0, 0, 0, 0.7)';
        } else if (score === 1) {
            size = 60;  // 20 * 3 (중간 크기 원)
            gradientColor = 'rgba(128, 128, 0, 0.7)';
        } else if (score === 1.5) {
            size = 48;  // 16 * 3 (가장 작은 원)
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

// 힌트6 함수 추가
function 힌트6() {
    // 이미 활성화되어 있으면 제거
    if (힌트6활성화) {
        clearMovingDots();
        힌트6활성화 = false;
        return;
    }

    // 다른 힌트들 비활성화
    힌트1활성화 = false;
    힌트2활성화 = false;
    힌트3활성화 = false;
    힌트4활성화 = false;
    힌트5활성화 = false;
    
    // 기존 연결선들 제거
    clearConnections();
    clearScoreDisplay();
    clearMovingDots();  // 혹시 남아있을 수 있는 점들 제거
    
    힌트6활성화 = true;
    
    const 격자 = document.querySelector('.grid-container');
    if (!격자) return;
    
    const 격자Rect = 격자.getBoundingClientRect();
    const 모든당첨셀 = document.querySelectorAll('.grid-cell.marked');
    const 셀배열 = Array.from(모든당첨셀);
    
    try {
        // 셀들을 회차와 열 번호로 정렬
        const 정렬된셀배열 = 셀배열.map(cell => {
            // 셀의 위치를 그리드에서의 인덱스로 계산
            const cells = Array.from(격자.children);
            const index = cells.indexOf(cell);
            const row = Math.floor(index / 16); // 16은 그리드의 열 수
            const col = index % 16;
            return { cell, row, col };
        }).sort((a, b) => {
            if (a.row !== b.row) return a.row - b.row;
            return a.col - b.col;
        });

        // 같은 회차의 셀들을 그룹화
        const 회차그룹 = {};
        정렬된셀배열.forEach(item => {
            if (!회차그룹[item.row]) {
                회차그룹[item.row] = [];
            }
            회차그룹[item.row].push(item);
        });

        // 연속된 회차(왼쪽 방향)만: 회차들 내림차순 정렬
        const 회차들 = Object.keys(회차그룹).map(Number).sort((a, b) => b - a);
        
        for (let i = 0; i < 회차들.length - 1; i++) {
            const 현재회차 = 회차들[i];
            const 다음회차 = 회차들[i + 1];
            // 연속된 회차(왼쪽 방향)만
            if (현재회차 - 다음회차 !== 1) continue;
            if (현재회차 <= 다음회차) continue;
            const 현재셀들 = 회차그룹[현재회차];
            const 다음셀들 = 회차그룹[다음회차];
            
            현재셀들.forEach(현재셀정보 => {
                다음셀들.forEach(다음셀정보 => {
                    const 셀1Rect = 현재셀정보.cell.getBoundingClientRect();
                    const 셀2Rect = 다음셀정보.cell.getBoundingClientRect();
                    
                    const x1 = 셀1Rect.left - 격자Rect.left;
                    const y1 = 셀1Rect.top - 격자Rect.top;
                    const x2 = 셀2Rect.left - 격자Rect.left;
                    const y2 = 셀2Rect.top - 격자Rect.top;
                    
                    const 거리 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                    const 각도 = Math.atan2(y2 - y1, x2 - x1);
                    
                    // 연결선 생성 (투명)
                    const 연결선 = document.createElement('div');
                    연결선.className = 'hint6-line';
                    연결선.style.cssText = `
                        width: ${거리}px;
                        height: 2px;
                        position: absolute;
                        left: ${x1 + 셀1Rect.width/2}px;
                        top: ${y1 + 셀1Rect.height/2}px;
                        transform-origin: left center;
                        transform: rotate(${각도}rad);
                        z-index: 3;
                        background: transparent;
                    `;
                    격자.appendChild(연결선);

                    // 점 컨테이너 생성
                    const 점컨테이너 = document.createElement('div');
                    점컨테이너.className = 'hint6-dot-container';
                    점컨테이너.style.cssText = `
                        width: ${거리}px;
                        height: 2px;
                        position: absolute;
                        left: ${x1 + 셀1Rect.width/2}px;
                        top: ${y1 + 셀1Rect.height/2}px;
                        transform-origin: left center;
                        transform: rotate(${각도}rad);
                        z-index: 5;
                    `;

                    // 움직이는 점들 생성
                    for (let j = 0; j < 2; j++) {
                        const 점 = document.createElement('div');
                        점.className = 'hint6-moving-dot';
                        점.style.animationDelay = `${j * 2.5 + Math.random()}s`;
                        점컨테이너.appendChild(점);
                        // 펄스 효과를 예상열(가장 오른쪽 열)에만 적용
                        setTimeout(() => {
                            const num = 다음셀정보.cell.getAttribute('data-number');
                            const predictionCells = Array.from(document.querySelectorAll('.grid-cell.prediction-cell'));
                            const predictionCell = predictionCells.find(pc => pc.getAttribute('data-number') === num);
                            if (predictionCell) {
                                predictionCell.classList.remove('pulse');
                                void predictionCell.offsetWidth;
                                predictionCell.classList.add('pulse');
                            }
                        }, (j * 2.5 + Math.random()) * 1000 + 1200);
                    }

                    격자.appendChild(점컨테이너);
                });
            });
        }
    } catch (error) {
        console.error('힌트6 에러:', error);
        힌트6활성화 = false;
        clearMovingDots();
    }
}

// 힌트6의 점들 제거 함수
function clearMovingDots() {
    const elements = document.querySelectorAll('.hint6-line, .hint6-dot-container');
    elements.forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
}

// clearConnections 함수 수정
function clearConnections() {
    document.querySelectorAll('.connection-line, .dot-container, .angle-connection, .gradient-circle').forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
}

// 턴 점수 박스 업데이트 함수
function updateTurnScoreBox() {
    const listDiv = document.getElementById('turn-score-list');
    const sumDiv = document.getElementById('turn-score-sum');
    if (!listDiv || !sumDiv) return;
    let scoreList = [];
    let sum = 0;
    // 현재턴은 아직 완료되지 않은 상황이므로, 1턴~(현재턴-1)까지 표시
    for (let i = 1; i < 현재턴; i++) {
        const score = parseInt(localStorage.getItem(`turn${i}_score`)) || 0;
        scoreList.push(`${i}턴: ${score}점`);
        sum += score;
    }
    listDiv.textContent = scoreList.join('   ');
    sumDiv.textContent = `총점: ${sum}점`;
}

