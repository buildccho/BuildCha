# Backend

BuildCha のバックエンド API サーバーです。Hono フレームワークを使用し、ローカル開発と AWS Lambda デプロイの両方をサポートしています。

## 🏗️ プロジェクト構造

```
packages/backend/
├── bin/                    # CDKアプリケーションのエントリーポイント
│   └── backend.ts         # CDKスタックの定義
├── lib/                    # CDKスタックの実装
│   └── backend-stack.ts   # AWS Lambda関数の定義
├── lambda/                 # AWS Lambda用のエントリーポイント
│   └── index.ts           # Lambdaハンドラーの定義
├── test/                   # テストファイル
├── index.ts               # メインのAPIサーバー（Honoアプリ）
├── package.json           # 依存関係とスクリプト
└── tsconfig.json          # TypeScript設定
```

## 🚀 セットアップ

### 前提条件

- Node.js 22.x 以上
- pnpm

### インストール

```bash
pnpm install
```

## 🛠️ 開発

### ローカル開発サーバーの起動

```bash
pnpm dev
```

サーバーは [http://localhost:8000](http://localhost:8000) で起動します。

### ビルド

```bash
pnpm build
```

### テスト

```bash
pnpm test
```

## 🏗️ アーキテクチャ

### ローカル開発

- **Hono** + **@hono/node-server** を使用
- ポート 8000 で HTTP サーバーを起動
- ホットリロード対応（`tsx watch`）

### 本番環境（AWS）

- **AWS Lambda** + **Hono** を使用
- CDK でインフラをコード化
- Lambda Function URL でアクセス可能

### コード共有

- `index.ts` で定義された Hono アプリケーション
- ローカル開発と Lambda 環境で同じコードを再利用
- `lambda/index.ts` で Lambda 用のアダプタを提供

## 📦 主要な依存関係

### フレームワーク

- **Hono**: 軽量な Web フレームワーク
- **@hono/node-server**: Node.js 用サーバーアダプタ

### AWS

- **aws-cdk-lib**: AWS CDK ライブラリ
- **constructs**: CDK コンストラクト

### 開発ツール

- **TypeScript**: 型安全な開発
- **Jest**: テストフレームワーク
- **tsx**: TypeScript 実行環境

## 🚀 デプロイ

### CDK デプロイ

```bash
pnpm cdk deploy
```

### CDK 合成

```bash
pnpm cdk synth
```
