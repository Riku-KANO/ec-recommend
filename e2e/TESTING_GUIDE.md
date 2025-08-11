# E2E テスト実行ガイド

## 前提条件
- Docker Desktop が起動していること
- ポート 3000, 5000, 8080 が使用可能であること

## テストの実行方法

### 1. Dockerコンテナとテストを一括実行
```bash
cd e2e
npm run test:with-docker
```

### 2. 手動でDockerコンテナを管理する場合
```bash
# コンテナを起動
npm run docker:up

# サービスが起動するまで待機（約30秒）
# ブラウザで以下のURLにアクセスして確認
# - http://localhost:3000 (Frontend)
# - http://localhost:8080 (Backend)
# - http://localhost:5000 (Cognito Mock)

# テストを実行
npm test

# コンテナを停止
npm run docker:down
```

### 3. デバッグモードでテストを実行
```bash
npm run docker:up
npm run test:debug
npm run docker:down
```

## トラブルシューティング

### ポートが既に使用されている場合
他のアプリケーションが同じポートを使用している可能性があります。
以下のコマンドで確認してください：

Windows:
```cmd
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8080
```

### Dockerコンテナが起動しない場合
```bash
# ログを確認
docker-compose -f config/docker-compose.yml logs

# クリーンアップして再起動
npm run docker:clean
npm run docker:up
```