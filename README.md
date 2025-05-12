# Workout App

このリポジトリは、フロントエンド（Next.js）とバックエンド（Express）で構成されたワークアウト管理アプリです。

## ディレクトリ構成

```
/
├── frontend/
│   └── src/
│       ├── pages/                  # 画面ごとのReactページコンポーネント
│       │   ├── _app.js             # Next.js全体のカスタムAppコンポーネント
│       │   ├── _document.js        # Next.js全体のカスタムDocument
│       │   ├── history.js          # 記録履歴ページ
│       │   ├── login.js            # ログインページ
│       │   ├── measure.js          # 計測ページ
│       │   ├── register.js         # 新規登録ページ
│       │   └── setting.js          # 設定ページ
│       ├── components/             # 再利用可能なUIコンポーネント
│       │   └── HamburgerMenu.js    # ハンバーガーメニューのUIコンポーネント
│       ├── hooks/                  # カスタムReactフック
│       │   ├── useAuth.js          # 認証関連のロジック
│       │   ├── useHistory.js       # 記録履歴取得・管理ロジック
│       │   ├── useMeasure.js       # 計測データ取得・管理ロジック
│       │   └── useSetting.js       # 設定データ取得・管理ロジック
│       └── styles/                 # CSSファイル群
│           ├── globals.css                 # 全体スタイル
│           ├── HamburgerMenu.module.css    # ハンバーガーメニュー用スタイル
│           ├── history.module.css          # 記録履歴ページ用スタイル
│           ├── login.module.css            # ログインページ用スタイル
│           ├── measure.module.css          # 計測ページ用スタイル
│           ├── register.module.css         # 新規登録ページ用スタイル
│           └── setting.module.css          # 設定ページ用スタイル
├── backend/
│   └── src/
│       ├── app.js                  # Expressアプリのエントリーポイント
│       ├── db.js                   # MySQLデータベース接続設定
│       ├── server.js               # サーバー起動スクリプト
│       ├── controllers/            # 各種ビジネスロジック
│       │   ├── history.js          # 記録履歴関連の処理
│       │   ├── login.js            # ログイン処理
│       │   ├── measure.js          # 計測データ処理
│       │   ├── register.js         # 新規登録処理
│       │   └── setting.js          # 設定関連の処理
│       ├── routes/                 # APIルーティング
│       │   ├── history.js          # 記録履歴APIルート
│       │   ├── login.js            # ログインAPIルート
│       │   ├── measure.js          # 計測APIルート
│       │   ├── register.js         # 新規登録APIルート
│       │   └── setting.js          # 設定APIルート
│       └── middleware/             # ミドルウェア
│           ├── apply.js            # リクエスト前処理用ミドルウェア
│           └── auth.js             # 認証用ミドルウェア
└── README.md                       # プロジェクト全体の説明
```

## 依存技術

### フロントエンド（frontend）
- axios: ^1.8.1
- jwt-decode: ^4.0.0
- next: 15.2.0
- react: ^19.0.0
- react-dom: ^19.0.0
- recharts: ^2.15.1

#### 開発用依存
- @eslint/eslintrc: ^3
- eslint: ^9
- eslint-config-next: 15.2.0

### バックエンド（backend）
- bcrypt: ^5.1.1
- cors: ^2.8.5
- dotenv: ^16.4.7
- express: ^4.21.2
- jsonwebtoken: ^9.0.2
- mysql2: ^3.12.0

#### 開発用依存
- nodemon: ^3.1.9
