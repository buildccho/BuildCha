FROM node:22

# 必要なツールをapkでインストール
RUN apt-get update && apt-get install -y zsh git

# pnpmインストール
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /workspace