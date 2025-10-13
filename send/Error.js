function sendError(replyToken) {
  const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

  if (!CHANNEL_ACCESS_TOKEN) {
    console.log('エラー: チャネルアクセストークンが設定されていません。');
    return { status: 'error', message: 'Channel access token is missing.' };
  }

  const url = 'https://api.line.me/v2/bot/message/reply';

  // メッセージのペイロードを構築
  const message = {
    type: 'text',
    text: "想定されていない返信を受信しました。"
  };

  const payload = {
    replyToken: replyToken,
    messages: [message]
  };

  const options = {
    'method': 'post',
    'headers': {
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true // エラー時も例外を投げず、レスポンスを取得
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText() || '{}');
    console.log('LINE APIレスポンス: ' + response.getResponseCode());
    console.log(result);
    return result;
  } catch (e) {
    console.log('API実行中にエラーが発生しました: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}
