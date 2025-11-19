/**
 * LINE APIにFlex Messageを送信する汎用関数
 * @param {string} replyToken - 応答トークン
 * @param {Object} flexJson - Flex MessageのJSONオブジェクト (type: 'bubble' or 'carousel')
 */
function sendFlexMessage(replyToken, flexJson) {
  const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

  if (!CHANNEL_ACCESS_TOKEN) {
    Logger.log('エラー: チャネルアクセストークンが設定されていません。');
    return { status: 'error', message: 'Channel access token is missing.' };
  }

  const url = 'https://api.line.me/v2/bot/message/reply';

  const payload = {
    replyToken: replyToken,
    messages: [{
      type: "flex",
      altText: "部活名を選択してください。", 
      contents: flexJson 
    },
    {
      type: "flex",
      altText: "前の選択肢に戻るボタン", 
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "メニュー", 
              align: "center",
              wrap: true,
              weight: "bold"
            }
          ]
        },
        footer: { 
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              style: "link", 
              height: "sm",
              action: {
                type: "message",
                label: "一つ戻る",
                text: "一つ戻る" 
              }
            },
            {
              type: "button",
              style: "link", 
              height: "sm",
              action: {
                type: "message",
                label: "報告をキャンセル",
                text: "報告をキャンセル" 
              }
            }
          ]
        }
      }
    }]
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
    Logger.log('LINE API Flexレスポンス: ' + response.getResponseCode());
    return JSON.parse(response.getContentText() || '{}');
  } catch (e) {
    Logger.log('API実行中にエラーが発生しました: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}
