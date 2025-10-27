# BuildCha MCP Worker

BuildCha 用に用意した Model Context Protocol (MCP) サーバーを Cloudflare Worker 上で公開するためのコードです。  
Hono アプリケーションをベースに GitHub 連携ツールと Cloudflare Vectorize によるナレッジ検索を提供します。

## 主な機能

- `get_github_file_tool` — BuildCha リポジトリ内の任意ファイル内容を取得。
- `github_list_files_and_folders_tool` — リポジトリのツリー構造を取得。
- `vector_store_tool` — Cloudflare Vectorize の `buildcha-vector` インデックスに対して類似検索を実行。
- `zod` による JSON スキーマバリデーションと LangChain + OpenAI Embeddings を利用したベクトル化。

## 必要環境

- Node.js 18 以上（Wrangler 4 が Node 18+ を要求）。
- Cloudflare アカウント（Workers / AI Gateway / Vectorize が有効化されていること）。
- 下記アクセストークン:
  - `GITHUB_TOKEN`: 対象リポジトリの読み取り権限を付与。
  - `OPENAI_API_KEY`: LangChain 経由で利用する OpenAI API のキー。

## セットアップ

```bash
npm install
```

pnpm など別パッケージマネージャを使う場合は、下記コマンドを同等のスクリプトに置き換えてください。

## ローカル開発フロー

1. `.env` ファイルを作成し、`wrangler dev` 実行時に必要なシークレットを記述します。
   ```bash
   GITHUB_TOKEN=xxxxxxxxxxxxxxxx
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
   ```
2. `wrangler.jsonc` に記載された Vectorize バインディングが存在することを確認します。既定では `buildcha-vector` インデックスを想定しています。必要に応じて作成:
   ```bash
   wrangler vectorize index create buildcha-vector
   ```
3. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
   Wrangler は `http://127.0.0.1:8787` で Worker を提供し、`/mcp` エンドポイントが MCP サーバーを初期化して JSON レスポンスをストリームします。

> **補足:** `vector_store_tool` は Vectorize バインディングが必須です。ローカルで完全にオフラインの場合、初期化エラーが発生し本番と同じ挙動になります。

## 利用可能なスクリプト

- `npm run dev` — Cloudflare Workers の開発サーバーを起動（ホットリロード付き）。
- `npm run deploy` — Worker を Cloudflare にデプロイ（ミニファイ有り）。
- `npm run build` — TypeScript を `tsc` でビルドおよび型チェック。
- `npm run cf-typegen` — `CloudflareBindings` の型定義を再生成（`wrangler.jsonc` 更新後に実行）。

## シークレットとバインディング

本番環境にデプロイする前に、Wrangler 経由でシークレットを登録してください。

```bash
wrangler secret put GITHUB_TOKEN
wrangler secret put OPENAI_API_KEY
```

別の Vectorize インデックスやリージョンを参照する場合は、`apps/mcp/wrangler.jsonc` を更新し、`npm run cf-typegen` で型定義を再生成します。

## ディレクトリ構成

- `src/index.ts` — MCP サーバーと Hono アプリの初期化処理。
- `src/tools/githubTools.ts` — GitHub 連携用ツールの実装。
- `src/tools/vectorSearchTool.ts` — Vectorize を利用した類似検索ツールのファクトリ。
- `src/config.ts` — 環境変数スキーマと取得ヘルパー。
- `wrangler.jsonc` — Worker 設定・AI バインディング・Vectorize 設定。

## MCP 連携メモ

サーバーは上記ツールを `@modelcontextprotocol/sdk` に登録します。MCP 対応クライアントは `/mcp` ルートへ Streamable HTTP Transport で接続可能です。接続前に環境バインディングが正しく設定されていることを確認し、初期化エラーを防いでください。
