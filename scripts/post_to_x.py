import os
import tweepy

# 環境変数からAPIキーを取得
API_KEY = os.environ.get("X_API_KEY")
API_KEY_SECRET = os.environ.get("X_API_KEY_SECRET")
ACCESS_TOKEN = os.environ.get("X_ACCESS_TOKEN")
ACCESS_TOKEN_SECRET = os.environ.get("X_ACCESS_TOKEN_SECRET")

def post_tweet(message):
    """
    X (Twitter) にツイートを投稿する関数
    """
    try:
        # 認証
        client = tweepy.Client(
            consumer_key=API_KEY,
            consumer_secret=API_KEY_SECRET,
            access_token=ACCESS_TOKEN,
            access_token_secret=ACCESS_TOKEN_SECRET
        )
        
        # 投稿
        response = client.create_tweet(text=message)
        print(f"投稿成功: {response.data['id']}")
        return True
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return False

if __name__ == "__main__":
    # コミットメッセージなどを引数や環境変数から取得して投稿する想定
    # 今回は簡単な更新通知を送ります
    commit_msg = os.environ.get("COMMIT_MESSAGE", "サイトが更新されました！")
    repo_url = os.environ.get("REPO_URL", "https://hiro8343.github.io/")
    
    tweet_text = f"✨ サイト更新のお知らせ ✨\n\n【更新内容】\n{commit_msg}\n\n詳細はこちら：\n{repo_url}"
    
    # 280文字制限に配慮（簡易版）
    if len(tweet_text) > 280:
        tweet_text = tweet_text[:277] + "..."
        
    post_tweet(tweet_text)
