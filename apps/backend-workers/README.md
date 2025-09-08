
# BuildCha Backend

Hono + Cloudflare Workers で構築された BuildCha のバックエンドサービスです。

## 概要

このディレクトリは、BuildCha プロジェクトのバックエンド（APIサーバー）を管理します。
主に Hono フレームワークと Cloudflare Workers を利用し、Prisma によるDBアクセスや認証機能などを提供します。

## 開発環境セットアップ

1. 依存パッケージをインストール
	```bash
	pnpm install
	```
2. wrangler ログイン
	```bash
	npx wrangler login
	```
3. マイグレーションを適用
	```bash
	pnpm local:migration
	```
4. prisma client を生成
	```bash
	pnpm prisma generate
	```
5. 開発サーバーの起動
	```bash
	pnpm dev
	```

## 主要コマンド

backend-workers ディレクトリ内で利用できる主要なコマンドは以下の通りです

| コマンド | 説明 |
|----------|------|
| `pnpm install` | 依存パッケージのインストール |
| `pnpm dev` | 開発サーバーの起動 |
| `pnpm local:migration` | 開発環境のD1マイグレーション |
| `pnpm remote:migration` | 本番環境のD1マイグレーション |
| `pnpm test` | テストの実行 |

## テスト

テスト用の環境変数は、test/__mocks__/cloudflareWorkersMock.ts に設定してください。

```ts
// Cloudflare Workers 用モジュールのモック
export const env = {
  OPENAI_API_KEY: "dummy-key", // 自分のkeyに変更してください
  USE_OPENAI_MODEL_NAME: "gpt-4o-mini",
}
```


## ディレクトリ構成

```
apps/backend-workers/
├── migrations/         # DBマイグレーションSQL
├── prisma/             # Prismaスキーマ
├── src/                # ソースコード
│   ├── app.ts          # エントリーポイント
│   ├── config.ts       # 設定
│   ├── lib/            # ライブラリ群
│   ├── routes/         # APIルート
│   └── moc/            # モックデータ
└── worker-configuration.d.ts  # Worker設定型定義
```

## 使用技術

- [Hono](https://hono.dev/) - 軽量Webフレームワーク
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Prisma](https://www.prisma.io/) - ORM
- TypeScript
- pnpm
