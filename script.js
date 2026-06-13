// ページ読み込み時に要素を少しフワッと浮き上がらせるような
// マイクロインタラクションを追加します
document.addEventListener('DOMContentLoaded', () => {
    // リンクカードをホバーしたときに、微小なパーティクル効果や
    // クリック時の波紋効果（リップルエフェクト）などを追加する処理
    
    const cards = document.querySelectorAll('.link-card');
    
    cards.forEach(card => {
        // クリック時のリップル（波紋）効果
        card.addEventListener('mousedown', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.borderRadius = '50%';
            ripple.style.pointerEvents = 'none';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.transition = 'width 0.5s ease-out, height 0.5s ease-out, opacity 0.5s ease-out';
            ripple.style.opacity = '1';
            
            // overflow hidden をカードに追加（CSS側で対応も可）
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            
            this.appendChild(ripple);
            
            // アニメーション発火
            setTimeout(() => {
                ripple.style.width = '300px';
                ripple.style.height = '300px';
                ripple.style.opacity = '0';
            }, 10);
            
            // アニメーション完了後に要素を削除
            setTimeout(() => {
                ripple.remove();
            }, 500);
        });
    });
});
