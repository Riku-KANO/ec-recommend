# ECレコメンドシステム プロジェクト構成

## モノレポ構成

```
ec-recommend/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # CI/CDパイプライン
│   │   ├── frontend-deploy.yml    # フロントエンドデプロイ
│   │   ├── backend-deploy.yml     # バックエンドデプロイ
│   │   └── e2e-tests.yml          # E2Eテスト実行
│   └── CODEOWNERS                 # コードオーナー設定
│
├── frontend/                      # フロントエンドアプリケーション
│   ├── apps/
│   │   ├── user/                  # ユーザー向けNext.js
│   │   │   ├── src/
│   │   │   │   ├── app/           # App Router
│   │   │   │   ├── components/    # UIコンポーネント
│   │   │   │   ├── hooks/         # カスタムフック
│   │   │   │   ├── lib/           # ユーティリティ
│   │   │   │   ├── services/      # APIクライアント
│   │   │   │   └── types/         # 型定義
│   │   │   ├── public/            # 静的ファイル
│   │   │   ├── .storybook/        # Storybook設定
│   │   │   ├── __tests__/         # Vitestテスト
│   │   │   ├── next.config.js
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   └── vitest.config.ts
│   │   │
│   │   ├── seller/                # 業者向けNext.js
│   │   │   └── (同様の構成)
│   │   │
│   │   └── admin/                 # 管理者向けNext.js
│   │       └── (同様の構成)
│   │
│   ├── packages/
│   │   ├── ui/                    # 共通UIコンポーネントライブラリ
│   │   │   ├── src/
│   │   │   │   ├── components/
│   │   │   │   │   └── *.stories.tsx  # Storybook
│   │   │   │   └── __tests__/
│   │   │   ├── .storybook/        # Storybook設定
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   └── vitest.config.ts
│   │   │
│   │   ├── shared/                # 共通ユーティリティ
│   │   │   ├── src/
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   │
│   │   └── api-client/            # API クライアントSDK
│   │       ├── src/
│   │       ├── package.json
│   │       └── tsconfig.json
│   │
│   ├── turbo.json                 # Turborepo設定
│   └── package.json               # ルートpackage.json
│
├── backend/                       # バックエンドマイクロサービス
│   ├── services/
│   │   ├── user/                  # ユーザーサービス (Go)
│   │   │   ├── cmd/
│   │   │   │   └── server/
│   │   │   │       └── main.go
│   │   │   ├── internal/
│   │   │   │   ├── domain/        # ドメインモデル
│   │   │   │   ├── repository/    # リポジトリインターフェース
│   │   │   │   ├── usecase/       # ユースケース
│   │   │   │   ├── handler/       # HTTPハンドラー
│   │   │   │   └── infrastructure/# 実装詳細
│   │   │   ├── pkg/               # 共有パッケージ
│   │   │   ├── go.mod
│   │   │   ├── go.sum
│   │   │   └── Dockerfile
│   │   │
│   │   ├── product/               # 商品サービス (Go)
│   │   │   └── (同様の構成)
│   │   │
│   │   ├── order/                 # 注文サービス (Go)
│   │   │   └── (同様の構成)
│   │   │
│   │   ├── payment/               # 決済サービス (Go)
│   │   │   └── (同様の構成)
│   │   │
│   │   ├── search/                # 検索サービス (Go)
│   │   │   └── (同様の構成)
│   │   │
│   │   ├── analytics/             # 分析サービス (Go)
│   │   │   └── (同様の構成)
│   │   │
│   │   ├── notification/          # 通知サービス (Go)
│   │   │   └── (同様の構成)
│   │   │
│   │   └── recommendation/        # レコメンドサービス (Python)
│   │       ├── src/
│   │       │   ├── api/           # FastAPI
│   │       │   ├── models/        # MLモデル
│   │       │   ├── training/      # 学習パイプライン
│   │       │   └── utils/         # ユーティリティ
│   │       ├── requirements.txt
│   │       ├── setup.py
│   │       └── Dockerfile
│   │
│   ├── shared/                    # バックエンド共通コード
│   │   ├── go/
│   │   │   ├── auth/              # 認証ミドルウェア
│   │   │   ├── database/          # DB接続
│   │   │   ├── logger/            # ロギング
│   │   │   ├── middleware/        # 共通ミドルウェア
│   │   │   └── proto/             # gRPC定義
│   │   │
│   │   └── python/
│   │       └── common/            # Python共通ライブラリ
│   │
│   └── api-gateway/               # API Gateway設定
│       ├── kong/                  # Kong設定（例）
│       └── envoy/                 # Envoy設定（例）
│
├── infrastructure/                # インフラストラクチャコード
│   ├── terraform/
│   │   ├── environments/
│   │   │   ├── dev/               # 開発環境
│   │   │   ├── staging/           # ステージング環境
│   │   │   └── prod/              # 本番環境
│   │   ├── modules/
│   │   │   ├── vpc/               # VPCモジュール
│   │   │   ├── ecs/               # ECSモジュール
│   │   │   ├── rds/               # RDSモジュール
│   │   │   ├── cognito/           # Cognitoモジュール
│   │   │   ├── s3/                # S3モジュール
│   │   │   └── cloudfront/        # CloudFrontモジュール
│   │   └── backend.tf             # Terraform設定
│   │
│   ├── kubernetes/                # K8s設定（将来的な移行用）
│   │   ├── base/
│   │   └── overlays/
│   │
│   └── docker/
│       └── compose/               # ローカル開発用
│           ├── docker-compose.yml
│           └── .env.example
│
├── database/                      # データベース関連
│   ├── migrations/                # マイグレーションファイル
│   │   ├── postgres/
│   │   └── dynamodb/
│   ├── seeds/                     # シードデータ
│   └── schemas/                   # スキーマ定義
│
├── tests/                         # テストコード
│   ├── e2e/                       # E2Eテスト
│   │   ├── playwright/
│   │   │   ├── tests/
│   │   │   ├── playwright.config.ts
│   │   │   └── package.json
│   │   └── fixtures/              # テストデータ
│   │
│   ├── integration/               # 統合テスト
│   └── load/                      # 負荷テスト
│       └── k6/
│
├── scripts/                       # ユーティリティスクリプト
│   ├── setup/                     # セットアップスクリプト
│   ├── deploy/                    # デプロイスクリプト
│   └── db/                        # DB管理スクリプト
│
├── docs/                          # ドキュメント
│   ├── REQUIREMENTS.md            # 要件定義書
│   ├── ARCHITECTURE.md            # アーキテクチャ設計書
│   ├── PROJECT_STRUCTURE.md       # プロジェクト構成（このファイル）
│   ├── API.md                     # API仕様書
│   ├── DATABASE.md                # データベース設計書
│   └── DEPLOYMENT.md              # デプロイメント手順
│
├── .env.example                   # 環境変数サンプル
├── .gitignore                     # Git除外設定
├── README.md                      # プロジェクトREADME
├── Makefile                       # タスクランナー
└── CLAUDE.md                      # Claude Code用メモリ

```

## 主要な技術スタック

### フロントエンド
- **フレームワーク**: Next.js 15+ (App Router)
- **言語**: TypeScript
- **状態管理**: Zustand / TanStack Query
- **UIライブラリ**: Tailwind CSS + shadcn/ui
- **フォーム**: TanStack Form + Zod
- **テスト**: Vitest + React Testing Library
- **UIカタログ**: Storybook
- **モノレポ管理**: Turborepo

### バックエンド
- **言語**: Go (主要サービス), Python (レコメンド)
- **フレームワーク**: Echo/Gin (Go), FastAPI (Python)
- **通信**: gRPC (サービス間), REST (クライアント向け)
- **認証**: AWS Cognito + JWT

### インフラ
- **IaC**: Terraform
- **コンテナ**: Docker
- **オーケストレーション**: ECS Fargate
- **CI/CD**: GitHub Actions

## フロントエンドテスト戦略

### Vitest設定例
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.stories.tsx',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Storybook設定例
```javascript
// .storybook/main.js
export default {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
}
```

### TanStack Form使用例
```typescript
// components/ProductForm.tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, '商品名は必須です'),
  price: z.number().positive('価格は0より大きい必要があります'),
  description: z.string().optional(),
})

export function ProductForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      price: 0,
      description: '',
    },
    onSubmit: async ({ value }) => {
      // 送信処理
    },
    validatorAdapter: zodValidator,
    validators: {
      onChange: productSchema,
    },
  })
  
  // フォーム実装
}
```

## 開発ワークフロー

### ローカル開発
```bash
# 依存関係インストール
make install

# ローカル環境起動
make dev

# テスト実行
make test

# Storybook起動
make storybook

# E2Eテスト
make e2e
```

### テストコマンド
```bash
# ユニットテスト
pnpm test

# テストカバレッジ
pnpm test:coverage

# Storybookビルド
pnpm build-storybook

# E2Eテスト（Playwright）
pnpm test:e2e
```

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

### コミット規約
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` コードスタイル
- `refactor:` リファクタリング
- `test:` テスト
- `chore:` ビルドタスク等

## セキュリティ考慮事項

### シークレット管理
- AWS Secrets Manager使用
- 環境変数は`.env`ファイルで管理（gitignore）
- CI/CDではGitHub Secretsを使用

### アクセス制御
- 最小権限の原則
- IAMロールベースアクセス
- VPCによるネットワーク分離