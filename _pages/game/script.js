let clickCount = 0;

// 找到切換夜間模式的按鈕
const button = document.getElementById('night-mode-toggle');

// 添加點擊事件監聽器
button.addEventListener('click', function() {
    clickCount++;

    // 當點擊次數達到 3 次後顯示遊戲
    if (clickCount >= 3) {
        document.getElementById('game-container').style.display = 'block';
    }
});
