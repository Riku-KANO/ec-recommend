#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log(chalk.blue.bold('\n🚀 ECレコメンドシステム セットアップ\n'));

// 必要なツールのチェック
async function checkDependencies() {
  const spinner = ora('依存関係をチェックしています...').start();
  
  const dependencies = [
    { name: 'Docker', command: 'docker --version' },
    { name: 'Node.js', command: 'node --version' },
    { name: 'pnpm', command: 'pnpm --version' },
    { name: 'Go', command: 'go version' },
    { name: 'Python', command: 'python3 --version' },
    { name: 'AWS CLI', command: 'aws --version' }
  ];

  const missing = [];

  for (const dep of dependencies) {
    try {
      execSync(dep.command, { stdio: 'ignore' });
    } catch {
      missing.push(dep.name);
    }
  }

  if (missing.length > 0) {
    spinner.fail('以下のツールがインストールされていません:');
    missing.forEach(tool => console.log(chalk.red(`  - ${tool}`)));
    console.log(chalk.yellow('\nセットアップガイドを参照してください: docs/SETUP_GUIDE.md'));
    process.exit(1);
  }

  spinner.succeed('すべての依存関係が確認できました');
}

// 環境変数ファイルのセットアップ
async function setupEnvFiles() {
  const spinner = ora('環境変数ファイルをセットアップしています...').start();

  const envExample = join(rootDir, '.env.example');
  const envFile = join(rootDir, '.env');

  if (!existsSync(envFile)) {
    copyFileSync(envExample, envFile);
    spinner.succeed('環境変数ファイルを作成しました');
    console.log(chalk.yellow('  → .envファイルを編集して設定を完了してください'));
  } else {
    spinner.info('環境変数ファイルは既に存在します');
  }
}

// Dockerサービスの起動
async function startDockerServices() {
  const { startDocker } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'startDocker',
      message: 'Dockerサービスを起動しますか？',
      default: true
    }
  ]);

  if (startDocker) {
    const spinner = ora('Dockerサービスを起動しています...').start();
    try {
      execSync('pnpm docker:up', { stdio: 'inherit', cwd: rootDir });
      spinner.succeed('Dockerサービスが起動しました');
      
      // サービスが完全に起動するまで待機
      console.log(chalk.gray('  データベースの初期化を待っています...'));
      await new Promise(resolve => setTimeout(resolve, 10000));
    } catch (error) {
      spinner.fail('Dockerサービスの起動に失敗しました');
      console.error(error);
    }
  }
}

// データベースのセットアップ
async function setupDatabase() {
  const { setupDb } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setupDb',
      message: 'データベースをセットアップしますか？',
      default: true
    }
  ]);

  if (setupDb) {
    const spinner = ora('データベースをセットアップしています...').start();
    try {
      execSync('pnpm db:migrate', { stdio: 'inherit', cwd: rootDir });
      execSync('pnpm db:seed', { stdio: 'inherit', cwd: rootDir });
      spinner.succeed('データベースのセットアップが完了しました');
    } catch (error) {
      spinner.fail('データベースのセットアップに失敗しました');
      console.error(error);
    }
  }
}

// 依存関係のインストール
async function installDependencies() {
  const spinner = ora('依存関係をインストールしています...').start();
  try {
    execSync('pnpm install', { stdio: 'inherit', cwd: rootDir });
    spinner.succeed('依存関係のインストールが完了しました');
  } catch (error) {
    spinner.fail('依存関係のインストールに失敗しました');
    console.error(error);
  }
}

// Proto ファイルのコンパイル
async function compileProto() {
  const { compileProto } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'compileProto',
      message: 'Protocol Buffersをコンパイルしますか？',
      default: true
    }
  ]);

  if (compileProto) {
    const spinner = ora('Protocol Buffersをコンパイルしています...').start();
    try {
      execSync('pnpm proto', { stdio: 'inherit', cwd: rootDir });
      spinner.succeed('Protocol Buffersのコンパイルが完了しました');
    } catch (error) {
      spinner.fail('Protocol Buffersのコンパイルに失敗しました');
      console.error(error);
    }
  }
}

// メイン処理
async function main() {
  try {
    await checkDependencies();
    await setupEnvFiles();
    await installDependencies();
    await startDockerServices();
    await setupDatabase();
    await compileProto();

    console.log(chalk.green.bold('\n✅ セットアップが完了しました！\n'));
    console.log(chalk.cyan('開発を開始するには:'));
    console.log(chalk.white('  pnpm dev        # すべてのサービスを起動'));
    console.log(chalk.white('  pnpm dev:user   # ユーザー向けフロントエンドのみ起動'));
    console.log(chalk.white('  pnpm storybook  # Storybookを起動'));
    console.log('');
  } catch (error) {
    console.error(chalk.red('\n❌ セットアップ中にエラーが発生しました:'));
    console.error(error);
    process.exit(1);
  }
}

main();