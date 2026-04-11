const fs = require('fs');
const path = require('path');

// CSV URL
const SPREADSHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1IN-PC0r_y6WHSQs1-Xklakj72LYm43q6xUspQ0KueXE/export?format=csv&gid=1782876609';

// Hash function matching frontend
function generateHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
}

// Robust CSV Parser (handles quotes and newlines)
function parseCSV(text) {
    const result = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                field += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                field += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                row.push(field);
                field = '';
            } else if (char === '\n' || char === '\r') {
                row.push(field);
                if (row.length > 1 || row[0] !== '') {
                    result.push(row);
                }
                row = [];
                field = '';
                if (char === '\r' && nextChar === '\n') {
                    i++;
                }
            } else {
                field += char;
            }
        }
    }
    if (row.length > 0 || field !== '') {
        row.push(field);
        result.push(row);
    }
    return result;
}

const sharesDir = path.join(__dirname, '..', 'shares');
if (!fs.existsSync(sharesDir)) {
    fs.mkdirSync(sharesDir);
}

async function run() {
    console.log('Fetching CSV processing data...');
    try {
        const response = await fetch(SPREADSHEET_CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.text();
        
        const parsed = parseCSV(data);
        const rows = parsed.slice(1); // skip header
        let count = 0;

        rows.forEach(row => {
            if (row.length < 4) return;
            const cat = row[0] || 'その他';
            const title = row[1];
            const desc = row[2] || '';
            const content = row[3] || '';
            
            if (!title) return;

            const hash = generateHash(title);
            
            // Build share text equivalent to what we do in JS
            const tags = " #暗記 #かっこいい";
            const contentLines = content.split('\n').filter(l => l.trim() !== '');
            let previewAll = "---\\n" + contentLines.join('、');
            
            let shareText = desc + "\\n" + previewAll + tags;
            if (shareText.length > 120) {
                let partialPreview = "---\\n" + contentLines.slice(0, 2).join('、') + (contentLines.length > 2 ? '...' : '');
                shareText = desc + "\\n" + partialPreview + tags;
            }

            const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${title} | 暗記したらかっこいい | 楽しい暗記サイト</title>
    <meta name="description" content="${shareText.replace(/"/g, '&quot;')}">
    <meta property="og:title" content="${title} | 暗記したらかっこいい">
    <meta property="og:description" content="${shareText.replace(/"/g, '&quot;')}">
    <meta property="og:url" content="https://hiro8343.github.io/shares/${hash}.html">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="楽しい暗記サイト">
    <meta name="twitter:card" content="summary">
    
    <script>
        // 実際のコンテンツページへリダイレクト
        window.location.replace('../cool.html?title=' + encodeURIComponent('${title.replace(/'/g, "\\'")}'));
    </script>
</head>
<body>
    <p>リダイレクト中... <a href="../cool.html?title=${encodeURIComponent(title)}">自動で移動しない場合はこちらをクリック</a></p>
</body>
</html>`;

            fs.writeFileSync(path.join(sharesDir, `${hash}.html`), htmlContent, 'utf-8');
            count++;
        });

        console.log(`Successfully generated ${count} share pages in /shares/`);
    } catch (err) {
        console.error('Error fetching CSV:', err);
    }
}

run();
