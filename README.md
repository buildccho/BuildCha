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



## フォルダー構造 （AIのために）
<details>

<summary>フォルダー構造</summary>

```
.
├── README.md
├── apps
│   ├── backend
│   │   ├── README.md
│   │   ├── dist
│   │   │   ├── ai
│   │   │   │   ├── chatBot.d.ts
│   │   │   │   ├── chatBot.js
│   │   │   │   ├── compareImages.d.ts
│   │   │   │   ├── compareImages.js
│   │   │   │   ├── create3DObject.d.ts
│   │   │   │   ├── create3DObject.js
│   │   │   │   ├── index.d.ts
│   │   │   │   ├── index.js
│   │   │   │   ├── roofAlignmentTool.d.ts
│   │   │   │   ├── roofAlignmentTool.js
│   │   │   │   ├── schemas.d.ts
│   │   │   │   ├── schemas.js
│   │   │   │   └── tools
│   │   │   │       ├── githubTools.d.ts
│   │   │   │       ├── githubTools.js
│   │   │   │       ├── index.d.ts
│   │   │   │       ├── index.js
│   │   │   │       ├── vectorSearchTool.d.ts
│   │   │   │       └── vectorSearchTool.js
│   │   │   ├── app.d.ts
│   │   │   ├── app.js
│   │   │   ├── client.d.ts
│   │   │   ├── client.js
│   │   │   ├── config.d.ts
│   │   │   ├── config.js
│   │   │   ├── lib
│   │   │   │   ├── auth.d.ts
│   │   │   │   ├── auth.js
│   │   │   │   ├── githubMcpClient.d.ts
│   │   │   │   ├── githubMcpClient.js
│   │   │   │   ├── prisma.d.ts
│   │   │   │   └── prisma.js
│   │   │   ├── map.d.ts
│   │   │   ├── map.js
│   │   │   ├── moc
│   │   │   │   ├── getAnswerObject.d.ts
│   │   │   │   └── getAnswerObject.js
│   │   │   ├── prisma
│   │   │   │   ├── schemas.d.ts
│   │   │   │   └── schemas.js
│   │   │   ├── quest.d.ts
│   │   │   ├── quest.js
│   │   │   ├── routes
│   │   │   │   ├── map.d.ts
│   │   │   │   ├── map.js
│   │   │   │   ├── object.d.ts
│   │   │   │   ├── object.js
│   │   │   │   ├── quest.d.ts
│   │   │   │   ├── quest.js
│   │   │   │   ├── user.d.ts
│   │   │   │   └── user.js
│   │   │   ├── user.d.ts
│   │   │   └── user.js
│   │   ├── generated
│   │   │   └── prisma
│   │   │       ├── client.d.ts
│   │   │       ├── client.js
│   │   │       ├── default.d.ts
│   │   │       ├── default.js
│   │   │       ├── edge.d.ts
│   │   │       ├── edge.js
│   │   │       ├── index-browser.js
│   │   │       ├── index.d.ts
│   │   │       ├── index.js
│   │   │       ├── libquery_engine-darwin-arm64.dylib.node
│   │   │       ├── libquery_engine-linux-arm64-openssl-3.0.x.so.node
│   │   │       ├── libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node
│   │   │       ├── package.json
│   │   │       ├── query_engine_bg.js
│   │   │       ├── query_engine_bg.wasm
│   │   │       ├── runtime
│   │   │       │   ├── edge-esm.js
│   │   │       │   ├── edge.js
│   │   │       │   ├── index-browser.d.ts
│   │   │       │   ├── index-browser.js
│   │   │       │   ├── library.d.ts
│   │   │       │   ├── library.js
│   │   │       │   ├── react-native.js
│   │   │       │   ├── wasm-compiler-edge.js
│   │   │       │   └── wasm-engine-edge.js
│   │   │       ├── schema.prisma
│   │   │       ├── wasm-edge-light-loader.mjs
│   │   │       ├── wasm-worker-loader.mjs
│   │   │       ├── wasm.d.ts
│   │   │       └── wasm.js
│   │   ├── images
│   │   ├── jest.config.js
│   │   ├── migrations
│   │   │   ├── 0001_initial.sql
│   │   │   ├── 0002_create_tables.sql
│   │   │   └── 0003_update_table.sql
│   │   ├── package.json
│   │   ├── prisma
│   │   │   └── schema.prisma
│   │   ├── src
│   │   │   ├── ai
│   │   │   │   ├── chatBot.ts
│   │   │   │   ├── compareImages.ts
│   │   │   │   ├── create3DObject.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── schemas.ts
│   │   │   │   └── tools
│   │   │   │       ├── githubTools.ts
│   │   │   │       ├── index.ts
│   │   │   │       └── vectorSearchTool.ts
│   │   │   ├── app.ts
│   │   │   ├── client.ts
│   │   │   ├── config.ts
│   │   │   ├── lib
│   │   │   │   ├── auth.ts
│   │   │   │   └── prisma.ts
│   │   │   ├── moc
│   │   │   │   └── getAnswerObject.ts
│   │   │   ├── prisma
│   │   │   │   └── schemas.ts
│   │   │   └── routes
│   │   │       ├── map.ts
│   │   │       ├── object.ts
│   │   │       ├── quest.ts
│   │   │       └── user.ts
│   │   ├── test
│   │   │   ├── __mocks__
│   │   │   │   └── cloudflareWorkersMock.ts
│   │   │   └── createObject.test.ts
│   │   ├── tsconfig.json
│   │   ├── worker-configuration.d.ts
│   │   └── wrangler.jsonc
│   └── frontend
│       ├── Dockerfile
│       ├── README.md
│       ├── app
│       │   ├── chatbot
│       │   │   └── page.tsx
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── quests
│       │   │   ├── complete
│       │   │   │   └── page.tsx
│       │   │   ├── detail
│       │   │   │   └── page.tsx
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   └── position
│       │   │       └── page.tsx
│       │   └── start
│       │       └── page.tsx
│       ├── cloudflare-env.d.ts
│       ├── components
│       │   ├── auth
│       │   │   └── authInitializer.tsx
│       │   ├── layout
│       │   │   ├── bgSky.tsx
│       │   │   └── myTown.tsx
│       │   └── ui
│       │       ├── avatar.tsx
│       │       ├── badge.tsx
│       │       ├── button.tsx
│       │       ├── dialog.tsx
│       │       ├── input-group.tsx
│       │       ├── input.tsx
│       │       ├── label.tsx
│       │       ├── progress.tsx
│       │       ├── scroll-area.tsx
│       │       ├── sonner.tsx
│       │       ├── spinner.tsx
│       │       └── textarea.tsx
│       ├── components.json
│       ├── features
│       │   ├── auth
│       │   │   ├── components
│       │   │   │   ├── authenticatedProfileDialog.tsx
│       │   │   │   ├── profileSection.tsx
│       │   │   │   ├── signInButton.tsx
│       │   │   │   ├── signInForm.tsx
│       │   │   │   └── userProfileCard.tsx
│       │   │   └── hooks
│       │   │       └── useSignIn.ts
│       │   ├── chatbot
│       │   │   └── components
│       │   │       └── chatBotPanel.tsx
│       │   ├── quest
│       │   │   └── components
│       │   │       ├── chat.tsx
│       │   │       └── questCard.tsx
│       │   └── world3d
│       │       ├── components
│       │       │   ├── ground.tsx
│       │       │   ├── hoverGuide.tsx
│       │       │   ├── resultObject.tsx
│       │       │   ├── rotationControl.tsx
│       │       │   ├── sceneSetup.tsx
│       │       │   └── selectPosition.tsx
│       │       ├── hooks
│       │       │   ├── useGetMaps.ts
│       │       │   └── useObjectPlacement.ts
│       │       └── utils
│       │           ├── buildingCalculations.ts
│       │           └── buildingRotation.ts
│       ├── hooks
│       │   └── useDeviceDetection.ts
│       ├── lib
│       │   ├── auth-client.ts
│       │   ├── rpc-client.ts
│       │   ├── text-shadow.ts
│       │   └── utils.ts
│       ├── next-env.d.ts
│       ├── next.config.ts
│       ├── open-next.config.ts
│       ├── package.json
│       ├── postcss.config.mjs
│       ├── public
│       │   ├── AICharacter.png
│       │   └── house.png
│       ├── stores
│       │   ├── authStore.ts
│       │   ├── index.ts
│       │   └── objectStore.ts
│       ├── tsconfig.json
│       ├── types
│       │   └── index.ts
│       └── wrangler.jsonc
├── biome.json
├── compose.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tree.txt
```
</details>