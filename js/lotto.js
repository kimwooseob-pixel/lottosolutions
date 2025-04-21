// 당첨 번호를 저장할 변수
let winningNumbers = [];

// 게임 초기화
function initGame() {
    winningNumbers = generateLottoNumbers();
    document.getElementById('result').style.display = 'none';
    clearInputs();
}

// 로또 번호 생성
function generateLottoNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    return numbers.sort((a, b) => a - b);
}

// 입력 필드 초기화
function clearInputs() {
    const inputs = document.querySelectorAll('.number-input input');
    inputs.forEach(input => {
        input.value = '';
        input.style.borderColor = '#ddd';
    });
}

// 자동 번호 생성
function autoGenerate() {
    const numbers = generateLottoNumbers();
    const inputs = document.querySelectorAll('.number-input input');
    inputs.forEach((input, index) => {
        input.value = numbers[index];
    });
}

// 번호 확인
function checkNumbers() {
    const inputs = document.querySelectorAll('.number-input input');
    const userNumbers = [];
    let isValid = true;

    // 입력값 검증
    inputs.forEach(input => {
        const num = parseInt(input.value);
        if (isNaN(num) || num < 1 || num > 45) {
            input.style.borderColor = 'red';
            isValid = false;
        } else if (userNumbers.includes(num)) {
            input.style.borderColor = 'red';
            isValid = false;
        } else {
            input.style.borderColor = '#ddd';
            userNumbers.push(num);
        }
    });

    if (!isValid || userNumbers.length !== 6) {
        alert('1부터 45까지의 중복되지 않는 숫자를 입력해주세요.');
        return;
    }

    // 결과 표시
    showResult(userNumbers.sort((a, b) => a - b));
}

// 결과 표시
function showResult(userNumbers) {
    const resultDiv = document.getElementById('result');
    const winningNumbersDiv = document.getElementById('winningNumbers');
    const userNumbersDiv = document.getElementById('userNumbers');
    const matchCountP = document.getElementById('matchCount');
    const rankP = document.getElementById('rank');

    // 당첨 번호 표시
    winningNumbersDiv.innerHTML = winningNumbers
        .map(num => `<div class="number-ball winning">${num}</div>`)
        .join('');

    // 사용자 번호 표시
    userNumbersDiv.innerHTML = userNumbers
        .map(num => {
            const isCorrect = winningNumbers.includes(num);
            return `<div class="number-ball ${isCorrect ? 'correct' : 'user'}">${num}</div>`;
        })
        .join('');

    // 맞은 개수 계산
    const correctCount = userNumbers.filter(num => winningNumbers.includes(num)).length;
    matchCountP.textContent = `맞은 개수: ${correctCount}개`;

    // 등수 표시
    let rankText = '';
    switch (correctCount) {
        case 6:
            rankText = '🎉 1등 당첨! 🎉';
            break;
        case 5:
            rankText = '🎉 2등 당첨! 🎉';
            break;
        case 4:
            rankText = '🎉 3등 당첨! 🎉';
            break;
        case 3:
            rankText = '🎉 4등 당첨! 🎉';
            break;
        case 2:
            rankText = '🎉 5등 당첨! 🎉';
            break;
        default:
            rankText = '아쉽네요. 다음 기회에 도전해보세요!';
    }
    rankP.textContent = rankText;

    resultDiv.style.display = 'block';
}

// 게임 리셋
function resetGame() {
    initGame();
}

// 페이지 로드 시 게임 초기화
window.onload = initGame; 