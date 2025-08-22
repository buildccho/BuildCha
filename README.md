# BuildCha

モノレポ構成ですべての開発を行います。

## セットアップ

依存関係をインストールするには、プロジェクトのルートディレクトリで次のコマンドを実行します。

```bash
pnpm install
```

## 開発環境の起動

開発サーバーをローカルで起動するには以下を実行します。

```bash
pnpm dev
```

## Dockerでの開発環境構築

Dockerを使った開発環境構築には2つの方法があります。
### 1. Dev Containerを使用する方法 (推奨)

Dev Container機能を使用して、統一された開発環境で作業できます。

#### 前提条件

- **Dev Containers拡張機能** 
  - 拡張機能マーケットプレイスからインストール
- **Docker Desktop**

#### 起動方法

1. VS Codeでプロジェクトルートディレクトリを開く
2. コマンドパレット（`Ctrl+Shift+P` / `Cmd+Shift+P`）を開く
3. `Dev Containers: Reopen in Container` を選択
4. コンテナが自動的にビルドされ、開発環境が準備されます

#### 開発環境の起動

Dev Container内で以下のコマンドを実行します：

```bash
# 全サービスの開発サーバー起動
pnpm dev

# または個別に起動
pnpm --filter backend dev
pnpm --filter frontend dev
```

### 2. Docker Composeを使用する方法 (デプロイ向け)

以下のコマンドでそれぞれのサービスを起動できます。

- **backendのみ起動**

```bash
docker compose --profile frontend build
docker compose --profile backend up --build
```

- **frontendのみ起動**

```bash
docker compose --profile backend build
docker compose --profile frontend up --build
```

- **両方同時に起動**

```bash
docker compose --profile full build
docker compose --profile full up --build
```

各サービスのアクセス先は次のとおりです。

- backend: [http://localhost:8000](http://localhost:8000)
- frontend: [http://localhost:3000](http://localhost:3000)

停止は以下のコマンドです。

```bash
docker compose down
```
