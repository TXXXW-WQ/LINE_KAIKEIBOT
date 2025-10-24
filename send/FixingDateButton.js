function sendFixingDateButton(replyToken, Yer, Mon, Day) {
  const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

  if (!CHANNEL_ACCESS_TOKEN) {
    Logger.log('エラー: チャネルアクセストークンが設定されていません。');
    return { status: 'error', message: 'Channel access token is missing.' };
  }

  const url = 'https://api.line.me/v2/bot/message/reply';

  const message = `${Yer}年${Mon}月${Day}日`
  const payload = {
    replyToken: replyToken,
    messages: [{
      type: "flex",
      altText: message,
      contents: {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "spacing": "md",
          "contents": [
            {
              "type": "text",
              "text": "日付に間違いがなければ確定ボタンを押してください",
              "wrap": true,
              "size": "sm",
              "align": "center",
              "margin": "md"
              
            },
            {
              "type": "text",
              "text": `${Yer}年 ${Mon}月 ${Day}日`,
              "size": "md",
              "align": "center",
              "weight": "bold",
              "color": "#4169e1"
            },
            {
              "type": "separator"
            },
            {
              "type": "button",
              "style": "link",
              "height": "sm",
              "action": {
                "type": "message",
                "label": "確定",
                "text": `${Yer}-${Mon}-${Day}`
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
