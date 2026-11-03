// スプレッドシート（「リンクを知っている全員が閲覧可」にしておく）
// 列：都道府県 / 場所の名前 / 概要 / 画像のURL / 行ったよー（◯ が入っていたら行った）
const SHEET_ID = "1n3mpJuMAR9_7UTCBsX5tXoKWJ1rQMdvayeHdNajdzSo";
const SHEET_GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;

const ALL = "すべて";
const EMOJIS = ["🌏", "🌸", "☀️", "🌈", "✨", "🍀", "🌊", "⛰️"];
const PREF_ORDER = ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"];

const state = { places: [], pref: ALL, status: "all" };

const $grid = document.getElementById("grid");
const $prefs = document.getElementById("prefs");
const $status = document.getElementById("status");
const $result = document.getElementById("result");
const $progress = document.getElementById("progress");

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

function toPlaces(rows) {
  const header = rows[0].map(h => h.trim());
  return rows.slice(1)
    .map(r => Object.fromEntries(header.map((h, i) => [h, r[i] || ""])))
    .map(o => ({
      pref: pick(o, ["都道府県"]) || "その他",
      name: pick(o, ["場所の名前", "場所", "名前"]),
      desc: pick(o, ["概要", "説明"]),
      image: pick(o, ["画像のURL", "画像", "画像URL"]),
      // ◯ ○ 〇 O o などを「行ったよー」とみなす
      done: /[◯○〇◎●OoＯｏ]/.test(pick(o, ["行ったよー", "行った"])),
    }))
    .filter(p => p.name);
}

// GoogleドライブのリンクURLを画像として表示できる形に変換
function imageUrl(url) {
  const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800` : url;
}

function esc(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function prefRank(p) {
  const i = PREF_ORDER.indexOf(p);
  return i === -1 ? 99 : i;
}

function renderPrefs() {
  const counts = {};
  state.places.forEach(p => counts[p.pref] = (counts[p.pref] || 0) + 1);
  const prefs = [ALL, ...Object.keys(counts).sort((a, b) => prefRank(a) - prefRank(b))];
  $prefs.innerHTML = prefs.map(p => {
    const n = p === ALL ? state.places.length : counts[p];
    return `<button class="chip${p === state.pref ? " active" : ""}" data-pref="${esc(p)}" aria-pressed="${p === state.pref}">${esc(p)} <small>(${n})</small></button>`;
  }).join("");
}

function renderProgress() {
  const done = state.places.filter(p => p.done).length;
  $progress.innerHTML = `いままでに <strong>${done}</strong> か所 行ったよー ／ 全 ${state.places.length} か所`;
}

function card(p, i) {
  const img = p.image
    ? `<div class="card-img"><img src="${esc(imageUrl(p.image))}" alt="${esc(p.name)}" loading="lazy"></div>`
    : `<div class="card-img placeholder" aria-hidden="true">${EMOJIS[i % EMOJIS.length]}</div>`;
  return `<article class="card">
    ${img}
    ${p.done ? `<div class="stamp">行った<br>よー♡</div>` : ""}
    <div class="card-body">
      <button class="pref" data-pref="${esc(p.pref)}">📍 ${esc(p.pref)}</button>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.desc)}</p>
    </div>
  </article>`;
}

function render() {
  const list = state.places.filter(p =>
    (state.pref === ALL || p.pref === state.pref) &&
    (state.status === "all" || (state.status === "done") === p.done));
  $grid.innerHTML = list.length
    ? list.map(p => card(p, state.places.indexOf(p))).join("")
    : `<p class="empty">ここはまだこれから♪ 一緒に探しにいこう</p>`;
  $result.textContent = `${list.length}か所を表示`;
}

function selectPref(pref) {
  state.pref = pref;
  renderPrefs();
  render();
}

$prefs.addEventListener("click", e => {
  const b = e.target.closest("[data-pref]");
  if (b) selectPref(b.dataset.pref);
});
$grid.addEventListener("click", e => {
  const b = e.target.closest(".pref");
  if (b) selectPref(b.dataset.pref);
});
$status.addEventListener("click", e => {
  const b = e.target.closest("[data-status]");
  if (!b) return;
  state.status = b.dataset.status;
  $status.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("active", c === b);
    c.setAttribute("aria-pressed", c === b);
  });
  render();
});

fetch(SHEET_URL)
  .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
  .then(text => {
    state.places = toPlaces(parseCSV(text));
    renderPrefs();
    renderProgress();
    render();
  })
  .catch(() => {
    $grid.innerHTML = `<p class="empty">読み込めませんでした。時間をおいて再読み込みしてください🙏</p>`;
  });
