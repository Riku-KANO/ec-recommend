# コードスタイル・規約

## TypeScript/React 規約

### ESLint設定
- Next.js推奨設定 + TypeScript strict
- import文の自動ソート（アルファベット順）
- 未使用変数のエラー（`_`プレフィックスは除外）
- `any`型は警告レベル

### Prettier設定
- **インデント**: スペース2個
- **行幅**: 80文字
- **セミコロン**: 必須
- **クォート**: シングルクォート
- **JSX**: シングルクォート
- **末尾カンマ**: ES5準拠
- **改行**: LF

### Import順序規約
1. Node.js built-in
2. external packages
3. internal modules
4. parent/sibling
5. index files

各グループ間は空行、アルファベット順

### 命名規約
- **コンポーネント**: PascalCase
- **ファイル**: コンポーネントはPascalCase、その他はcamelCase
- **変数・関数**: camelCase
- **定数**: SCREAMING_SNAKE_CASE
- **型定義**: PascalCase

## Go 規約

### 認証・セキュリティ
- AWS Cognito + JWT
- gRPC interceptorによる認証
- ロールベースアクセス制御（buyer, seller, admin）
- パブリックエンドポイントの明示的定義

### エラーハンドリング
- gRPC status codes使用
- 構造化されたエラーメッセージ

## データベース規約

### 命名
- テーブル: snake_case
- カラム: snake_case
- インデックス: 意味のある名前

## Git規約

### Pre-commit hooks
- ESLint自動修正
- Prettier自動フォーマット
- Go: gofmt + golangci-lint

### ファイル対象
- `.{js,jsx,ts,tsx}`: ESLint + Prettier
- `.{json,md,yml,yaml}`: Prettier
- `.go`: gofmt + golangci-lint