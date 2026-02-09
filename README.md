# Sentry Release 検証サイト

SentryのRelease機能を検証するためのシンプルな静的サイトです。GitHub Pagesにデプロイされます。

## 機能

- ✅ Sentry SDK統合
- ✅ Release情報の表示
- ✅ エラーテスト機能
- ✅ GitHub Actionsによる自動デプロイ
- ✅ リリースバージョンの自動設定
- ✅ GitHub統合による高度な機能（Suspect Commits、Stack Trace Linking、PRコメント）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. GitHub統合のセットアップ

このプロジェクトは**GitHub統合を使用する前提**で設定されています。以下の手順でセットアップしてください：

1. **SentryでGitHub統合をインストール**:
   - SentryのSettings > Integrations > [GitHub](https://sentry.io/orgredirect/organizations/:orgslug/settings/integrations/github)に移動
   - 「Install」または「Upgrade」をクリック
   - GitHubの認証画面で「Install」をクリック
   - リポジトリへのアクセス権限を付与（このリポジトリを選択）
   - Sentryに戻り、「Configure」をクリックしてリポジトリを追加

2. **GitHub Secretsの設定**:
   GitHubリポジトリのSettings > Secrets and variables > Actions で、以下のシークレットを追加してください：

   - `SENTRY_DSN`: SentryプロジェクトのDSN（フロントエンド用）
   - `SENTRY_AUTH_TOKEN`: Sentryの認証トークン（Settings > Account > Auth Tokensで作成）
   - `SENTRY_ORG`: Sentryの組織名（スラッグ）
   - `SENTRY_PROJECT`: Sentryのプロジェクト名（スラッグ）

3. **Code Mappingsの設定（オプション）**:
   Stack Trace Linkingを有効にするには、SentryのSettings > Integrations > GitHub > Configure > Code Mappingsで設定を行ってください。

### 3. ローカル開発用の環境変数設定

ローカル開発時は、`.env`ファイルを作成して環境変数を設定できます：

1. プロジェクトルートに`.env`ファイルを作成：
   ```bash
   # .envファイルの例
   SENTRY_DSN=your-sentry-dsn-here
   RELEASE_VERSION=1.0.0-dev
   ENVIRONMENT=development
   ```

2. `.env`ファイルは既に`.gitignore`に含まれているため、Gitにコミットされません。

3. ビルド時に自動的に`.env`ファイルから環境変数が読み込まれます。

**注意**: GitHub ActionsなどのCI環境では、環境変数が既に設定されているため、`.env`ファイルは使用されません。

### 4. ローカルでの実行

```bash
npm run serve
```

ブラウザで `http://localhost:8000` にアクセスしてください。

**注意**: 初回実行時は自動的にビルドが実行されます。`.env`ファイルを設定している場合は、その値が使用されます。

## 使用方法

### リリースの作成

1. **タグを使用したリリース**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   タグをプッシュすると、自動的にGitHub Pagesにデプロイされ、Sentryにリリース情報が送信されます。

2. **手動デプロイ**:
   GitHub Actionsの「Deploy to GitHub Pages」ワークフローを手動で実行できます。

### Sentry Releaseの設定

GitHub Actionsでデプロイが実行されると、自動的に以下が行われます：

1. ビルド時にリリースバージョンが決定される
2. Sentryにリリースが作成される
3. ソースマップがアップロードされる
4. GitHubのコミット情報が自動的に紐付けられる

SentryのWeb UI（Releasesページ）からリリースを確認・管理できます。

### GitHub統合の機能

GitHub統合をインストールすることで、以下の機能が利用可能になります：

1. **Suspect Commits（問題の原因となったコミットの自動検出）**:
   - エラーが発生したリリースに関連するコミットを自動的に特定
   - どのコミットが問題を引き起こした可能性が高いかを表示

2. **Stack Trace Linking（スタックトレースからGitHubへのリンク）**:
   - エラーのスタックトレースから、GitHubのソースコードに直接リンク
   - Code Mappingsを設定することで、正確なファイルパスをマッピング

3. **Pull Requestへの自動コメント**:
   - マージされたPRが問題の原因となった場合、自動的にコメントを投稿
   - オープン中のPRで、関連する既存の問題をハイライト

4. **Issueの自動解決**:
   - コミットメッセージに`fixes SENTRY-ID`を含めることで、Issueを自動的に解決

これらの機能を最大限に活用するには、GitHub統合のインストールが必要です。

## ファイル構成

```
.
├── index.html          # メインHTMLファイル
├── style.css          # スタイルシート
├── app.js             # JavaScript（Sentry統合）
├── build.js           # ビルドスクリプト
├── package.json       # 依存関係
├── .github/
│   └── workflows/
│       └── deploy.yml # GitHub Actions設定
└── README.md          # このファイル
```

## テスト機能

サイトには以下のテスト機能が含まれています：

1. **エラーを発生させる**: 意図的にエラーを発生させ、Sentryに送信します
2. **メッセージを送信**: 情報メッセージをSentryに送信します
3. **例外をスロー**: ネストされた例外を発生させ、スタックトレースを確認できます

## 注意事項

- ローカル環境では、`SENTRY_DSN`が設定されていない場合、エラーはSentryに送信されませんが、ログには表示されます
- 本番環境（GitHub Pages）では、GitHub Secretsで設定した`SENTRY_DSN`が使用されます
- リリースバージョンは、Gitタグ、コミットSHA、または手動実行時のタイムスタンプから自動的に決定されます

## ライセンス

MIT
