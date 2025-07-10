FROM node:22-alpine

# 必要なツールをapkでインストール
RUN apk update && apk add --no-cache zsh git

# pnpmインストール
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /workspace