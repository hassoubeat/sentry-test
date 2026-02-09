const fs = require('fs-extra');
const path = require('path');

// ローカル開発時は.envファイルから環境変数を読み込む
// GitHub ActionsなどのCI環境では環境変数が既に設定されているため、dotenvは無視される
if (process.env.NODE_ENV !== 'production' && !process.env.CI) {
    require('dotenv').config();
}

// ビルド時にリリース情報を注入
const releaseVersion = process.env.RELEASE_VERSION || process.env.GITHUB_REF?.replace('refs/tags/', '') || '1.0.0-dev';
const buildTime = new Date().toISOString();
const sentryDsn = process.env.SENTRY_DSN || '';
const environment = process.env.ENVIRONMENT || 'development';

console.log(`Building with version: ${releaseVersion}`);
console.log(`Build time: ${buildTime}`);
console.log(`Environment: ${environment}`);

// HTMLファイルを読み込んで置換
const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// app.jsの前にリリース情報を注入するスクリプトを追加
const releaseScript = `
    <script>
        window.RELEASE_VERSION = '${releaseVersion}';
        window.BUILD_TIME = '${buildTime}';
        window.SENTRY_DSN = '${sentryDsn}';
        window.ENVIRONMENT = '${environment}';
    </script>
`;

// </head>の前に挿入
html = html.replace('</head>', `${releaseScript}</head>`);

// distディレクトリに出力
const distDir = path.join(__dirname, 'dist');
fs.ensureDirSync(distDir);
fs.writeFileSync(path.join(distDir, 'index.html'), html);

// 他のファイルもコピー
fs.copySync(path.join(__dirname, 'style.css'), path.join(distDir, 'style.css'));
fs.copySync(path.join(__dirname, 'app.js'), path.join(distDir, 'app.js'));

console.log('Build completed!');
