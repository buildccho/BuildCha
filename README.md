# BuildCha

BuildCha は 3D 表現と AI を組み合わせた街づくり支援アプリケーションのモノレポです。Cloudflare Workers 上で動作する Hono ベースのバックエンドと、Next.js 15 / React 19 のフロントエンドを単一リポジトリで管理しています。

## モノレポ構成
- `apps/backend` — LangChain・Prisma・Better Auth などを用いた Cloudflare Workers API
- `apps/frontend` — 3D 表現を行う Next.js 15 (Turbopack) フロントエンド
- `.devcontainer` — VS Code Dev Container 設定 (Node.js 22 + pnpm)
- `compose.yml` — Docker Compose によるローカルプレビュー設定
- そのほか、Biome による整形/静的解析や Husky の Git Hook 設定をルートで管理しています

## 必要環境
- Node.js 22 系 (推奨は Dev Container と同じバージョン)
- pnpm 10.11.0 (`package.json` の `packageManager` で固定)
- Cloudflare アカウントと `wrangler` CLI (バックエンドのデプロイ・ローカル実行に必須)
- Docker / Docker Compose (Dev Container やコンテナ実行を利用する場合)


## 初期セットアップ
プロジェクトルートで依存関係をインストールします。

```bash
pnpm install
```

初回のみ Cloudflare へのログインとローカル DB 用マイグレーション・Prisma クライアント生成を行ってください。

```bash
pnpm --filter backend wrangler login
pnpm --filter backend local:migration
pnpm --filter backend build:prisma
```

## 環境変数
- バックエンド: `apps/backend/.env.example` をコピーして `.env` を作成します。
  - `OPENAI_API_KEY` — OpenAI の API キー
  - `USE_OPENAI_MODEL_NAME` — 既定値 (`gpt-4o-mini` など) を指定
  - `BETTER_AUTH_SECRET` — [Better Auth のドキュメント](https://www.better-auth.com/docs/installation#set-environment-variables)で生成したシークレット
  - `BETTER_AUTH_URL` — ローカル開発時は `http://localhost:8787`
- フロントエンド: API エンドポイントを切り替える場合は `apps/frontend/.env.local` を作成し、`NEXT_PUBLIC_RPC_URL` を設定します (未設定時は `http://localhost:8787` を自動使用します)。

Cloudflare D1 / Vectorize などのバインディングは `apps/backend/wrangler.jsonc` で定義されています。必要に応じて Cloudflare ダッシュボード側のリソースを用意してください。

## ローカル開発
バックエンドとフロントエンドをそれぞれ別ターミナルで起動するのが推奨です。

### バックエンド (Cloudflare Workers)
```bash
pnpm dev:back   # = pnpm --filter backend dev
```
- ポート: `http://localhost:8787`
- Prisma スキーマを変更した際は `pnpm --filter backend build:prisma` を再実行してください。
- D1 のスキーマ変更は `pnpm --filter backend local:migration` で適用できます。

### フロントエンド (Next.js)
```bash
pnpm dev:front  # = pnpm --filter frontend dev
```
- ポート: `http://localhost:3000`
- Turbopack が有効なため、差分に追従した高速なホットリロードが利用できます。

> `pnpm dev` はバックエンド→フロントエンドの順に逐次実行するスクリプトのため、同時起動には別ターミナルで `dev:back` / `dev:front` を実行してください。

## ビルド & デプロイ
- バックエンド: `pnpm build:back` で TypeScript ビルドと Prisma 生成、`pnpm deploy:back` で Cloudflare Workers にデプロイ
- フロントエンド: `pnpm build:front` で本番ビルド、`pnpm deploy:front` / `pnpm upload:front` で OpenNext (Cloudflare Pages/Workers) への反映
- 必要に応じて `pnpm deploy` でバックエンド→フロントエンドの順にデプロイできます

## 品質チェック
- `pnpm lint` — Biome による lint
- `pnpm format` — Biome によるコード整形
- `pnpm check` — Biome の型・Lint チェック
- `pnpm --filter backend test` — バックエンドの Jest テスト (モック環境変数は `apps/backend/test/__mocks__/cloudflareWorkersMock.ts` を参照)

## Dev Container での開発
1. VS Code に Dev Containers 拡張と Docker Desktop をインストール
2. リポジトリを開き、パレットで `Dev Containers: Reopen in Container` を実行
3. コンテナ起動後、自動で `pnpm install` が実行されます
4. コンテナ内ターミナルで `pnpm dev:back` / `pnpm dev:front` を利用してください


