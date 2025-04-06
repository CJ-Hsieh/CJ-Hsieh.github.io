// 記錄按鈕點擊次數
let clickCount = 0;

// 取得按鈕和遊戲容器
const nightModeBtn = document.getElementById('night-mode-btn');
const gameContainer = document.getElementById('game-container');

// 處理按鈕點擊事件
nightModeBtn.addEventListener('click', function() {
  clickCount++;

  if (clickCount >= 5) {
    // 當點擊次數達到 5 次時顯示遊戲
    gameContainer.classList.remove('hidden');
    alert('恭喜你，遊戲已經顯示！');
  }
});
