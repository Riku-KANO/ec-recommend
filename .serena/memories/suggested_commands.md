# 推奨コマンド一覧

## 開発開始時
```bash
# 環境セットアップ
pnpm setup

# 環境変数設定
pnpm setup:env

# データベース起動
pnpm db:start

# データベースマイグレーション & シード
pnpm db:migrate && pnpm db:seed
```

## 開発時
```bash
# 全体開発サーバー起動
pnpm dev

# フロントエンド別々起動
pnpm dev:frontend  # 全フロントエンド
pnpm dev:user      # ユーザーアプリのみ
pnpm dev:seller    # 出品業者アプリのみ
pnpm dev:admin     # 管理者アプリのみ

# バックエンドのみ
pnpm dev:backend
```

## コード品質
```bash
# リント
pnpm lint

# 型チェック
pnpm type-check

# フォーマット（個別アプリ内で）
cd frontend/apps/user
pnpm format        # フォーマット実行
pnpm format:check  # フォーマットチェック
```

## テスト
```bash
# 全テスト実行
pnpm test

# ユニットテスト
pnpm test:unit

# E2Eテスト
pnpm test:e2e
```

## ビルド
```bash
# 全体ビルド
pnpm build
```

## データベース操作
```bash
# DBリセット（完全初期化）
pnpm db:reset

# DB停止
pnpm db:stop
```

## Docker操作
```bash
# 全サービス起動
pnpm docker:up

# 全サービス停止
pnpm docker:down

# ログ確認
pnpm docker:logs
```

## Protocol Buffers
```bash
# gRPC定義ファイル生成
pnpm proto
```

## Storybook
```bash
# UIコンポーネント開発
pnpm storybook
```

## クリーンアップ
```bash
# 全依存関係クリーンアップ
pnpm clean

# 依存関係更新
pnpm update-deps
```