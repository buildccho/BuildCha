# Back-Azure

BuildCha のバックエンド API サーバーです。Hono フレームワークを使用し、ローカル開発と Azure Functions デプロイの両方をサポートしています。

## 🏗️ プロジェクト構造

```
apps/back-azure/
├── src/                    # ソースコード
│   ├── app.ts             # メインのAPIアプリケーション（Honoアプリ）
│   └── functions/         # Azure Functions用のエントリーポイント
│       └── httpTrigger.ts # HTTP トリガー関数の定義
├── host.json              # Azure Functions の設定ファイル
├── local.settings.json    # ローカル開発用の設定
├── package.json           # 依存関係とスクリプト
└── tsconfig.json          # TypeScript設定
```

## 🚀 セットアップ

### 前提条件

- Node.js 18.x 以上
- pnpm
- Azure Functions Core Tools（ローカル開発用）

### インストール

```bash
pnpm install
```

### Azure Functions Core Tools のインストール

```bash
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

## 🛠️ 開発

### ローカル開発サーバーの起動

```bash
pnpm dev
```

サーバーは [http://localhost:7071](http://localhost:7071) で起動します。

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

- **Hono** + **@marplex/hono-azurefunc-adapter** を使用
- Azure Functions Core Tools でローカルサーバーを起動
- ポート 7071 で HTTP サーバーを起動
- ホットリロード対応（TypeScript watch モード）

### 本番環境（Azure）

- **Azure Functions** + **Hono** を使用
- HTTP トリガーでリクエストを処理
- すべてのHTTPメソッド（GET, POST, DELETE, PATCH）をサポート

### コード共有

- `src/app.ts` で定義された Hono アプリケーション
- ローカル開発と Azure Functions 環境で同じコードを再利用
- `src/functions/httpTrigger.ts` で Azure Functions 用のアダプタを提供

## 📦 主要な依存関係

### フレームワーク

- **Hono**: 軽量な Web フレームワーク
- **@marplex/hono-azurefunc-adapter**: Azure Functions 用の Hono アダプタ

### Azure

- **@azure/functions**: Azure Functions ランタイム

### 開発ツール

- **TypeScript**: 型安全な開発
- **concurrently**: 複数コマンドの並列実行
- **rimraf**: ディレクトリクリーンアップ

## 🚀 デプロイ

### Azure Functions へのデプロイ

```bash
# ビルド
pnpm build

# Azure にデプロイ（Azure CLI を使用）
func azure functionapp publish <your-function-app-name>
```

### 設定

- `host.json`: Azure Functions の全体設定
- `local.settings.json`: ローカル開発用の環境設定
- CORS設定: すべてのオリジンを許可（開発用）
