# User Service

ユーザープロファイル管理を担当するgRPCマイクロサービス

## 概要

User Serviceは、ECレコメンドシステムのユーザー情報、設定、住所を管理するマイクロサービスです。
DynamoDBをデータストアとして使用し、gRPCプロトコルで通信します。

## 機能

- ユーザープロファイル管理（作成、取得、更新、削除）
- ユーザー設定管理（通知設定、表示設定など）
- 住所管理（配送先、請求先住所の管理）
- Cognito連携によるユーザー認証後の初期設定

## 技術スタック

- **言語**: Go 1.21
- **通信プロトコル**: gRPC
- **データストア**: Amazon DynamoDB
- **ロギング**: Zap
- **ヘルスチェック**: gRPC Health v1

## アーキテクチャ

```
├── proto/                # Protocol Buffers定義
├── internal/
│   ├── grpc/            # gRPCサーバー実装
│   ├── models/          # データモデル
│   ├── repository/      # DynamoDBアクセス層
│   └── service/         # ビジネスロジック層
└── main.go              # エントリーポイント
```

## セットアップ

### 前提条件

- Go 1.21以上
- Protocol Buffers コンパイラ (protoc)
- AWS CLI設定済み
- DynamoDBテーブル作成済み

### 依存関係のインストール

```bash
go mod download
```

### Protocol Buffersのコード生成

```bash
make proto
```

### ローカル実行

```bash
# 環境変数の設定
export AWS_REGION=ap-northeast-1
export USER_TABLE_NAME=ec-recommend-users
export USER_PREFS_TABLE_NAME=ec-recommend-user-preferences
export USER_ADDRESS_TABLE_NAME=ec-recommend-user-addresses

# サービスの起動
make run
```

## Docker

### ビルド

```bash
make docker-build
```

### 実行

```bash
make docker-run
```

## API仕様

### ユーザー操作

- `CreateUser`: 新規ユーザー作成
- `GetUser`: ユーザー情報取得
- `GetCurrentUser`: 現在のユーザー情報取得
- `UpdateUser`: ユーザー情報更新
- `DeleteUser`: ユーザー削除（論理削除）
- `GetUserByEmail`: メールアドレスでユーザー検索

### 設定操作

- `GetUserPreferences`: ユーザー設定取得
- `UpdateUserPreferences`: ユーザー設定更新

### 住所操作

- `CreateAddress`: 住所追加
- `GetAddress`: 住所取得
- `GetUserAddresses`: ユーザーの全住所取得
- `UpdateAddress`: 住所更新
- `DeleteAddress`: 住所削除

## DynamoDBテーブル構成

### ec-recommend-users
- **パーティションキー**: userId (String)
- **GSI**: email-index (email)

### ec-recommend-user-preferences
- **パーティションキー**: userId (String)

### ec-recommend-user-addresses
- **パーティションキー**: addressId (String)
- **GSI**: userId-index (userId)

## 環境変数

- `PORT`: gRPCサーバーポート（デフォルト: 50051）
- `AWS_REGION`: AWSリージョン（デフォルト: ap-northeast-1）
- `USER_TABLE_NAME`: ユーザーテーブル名
- `USER_PREFS_TABLE_NAME`: ユーザー設定テーブル名
- `USER_ADDRESS_TABLE_NAME`: 住所テーブル名

## テスト

```bash
make test
```

## デプロイ

ECS Fargateへのデプロイを想定しています。
詳細は `/infrastructure` ディレクトリを参照してください。