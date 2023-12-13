## Installation

```bash
git clone git@github.com:mizukitayama/chatGPT-slack-bot.git && cd chatGPT-slack-bot
```

1. Slack CLIのインストール

```bash
$ curl -fsSL https://downloads.slack-edge.com/slack-cli/install.sh | bash
```

2. CLIからSlackにログイン

```bash
slack login
```

3. 環境変数をCLIから設定

```bash
slack env add SLACK_API_KEY 'xoxp-xxxxxxxx-xxx-xxxxxx'
slack env add OPEN_AI_API_KEY 'xxxxxxxxxxx'
slack env add CHANNEL_IDS 'C0xxxxxxx C0xxxxxxx C0xxxxxxx C0xxxxxxx'
```

このコマンドで、以下のキーを追加する
- SLACK_API_KEY
  - ここからSlackのワークスペースにアプリを追加：https://api.slack.com/apps
  - OAuth & PermissionsページからBot Token Scopesに以下を追加したボットのAPIキーを使う
    - channels:history
    - chat:write
    - groups:history
    - im:history
    - mpim:history
  - 会話履歴の取得に使われる
- OPEN_AI_API_KEY
  - Billingの設定をしたアカウントであることを確認する：https://platform.openai.com/account/billing/overview
  - keyを生成：https://platform.openai.com/api-keys
  - chatGPT model gpt-4 を使用
- CHANNEL_IDS
  - トリガー作成時に使用
  - チャンネル内でメンションされるとbotがトリガーされる
  - ボットを使いたいチャンネルID。半角空白区切りで複数のチャンネル設定可能

**ローカルで実行する場合、.env.sampleファイルを.envファイルに書き換え、同じキーを登録する**


3. トリガーの作成

```bash
slack trigger create --trigger-def "triggers/asking_chatgpt_workflow.ts"
```

4. デプロイ

```bash
slack deploy
```

## Memo

- ローカルで実行

```bash
slack run
```

- ログの確認

```bash
slack activity
```
