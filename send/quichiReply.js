function sendReplyWithMessageAndQuickReply(replyToken, text, quickReplyPayload) {
  // スクリプトプロパティからチャネルアクセストークンを取得
  // プロパティキーは任意（例: 'LINE_CHANNEL_ACCESS_TOKEN'）
  const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  
  if (!CHANNEL_ACCESS_TOKEN) {
   Logger.log('エラー: チャネルアクセストークンが設定されていません。');
    return { status: 'error', message: 'Channel access token is missing.' };
  }

  const url = 'https://api.line.me/v2/bot/message/reply';
  
  // メッセージのペイロードを構築
  const message = {
    type: 'text',
    text: text, // メインのメッセージテキスト
    // ここにクイックリプライのペイロードをマージする
    ...quickReplyPayload 
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
    Logger.log('LINE APIレスポンス: ' + response.getResponseCode());
    Logger.log(result);
    return result;
  } catch (e) {
    Logger.log('API実行中にエラーが発生しました: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}