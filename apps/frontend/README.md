# Frontend

BuildChaプロジェクトのフロントエンドアプリケーション

## 概要

Next.js 15とReact 19を使用したモダンなWebアプリケーションです。3D表現とUIコンポーネントを組み合わせたインタラクティブな街づくりアプリケーションを構築しています。

## 技術スタック

### フレームワーク・ライブラリ
- **Next.js 15** - Reactベースのフレームワーク（Turbopack使用）
- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発

### 3D関連
- **Three.js** - 3Dグラフィックスライブラリ
- **React Three Fiber** - ReactでThree.jsを使用するためのレンダラー
- **React Three Drei** - 3D開発のためのヘルパー・コンポーネント集

### スタイリング・UI
- **Tailwind CSS 4** - ユーティリティファーストCSSフレームワーク
- **shadcn/ui** - 再利用可能なコンポーネントライブラリ
- **Radix UI** - アクセシブルなプリミティブコンポーネント
- **Lucide React** - アイコンライブラリ

### 参考リンク
- [Next.js 15](https://nextjs.org/docs)
- [React 19](https://reactjs.org/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction/)
- [React Three Drei](https://drei.docs.pmnd.rs/getting-started/introduction)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)


## プロジェクト構成

```
apps/frontend/
├── app/                 # App Routerディレクトリ
│   ├── layout.tsx      # ルートレイアウト
│   ├── page.tsx        # メインページ
│   └── globals.css     # グローバルスタイル
├── components/         # コンポーネント
│   └── ui/            # UIコンポーネント
├── lib/               # ユーティリティ
└── public/            # 静的ファイル
```

## 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバー起動
pnpm start
```

## 設定ファイル

- `components.json` - shadcn/ui設定（New Yorkスタイル、TypeScript対応）
- `next.config.ts` - Next.js設定
- `tsconfig.json` - TypeScript設定
- `postcss.config.mjs` - PostCSS設定

## 開発環境

- Docker対応（Dockerfile含む）
- Dev Container対応

