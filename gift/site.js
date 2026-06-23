/* 共通ナビ・フッター・スクロール演出の注入 */
(function () {
  const PAGES = [
    { href: "index.html",   label: "ホーム",        key: "home" },
    { href: "concept.html", label: "ギフトに生きるとは", key: "concept" },
    { href: "book.html",    label: "書籍",          key: "book" },
    { href: "learn.html",   label: "学ぶ・繋がる",    key: "learn" },
    { href: "support.html", label: "応援・循環",      key: "support" },
    { href: "gift-author.html", label: "著者にギフト",  key: "giftauthor" },
  ];

  const current = document.body.getAttribute("data-page") || "home";

  /* ---- ファビコン（ブラウザのタブアイコン） ---- */
  if (!document.querySelector('link[rel="icon"]')) {
    const fav = document.createElement("link");
    fav.rel = "icon";
    fav.type = "image/svg+xml";
    fav.href = "favicon.svg";
    document.head.appendChild(fav);
  }

  /* ---- ヘッダー ---- */
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <nav class="nav" aria-label="メインナビゲーション">
      <a class="brand" href="index.html">
        <span class="brand-mark">ギ</span>
        <span class="brand-text">
          <span class="brand-name">ギフトに生きる</span>
          <span class="brand-sub">あなたの存在がギフト</span>
        </span>
      </a>
      <button class="nav-toggle" aria-label="メニュー" aria-expanded="false">☰</button>
      <div class="nav-links" id="navLinks">
        ${PAGES.map(p => `<a href="${p.href}" class="${p.key === current ? "active" : ""}">${p.label}</a>`).join("")}
      </div>
      <a class="nav-cta" href="book.html#yoyaku">予約特典を見る</a>
    </nav>`;
  document.body.prepend(header);

  const toggle = header.querySelector(".nav-toggle");
  const links = header.querySelector("#navLinks");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  /* ---- フッター ---- */
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="brand" href="index.html" style="margin-bottom:14px">
            <span class="brand-mark">ギ</span>
            <span class="brand-text">
              <span class="brand-name">ギフトに生きる</span>
              <span class="brand-sub">著・石丸 弘</span>
            </span>
          </a>
          <p style="font-size:14.5px;color:var(--ink-soft);max-width:34ch;margin-top:6px">
            ありのままの自分が、ギフトになっている。<br>やさしさが静かにめぐる、その入り口へ。＾＾
          </p>
          <div class="footer-social">
            <a href="https://note.com/gift8343" target="_blank" rel="noopener" aria-label="note" title="note">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M5 3h11.5L21 7.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3.3 5.6c-1.7 0-3 1.3-3 3.4 0 2 1.2 3.4 2.9 3.4.8 0 1.4-.3 1.9-.9v.7h1.9V8.8h-1.9v.7c-.5-.6-1.1-.9-1.7-.9Zm.4 1.7c.9 0 1.5.7 1.5 1.7s-.6 1.7-1.5 1.7-1.5-.7-1.5-1.7.6-1.7 1.5-1.7Z"/></svg>
            </a>
            <a href="https://www.facebook.com/hiroshi.ishimaru.8343" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z"/></svg>
            </a>
            <a href="https://www.instagram.com/hiro8343" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-.9 0-1.4.2-1.7.3-.4.2-.7.4-1 .7-.3.3-.5.6-.7 1-.1.3-.3.8-.3 1.7-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c0 .9.2 1.4.3 1.7.2.4.4.7.7 1 .3.3.6.5 1 .7.3.1.8.3 1.7.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c.9 0 1.4-.2 1.7-.3.4-.2.7-.4 1-.7.3-.3.5-.6.7-1 .1-.3.3-.8.3-1.7.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c0-.9-.2-1.4-.3-1.7-.2-.4-.4-.7-.7-1-.3-.3-.6-.5-1-.7-.3-.1-.8-.3-1.7-.3-1.2-.1-1.6-.1-4.7-.1Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.2-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0Z"/></svg>
            </a>
            <a href="https://lin.ee/po92sie" target="_blank" rel="noopener" aria-label="公式LINE" title="公式LINE">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 3C6.9 3 2.8 6.3 2.8 10.4c0 3.7 3.3 6.8 7.8 7.4.3.06.7.2.8.46.07.24.05.6.02.84l-.13.78c-.04.24-.2.93.82.5 1.02-.42 5.48-3.23 7.48-5.53 1.37-1.5 2.03-3.03 2.03-4.72C21.4 6.3 17.3 3 12 3ZM8.2 12.7H6.6c-.24 0-.43-.2-.43-.43V9.06c0-.24.2-.43.43-.43.24 0 .43.2.43.43v2.78H8.2c.24 0 .43.2.43.43 0 .24-.2.43-.43.43Zm1.7-.43c0 .24-.2.43-.43.43-.24 0-.43-.2-.43-.43V9.06c0-.24.2-.43.43-.43.24 0 .43.2.43.43v3.2Zm4 0c0 .19-.12.35-.3.41-.05.02-.1.02-.14.02-.14 0-.27-.06-.35-.18l-1.65-2.25v2c0 .24-.2.43-.43.43-.24 0-.43-.2-.43-.43V9.06c0-.19.12-.35.3-.41.04-.02.1-.02.13-.02.14 0 .27.07.35.18l1.66 2.25v-2c0-.24.2-.43.43-.43.24 0 .43.2.43.43v3.2Zm2.86-2.04c.24 0 .43.2.43.43 0 .24-.2.43-.43.43h-1.16v.75h1.16c.24 0 .43.2.43.43 0 .24-.2.43-.43.43h-1.6c-.23 0-.42-.2-.42-.43V9.06c0-.24.2-.43.43-.43h1.6c.23 0 .42.2.42.43 0 .24-.2.43-.43.43h-1.16v.75h1.16Z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h4>めぐる5つの入口</h4>
          <div class="footer-links">
            ${PAGES.map(p => `<a href="${p.href}">${p.label}</a>`).join("")}
          </div>
        </div>
        <div>
          <h4>つながる</h4>
          <div class="footer-links">
            <a href="book.html#yoyaku">書籍を予約する</a>
            <a href="events.html">イベント情報</a>
            <a href="reviews.html">読んだ方の感想</a>
            <a href="learn.html">動画で学ぶ</a>
            <a href="support.html">循環に加わる</a>
            <a href="gift-author.html">著者にギフトする</a>
          </div>
        </div>
      </div>
      <div class="footer-note">
        <span>© 2026 ギフトに生きる。 やさしくなぁれ♡</span>
        <span>※このサイトはたたき台です。画像・リンクは差し替え予定。</span>
      </div>
    </div>`;
  document.body.appendChild(footer);

  /* ---- スクロール演出 ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(el => io.observe(el));
    // 安全策：何かの理由で発火しなくても必ず表示する
    setTimeout(() => reveals.forEach(el => el.classList.add("in")), 2600);
  } else {
    reveals.forEach(el => el.classList.add("in"));
  }

  /* ---- アンカー（#yoyaku 等）への着地を補正 ---- */
  /* 最初の読み込み時、上部の画像が後から読み込まれて高さが変わると
     ジャンプ位置がズレて途中で止まることがある。
     画像の読み込み完了や reveal の表示後に、もう一度合わせ直す。 */
  function scrollToHash(smooth) {
    const id = decodeURIComponent((location.hash || "").slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  }

  if (location.hash) {
    // reveal を即時表示にして高さを確定させてから着地する
    const settle = () => {
      reveals.forEach(el => el.classList.add("in"));
      scrollToHash(false);
    };
    // 画面初期化直後・各段階で複数回合わせ直す（画像ロードのタイミング差を吸収）
    requestAnimationFrame(settle);
    window.addEventListener("load", () => { settle(); setTimeout(() => scrollToHash(false), 300); });
    setTimeout(() => scrollToHash(false), 800);
    setTimeout(() => scrollToHash(false), 1500);
  }
})();
