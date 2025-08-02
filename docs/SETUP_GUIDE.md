# ECレコメンドシステム 開発環境セットアップガイド

## 前提条件

### 必要なソフトウェア
- **Node.js**: v20.x 以上
- **pnpm**: v8.x 以上
- **Go**: 1.21 以上
- **Python**: 3.11 以上
- **Git**: 最新版
- **AWS CLI**: v2
- **Terraform**: 1.5 以上

### 推奨開発環境
- **IDE**: Visual Studio Code または IntelliJ IDEA
- **OS**: macOS, Linux, Windows (WSL2)
- **メモリ**: 16GB 以上推奨

## 1. クイックスタート

```bash
# リポジトリのクローン
git clone https://github.com/your-org/ec-recommend.git
cd ec-recommend

# 自動セットアップスクリプトの実行
pnpm install
pnpm setup
```

自動セットアップスクリプトは以下を実行します：
- 依存関係のチェック
- 環境変数ファイルの作成
- Node.js依存関係のインストール
- Dockerサービスの起動
- データベースのセットアップ
- Protocol Buffersのコンパイル

## 2. 環境変数の設定

`.env`ファイルを編集して必要な設定を行います：

```bash
# AWS設定
AWS_REGION=ap-northeast-1
AWS_PROFILE=ec-recommend-dev

# Cognito設定
COGNITO_USER_POOL_ID=ap-northeast-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# データベース設定
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ec_recommend
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis設定
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenSearch設定
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200

# Stripe設定（テスト用キー）
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 3. 開発コマンド

### 基本的なコマンド

```bash
# すべてのサービスを起動
pnpm dev

# フロントエンドのみ起動
pnpm dev:frontend

# バックエンドのみ起動
pnpm dev:backend

# 特定のアプリケーションを起動
pnpm dev:user    # ユーザー向けフロントエンド
pnpm dev:seller  # 販売者向けフロントエンド
pnpm dev:admin   # 管理者向けフロントエンド

# Storybookを起動
pnpm storybook
```

### テストとビルド

```bash
# すべてのテストを実行
pnpm test

# ユニットテストのみ
pnpm test:unit

# E2Eテスト
pnpm test:e2e

# リント実行
pnpm lint

# 型チェック
pnpm type-check

# ビルド
pnpm build
```

### データベース操作

```bash
# Dockerサービスの起動
pnpm docker:up

# Dockerサービスの停止
pnpm docker:down

# データベースマイグレーション
pnpm db:migrate

# シードデータ投入
pnpm db:seed

# データベースリセット
pnpm db:reset
```

### その他のコマンド

```bash
# Protocol Buffersコンパイル
pnpm proto

# 依存関係の更新
pnpm update-deps

# プロジェクトのクリーンアップ
pnpm clean

# Dockerログの確認
pnpm docker:logs
```

## 4. 各サービスへのアクセス

### フロントエンド
- ユーザー向け: http://localhost:3000
- 販売者向け: http://localhost:3001
- 管理者向け: http://localhost:3002
- Storybook: http://localhost:6006

### バックエンドAPI
- API Gateway: http://localhost:8080
- レコメンドサービス: http://localhost:8000

### インフラサービス
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- OpenSearch: http://localhost:9200

## 5. Turborepoの活用

このプロジェクトはTurborepoを使用してモノレポを管理しています。

### Turborepoの利点
- **並列実行**: タスクが自動的に並列実行される
- **キャッシュ**: ビルド結果がキャッシュされ、2回目以降が高速
- **依存関係の自動解決**: パッケージ間の依存関係を自動的に処理

### フィルタリング

```bash
# 特定のパッケージのみ実行
pnpm turbo run build --filter=user

# 特定のディレクトリ配下のみ実行
pnpm turbo run test --filter="./frontend/**"

# 変更されたパッケージのみ実行
pnpm turbo run test --filter="...[origin/main]"
```

## 6. トラブルシューティング

### ポート競合

```bash
# 使用中のポートを確認
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# プロセスを終了
kill -9 [PID]  # macOS/Linux
taskkill /PID [PID] /F  # Windows
```

### Docker関連

```bash
# Dockerのステータス確認
docker ps

# コンテナの再起動
pnpm docker:down
pnpm docker:up

# ログの確認
pnpm docker:logs
```

### 依存関係の問題

```bash
# キャッシュをクリアして再インストール
pnpm clean
pnpm install
```

## 7. VSCode推奨設定

### 推奨拡張機能

`.vscode/extensions.json`:
```json
{
  "recommendations": [
    "golang.go",
    "ms-python.python",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "hashicorp.terraform",
    "ms-azuretools.vscode-docker",
    "zxh404.vscode-proto3"
  ]
}
```

### ワークスペース設定

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "go.lintOnSave": "package",
  "go.formatTool": "goimports",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 8. 開発フロー

### ブランチ戦略

```bash
# 機能開発
git checkout -b feature/add-cart-functionality

# バグ修正
git checkout -b fix/payment-error

# プルリクエスト作成前
git fetch origin
git rebase origin/develop
```

### コミット規約

```bash
# 良い例
git commit -m "feat: カート機能を追加"
git commit -m "fix: 支払い処理のエラーを修正"
git commit -m "docs: セットアップガイドを更新"

# コミットメッセージのフォーマット
# type: description
# 
# types: feat, fix, docs, style, refactor, test, chore
```

## 9. 次のステップ

1. [API仕様書](./API.md)を確認
2. [アーキテクチャ設計書](./ARCHITECTURE.md)を確認
3. サンプルコードを参考に開発開始
4. テストを書きながら実装

## サポート

問題が発生した場合:
1. このガイドのトラブルシューティングセクションを確認
2. `pnpm setup`を再実行
3. プロジェクトのSlackチャンネルで質問
4. GitHubでIssueを作成