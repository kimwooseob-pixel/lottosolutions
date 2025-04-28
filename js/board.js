// 게시판 데이터 관리
class BoardManager {
    constructor(boardType) {
        this.boardType = boardType;
        this.data = {
            posts: [],
            currentPage: 1,
            postsPerPage: 10,
            videoUrl: ''
        };
        this.loadData();
    }

    loadData() {
        const savedData = localStorage.getItem(`boardData_${this.boardType}`);
        if (savedData) {
            this.data = JSON.parse(savedData);
        }
        this.renderBoard();
    }

    saveData() {
        localStorage.setItem(`boardData_${this.boardType}`, JSON.stringify(this.data));
    }

    createPost() {
        const title = prompt('제목을 입력하세요:');
        if (!title) return;

        const content = prompt('내용을 입력하세요:');
        if (!content) return;

        const post = {
            id: Date.now(),
            title,
            content,
            author: '작성자', // 실제로는 로그인된 사용자 정보를 사용
            date: new Date().toLocaleDateString(),
            views: 0
        };

        this.data.posts.unshift(post);
        this.saveData();
        this.renderBoard();
    }

    viewPost(id) {
        const post = this.data.posts.find(p => p.id === id);
        if (!post) return;

        post.views++;
        this.saveData();

        alert(`제목: ${post.title}\n내용: ${post.content}\n작성자: ${post.author}\n작성일: ${post.date}\n조회수: ${post.views}`);
    }

    renderBoard() {
        const boardList = document.getElementById('boardList');
        if (!boardList) return;

        const start = (this.data.currentPage - 1) * this.data.postsPerPage;
        const end = start + this.data.postsPerPage;
        const pageData = this.data.posts.slice(start, end);

        boardList.innerHTML = pageData.map((post, index) => `
            <tr onclick="boardManager.viewPost(${post.id})">
                <td>${this.data.posts.length - start - index}</td>
                <td>${post.title}</td>
                <td>${post.author}</td>
                <td>${post.date}</td>
                <td>${post.views}</td>
            </tr>
        `).join('');

        const currentPageSpan = document.getElementById('currentPage');
        if (currentPageSpan) {
            currentPageSpan.textContent = this.data.currentPage;
        }
    }

    prevPage() {
        if (this.data.currentPage > 1) {
            this.data.currentPage--;
            this.renderBoard();
        }
    }

    nextPage() {
        const maxPage = Math.ceil(this.data.posts.length / this.data.postsPerPage);
        if (this.data.currentPage < maxPage) {
            this.data.currentPage++;
            this.renderBoard();
        }
    }

    uploadVideo() {
        const input = document.getElementById('videoUpload');
        const file = input.files[0];
        if (!file) {
            alert('파일을 선택해주세요.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.data.videoUrl = e.target.result;
            const videoPlayer = document.getElementById('videoPlayer');
            if (videoPlayer) {
                videoPlayer.src = this.data.videoUrl;
            }
            this.saveData();
        };
        reader.readAsDataURL(file);
    }
}

// 전역 함수들
let boardManager;

function createPost() {
    boardManager.createPost();
}

function prevPage() {
    boardManager.prevPage();
}

function nextPage() {
    boardManager.nextPage();
}

function uploadVideo() {
    boardManager.uploadVideo();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 현재 페이지 URL에서 게시판 타입 확인
    const path = window.location.pathname;
    let boardType = 'free';
    
    if (path.includes('led-board')) {
        boardType = 'led';
    } else if (path.includes('brush-board')) {
        boardType = 'brush';
    }
    
    boardManager = new BoardManager(boardType);
}); 