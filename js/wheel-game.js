/**
 * 로또 원판(다트) 게임 — 1~45 원판 회전으로 6개 번호 선택, predictions 저장 시 source: lotto_dart
 * Firebase: currentDraw 읽기 전용, predictions 쓰기
 */
(function () {
    'use strict';

    const SLICE_COUNT = 45;
    const SLICE_DEG = 360 / SLICE_COUNT;

    const firebaseConfig = {
        apiKey: 'AIzaSyAwh55rLOQkY8ZVCzaC4ZF3iaUVU5Vu0GM',
        authDomain: 'ai-lottosolutions.firebaseapp.com',
        databaseURL: 'https://ai-lottosolutions-default-rtdb.asia-southeast1.firebasedatabase.app',
        projectId: 'ai-lottosolutions',
        storageBucket: 'ai-lottosolutions.appspot.com',
        messagingSenderId: '616782090306',
        appId: '1:616782090306:web:688c710998dfce8e4d5ddb',
    };

    let latestDrawNumber = 1170;
    let wheelRotation = 0;
    let picked = [];
    let isSpinning = false;
    let predictModalShown = false;

    function initFirebase() {
        try {
            if (typeof firebase === 'undefined' || !firebase.initializeApp) return;
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
        } catch (e) {
            console.warn('[wheel-game] Firebase 초기화 실패', e);
        }
    }

    function normalizeDeg(d) {
        return ((d % 360) + 360) % 360;
    }

    async function resolveLatestDrawNumber() {
        initFirebase();
        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            return latestDrawNumber;
        }
        try {
            const snap = await firebase.database().ref('currentDraw').once('value');
            const val = snap.val();
            if (val != null && typeof val.drawNumber === 'number' && Number.isFinite(val.drawNumber)) {
                return val.drawNumber;
            }
        } catch (e) {
            console.warn('[wheel-game] currentDraw 읽기 실패', e);
        }
        try {
            const dr = await firebase.database().ref('drawRange').once('value');
            const v = dr.val();
            if (v != null && typeof v === 'object') {
                const end = parseInt(v.end, 10);
                if (Number.isFinite(end)) return end;
            }
        } catch (e) { /* ignore */ }
        return latestDrawNumber;
    }

    function updateRoundLabel() {
        const el = document.getElementById('wheelRoundLabel');
        if (!el) return;
        const next = latestDrawNumber + 1;
        el.textContent = Number.isFinite(next) ? next + '회차 예측' : '예측 회차';
    }

    function drawWheel(canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const size = canvas.clientWidth || 320;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cx = size / 2;
        const cy = size / 2;
        const r = size / 2 - 4;
        ctx.clearRect(0, 0, size, size);

        const colors = ['#152238', '#1a2d4a'];
        for (let i = 0; i < SLICE_COUNT; i++) {
            const start = (-Math.PI / 2) + (i * 2 * Math.PI) / SLICE_COUNT;
            const end = (-Math.PI / 2) + ((i + 1) * 2 * Math.PI) / SLICE_COUNT;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, start, end);
            ctx.closePath();
            ctx.fillStyle = colors[i % 2];
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            const mid = (start + end) / 2;
            const n = i + 1;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(mid + Math.PI / 2);
            ctx.fillStyle = n <= 10 ? '#7ee8ff' : '#b8d4e8';
            ctx.font = 'bold ' + Math.max(7, size / 38) + 'px Pretendard, "Noto Sans KR", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(n), 0, -r * 0.72);
            ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.18);
        g.addColorStop(0, '#0d1525');
        g.addColorStop(1, '#152238');
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold ' + Math.max(10, size / 22) + 'px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LOTTO', cx, cy - 4);
        ctx.font = (size / 32) + 'px Pretendard, sans-serif';
        ctx.fillStyle = '#8daab8';
        ctx.fillText('45', cx, cy + 10);
    }

    function renderPickedBalls() {
        const row = document.getElementById('pickedBalls');
        if (!row) return;
        row.innerHTML = '';
        const sorted = picked.slice().sort(function (a, b) {
            return a - b;
        });
        sorted.forEach(function (n) {
            const span = document.createElement('span');
            span.className = 'lot-ball';
            span.textContent = String(n);
            row.appendChild(span);
        });
        for (let i = sorted.length; i < 6; i++) {
            const span = document.createElement('span');
            span.className = 'lot-ball lot-ball--empty';
            span.textContent = '·';
            row.appendChild(span);
        }
    }

    function spinDeltaForNumber(num) {
        const i = num - 1;
        const midDeg = -90 + (i + 0.5) * SLICE_DEG;
        const targetMod = normalizeDeg(-90 - midDeg);
        const cur = normalizeDeg(wheelRotation);
        let add = targetMod - cur;
        if (add <= 0) add += 360;
        add += 360 * (5 + Math.floor(Math.random() * 3));
        return add;
    }

    function animateRotation(fromDeg, toDeg, durationMs, onDone) {
        const wheelRot = document.getElementById('wheelRot');
        if (!wheelRot) {
            onDone();
            return;
        }
        const t0 = performance.now();
        function frame(now) {
            const t = Math.min(1, (now - t0) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3);
            const cur = fromDeg + (toDeg - fromDeg) * eased;
            wheelRot.style.transform = 'rotate(' + cur + 'deg)';
            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                wheelRotation = toDeg;
                onDone();
            }
        }
        requestAnimationFrame(frame);
    }

    function onSpinComplete(num) {
        if (picked.indexOf(num) === -1) {
            picked.push(num);
        }
        renderPickedBalls();
        const status = document.getElementById('wheelStatus');
        if (status) {
            status.textContent = picked.length >= 6 ? '6개가 모였습니다. 저장하거나 다시 도전하세요.' : '남은 회전: ' + (6 - picked.length) + '번';
        }
        isSpinning = false;
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn) spinBtn.disabled = picked.length >= 6;

        if (picked.length >= 6 && !predictModalShown) {
            predictModalShown = true;
            showCompleteModal();
        }
    }

    function showCompleteModal() {
        const overlay = document.getElementById('wheelCompleteModal');
        const ballsWrap = document.getElementById('wheelCompleteBalls');
        if (!overlay || !ballsWrap) return;
        const nums = picked.slice().sort(function (a, b) {
            return a - b;
        });
        ballsWrap.innerHTML = '';
        nums.forEach(function (n) {
            const el = document.createElement('span');
            el.className = 'predict-ball';
            el.textContent = String(n);
            ballsWrap.appendChild(el);
        });
        overlay.classList.add('show');
        overlay.setAttribute('aria-hidden', 'false');
    }

    function hideCompleteModal() {
        const overlay = document.getElementById('wheelCompleteModal');
        if (!overlay) return;
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
    }

    function savePrediction(options) {
        const opts = options || {};
        const redirectOnMissingAuth = opts.redirectOnMissingAuth !== false;
        const redirectTo = opts.redirectTo || '';
        if (picked.length < 6) return Promise.resolve(false);

        const numbers = picked.slice().sort(function (a, b) {
            return a - b;
        });
        const userUid = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('userUid') : null;
        const loggedInUser = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('loggedInUser') : null;
        if (!userUid || !loggedInUser) {
            alert('로그인이 필요합니다.');
            if (redirectOnMissingAuth) {
                location.href = '../index.html?openLogin=1';
            }
            return Promise.resolve(false);
        }

        const round = latestDrawNumber + 1;
        if (!Number.isFinite(round)) return Promise.resolve(false);

        initFirebase();
        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            console.warn('[wheel-game] Firebase를 사용할 수 없습니다.');
            return Promise.resolve(false);
        }

        return firebase
            .database()
            .ref('predictions')
            .push()
            .set({
                userId: userUid,
                nickname: loggedInUser,
                numbers: numbers,
                round: round,
                source: 'lotto_dart',
                timestamp: Date.now(),
            })
            .then(function () {
                if (redirectTo) {
                    location.href = redirectTo;
                }
                return true;
            })
            .catch(function (err) {
                console.error('[wheel-game] 예측 저장 실패:', err);
                alert('예측 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                return false;
            });
    }

    function resetGame() {
        hideCompleteModal();
        picked = [];
        predictModalShown = false;
        isSpinning = false;
        wheelRotation = 0;
        const wheelRot = document.getElementById('wheelRot');
        if (wheelRot) wheelRot.style.transform = 'rotate(0deg)';
        renderPickedBalls();
        const status = document.getElementById('wheelStatus');
        if (status) status.textContent = '원판을 돌려 번호 6개를 모아 보세요.';
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn) spinBtn.disabled = false;
    }

    function doSpin() {
        if (isSpinning || picked.length >= 6) return;
        const remaining = [];
        for (let n = 1; n <= SLICE_COUNT; n++) {
            if (picked.indexOf(n) === -1) remaining.push(n);
        }
        if (remaining.length === 0) return;

        const num = remaining[Math.floor(Math.random() * remaining.length)];
        const delta = spinDeltaForNumber(num);
        const from = wheelRotation;
        const to = wheelRotation + delta;
        isSpinning = true;
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn) spinBtn.disabled = true;
        const status = document.getElementById('wheelStatus');
        if (status) status.textContent = '회전 중…';

        animateRotation(from, to, 3200 + Math.random() * 800, function () {
            onSpinComplete(num);
        });
    }

    function wireUi() {
        const canvas = document.getElementById('wheelCanvas');
        const spinBtn = document.getElementById('spinBtn');
        const resetBtn = document.getElementById('wheelResetBtn');

        function resizeWheel() {
            drawWheel(canvas);
        }

        if (canvas) {
            window.addEventListener('resize', resizeWheel);
            resizeWheel();
        }

        if (spinBtn) spinBtn.addEventListener('click', doSpin);
        if (resetBtn) resetBtn.addEventListener('click', resetGame);

        const saveBtn = document.getElementById('wheelSaveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                savePrediction({ redirectOnMissingAuth: false, redirectTo: 'page5.html' }).then(function (ok) {
                    if (ok) hideCompleteModal();
                });
            });
        }
        const retryBtn = document.getElementById('wheelRetryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', function () {
                hideCompleteModal();
                resetGame();
            });
        }
    }

    let currentDrawListenerOn = false;

    function attachCurrentDrawListener() {
        initFirebase();
        if (currentDrawListenerOn) return;
        if (typeof firebase === 'undefined' || !firebase.apps.length) return;
        currentDrawListenerOn = true;
        firebase.database().ref('currentDraw').on('value', function (snap) {
            const v = snap.val();
            const d =
                v != null && typeof v.drawNumber === 'number' && Number.isFinite(v.drawNumber)
                    ? v.drawNumber
                    : null;
            if (d == null) return;
            if (d === latestDrawNumber) return;
            latestDrawNumber = d;
            updateRoundLabel();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        wireUi();
        void (async function () {
            try {
                latestDrawNumber = await resolveLatestDrawNumber();
                const n = typeof latestDrawNumber === 'number' ? latestDrawNumber : parseInt(latestDrawNumber, 10);
                if (Number.isFinite(n)) latestDrawNumber = n;
            } catch (e) {
                console.warn('[wheel-game] 회차 동기화 실패', e);
            }
            updateRoundLabel();
            renderPickedBalls();
            attachCurrentDrawListener();
        })();
    });
})();

