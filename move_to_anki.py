import os
import glob
import re
import subprocess

search_str = "https://hiro8343.github.io/"
replace_str = "https://hiro8343.github.io/anki/"

files_to_replace = [
    "sitemap.xml",
    "robots.txt",
    "scripts/generate_shares.js",
    "cool.html",
    "index.html",
    "lab.html",
    "game.html"
]

shares_files = glob.glob("shares/*.html")
files_to_replace.extend(shares_files)

for file_path in files_to_replace:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # すでにanki/が含まれている場合は置換しない
        content = re.sub(r"https://hiro8343\.github\.io/(?!anki/)", "https://hiro8343.github.io/anki/", content)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

# update_shares.yml の修正
wf_path = ".github/workflows/update_shares.yml"
if os.path.exists(wf_path):
    with open(wf_path, "r", encoding="utf-8") as f:
        wf_content = f.read()
    wf_content = wf_content.replace("node scripts/generate_shares.js", "node anki/scripts/generate_shares.js")
    wf_content = wf_content.replace("git add shares/", "git add anki/shares/")
    with open(wf_path, "w", encoding="utf-8") as f:
        f.write(wf_content)

print("URLの置換とワークフローの修正が完了しました。")

# フォルダ移動
if not os.path.exists("anki"):
    os.makedirs("anki")

exclude = [".git", ".github", ".gitignore", "_agent", "anki", "move_to_anki.py"]
items = os.listdir(".")

for item in items:
    if item not in exclude:
        # git mv は追跡されていないファイルだとエラーになるので、先に add しておく
        subprocess.run(["git", "add", item])
        res = subprocess.run(["git", "mv", item, f"anki/{item}"], capture_output=True, text=True)
        if res.returncode != 0:
            print(f"Failed to move {item} with git mv: {res.stderr.strip()}. Trying normal rename.")
            try:
                os.rename(item, f"anki/{item}")
                subprocess.run(["git", "add", f"anki/{item}"])
            except Exception as e:
                print(f"Error moving {item}: {e}")

print("ファイルの移動が完了しました。")
