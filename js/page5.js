// 페이지5의 예측 번호 표시 및 순위 관리
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지5 로드됨');
    
    // 순서 중요: 현재 예측 -> 당첨 결과 -> 지난주 결과 -> 전체 예측
    displayCurrentPrediction();
    displayLastWeekResults();
    displayPredictions();

    // 관리자 폼 숨기기
    const adminForm = document.querySelector('.admin-input-form');
    if (adminForm) {
        adminForm.style.display = 'none';
    }

    // 모달 외부 클릭 시 닫기
    document.getElementById('modalOverlay').addEventListener('click', hidePasswordModal);

    // Enter 키로 비밀번호 제출
    document.getElementById('adminPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
});

function getAllPredictions() {
    const predictions = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('prediction_')) {
            try {
                const prediction = JSON.parse(localStorage.getItem(key));
                predictions.push({
                    ...prediction,
                    key: key
                });
            } catch (e) {
                console.error('Failed to parse prediction:', e);
            }
        }
    }
    // timestamp 기준으로 내림차순 정렬 (최신순)
    return predictions.sort((a, b) => b.timestamp - a.timestamp);
}

// 이번주 예측 표시 함수
function displayCurrentPrediction() {
    const container = document.getElementById('currentPredictions');
    if (!container) {
        console.error('currentPredictions container not found');
        return;
    }

    const currentRound = getCurrentRound();
    const currentPredictions = [];

    // 이번주 예측 가져오기
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('prediction_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                const predictionDate = new Date(data.timestamp);
                
                // 이번주 예측만 필터링 (현재 시간 이후의 가장 가까운 회차)
                if (data.source === 'page4') {  // page4에서 온 예측만 표시
                    currentPredictions.push({
                        userName: data.userName || '익명 사용자',
                        numbers: data.numbers,
                        timestamp: data.timestamp
                    });
                }
            } catch (e) {
                console.error('Failed to parse prediction:', e);
            }
        }
    }

    // 시간순 정렬 (최신순)
    currentPredictions.sort((a, b) => b.timestamp - a.timestamp);

    // 결과 표시
    container.innerHTML = ''; // 기존 내용 삭제

    if (currentPredictions.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.style.textAlign = 'center';
        noDataMessage.style.padding = '20px';
        noDataMessage.style.color = '#aaa';
        noDataMessage.textContent = '이번주 예측 데이터가 없습니다.';
        container.appendChild(noDataMessage);
        return;
    }

    currentPredictions.forEach((prediction) => {
        const predictionItem = document.createElement('div');
        predictionItem.className = 'prediction-item';
        
        predictionItem.innerHTML = `
            <div class="user-info">
                <div class="user-name">${prediction.userName}</div>
                <div class="prediction-time">${new Date(prediction.timestamp).toLocaleString()}</div>
            </div>
            <div class="prediction-numbers">
                ${prediction.numbers.map(num => `
                    <div class="number-ball">${num}</div>
                `).join('')}
            </div>
        `;

        container.appendChild(predictionItem);
    });
}

// 전체 예측 기록 표시 함수
function displayPredictions() {
    const container = document.getElementById('allPredictions');
    if (!container) return;

    const allPredictions = [];
    const currentRound = getCurrentRound();

    // 모든 예측 가져오기
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('prediction_')) {
            const data = JSON.parse(localStorage.getItem(key));
            const predictionDate = new Date(data.timestamp);
            const round = getRoundForDate(predictionDate);
            
            if (round < currentRound) {  // 이전 회차만 포함
                const matches = calculateMatches(data.numbers, round);
                allPredictions.push({
                    userName: data.userName || '익명 사용자',
                    numbers: data.numbers,
                    matches: matches,
                    timestamp: data.timestamp,
                    round: round
                });
            }
        }
    }

    // 회차별로 그룹화
    const groupedPredictions = {};
    allPredictions.forEach(prediction => {
        if (!groupedPredictions[prediction.round]) {
            groupedPredictions[prediction.round] = [];
        }
        groupedPredictions[prediction.round].push(prediction);
    });

    // 기존 결과 제거
    const oldResults = container.querySelectorAll('.round-group');
    oldResults.forEach(item => item.remove());

    // 회차별로 결과 표시
    Object.keys(groupedPredictions)
        .sort((a, b) => b - a)  // 최신 회차부터 표시
        .forEach(round => {
            const roundGroup = document.createElement('div');
            roundGroup.className = 'round-group';
            
            const roundHeader = document.createElement('div');
            roundHeader.className = 'round-header';
            roundHeader.innerHTML = `
                <h3>${round}회 예측 결과</h3>
                <div class="winning-numbers">
                    당첨번호: ${당첨번호_데이터[round]?.map(num => `
                        <div class="number-ball winning-number">${num}</div>
                    `).join('') || '데이터 없음'}
                </div>
            `;
            roundGroup.appendChild(roundHeader);

            // 맞춘 개수로 정렬
            const sortedPredictions = groupedPredictions[round].sort((a, b) => 
                b.matches.regular - a.matches.regular
            );

            sortedPredictions.forEach(prediction => {
                const predictionItem = document.createElement('div');
                predictionItem.className = 'prediction-item';
                
                predictionItem.innerHTML = `
                    <div class="user-info">
                        <div class="user-name">${prediction.userName}</div>
                        <div class="match-count">${prediction.matches.regular}개 일치</div>
                    </div>
                    <div class="prediction-numbers">
                        ${prediction.numbers.map(num => `
                            <div class="number-ball ${당첨번호_데이터[round]?.includes(num) ? 'winning-number' : ''}">${num}</div>
                        `).join('')}
                    </div>
                `;

                roundGroup.appendChild(predictionItem);
            });

            container.appendChild(roundGroup);
        });

    if (Object.keys(groupedPredictions).length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.style.textAlign = 'center';
        noDataMessage.style.padding = '20px';
        noDataMessage.style.color = '#aaa';
        noDataMessage.textContent = '예측 기록이 없습니다.';
        container.appendChild(noDataMessage);
    }
}

// 날짜에 해당하는 회차 계산
function getRoundForDate(date) {
    const baseDate = new Date('2024-04-14'); // 1167회 당첨일
    const baseRound = 1167;
    const diffWeeks = Math.floor((date - baseDate) / (7 * 24 * 60 * 60 * 1000));
    return baseRound + diffWeeks;
}

function updateUserName(predictionId, button) {
    const input = button.previousElementSibling;
    const newName = input.value.trim();
    
    if (!newName) {
        alert('아이디를 입력해주세요.');
        return;
    }
    
    try {
        const predictionData = JSON.parse(localStorage.getItem(predictionId));
        predictionData.userName = newName;
        localStorage.setItem(predictionId, JSON.stringify(predictionData));
        
        // 화면 새로고침
        displayCurrentPrediction();
        displayPredictions();
    } catch (e) {
        console.error('Failed to update username:', e);
        alert('아이디 저장에 실패했습니다.');
    }
}

// 당첨번호 데이터
const 당첨번호_데이터 = {
    1167: [2, 4, 15, 23, 29, 38],
    1166: [1, 8, 13, 36, 44, 45],
    1165: [6, 12, 19, 23, 34, 42],
    1164: [14, 21, 35, 36, 40, 44],
    1163: [3, 14, 17, 20, 24, 31],
    1162: [2, 12, 19, 24, 39, 44],
    1161: [7, 9, 20, 25, 36, 39],
    1160: [11, 19, 21, 27, 28, 36]
};

// 현재 회차 계산 함수
function getCurrentRound() {
    const baseDate = new Date('2024-04-14'); // 1167회 당첨일
    const baseRound = 1167;
    const today = new Date();
    const diffWeeks = Math.floor((today - baseDate) / (7 * 24 * 60 * 60 * 1000));
    return baseRound + diffWeeks;
}

// 날짜 범위 계산 함수
function getDateRangeForRound(round) {
    const baseDate = new Date('2024-04-14'); // 1167회 당첨일
    const weekDiff = round - 1167;
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() + (weekDiff * 7) + 1); // 다음주 월요일
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 다음주 일요일
    return {
        start: startDate,
        end: endDate
    };
}

// 맞춘 개수 계산 함수
function calculateMatches(numbers, round) {
    const winningNumbers = 당첨번호_데이터[round];
    if (!winningNumbers) return { regular: 0 };

    const regularMatches = numbers.filter(num => winningNumbers.includes(num)).length;
    return {
        regular: regularMatches
    };
}

// 저번주 예상번호 결과 표시 함수
function displayLastWeekResults() {
    const resultsContainer = document.getElementById('lastWeekResults');
    if (!resultsContainer) return;

    const lastWeekPredictions = [];
    const currentRound = getCurrentRound();

    // 저번주 예측 가져오기
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('prediction_')) {
            const data = JSON.parse(localStorage.getItem(key));
            const predictionDate = new Date(data.timestamp);
            
            // 저번주 예측만 필터링
            if (predictionDate >= getDateRangeForRound(currentRound - 1).start && 
                predictionDate <= getDateRangeForRound(currentRound - 1).end) {
                const matches = calculateMatches(data.numbers, currentRound - 1);
                lastWeekPredictions.push({
                    userName: data.userName || '익명 사용자',
                    numbers: data.numbers,
                    matches: matches,
                    timestamp: data.timestamp
                });
            }
        }
    }

    // 맞춘 개수로 정렬
    lastWeekPredictions.sort((a, b) => b.matches.regular - a.matches.regular);

    // 기존 결과 제거
    const oldResults = resultsContainer.querySelectorAll('.result-item');
    oldResults.forEach(item => item.remove());

    // 결과 표시
    lastWeekPredictions.forEach((prediction, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        resultItem.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="user-info">
                <div class="user-name">${prediction.userName}</div>
                <div class="prediction-numbers">
                    ${prediction.numbers.map(num => `
                        <div class="number-ball ${당첨번호_데이터[currentRound - 1]?.includes(num) ? 'winning-number' : ''}">${num}</div>
                    `).join('')}
                </div>
            </div>
            <div class="match-count">
                ${prediction.matches.regular}개 일치
            </div>
        `;

        resultsContainer.appendChild(resultItem);
    });

    if (lastWeekPredictions.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.style.textAlign = 'center';
        noDataMessage.style.padding = '20px';
        noDataMessage.style.color = '#aaa';
        noDataMessage.textContent = '저번주 예측 데이터가 없습니다.';
        resultsContainer.appendChild(noDataMessage);
    }
}

// 관리자 관련 함수들
function showPasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('adminPassword').focus();
}

function hidePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

function checkPassword() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'knue2000') {
        hidePasswordModal();
        showAdminForm();
    } else {
        alert('비밀번호가 올바르지 않습니다.');
        document.getElementById('adminPassword').value = '';
    }
}

function showAdminForm() {
    const adminForm = document.querySelector('.admin-input-form');
    if (adminForm) {
        adminForm.style.display = 'block';
    }
}

// ... existing code ... 