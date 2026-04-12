// page4.js - 로또 패턴 분석 (1153회-1167회)
let 현재턴 = parseInt(localStorage.getItem('현재턴')) || 1;
const 총턴수 = 30;
const 체크포인트턴 = 10;
let 선택된번호들 = [];
let 힌트1활성화 = false;
let 힌트2활성화 = false;
let 힌트3활성화 = false;
let 힌트4활성화 = false;

// 캐시된 DOM 요소
let 격자컨테이너;
let 힌트버튼들;
let 턴표시엘리먼트;

// 실제 당첨번호 데이터 (기본 데이터)
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

// 동물 이미지 배열
const 동물이미지들 = ['fa1.png', 'fa2.png', 'fa3.png'];

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

/** RTDB winningNumbers/{회차}: { numbers, timestamp } 또는 구형 배열 */
function 당첨엔트리를번호배열로(entry) {
    if (entry == null) return null;
    const numbers = entry.numbers ? entry.numbers : entry;
    return Array.isArray(numbers) ? numbers : null;
}

/** 회차 문자열 키 → 번호 배열 맵 (Firebase + 구형 호환) */
function 당첨번호맵정규화(raw) {
    const out = {};
    if (!raw || typeof raw !== 'object') return out;
    for (const key of Object.keys(raw)) {
        const nums = 당첨엔트리를번호배열로(raw[key]);
        if (nums && nums.length) out[String(key)] = nums;
    }
    return out;
}

// 회차 정보 가져오기 (drawRange 문자열 필드 → parseInt 후 문자열 키로 통일)
async function get턴정보() {
    const defaults = { start: "1154", end: "1168", next: "1169" };
    try {
        const snapshot = await database.ref('drawRange').once('value');
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
    } catch (error) {
        console.error('턴 정보 가져오기 실패:', error);
    }
    return defaults;
}

// 당첨번호 가져오기
async function get실제당첨번호() {
    try {
        const snapshot = await database.ref('winningNumbers').once('value');
        if (snapshot.exists()) {
            return 당첨번호맵정규화(snapshot.val());
        }
    } catch (error) {
        console.error('당첨번호 가져오기 실패:', error);
    }
    return {};
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

async function renderRankingPanels() {
    const winningBalls = document.getElementById('winning-balls');
    if (!winningBalls) return;

    try {
        const [턴정보, winSnap, cdSnap, predSnap] = await Promise.all([
            get턴정보(),
            database.ref('winningNumbers').once('value'),
            database.ref('currentDraw').once('value'),
            database.ref('predictions').once('value')
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

async function 업데이트턴표시() {
    const 턴정보 = await get턴정보();
    console.log('현재 턴 정보:', 턴정보); // 디버깅용 로그 추가
    턴표시엘리먼트.textContent = `1턴 (${턴정보.start}회-${턴정보.end}회)`;
}

function 셀클릭(cell) {
    if (!cell.classList.contains('prediction-cell')) return;
    
    const 번호 = parseInt(cell.getAttribute('data-number'));
    if (isNaN(번호)) return;

    if (cell.classList.contains('selected')) {
        cell.classList.remove('selected');
        cell.style.backgroundColor = '#f8f9fa';
        cell.style.color = '#000';
        선택된번호들 = 선택된번호들.filter(n => n !== 번호);
    } else {
        if (선택된번호들.length >= 6) {
            alert('최대 6개의 번호만 선택할 수 있습니다.');
            return;
        }
        cell.classList.add('selected');
        cell.style.backgroundColor = '#3498db';
        cell.style.color = '#fff';
        선택된번호들.push(번호);
        
        if (선택된번호들.length === 6) {
            setTimeout(() => {
                완료();
            }, 500);
        }
    }
    
    console.log('현재 선택된 번호들:', 선택된번호들);
}

// 실시간 업데이트 리스너 설정
let listenersInitialized = false;
function setupRealtimeListeners() {
    if (listenersInitialized) {
        database.ref('drawRange').off();
        database.ref('winningNumbers').off();
        database.ref('currentDraw').off();
        database.ref('predictions').off();
    }

    database.ref('drawRange').on('value', snapshot => {
        if (snapshot.exists()) {
            console.log('회차 범위 업데이트:', snapshot.val());
            업데이트턴표시();
            renderRankingPanels();
        }
    });

    database.ref('winningNumbers').on('value', snapshot => {
        if (snapshot.exists()) {
            console.log('당첨번호 업데이트 감지');
            초기화();
            renderRankingPanels();
        }
    });

    database.ref('currentDraw').on('value', () => {
        renderRankingPanels();
    });

    database.ref('predictions').on('value', () => {
        renderRankingPanels();
    });

    listenersInitialized = true;
    renderRankingPanels();
}

// 초기화 함수
async function 초기화() {
    console.log('초기화 함수 시작');
    
    // DOM 요소 캐시
    격자컨테이너 = document.querySelector('.grid-container');
    힌트버튼들 = document.querySelectorAll('.hint-button');
    턴표시엘리먼트 = document.getElementById('턴표시');
    
    if (!격자컨테이너) {
        console.error('격자 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    console.log('격자 컨테이너 찾음:', 격자컨테이너);
    
    격자컨테이너.innerHTML = '';
    선택된번호들 = [];
    
    try {
        const 턴정보 = await get턴정보();
        console.log('턴 정보:', 턴정보);
        
        const 실제당첨번호 = await get실제당첨번호();
        console.log('당첨번호 데이터:', 실제당첨번호);

        // 턴 표시 업데이트
        턴표시엘리먼트.textContent = `1턴 (${턴정보.start}회-${턴정보.end}회)`;

        const fragment = document.createDocumentFragment();
        
        // 헤더 행 추가
        for (let i = 0; i < 16; i++) {
            const header = document.createElement('div');
            header.className = 'grid-cell header';
            if (i < 15) {
                const 회차번호 = parseInt(턴정보.start) + i;
                header.textContent = 회차번호;
                header.style.cssText = `
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform: rotate(-45deg);
                    font-size: 8px;
                    font-weight: bold;
                    white-space: nowrap;
                    padding-bottom: 15px;
                    color: #333;
                `;
            } else {
                header.textContent = '예상';
                header.style.cssText = `
                    border-left: 2px solid #3498db;
                    background-color: #f8f9fa;
                    font-weight: bold;
                    color: #3498db;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 30px;
                    width: 30px;
                    padding: 0;
                    margin: 0;
                    white-space: nowrap;
                    overflow: visible;
                    position: relative;
                    z-index: 2;
                `;
            }
            fragment.appendChild(header);
        }

        // 번호 그리드 생성
        for (let num = 1; num <= 45; num++) {
            for (let col = 0; col < 16; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.setAttribute('data-number', num);
                
                if (col === 15) {
                    cell.textContent = num;
                    cell.classList.add('prediction-cell');
                    cell.style.cssText = `
                        border-left: 2px solid #3498db;
                        background-color: #f8f9fa;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        height: 30px;
                        width: 30px;
                        line-height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        position: relative;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        border-radius: 4px;
                        margin: 0;
                        padding: 0;
                        z-index: 3;
                    `;
                    cell.addEventListener('click', () => 셀클릭(cell));
                } else {
                    const 회차번호 = (parseInt(턴정보.start) + col).toString();
                    const 해당회차번호들 = 실제당첨번호[회차번호] || 기본당첨번호[회차번호];
                    
                    if (해당회차번호들 && 해당회차번호들.includes(num)) {
                        cell.classList.add('marked');
                        const circle = document.createElement('div');
                        circle.className = 'number-circle';
                        circle.textContent = num;
                        circle.style.cssText = `
                            width: 24px;
                            height: 24px;
                            border: 2px solid #e74c3c;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            color: #e74c3c;
                            background: white;
                            position: relative;
                            z-index: 1;
                        `;
                        cell.appendChild(circle);
                    }
                }
                fragment.appendChild(cell);
            }
        }

        격자컨테이너.appendChild(fragment);
        
    } catch (error) {
        console.error('격자 생성 중 오류 발생:', error);
    }
}

function 완료() {
    if (선택된번호들.length === 6) {
        // 선택된 번호들을 오름차순으로 정렬
        선택된번호들.sort((a, b) => a - b);
        
        // 예측 데이터 생성
        const predictionData = {
            numbers: 선택된번호들,
            timestamp: new Date().getTime(),
            userName: '익명 사용자',
            source: 'page4'  // 페이지 출처 표시
        };
        
        // 고유 ID로 저장
        const predictionId = `prediction_${new Date().getTime()}`;
        localStorage.setItem(predictionId, JSON.stringify(predictionData));
        
        // page5로 이동
        location.href = 'page5.html';
    }
}

function 힌트1() {
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

            const 거리 = Math.sqrt(
                Math.pow(끝X - 시작X, 2) + 
                Math.pow(끝Y - 시작Y, 2)
            );

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
                    background-color: #28a745;
                    position: absolute;
                    left: ${시작X - 격자Rect.left}px;
                    top: ${시작Y - 격자Rect.top - 두께/2}px;
                    transform: rotate(${각도 * 180 / Math.PI}deg);
                    transform-origin: left center;
                    z-index: 2;
                `;

                격자.appendChild(연결선);
            }
        });
    });
}

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

                const 거리12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const 거리23 = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2));
                const 거리13 = Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));

                if (거리12 <= 120 && 거리23 <= 120 && 거리13 <= 120) {
                    const 각도1 = Math.acos((거리12 * 거리12 + 거리23 * 거리23 - 거리13 * 거리13) / (2 * 거리12 * 거리23));
                    const 각도2 = Math.acos((거리23 * 거리23 + 거리13 * 거리13 - 거리12 * 거리12) / (2 * 거리23 * 거리13));
                    const 각도3 = Math.acos((거리13 * 거리13 + 거리12 * 거리12 - 거리23 * 거리23) / (2 * 거리13 * 거리12));

                    const 각도1도 = 각도1 * 180 / Math.PI;
                    const 각도2도 = 각도2 * 180 / Math.PI;
                    const 각도3도 = 각도3 * 180 / Math.PI;

                    if (각도1도 >= 140 || 각도2도 >= 140 || 각도3도 >= 140) {
                        const 연결선1 = document.createElement('div');
                        연결선1.className = 'angle-connection';
                        연결선1.style.cssText = `
                            width: ${거리12}px;
                            height: 4px;
                            background-color: #dc3545;
                            position: absolute;
                            left: ${x1 - 격자Rect.left}px;
                            top: ${y1 - 격자Rect.top}px;
                            transform: rotate(${Math.atan2(y2 - y1, x2 - x1)}rad);
                            transform-origin: left center;
                            z-index: 2;
                        `;
                        격자.appendChild(연결선1);

                        const 연결선2 = document.createElement('div');
                        연결선2.className = 'angle-connection';
                        연결선2.style.cssText = `
                            width: ${거리23}px;
                            height: 4px;
                            background-color: #dc3545;
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

function 힌트3() {
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
                
                const 연결선수 = 정보.연결선들.length;
                const 평균거리 = 정보.연결선들.reduce((a, b) => a + b, 0) / 연결선수;
                
                let 반지름 = 35;
                반지름 += Math.log2(연결선수 + 1) * 12;
                반지름 *= Math.max(0.9, 1 - 평균거리 / 250);
                
                그라데이션원.style.cssText = `
                    position: absolute;
                    width: ${반지름 * 2}px;
                    height: ${반지름 * 2}px;
                    background: radial-gradient(circle, rgba(255, 193, 7, 0.4) 0%, rgba(255, 193, 7, 0) 90%);
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
}

function 힌트4() {
    const 예상열셀들 = document.querySelectorAll('.prediction-cell');
    const 패턴강도 = new Array(46).fill(0);
    let 최대강도 = 0;

    document.querySelectorAll('.grid-cell.marked').forEach(cell => {
        const num = parseInt(cell.querySelector('.number-circle')?.textContent);
        if (num > 0 && num <= 45) {
            패턴강도[num] += 1;
            최대강도 = Math.max(최대강도, 패턴강도[num]);
        }
    });

    const 힌트4버튼 = document.querySelector('.hint-button:nth-child(4)');
    힌트4버튼.classList.toggle('active');
    const isActive = 힌트4버튼.classList.contains('active');

    예상열셀들.forEach(cell => {
        const num = parseInt(cell.textContent);
        if (num > 0 && num <= 45) {
            if (cell.classList.contains('selected')) {
                cell.style.backgroundColor = '#2196F3';
                cell.style.color = '#fff';
                return;
            }
            if (isActive) {
                const 강도비율 = 패턴강도[num] / (최대강도 || 1);
                const 강화된강도 = Math.pow(강도비율, 0.7);
                cell.style.backgroundColor = `rgba(23, 162, 184, ${강화된강도.toFixed(2)})`;
                cell.style.color = 강화된강도 > 0.5 ? '#fff' : '#000';
                cell.classList.remove('pulse');
                void cell.offsetWidth;
                cell.classList.add('pulse');
            } else {
                cell.style.backgroundColor = '#f8f9fa';
                cell.style.color = '#000';
                cell.classList.remove('pulse');
            }
            cell.style.transition = 'all 0.3s ease';
        }
    });
}

// 힌트5: 빈칸에 점수 및 그라데이션 원 표시
function 힌트5() {
    window.힌트5활성화 = !window.힌트5활성화;
    clearScoreDisplay();
    if (!window.힌트5활성화) return;
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
    document.querySelectorAll('.score-display').forEach(el => el.remove());
    document.querySelectorAll('.hint5-gradient-circle').forEach(el => el.remove());
    document.querySelectorAll('[style*="radial-gradient"]').forEach(el => {
        if (el.parentElement && el.parentElement.classList.contains('grid-cell')) {
            el.remove();
        }
    });
}

function getCellPosition(cell) {
    const gridSize = 16;
    const cells = Array.from(document.querySelectorAll('.grid-cell'));
    const index = cells.indexOf(cell);
    const row = Math.floor((index - gridSize) / gridSize);
    const col = index % gridSize;
    return { row, col };
}

function calculatePositionScore(pos1, pos2) {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) return 2;
    if (rowDiff === 1 && colDiff === 1) return 1.5;
    if ((rowDiff === 2 && colDiff === 0) || (rowDiff === 0 && colDiff === 2)) return 1;
    return 0;
}

function displayScore(cell, score) {
    if (score <= 1.5) {
        const gradientCircle = document.createElement('div');
        gradientCircle.className = 'hint5-gradient-circle';
        let size, gradientColor;
        if (score === 0) { size = 72; gradientColor = 'rgba(0,0,0,0.7)'; }
        else if (score === 1) { size = 60; gradientColor = 'rgba(128,128,0,0.7)'; }
        else if (score === 1.5) { size = 48; gradientColor = 'rgba(255,255,0,0.7)'; }
        gradientCircle.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:radial-gradient(circle,${gradientColor} 0%,transparent 70%);border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);z-index:1;`;
        cell.appendChild(gradientCircle);
    }
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display';
    scoreDisplay.textContent = score.toFixed(1);
    scoreDisplay.style.cssText = `position:absolute;width:12px;height:12px;display:flex;justify-content:center;align-items:center;color:${score>0?'#1976D2':'#999'};font-weight:bold;font-size:7px;z-index:2;background-color:rgba(255,255,255,0.9);border-radius:2px;padding:1px;left:50%;top:50%;transform:translate(-50%,-50%);`;
    cell.style.position = 'relative';
    cell.appendChild(scoreDisplay);
}

// 힌트6: 당첨 셀들 사이에 움직이는 점(애니메이션) 표시
function 힌트6() {
    if (window.힌트6활성화) {
        clearMovingDots();
        document.querySelectorAll('.grid-cell.prediction-cell').forEach(cell => {
            cell.style.backgroundColor = '#f8f9fa';
            cell.classList.remove('pulse');
        });
        window.힌트6활성화 = false;
        return;
    }
    window.힌트1활성화 = false;
    window.힌트2활성화 = false;
    window.힌트3활성화 = false;
    window.힌트4활성화 = false;
    window.힌트5활성화 = false;
    clearConnections();
    clearScoreDisplay();
    clearMovingDots();
    document.querySelectorAll('.grid-cell.prediction-cell').forEach(cell => {
        cell.style.backgroundColor = '#f8f9fa';
        cell.classList.remove('pulse');
    });
    window.힌트6활성화 = true;
    const 격자 = document.querySelector('.grid-container');
    if (!격자) return;
    const 격자Rect = 격자.getBoundingClientRect();
    const 모든당첨셀 = document.querySelectorAll('.grid-cell.marked');
    const predictionCells = Array.from(document.querySelectorAll('.grid-cell.prediction-cell'));
    const hitCounts = {};
    // 번호별로 당첨 셀 모으기
    const numberToCells = {};
    모든당첨셀.forEach(cell => {
        const num = cell.getAttribute('data-number');
        if (!numberToCells[num]) numberToCells[num] = [];
        numberToCells[num].push(cell);
    });
    Object.entries(numberToCells).forEach(([num, cells]) => {
        const predictionCell = predictionCells.find(pc => pc.getAttribute('data-number') === num);
        if (!predictionCell) return;
        cells.forEach(cell => {
            const cellRect = cell.getBoundingClientRect();
            const predRect = predictionCell.getBoundingClientRect();
            const x1 = cellRect.left + cellRect.width / 2 - 격자Rect.left;
            const y1 = cellRect.top + cellRect.height / 2 - 격자Rect.top;
            const x2 = predRect.left + predRect.width / 2 - 격자Rect.left;
            const y2 = predRect.top + predRect.height / 2 - 격자Rect.top;
            const 점 = document.createElement('div');
            점.className = 'moving-dot';
            점.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;background:#1976D2;z-index:10;`;
            격자.appendChild(점);
            let t = 0;
            const duration = 1200 + Math.random() * 400; // 약간의 시간차
            function animateDot() {
                t += 16;
                const progress = (t % duration) / duration;
                점.style.left = (x1 + (x2 - x1) * progress) + 'px';
                점.style.top  = (y1 + (y2 - y1) * progress) + 'px';
                if (progress >= 0.98) {
                    // 점이 도착하면 카운트 증가 및 배경 진하게, 펄스 효과
                    if (!hitCounts[num]) hitCounts[num] = 0;
                    hitCounts[num]++;
                    const intensity = Math.min(0.8, 0.2 + hitCounts[num] * 0.15);
                    predictionCell.style.backgroundColor = `rgba(33, 150, 243, ${intensity})`;
                    predictionCell.classList.remove('pulse');
                    void predictionCell.offsetWidth; // reflow for restart
                    predictionCell.classList.add('pulse');
                }
                if (document.body.contains(점)) {
                    requestAnimationFrame(animateDot);
                }
            }
            animateDot();
        });
    });
}

function clearMovingDots() {
    document.querySelectorAll('.moving-dot').forEach(dot => dot.remove());
}

function saveUserName(name) {
    if (name.trim()) {
        localStorage.setItem('userName', name.trim());
    }
}

// 페이지 로드 시 한 번만 실행
let initialized = false;
document.addEventListener('DOMContentLoaded', async function() {
    if (initialized) return;
    try {
        await 초기화();
        setupRealtimeListeners();
        initialized = true;
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
    }
});

// 연결선, 각도선, 그라데이션 원 등 힌트 요소 제거 함수
function clearConnections() {
    document.querySelectorAll('.connection-line, .dot-container, .angle-connection, .gradient-circle').forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
} 