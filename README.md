# シフト申請アプリ

## セットアップ手順

### 1. Google Apps Script のセットアップ

1. [Google Apps Script](https://script.google.com/) でプロジェクトを新規作成
2. `gas/Code.gs` の内容をエディタにコピー
3. `SPREADSHEET_ID` を自分のスプレッドシートIDに変更
4. スプレッドシートIDは URL の `https://docs.google.com/spreadsheets/d/★ここ★/edit` の部分
5. `initializeSheets()` を実行してシート・サンプルデータを初期化
6. 「デプロイ」→「新しいデプロイ」→「種類: ウェブアプリ」を選択
7. 「次のユーザーとして実行」→「自分」、「アクセスできるユーザー」→「全員」に設定
8. デプロイして表示される URL をコピー

### 2. Next.js のセットアップ

```bash
# .env.local を作成
cp .env.local.example .env.local

# .env.local を編集して GAS の URL を設定
NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# パッケージインストール
npm install

# 開発サーバー起動
npm run dev
```

### 3. Vercel へのデプロイ

1. GitHub にプッシュ
2. [Vercel](https://vercel.com/) でリポジトリをインポート
3. 環境変数 `NEXT_PUBLIC_GAS_URL` にGASのURLを設定してデプロイ

## ディレクトリ構成

```
shift-app/
├── gas/
│   └── Code.gs          # Google Apps Script
├── src/
│   ├── app/
│   │   ├── layout.tsx   # 共通レイアウト
│   │   ├── page.tsx     # シフト枠一覧
│   │   └── apply/
│   │       └── [shiftId]/
│   │           └── page.tsx  # 申請フォーム
│   ├── lib/
│   │   └── api.ts       # GAS API呼び出し
│   └── types/
│       └── index.ts     # 型定義
└── .env.local.example
```

## スプレッドシート構成

### シフト枠シート
| 枠ID | 枠名 | 日付 | 場所 | 開始時間 | 終了時間 | 業務内容 | 募集人数 | 申請数 | ステータス |

### 申請シート
| 申請ID | 申請日時 | 氏名 | メール | 希望枠ID | 希望枠名 | 区分 | メモ | ステータス |
