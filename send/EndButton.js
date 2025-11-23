/**
 * 簡単なテキストメッセージをreplymessageで返す関数
 */
function sendEndButton(replyToken) {
  // スクリプトプロパティからアクセストークンを取得
  const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

  if (!CHANNEL_ACCESS_TOKEN) {
    Logger.log('エラー: チャネルアクセストークンが設定されていません。');
    return;
  }

  const url = 'https://api.line.me/v2/bot/message/reply';

  const text = "報告を完了するにはボタンをタップしてください。"
  const endButton = {
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message", // ユーザーがメッセージを送信するアクション
            label: "報告完了", // ボタンに表示されるテキスト
            text: "報告完了" // 実際にBotに送られるテキスト
          }
        }
      ]
    }
  };

  const payload = {
    replyToken: replyToken,
    messages: [
      {
        type: 'text',
        text: text,
        ...endButton
      }
    ]
  };

  const options = {
    'method': 'post',
    'headers': {
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log('LINE APIレスポンス: ' + response.getResponseCode());
  } catch (e) {
    Logger.log('API実行中にエラーが発生しました: ' + e.toString());
  }
}