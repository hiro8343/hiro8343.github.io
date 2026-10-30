// スプレッドシート（「リンクを知っている全員が閲覧可」にしておく）
// 列：商品名 / 商品内容 / タグ（必須）、画像 / 価格 / リンク（任意・あれば表示）
const SHEET_ID = "1nV_jHRtpdwBhIpkNlxa99AZmtog-7o-Rq41uxSYZCKc";
const SHEET_GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;

const ALL = "すべて";
const EMOJIS = ["🎁", "🌈", "☀️", "🌺", "🍀", "🌊", "✨", "🧿"];

const state = { items: [], tag: ALL, perPage: 12, shown: 12 };

const $grid = document.getElementById("grid");
const $tags = document.getElementById("tags");
const $result = document.getElementById("result");
const $more = document.getElementById("more");
const $perPage = document.getElementById("perPage");

// ダブルクォート・改行入りセルにも対応したCSVパーサ
function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function pick(obj, keys) {
  for (const k of keys) if (obj[k]) return obj[k].trim();
  return "";
}

function toItems(rows) {
  const header = rows[0].map(h => h.trim());
  return rows.slice(1)
    .map(r => Object.fromEntries(header.map((h, i) => [h, r[i] || ""])))
    .map(o => ({
      name: pick(o, ["商品名", "名前"]),
      desc: pick(o, ["商品内容", "説明"]),
      tags: pick(o, ["タグ"]).split(/[,、，\/／]+/).map(t => t.trim()).filter(Boolean),
      image: pick(o, ["画像", "画像URL", "写真"]),
      price: pick(o, ["価格", "値段"]),
      link: pick(o, ["リンク", "URL", "購入リンク"]),
    }))
    .filter(it => it.name);
}

// GoogleドライブのリンクURLを画像として表示できる形に変換
function imageUrl(url) {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800` : url;
}

function esc(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderTags() {
  const counts = {};
  state.items.forEach(it => it.tags.forEach(t => counts[t] = (counts[t] || 0) + 1));
  const tags = [ALL, ...Object.keys(counts)];
  $tags.innerHTML = tags.map(t => {
    const n = t === ALL ? state.items.length : counts[t];
    return `<button class="tag-btn${t === state.tag ? " active" : ""}" data-tag="${esc(t)}" aria-pressed="${t === state.tag}">${esc(t)} <small>(${n})</small></button>`;
  }).join("");
}

function card(it, i) {
  const img = it.image
    ? `<div class="card-img"><img src="${esc(imageUrl(it.image))}" alt="${esc(it.name)}" loading="lazy"></div>`
    : `<div class="card-img placeholder" aria-hidden="true">${EMOJIS[i % EMOJIS.length]}</div>`;
  const tags = it.tags.map(t => `<button class="card-tag" data-tag="${esc(t)}">#${esc(t)}</button>`).join("");
  return `<article class="card">
    ${img}
    <div class="card-body">
      <div class="card-tags">${tags}</div>
      <h3>${esc(it.name)}</h3>
      <p class="desc">${esc(it.desc)}</p>
      ${it.price ? `<p class="price">${esc(it.price)}</p>` : ""}
      ${it.link ? `<a class="link" href="${esc(it.link)}" target="_blank" rel="noopener">詳しく見る →</a>` : ""}
    </div>
  </article>`;
}

function render() {
  const list = state.tag === ALL ? state.items : state.items.filter(it => it.tags.includes(state.tag));
  const visible = state.perPage === 0 ? list : list.slice(0, state.shown);
  $grid.innerHTML = visible.length
    ? visible.map((it, i) => card(it, state.items.indexOf(it))).join("")
    : `<p class="empty">このタグのアイテムはまだありません</p>`;
  $result.textContent = `${list.length}件中 ${visible.length}件を表示`;
  $more.hidden = visible.length >= list.length;
}

function selectTag(tag) {
  state.tag = tag;
  state.shown = state.perPage;
  renderTags();
  render();
}

$tags.addEventListener("click", e => {
  const b = e.target.closest("[data-tag]");
  if (b) selectTag(b.dataset.tag);
});
$grid.addEventListener("click", e => {
  const b = e.target.closest(".card-tag");
  if (!b) return;
  selectTag(b.dataset.tag);
  document.getElementById("items").scrollIntoView({ behavior: "smooth" });
});
$perPage.addEventListener("change", () => {
  state.perPage = Number($perPage.value);
  state.shown = state.perPage;
  render();
});
$more.addEventListener("click", () => {
  state.shown += state.perPage;
  render();
});

fetch(SHEET_URL)
  .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
  .then(text => {
    state.items = toItems(parseCSV(text));
    renderTags();
    render();
  })
  .catch(() => {
    $grid.innerHTML = `<p class="empty">アイテムを読み込めませんでした。時間をおいて再読み込みしてください🙏</p>`;
  });
