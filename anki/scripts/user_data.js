/**
 * User Data Manager
 * ユーザーの進捗データをlocalStorageで管理する
 */

const STORAGE_KEY = 'memo_game_user_data_v1';

const DEFAULT_DATA = {
    userName: 'Player',
    totalScore: 0,
    examsTaken: 0,
    history: [],   // { date, title, score, maxScore, rank }
    badges: [],    // 'first_exam', 'perfect_score', etc.
    favorites: []  // { id, title, category }
};

function getUserData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { ...DEFAULT_DATA, favorites: [] };
    try {
        const parsed = JSON.parse(data);
        // favoritesがない古いデータとの互換性
        if (!parsed.favorites) parsed.favorites = [];
        return { ...DEFAULT_DATA, ...parsed };
    } catch (e) {
        console.error("Failed to parse user data", e);
        return { ...DEFAULT_DATA, favorites: [] };
    }
}

function saveUserData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addExamResult(result) {
    // result: { title, score, max, rank, type }
    const data = getUserData();

    // Update Stats
    data.examsTaken++;
    data.totalScore += result.score;

    // Add History
    data.history.unshift({
        date: new Date().toISOString(),
        type: result.type || 'exam',
        ...result
    });

    // Limit History size
    if (data.history.length > 50) {
        data.history = data.history.slice(0, 50);
    }

    // Check Badges
    checkBadges(data, result);

    saveUserData(data);
    return data;
}

function checkBadges(data, lastResult) {
    const newBadges = [];

    // Helper
    const addBadge = (id) => {
        if (!data.badges.includes(id)) {
            data.badges.push(id);
            newBadges.push(id);
        }
    };

    // First Exam
    if (data.examsTaken === 1) addBadge('first_step');

    // Perfect Score
    if (lastResult.score > 0 && lastResult.score === lastResult.max) addBadge('perfectionist');

    // Score Milestones
    if (data.totalScore >= 100) addBadge('score_100');
    if (data.totalScore >= 500) addBadge('score_500');
    if (data.totalScore >= 1000) addBadge('score_1000');

    // Rank S
    if (lastResult.rank === 'S') addBadge('rank_s_master');

    return newBadges;
}

function updateUserName(name) {
    const data = getUserData();
    data.userName = name;
    saveUserData(data);
}

// お気に入り追加
function addFavorite(item) {
    const data = getUserData();
    // 重複チェック（titleで判定）
    if (!data.favorites.find(f => f.title === item.title)) {
        data.favorites.push({
            title: item.title,
            category: item.category || '',
            addedAt: new Date().toISOString()
        });
        saveUserData(data);
    }
    return data;
}

// お気に入り削除
function removeFavorite(title) {
    const data = getUserData();
    data.favorites = data.favorites.filter(f => f.title !== title);
    saveUserData(data);
    return data;
}

// お気に入り判定
function isFavorite(title) {
    const data = getUserData();
    return data.favorites.some(f => f.title === title);
}

// 指定タイトルの過去最高スコア・ランクを取得
function getBestResult(title) {
    const data = getUserData();
    // 同タイトルの履歴を絞り込む
    const records = data.history.filter(h => h.title === title);
    if (records.length === 0) return null;

    // スコアが最大のレコードを探す
    let best = records[0];
    for (const rec of records) {
        if (rec.score > best.score) best = rec;
    }
    return { score: best.score, rank: best.rank, max: best.max, count: records.length };
}

// ストリーク計算（連続日数・週・月・年）+ 過去最高値も返す
function getStreaks() {
    const data = getUserData();
    if (data.history.length === 0) {
        return { days: 0, weeks: 0, months: 0, years: 0, bestDays: 0, bestWeeks: 0, bestMonths: 0, bestYears: 0 };
    }

    // 日付のみ（時刻を除去）のSetを作成
    const examDates = new Set();
    data.history.forEach(h => {
        const d = new Date(h.date);
        examDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    });

    const sortedDates = Array.from(examDates).sort(); // 古い順
    
    // ====== 累計学習日数 ======
    const totalDays = sortedDates.length;

    // ====== 再開回数（途切れた後に再開した回数） ======
    // 学習した日付を古い順に見て、前回の学習日から1日以上間隔が空いていれば再開とみなす。
    let restarts = 0;
    if (sortedDates.length > 0) restarts = 1; // 最初の1回目を再開に含めるか（ここでは「学習を始めた」意味で1から開始するか、0とするかですが、応援目的なので「1回目のスタート」として1にします）
    
    for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffMs = curr - prev;
        const diffDays = Math.round(diffMs / 86400000);
        
        if (diffDays > 1) { // 1日以上空いて再開した場合
            restarts++;
        }
    }

    // ====== 現在の連続日数の計算 ======
    let dayStreak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 今日か昨日からスタート
    let checkDate = new Date(today);
    let startedFromToday = examDates.has(todayStr);
    if (!startedFromToday) {
        // 今日やってない場合は昨日からチェック
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (!examDates.has(yesterdayStr)) {
            // 昨日もやってなければ現在のストリークは0
            dayStreak = 0;
        } else {
            while (true) {
                const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
                if (examDates.has(dateStr)) {
                    dayStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }
    } else {
        while (true) {
            const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            if (examDates.has(dateStr)) {
                dayStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }

    // ====== 過去最高連続日数の計算（全履歴を走査）======
    let bestDays = 0;
    let tempDayStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
            tempDayStreak = 1;
        } else {
            // 前の日付から1日差かチェック
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            const diffMs = curr - prev;
            const diffDays = Math.round(diffMs / 86400000);
            if (diffDays === 1) {
                tempDayStreak++;
            } else {
                tempDayStreak = 1;
            }
        }
        if (tempDayStreak > bestDays) bestDays = tempDayStreak;
    }
    // 現在値も比較
    if (dayStreak > bestDays) bestDays = dayStreak;

    // ====== 連続週の計算 ======
    const getWeekKey = (d) => {
        const jan1 = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
        return `${d.getFullYear()}-W${weekNum}`;
    };
    const examWeeks = new Set();
    data.history.forEach(h => examWeeks.add(getWeekKey(new Date(h.date))));

    let weekStreak = 0;
    let checkWeekDate = new Date(today);
    while (true) {
        const wk = getWeekKey(checkWeekDate);
        if (examWeeks.has(wk)) {
            weekStreak++;
            checkWeekDate.setDate(checkWeekDate.getDate() - 7);
        } else {
            break;
        }
    }

    // 過去最高連続週数（ソートされたweekキーで連続チェック）
    const sortedWeeks = Array.from(examWeeks).sort();
    let bestWeeks = 0;
    let tempWeekStreak = 0;
    for (let i = 0; i < sortedWeeks.length; i++) {
        if (i === 0) {
            tempWeekStreak = 1;
        } else {
            // 週番号が連続しているかチェック（年を超える場合も考慮して日換算）
            const prev = sortedWeeks[i - 1];
            const curr = sortedWeeks[i];
            // 同年・連続週かを判定（簡易: "YYYY-WN"の週番号差を比較）
            const [py, pw] = prev.split('-W').map(Number);
            const [cy, cw] = curr.split('-W').map(Number);
            const isConsecutive = (cy === py && cw === pw + 1) || (cy === py + 1 && cw === 1 && pw >= 52);
            if (isConsecutive) {
                tempWeekStreak++;
            } else {
                tempWeekStreak = 1;
            }
        }
        if (tempWeekStreak > bestWeeks) bestWeeks = tempWeekStreak;
    }
    if (weekStreak > bestWeeks) bestWeeks = weekStreak;

    // ====== 連続月の計算 ======
    const getMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const examMonths = new Set();
    data.history.forEach(h => examMonths.add(getMonthKey(new Date(h.date))));

    let monthStreak = 0;
    let checkMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    while (true) {
        const mk = getMonthKey(checkMonth);
        if (examMonths.has(mk)) {
            monthStreak++;
            checkMonth.setMonth(checkMonth.getMonth() - 1);
        } else {
            break;
        }
    }

    // 過去最高連続月数
    const sortedMonths = Array.from(examMonths).sort();
    let bestMonths = 0;
    let tempMonthStreak = 0;
    for (let i = 0; i < sortedMonths.length; i++) {
        if (i === 0) {
            tempMonthStreak = 1;
        } else {
            const prev = new Date(sortedMonths[i - 1] + '-01');
            const curr = new Date(sortedMonths[i] + '-01');
            const diffMonths = (curr.getFullYear() - prev.getFullYear()) * 12 + (curr.getMonth() - prev.getMonth());
            if (diffMonths === 1) {
                tempMonthStreak++;
            } else {
                tempMonthStreak = 1;
            }
        }
        if (tempMonthStreak > bestMonths) bestMonths = tempMonthStreak;
    }
    if (monthStreak > bestMonths) bestMonths = monthStreak;

    // ====== 連続年の計算 ======
    const examYears = new Set();
    data.history.forEach(h => examYears.add(new Date(h.date).getFullYear()));

    let yearStreak = 0;
    let checkYear = today.getFullYear();
    while (examYears.has(checkYear)) {
        yearStreak++;
        checkYear--;
    }

    // 過去最高連続年数
    const sortedYears = Array.from(examYears).sort((a, b) => a - b);
    let bestYears = 0;
    let tempYearStreak = 0;
    for (let i = 0; i < sortedYears.length; i++) {
        if (i === 0) {
            tempYearStreak = 1;
        } else {
            if (sortedYears[i] === sortedYears[i - 1] + 1) {
                tempYearStreak++;
            } else {
                tempYearStreak = 1;
            }
        }
        if (tempYearStreak > bestYears) bestYears = tempYearStreak;
    }
    if (yearStreak > bestYears) bestYears = yearStreak;

    return { 
        days: dayStreak, weeks: weekStreak, months: monthStreak, years: yearStreak, 
        bestDays, bestWeeks, bestMonths, bestYears,
        totalDays, restarts
    };
}

// Badge Definitions (Metadata)
const BADGE_INFO = {
    'first_step': { icon: '🌱', name: 'はじめの一歩', desc: '初めて検定を受けた' },
    'perfectionist': { icon: '👑', name: '完全制覇', desc: '満点を取った' },
    'score_100': { icon: '🥉', name: '知識の芽', desc: '累計スコア100到達' },
    'score_500': { icon: '🥈', name: '知識の蕾', desc: '累計スコア500到達' },
    'score_1000': { icon: '🥇', name: '知識の花', desc: '累計スコア1000到達' },
    'rank_s_master': { icon: '✨', name: 'Sランクの輝き', desc: 'Sランクを獲得した' }
};

// --- Requests Management ---
const REQUESTS_STORAGE_KEY = 'memo_game_requests_v1';

function getRequests() {
    const data = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function addRequest(title, detail) {
    const reqs = getRequests();
    reqs.push({
        id: Date.now(),
        title: title,
        detail: detail,
        date: new Date().toISOString()
    });
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(reqs));
}

function removeRequest(id) {
    let reqs = getRequests();
    reqs = reqs.filter(r => r.id !== id);
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(reqs));
}

// Export
window.UserData = {
    get: getUserData,
    addResult: addExamResult,
    updateName: updateUserName,
    addFavorite: addFavorite,
    removeFavorite: removeFavorite,
    isFavorite: isFavorite,
    getBestResult: getBestResult,
    getStreaks: getStreaks,
    BADGES: BADGE_INFO,
    getRequests: getRequests,
    addRequest: addRequest,
    removeRequest: removeRequest
};
