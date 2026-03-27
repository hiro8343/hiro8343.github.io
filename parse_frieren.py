import re

try:
    with open('frieren.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Find where the character section starts
    match = re.search(r'(<h2[^>]*>.*?id="登場人物".*?</h2\s*>)(.*?)<h2', html, re.DOTALL | re.IGNORECASE)
    
    if match:
        section = match.group(2)
    else:
        idx = html.find('id="登場人物"')
        if idx == -1:
            print("登場人物が見つかりません")
            exit()
        idx2 = html.find('<h2', idx)
        idx3 = html.find('<h2', idx2 + 3)
        if idx3 != -1:
            section = html[idx2:idx3]
        else:
            section = html[idx2:]

    # Remove script tags or style tags to avoid weird matching
    section = re.sub(r'<script.*?</script>', '', section, flags=re.DOTALL)
    section = re.sub(r'<style.*?</style>', '', section, flags=re.DOTALL)

    pattern = re.compile(r'<(h3|h4|dt)[^>]*>(.*?)</\1\s*>', re.IGNORECASE | re.DOTALL)
    
    current_h3 = ""
    current_h4 = ""
    
    seen = set()

    with open('characters.txt', 'w', encoding='utf-8') as out:
        for tag, content in pattern.findall(section):
            text = re.sub(r'<[^>]+>', '', content).strip()
            tag = tag.lower()
            
            if tag == 'h3':
                text = re.sub(r'\[.+?\]', '', text).strip()
                current_h3 = text
                current_h4 = ""
            elif tag == 'h4':
                text = re.sub(r'\[.+?\]', '', text).strip()
                current_h4 = text
            elif tag == 'dt':
                name = text.split('声')[0].strip()
                name = re.sub(r'\[.+?\]', '', name).strip()
                name = re.sub(r'\s*-\s*$', '', name).strip()
                
                group = current_h3
                if current_h4:
                    group += "・" + current_h4
                
                if not name or name in ["脚注", "注釈", "注", "出典"]:
                    continue
                    
                entry = f"{name}（{group}）"
                if entry not in seen:
                    out.write(entry + '\n')
                    seen.add(entry)

except Exception as e:
    print("Error:", e)
