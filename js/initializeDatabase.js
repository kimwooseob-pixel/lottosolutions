// Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyAwh55rLOQkY8ZVCzaC4ZF3iaUVU5Vu0GM",
    authDomain: "ai-lottosolutions.firebaseapp.com",
    databaseURL: "https://ai-lottosolutions-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ai-lottosolutions",
    storageBucket: "ai-lottosolutions.appspot.com",
    messagingSenderId: "616782090306",
    appId: "1:616782090306:web:688c710998dfce8e4d5ddb"
};

// Firebase 앱이 이미 초기화되었는지 확인
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Firebase Database 참조 생성
const database = firebase.database();

// 로또 당첨번호 데이터
const winningNumbers = {
    "1168": [9, 21, 24, 30, 33, 37],
    "1167": [8, 23, 31, 35, 39, 40],
    "1166": [14, 23, 25, 27, 29, 42],
    "1165": [6, 7, 27, 29, 38, 45],
    "1164": [17, 18, 23, 25, 38, 39],
    "1163": [2, 13, 15, 16, 33, 43],
    "1162": [20, 21, 22, 25, 28, 29],
    "1161": [2, 12, 20, 24, 34, 42],
    "1160": [7, 13, 18, 36, 39, 45],
    "1159": [3, 9, 27, 28, 38, 39],
    "1158": [21, 25, 27, 32, 37, 38],
    "1157": [5, 7, 12, 20, 25, 26],
    "1156": [30, 31, 34, 39, 41, 45],
    "1155": [10, 16, 19, 27, 37, 38],
    "1154": [4, 8, 22, 26, 32, 38]
};

// 현재 회차 정보
const currentDraw = {
    number: "1168",
    lastUpdated: Date.now()
};

// 회차 범위 정보 (최근 15회차만 표시)
const drawRange = {
    start: "1154",
    end: "1168",
    prediction: "1169"
};

// 시스템 업데이트 정보
const systemUpdate = {
    type: "initialize",
    timestamp: Date.now(),
    draw: "1168"
};

// Firebase에 데이터 저장
const updates = {
    '/winningNumbers': winningNumbers,
    '/currentDraw': currentDraw,
    '/drawRange': drawRange,
    '/systemUpdate': systemUpdate
};

// 페이지 로드 시 자동으로 초기화 실행
window.addEventListener('load', function() {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status';
    statusDiv.textContent = '초기화 중...';

    // 데이터베이스 업데이트
    database.ref().update(updates)
        .then(() => {
            statusDiv.className = 'status success';
            statusDiv.textContent = '데이터베이스 초기화가 완료되었습니다.';
            console.log('데이터베이스 초기화 완료');
        })
        .catch((error) => {
            statusDiv.className = 'status error';
            statusDiv.textContent = '초기화 중 오류가 발생했습니다: ' + error.message;
            console.error('데이터베이스 초기화 실패:', error);
        });
}); 