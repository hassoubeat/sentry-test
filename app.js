// Sentry初期化
// このプロジェクトはGitHub統合を使用する前提で設定されています
// GitHub統合により、Suspect Commits、Stack Trace Linking、PRコメントなどの機能が利用可能になります
// 注意: 実際の使用時は、SentryのDSNを環境変数や設定ファイルから取得してください
const SENTRY_DSN = window.SENTRY_DSN || '';

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,
        environment: getEnvironment(),
        release: getReleaseVersion(), // リリースバージョンはGitHub統合と連携してエラーを追跡
        sampleRate: 1.0, // エラーイベントのサンプリング
        tracesSampleRate: 1.0, // パフォーマンストランザクションのサンプリング
        beforeSend(event, hint) {
            // ログに記録
            addLog('Sentry Event', event, 'info');
            return event;
        }
    });

    // buildTimeのみ追加情報として設定（releaseとenvironmentはinit()で既に設定済み）
    // GitHub統合は、リリースとコミット情報を自動的に紐付けます
    Sentry.setContext('build', {
        buildTime: getBuildTime()
    });
}

// リリース情報の取得
function getReleaseVersion() {
    // 環境変数やビルド時に注入された値を使用
    // GitHub Actionsでビルド時に注入することを想定
    // このリリースバージョンは、GitHub統合と連携してコミット情報と紐付けられます
    return window.RELEASE_VERSION || '1.0.0-dev';
}

function getEnvironment() {
    // ビルド時に注入された環境変数を優先的に使用
    // GitHub Actionsのロジックと一致: mainブランチ = production, その他 = staging
    return window.ENVIRONMENT || 'staging';
}

function getBuildTime() {
    return window.BUILD_TIME || new Date().toISOString();
}

// DOM要素の取得
const versionEl = document.getElementById('version');
const environmentEl = document.getElementById('environment');
const buildTimeEl = document.getElementById('buildTime');
const logContainer = document.getElementById('logContainer');
const testErrorBtn = document.getElementById('testError');
const testMessageBtn = document.getElementById('testMessage');
const testExceptionBtn = document.getElementById('testException');
const clearLogBtn = document.getElementById('clearLog');

// リリース情報の表示
function updateReleaseInfo() {
    versionEl.textContent = getReleaseVersion();
    environmentEl.textContent = getEnvironment();
    buildTimeEl.textContent = getBuildTime();
}

// ログ機能
function addLog(message, data = null, type = 'info') {
    const placeholder = logContainer.querySelector('.log-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    const time = new Date().toLocaleTimeString('ja-JP');
    let content = `<span class="log-time">[${time}]</span>${message}`;
    
    if (data) {
        content += `<pre style="margin-top: 8px; font-size: 0.85em; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>`;
    }
    
    logEntry.innerHTML = content;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// イベントハンドラー
testErrorBtn.addEventListener('click', () => {
    addLog('エラーテストを実行中...', null, 'warning');
    
    try {
        // 意図的にエラーを発生させる
        throw new Error('これはテスト用のエラーです。Sentry Release機能の検証用です。');
    } catch (error) {
        if (SENTRY_DSN) {
            Sentry.captureException(error);
            addLog('エラーをSentryに送信しました', { error: error.message }, 'error');
        } else {
            addLog('Sentry DSNが設定されていません。エラーを送信できませんでした。', { error: error.message }, 'error');
        }
    }
});

testMessageBtn.addEventListener('click', () => {
    const message = `テストメッセージ - ${new Date().toISOString()}`;
    
    if (SENTRY_DSN) {
        Sentry.captureMessage(message, 'info');
        addLog('メッセージをSentryに送信しました', { message }, 'success');
    } else {
        addLog('Sentry DSNが設定されていません。メッセージを送信できませんでした。', { message }, 'warning');
    }
});

testExceptionBtn.addEventListener('click', () => {
    addLog('例外テストを実行中...', null, 'warning');
    
    try {
        // ネストされた関数で例外を発生
        function level1() {
            function level2() {
                function level3() {
                    throw new TypeError('ネストされた例外エラー - Sentry Release検証用');
                }
                level3();
            }
            level2();
        }
        level1();
    } catch (error) {
        if (SENTRY_DSN) {
            Sentry.captureException(error);
            addLog('例外をSentryに送信しました', { 
                error: error.message,
                stack: error.stack 
            }, 'error');
        } else {
            addLog('Sentry DSNが設定されていません。例外を送信できませんでした。', { 
                error: error.message 
            }, 'error');
        }
    }
});

clearLogBtn.addEventListener('click', () => {
    logContainer.innerHTML = '<p class="log-placeholder">ログがここに表示されます...</p>';
    addLog('ログをクリアしました', null, 'info');
});

// 初期化
updateReleaseInfo();
addLog('アプリケーションが初期化されました', {
    version: getReleaseVersion(),
    environment: getEnvironment(),
    buildTime: getBuildTime(),
    sentryConfigured: !!SENTRY_DSN
}, 'success');
