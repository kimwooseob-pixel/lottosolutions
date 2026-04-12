// 페이지5의 예측 번호 표시 및 순위 관리
// Firestore 문서 읽기 시 RTDB와 동일한 필드 해석 (읽기 전용, DB 쓰기 미사용)
function readWinningNumbersField(val) {
    if (val == null) return [];
    const numbers = val.numbers ? val.numbers : val;
    return Array.isArray(numbers) ? numbers : [];
}
function readDrawNumberField(val) {
    if (val == null) return null;
    const draw = val.drawNumber != null ? val.drawNumber : val;
    return draw;
}

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('modalOverlay')) return;

    console.log('페이지5 로드됨');
    
    // 현재 로그인한 유저 가져오기
    let currentUser = '';
    const auth = firebase.auth();
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user.displayName || user.email || localStorage.getItem('userId') || '익명';
            console.log('로그인된 유저:', currentUser);
        }
    });
    
    // Firestore에서 데이터 가져오기
    loadDataFromFirestore();
    
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

    // 관리자 모드 진입 시 회차 표시 갱신
    const adminDot = document.querySelector('.admin-dot');
    adminDot.addEventListener('click', async function() {
        await updateDrawLabel();
    });
    
    // 당첨번호 저장 버튼 클릭 시 Firestore에 저장
    const saveWinningNumbers = document.getElementById('saveWinningNumbers');
    const numberInputs = document.querySelectorAll('.number-input-container input[type="number"]');
    saveWinningNumbers.addEventListener('click', async function() {
        const numbers = Array.from(numberInputs).map(input => parseInt(input.value));
        if (numbers.some(num => isNaN(num) || num < 1 || num > 45)) {
            alert('1부터 45 사이의 숫자를 입력해주세요.');
            return;
        }
        if (new Set(numbers).size !== 6) {
            alert('중복되지 않는 6개의 숫자를 입력해주세요.');
            return;
        }
        numbers.sort((a, b) => a - b);
        const nextDrawNumber = await updateDrawLabel();
        const winningNumber = {
            drawNumber: nextDrawNumber,
            numbers: numbers,
            timestamp: new Date().getTime()
        };
        try {
            await db.collection('lotto_numbers').doc(nextDrawNumber.toString()).set(winningNumber);
            alert('당첨번호가 저장되었습니다.');
            // Firestore에서 최신 번호로 UI 갱신
            await updateWinningNumberSection();
            
            // 현재 예측과 당첨번호 비교하여 완전일치 확인
            await checkForPerfectMatches(numbers);
        } catch (e) {
            alert('저장 실패: ' + e.message);
        }
    });
    
    // 예측번호 저장 버튼 클릭 이벤트
    const confirmButton = document.querySelector('.confirm-button');
    confirmButton.addEventListener('click', savePredictionToFirestore);
    
    // Firestore에서 최신 당첨번호 불러와서 UI에 표시
    async function updateWinningNumberSection() {
        const snapshot = await db.collection('lotto_numbers').orderBy('drawNumber', 'desc').limit(1).get();
        if (!snapshot.empty) {
            const latest = snapshot.docs[0].data();
            const draw = readDrawNumberField(latest);
            const nums = readWinningNumbersField(latest);
            const winningNumberTitle = document.querySelector('.section-header');
            if (winningNumberTitle && draw != null) winningNumberTitle.textContent = `${draw}회차 당첨번호`;
            const lastWeekNumbers = document.querySelector('.last-week-numbers');
            if (lastWeekNumbers) lastWeekNumbers.innerHTML = nums.map(num => `<div class="number-ball">${num}</div>`).join('');
        }
    }
    
    // 페이지 로드 시 Firestore에서 최신 당첨번호 표시
    updateWinningNumberSection();
    
    // Firestore에서 예측 데이터 불러오기
    async function loadDataFromFirestore() {
        try {
            // 현재 예측 데이터 불러오기
            const predictionsSnapshot = await db.collection('predictions').get();
            
            // 완전일치 번호 불러오기
            const perfectMatchesSnapshot = await db.collection('perfect_matches').get();
            
            // 완전일치 목록 표시
            displayPerfectMatchesFromFirestore(perfectMatchesSnapshot);
            
            // 현재 예측 표시
            displayCurrentPredictionsFromFirestore(predictionsSnapshot);
        } catch (e) {
            console.error('Firestore 데이터 로드 실패:', e);
        }
    }
    
    // Firestore에서 현재 예측 표시
    function displayCurrentPredictionsFromFirestore(snapshot) {
        const predictionsContainer = document.getElementById('thisWeekPredictions');
        const inputForm = document.getElementById('predictionInputForm');
        
        // 기존 예측들만 제거 (입력 폼 제외)
        const predictions = Array.from(predictionsContainer.children)
            .filter(child => child.id !== 'predictionInputForm');
        predictions.forEach(pred => pred.remove());
        
        // Firestore에서 가져온 예측 표시
        snapshot.forEach(doc => {
            const prediction = doc.data();
            const predictionElement = document.createElement('div');
            predictionElement.className = 'prediction-row';

            const predNums = readWinningNumbersField(prediction);
            const numbersHtml = predNums.map(num =>
                `<div class="number-ball">${num}</div>`
            ).join('');

            predictionElement.innerHTML = `
                <div class="user-name">${prediction.userName}</div>
                <div class="prediction-numbers">
                    ${numbersHtml}
                </div>
                <div class="timestamp">${new Date(prediction.timestamp).toLocaleString()}</div>
            `;
            predictionsContainer.appendChild(predictionElement);
        });
    }
    
    // Firestore에서 완전일치 번호 표시
    function displayPerfectMatchesFromFirestore(snapshot) {
        const perfectMatchList = document.getElementById('perfectMatchList');
        
        if (snapshot.empty) {
            perfectMatchList.innerHTML = '<div class="no-match-message">아직 완전일치 번호가 없습니다.</div>';
            return;
        }
        
        perfectMatchList.innerHTML = '';
        
        // Firestore 문서를 배열로 변환
        const perfectMatches = [];
        snapshot.forEach(doc => {
            perfectMatches.push(doc.data());
        });
        
        // 최신순으로 정렬
        perfectMatches.sort((a, b) => b.timestamp - a.timestamp);
        
        perfectMatches.forEach(match => {
            const matchElement = document.createElement('div');
            matchElement.className = 'prediction-row perfect-match';

            const matchNums = readWinningNumbersField(match);
            const numbersHtml = matchNums.map(num =>
                `<div class="number-ball winning-number">${num}</div>`
            ).join('');
            
            // 다음 회차 번호가 있으면 표시
            let nextNumbersHtml = '';
            if (match.next_numbers && match.next_numbers.length > 0) {
                nextNumbersHtml = `
                    <div style="margin-top: 10px; font-size: 0.85rem; color: #aaa;">다음 회차 예상번호:</div>
                    <div class="prediction-numbers" style="margin-top: 5px;">
                        ${match.next_numbers.map(num => 
                            `<div class="number-ball" style="background-color: #555;">${num}</div>`
                        ).join('')}
                    </div>
                `;
            }
            
            matchElement.innerHTML = `
                <div class="user-name">${match.userName}</div>
                <div class="prediction-numbers">
                    ${numbersHtml}
                </div>
                <div class="perfect-match-badge">완전일치</div>
                ${nextNumbersHtml}
                <div class="timestamp">${new Date(match.timestamp).toLocaleString()}</div>
            `;
            perfectMatchList.appendChild(matchElement);
        });
    }
    
    // 당첨번호와 현재 예측 비교해서 완전일치 확인
    async function checkForPerfectMatches(winningNumbers) {
        try {
            const predictionsSnapshot = await db.collection('predictions').get();
            
            predictionsSnapshot.forEach(async (doc) => {
                const prediction = doc.data();

                const userNumbers = readWinningNumbersField(prediction);
                const matches = userNumbers.filter(num => winningNumbers.includes(num)).length;
                
                if (matches === 6) {
                    console.log('완전일치 발견!', prediction);
                    
                    // 완전일치 데이터 저장
                    const perfectMatch = {
                        userName: prediction.userName,
                        numbers: userNumbers,
                        timestamp: new Date().getTime(),
                        drawNumber: getCurrentRound(),
                        next_numbers: [] // 다음 회차 예상번호 (필요시 추가)
                    };
                    
                    await db.collection('perfect_matches').add(perfectMatch);
                }
            });
        } catch (e) {
            console.error('완전일치 확인 오류:', e);
        }
    }
    
    // 예측번호를 Firestore에 저장
    async function savePredictionToFirestore() {
        try {
            // 로그인 확인
            if (!currentUser) {
                alert('로그인이 필요합니다.');
                return;
            }
            
            const predictionNumbers = document.querySelector('#predictionInputForm .prediction-numbers');
            const numbers = Array.from(predictionNumbers.querySelectorAll('.number-ball'))
                .map(ball => parseInt(ball.textContent));

            if (numbers.length !== 6) {
                alert('6개의 번호를 모두 선택해주세요.');
                return;
            }

            const prediction = {
                userName: currentUser,
                numbers: numbers,
                timestamp: new Date().getTime(),
                drawNumber: getCurrentRound()
            };

            // Firestore에 저장
            await db.collection('predictions').add(prediction);
            
            // UI 업데이트
            alert('예측번호가 저장되었습니다.');
            document.getElementById('predictionInputForm').style.display = 'none';
            
            // 데이터 다시 불러오기
            const predictionsSnapshot = await db.collection('predictions').get();
            displayCurrentPredictionsFromFirestore(predictionsSnapshot);
        } catch (e) {
            console.error('예측번호 저장 실패:', e);
            alert('저장에 실패했습니다: ' + e.message);
        }
    }
    
    // 페이지4에서 선택한 번호 표시
    function displayPage4Selection() {
        const predictionNumbers = document.querySelector('#predictionInputForm .prediction-numbers');
        if (!predictionNumbers) return;

        // localStorage에서 가장 최근의 prediction 찾기
        const keys = Object.keys(localStorage).filter(key => key.startsWith('prediction_'));
        if (keys.length > 0) {
            // 가장 최근의 키 찾기 (timestamp가 가장 큰 것)
            const latestKey = keys.reduce((a, b) => {
                const timeA = parseInt(a.split('_')[1]);
                const timeB = parseInt(b.split('_')[1]);
                return timeA > timeB ? a : b;
            });

            const prediction = JSON.parse(localStorage.getItem(latestKey));
            if (prediction && prediction.source === 'page4') {
                // 예측 번호 표시 업데이트
                predictionNumbers.innerHTML = prediction.numbers.map(num => 
                    `<div class="number-ball">${num}</div>`
                ).join('');
            }
        }
    }
    
    // 초기 데이터 표시
    displayPage4Selection();
    
    // Firestore 실시간 업데이트
    db.collection('predictions').onSnapshot(snapshot => {
        const predictionsSnapshot = snapshot;
        displayCurrentPredictionsFromFirestore(predictionsSnapshot);
    });
    
    db.collection('perfect_matches').onSnapshot(snapshot => {
        const perfectMatchesSnapshot = snapshot;
        displayPerfectMatchesFromFirestore(perfectMatchesSnapshot);
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
    resultsContainer.innerHTML = '';

    // 1~3등 카드
    const top3 = lastWeekPredictions.slice(0, 3);
    if (top3.length > 0) {
        const top3Container = document.createElement('div');
        top3Container.className = 'top3-container';
        top3.forEach((prediction, idx) => {
            const card = document.createElement('div');
            card.className = `top3-card rank-${idx+1}`;
            let trophyImg = '';
            if (idx === 0) trophyImg = '<img src="../images/gold.png" class="top3-trophy" alt="1등">';
            else if (idx === 1) trophyImg = '<img src="../images/silver.png" class="top3-trophy" alt="2등">';
            else if (idx === 2) trophyImg = '<img src="../images/bronze.png" class="top3-trophy" alt="3등">';
            card.innerHTML = `
                <div class="top3-rank">${idx+1}</div>
                ${trophyImg}
                <div class="top3-name">${prediction.userName}</div>
                <div class="top3-score">${prediction.matches.regular}개 일치</div>
                <div class="prediction-numbers">
                    ${prediction.numbers.map(num => `<div class="number-ball ${당첨번호_데이터[currentRound-1]?.includes(num) ? 'winning-number' : ''}">${num}</div>`).join('')}
                </div>
            `;
            top3Container.appendChild(card);
        });
        resultsContainer.appendChild(top3Container);
    }

    // 4등 이하 리스트
    if (lastWeekPredictions.length > 3) {
        const list = document.createElement('div');
        list.className = 'ranking-list';
        lastWeekPredictions.slice(3).forEach((prediction, idx) => {
            const row = document.createElement('div');
            row.className = 'ranking-row';
            row.innerHTML = `
                <span class="rank-badge">${idx+4}</span>
                <span class="user-name">${prediction.userName}</span>
                <span class="match-count">${prediction.matches.regular}개 일치</span>
                <span class="prediction-numbers">
                    ${prediction.numbers.map(num => `<span class="number-ball ${당첨번호_데이터[currentRound-1]?.includes(num) ? 'winning-number' : ''}">${num}</span>`).join('')}
                </span>
            `;
            list.appendChild(row);
        });
        resultsContainer.appendChild(list);
    }

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

// Firebase 설정 (Firestore 레거시 페이지용; page5.html은 인라인에서 이미 초기화)
const firebaseConfig = {
    apiKey: "AIzaSyAwh55rLOQkY8ZVCzaC4ZF3iaUVU5Vu0GM",
    authDomain: "ai-lottosolutions.firebaseapp.com",
    databaseURL: "https://ai-lottosolutions-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ai-lottosolutions",
    storageBucket: "ai-lottosolutions.firebasestorage.app",
    messagingSenderId: "616782090306",
    appId: "1:616782090306:web:688c710998dfce8e4d5ddb",
    measurementId: "G-NEXMN4FFJG"
};

if (typeof firebase !== 'undefined') {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
    } catch (e) { /* 이미 초기화됨 */ }
}
const db = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;

// Firestore에서 최신 회차 불러오기 및 drawLabel 표시
async function updateDrawLabel() {
    const drawLabel = document.getElementById('drawLabel');
    let nextDrawNumber = 1171;
    if (!db) {
        if (drawLabel) drawLabel.textContent = `${nextDrawNumber}회차 당첨번호 입력`;
        return nextDrawNumber;
    }
    try {
        const snapshot = await db.collection('lotto_numbers').orderBy('drawNumber', 'desc').limit(1).get();
        if (!snapshot.empty) {
            const latest = snapshot.docs[0].data();
            const draw = readDrawNumberField(latest);
            const d = parseInt(draw, 10);
            if (Number.isFinite(d)) nextDrawNumber = d + 1;
        }
    } catch (e) { console.error(e); }
    if (drawLabel) drawLabel.textContent = `${nextDrawNumber}회차 당첨번호 입력`;
    return nextDrawNumber;
}

// --- page5.html RTDB 랭킹 대시보드 (읽기 전용) ---
(function () {
    const 기본당첨번호 = {
        '1153': [2, 8, 19, 22, 32, 42],
        '1154': [6, 10, 12, 14, 20, 42],
        '1155': [17, 25, 33, 35, 38, 45],
        '1156': [1, 4, 29, 39, 43, 45],
        '1157': [7, 15, 30, 37, 39, 44],
        '1158': [8, 13, 18, 24, 27, 29],
        '1159': [8, 11, 15, 16, 17, 37],
        '1160': [8, 11, 16, 19, 21, 25],
        '1161': [9, 11, 30, 31, 41, 44],
        '1162': [15, 23, 29, 34, 40, 44],
        '1163': [9, 12, 15, 25, 34, 36],
        '1164': [1, 9, 12, 26, 35, 38],
        '1165': [5, 11, 18, 20, 35, 45],
        '1166': [21, 22, 26, 34, 36, 41],
        '1167': [3, 11, 14, 18, 26, 27]
    };

    function 당첨엔트리를번호배열로(entry) {
        if (entry == null) return null;
        const numbers = entry.numbers ? entry.numbers : entry;
        return Array.isArray(numbers) ? numbers : null;
    }

    function 당첨번호맵정규화(raw) {
        const out = {};
        if (!raw || typeof raw !== 'object') return out;
        for (const key of Object.keys(raw)) {
            const nums = 당첨엔트리를번호배열로(raw[key]);
            if (nums && nums.length) out[String(key)] = nums;
        }
        return out;
    }

    async function get턴정보(rtdb) {
        const defaults = { start: '1154', end: '1168', next: '1169' };
        try {
            const snapshot = await rtdb.ref('drawRange').once('value');
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (!data || typeof data !== 'object') return defaults;
                let nextRaw = data.next;
                if (nextRaw == null && data.prediction != null) nextRaw = data.prediction;
                const s = parseInt(data.start, 10);
                const e = parseInt(data.end, 10);
                const n = parseInt(nextRaw, 10);
                return {
                    start: Number.isFinite(s) ? String(s) : String(data.start),
                    end: Number.isFinite(e) ? String(e) : String(data.end),
                    next: Number.isFinite(n) ? String(n) : (nextRaw != null ? String(nextRaw) : defaults.next)
                };
            }
        } catch (e) {
            console.error('턴 정보 가져오기 실패:', e);
        }
        return defaults;
    }

    function normalizeNumbers(arr) {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 45);
    }

    function countMatches(predNums, winNums) {
        const w = new Set(normalizeNumbers(winNums));
        return normalizeNumbers(predNums).filter(n => w.has(n)).length;
    }

    function appendRankBalls(parent, numbers, kind) {
        if (!parent) return;
        parent.innerHTML = '';
        const nums = normalizeNumbers(numbers).slice(0, 6);
        nums.forEach((n, i) => {
            const span = document.createElement('span');
            if (kind === 'win') {
                span.className = 'rank-ball rank-ball--win';
            } else {
                span.className = 'rank-ball rank-ball--' + (i % 2 === 0 ? 'pred' : 'pred-alt');
            }
            span.textContent = String(n);
            parent.appendChild(span);
        });
    }

    let rankingListenersOn = false;

    async function renderRankingPanels(rtdb) {
        const winningBalls = document.getElementById('winning-balls');
        if (!winningBalls || !rtdb) return;

        try {
            const [턴정보, winSnap, cdSnap, predSnap] = await Promise.all([
                get턴정보(rtdb),
                rtdb.ref('winningNumbers').once('value'),
                rtdb.ref('currentDraw').once('value'),
                rtdb.ref('predictions').once('value')
            ]);

            const winningMap = 당첨번호맵정규화(winSnap.val() || {});

            let displayDraw = 턴정보.end;
            if (cdSnap.exists()) {
                const cd = cdSnap.val();
                const d = cd != null && typeof cd === 'object' && cd.drawNumber != null ? cd.drawNumber : cd;
                if (d != null && d !== '') displayDraw = String(d);
            }

            const titleEl = document.getElementById('winning-section-title');
            if (titleEl) titleEl.textContent = `${displayDraw}회차 당첨번호`;

            const winNums = winningMap[displayDraw] || 기본당첨번호[displayDraw] || [];
            if (normalizeNumbers(winNums).length === 0) {
                winningBalls.innerHTML = '<p class="empty-hint">등록된 당첨번호가 없습니다.</p>';
            } else {
                appendRankBalls(winningBalls, winNums, 'win');
            }

            const preds = [];
            if (predSnap.exists()) {
                predSnap.forEach(child => {
                    preds.push({ id: child.key, ...child.val() });
                });
            }

            const myList = document.getElementById('my-history-list');
            if (myList) {
                myList.innerHTML = '';
                const myUid = sessionStorage.getItem('userUid');
                if (!myUid) {
                    const p = document.createElement('p');
                    p.className = 'empty-hint';
                    p.textContent = '로그인 후 나의 예측 내역이 표시됩니다.';
                    myList.appendChild(p);
                } else {
                    const mine = preds.filter(p => p.userId === myUid);
                    mine.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                    if (mine.length === 0) {
                        const p = document.createElement('p');
                        p.className = 'empty-hint';
                        p.textContent = '저장된 예측이 없습니다.';
                        myList.appendChild(p);
                    } else {
                        mine.forEach(p => {
                            const row = document.createElement('div');
                            row.className = 'history-row';
                            const drawLabel = document.createElement('span');
                            drawLabel.className = 'history-draw';
                            const dno = p.drawNo != null ? String(p.drawNo) : '—';
                            drawLabel.textContent = `${dno}회`;
                            const balls = document.createElement('div');
                            balls.className = 'ball-row';
                            appendRankBalls(balls, p.numbers, 'pred');
                            const status = document.createElement('span');
                            status.className = 'history-status';
                            const wk = p.drawNo != null ? String(p.drawNo) : '';
                            const wnums = winningMap[wk];
                            if (!wk || !wnums || wnums.length === 0) {
                                status.classList.add('history-status--wait');
                                status.textContent = '대기중';
                            } else {
                                const m = countMatches(p.numbers, wnums);
                                status.classList.add('history-status--hit');
                                status.textContent = `${m}개 일치`;
                            }
                            row.appendChild(drawLabel);
                            row.appendChild(balls);
                            row.appendChild(status);
                            myList.appendChild(row);
                        });
                    }
                }
            }

            const nextDraw = String(턴정보.next || '');
            const sub = document.getElementById('top6-subhint');
            if (sub) sub.textContent = nextDraw ? `${nextDraw}회차 예측에서 집계` : '회차 정보 없음';

            const top6Grid = document.getElementById('top6-grid');
            if (top6Grid) {
                top6Grid.innerHTML = '';
                const forNext = preds.filter(p => p.drawNo != null && String(p.drawNo) === nextDraw);
                const freq = {};
                for (let i = 1; i <= 45; i++) freq[i] = 0;
                forNext.forEach(p => {
                    normalizeNumbers(p.numbers).forEach(n => {
                        if (freq[n] != null) freq[n]++;
                    });
                });
                const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);
                if (sorted.length === 0 || sorted.every(([, c]) => c === 0)) {
                    const ph = document.createElement('p');
                    ph.className = 'empty-hint';
                    ph.textContent = '해당 회차 예측 데이터가 없습니다.';
                    top6Grid.appendChild(ph);
                } else {
                    sorted.forEach(([num, cnt]) => {
                        const item = document.createElement('div');
                        item.className = 'top6-item';
                        const b = document.createElement('span');
                        b.className = 'rank-ball rank-ball--top';
                        b.textContent = num;
                        const c = document.createElement('span');
                        c.className = 'top6-count';
                        c.textContent = `${cnt}명`;
                        item.appendChild(b);
                        item.appendChild(c);
                        top6Grid.appendChild(item);
                    });
                }
            }

            const userBest = {};
            preds.forEach(p => {
                const wk = p.drawNo != null ? String(p.drawNo) : '';
                const wnums = winningMap[wk];
                if (!wk || !wnums || !p.numbers) return;
                const m = countMatches(p.numbers, wnums);
                const uid = p.userId || `nick:${p.nickname || p.userName || 'anon'}`;
                const name = p.nickname || p.userName || '익명';
                if (!userBest[uid] || m > userBest[uid].maxMatch) {
                    userBest[uid] = { nickname: name, maxMatch: m, numbers: p.numbers, drawNo: wk };
                }
            });
            const topUsers = Object.values(userBest)
                .filter(u => u.maxMatch > 0)
                .sort((a, b) => b.maxMatch - a.maxMatch)
                .slice(0, 3);

            const topUsersList = document.getElementById('top-users-list');
            if (topUsersList) {
                topUsersList.innerHTML = '';
                if (topUsers.length === 0) {
                    const ph = document.createElement('p');
                    ph.className = 'empty-hint';
                    ph.textContent = '당첨이 확정된 회차의 예측 비교 결과가 없습니다.';
                    topUsersList.appendChild(ph);
                } else {
                    const medals = ['🥇', '🥈', '🥉'];
                    topUsers.forEach((u, i) => {
                        const block = document.createElement('div');
                        block.className = 'top-user-block';
                        const head = document.createElement('div');
                        head.className = 'top-user-head';
                        const med = document.createElement('span');
                        med.className = 'medal';
                        med.textContent = medals[i];
                        const nm = document.createElement('span');
                        nm.className = 'top-user-name';
                        nm.textContent = u.nickname;
                        const mt = document.createElement('span');
                        mt.className = 'top-user-matches';
                        mt.textContent = `${u.maxMatch}개 맞춤`;
                        head.appendChild(med);
                        head.appendChild(nm);
                        head.appendChild(mt);
                        const subRow = document.createElement('div');
                        subRow.className = 'ball-row';
                        appendRankBalls(subRow, u.numbers, 'pred');
                        const cap = document.createElement('div');
                        cap.className = 'empty-hint';
                        cap.style.marginTop = '6px';
                        cap.textContent = `${u.drawNo}회 예측 번호`;
                        block.appendChild(head);
                        block.appendChild(subRow);
                        block.appendChild(cap);
                        topUsersList.appendChild(block);
                    });
                }
            }
        } catch (e) {
            console.error('renderRankingPanels 오류:', e);
        }
    }

    function setupRankingRealtime(rtdb) {
        if (rankingListenersOn) {
            rtdb.ref('drawRange').off();
            rtdb.ref('winningNumbers').off();
            rtdb.ref('currentDraw').off();
            rtdb.ref('predictions').off();
        }
        const refresh = () => renderRankingPanels(rtdb);
        rtdb.ref('drawRange').on('value', refresh);
        rtdb.ref('winningNumbers').on('value', refresh);
        rtdb.ref('currentDraw').on('value', refresh);
        rtdb.ref('predictions').on('value', refresh);
        rankingListenersOn = true;
        refresh();
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!document.getElementById('winning-balls')) return;
        if (typeof firebase === 'undefined' || !firebase.database) return;
        const rtdb = firebase.database();
        setupRankingRealtime(rtdb);
    });
})();