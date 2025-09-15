# Workout App

このリポジトリは、フロントエンド（Next.js）とバックエンド（Express）で構成されたワークアウト管理アプリです。

## ディレクトリ構成（TypeScript化後）

```
/
├── frontend/
│   ├── tsconfig.json
│   └── src/
│       ├── pages/                  # 画面ごとのReactページコンポーネント（TSX）
│       │   ├── _app.tsx            # Next.js カスタムApp
│       │   ├── _document.tsx       # Next.js カスタムDocument
│       │   ├── history.tsx         # 記録履歴ページ
│       │   ├── login.tsx           # ログインページ
│       │   ├── measure.tsx         # 計測ページ
│       │   ├── register.tsx        # 新規登録ページ
│       │   └── setting.tsx         # 設定ページ
│       ├── components/
│       │   └── HamburgerMenu.tsx   # ハンバーガーメニュー
│       ├── hooks/                  # カスタムフック（TS）
│       │   ├── useAuth.ts
│       │   ├── useHistory.ts
│       │   ├── useMeasure.ts
│       │   └── useSetting.ts
│       └── styles/                 # CSSファイル群（変更なし）
│           ├── globals.css
│           ├── HamburgerMenu.module.css
│           ├── history.module.css
│           ├── login.module.css
│           ├── measure.module.css
│           ├── register.module.css
│           └── setting.module.css
├── backend/
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts                  # Expressアプリ本体
│       ├── db.ts                   # MySQL接続
│       ├── server.ts               # サーバー起動
│       ├── controllers/
│       │   ├── history.ts
│       │   ├── login.ts
│       │   ├── measure.ts
│       │   ├── register.ts
│       │   └── setting.ts
│       ├── routes/
│       │   ├── history.ts
│       │   ├── login.ts
│       │   ├── measure.ts
│       │   ├── register.ts
│       │   └── setting.ts
│       └── middleware/
│           ├── apply.ts
│           └── auth.ts
└── README.md
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
- typescript
- @types/react, @types/react-dom, @types/node, @types/jwt-decode
- @eslint/eslintrc: ^3 / eslint: ^9 / eslint-config-next: 15.2.0

### バックエンド（backend）
- bcrypt: ^5.1.1
- cors: ^2.8.5
- dotenv: ^16.4.7
- express: ^4.21.2
- jsonwebtoken: ^9.0.2
- mysql2: ^3.12.0

#### 開発用依存
- typescript, ts-node
- @types/node, @types/express, @types/jsonwebtoken, @types/cors, @types/bcrypt
- nodemon: ^3.1.x