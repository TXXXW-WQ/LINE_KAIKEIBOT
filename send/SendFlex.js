/**
 * LINE APIにFlex Messageを送信する汎用関数
 * @param {string} replyToken - 応答トークン
 * @param {Object} flexJson - Flex MessageのJSONオブジェクト (type: 'bubble' or 'carousel')
 */
function sendFlexMessage(replyToken, flexJson) {
  const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  
  if (!CHANNEL_ACCESS_TOKEN) {
    console.log('エラー: チャネルアクセストークンが設定されていません。');
    return { status: 'error', message: 'Channel access token is missing.' };
  }

  const url = 'https://api.line.me/v2/bot/message/reply';
  
  const payload = {
    replyToken: replyToken,
    messages: [{
      type: "flex",
      altText: "部活名を選択してください。", // 通知として表示される代替テキスト
      contents: flexJson // ここに bubble または carousel のJSONが入る
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
    console.log('LINE API Flexレスポンス: ' + response.getResponseCode());
    return JSON.parse(response.getContentText() || '{}');
  } catch (e) {
    console.log('API実行中にエラーが発生しました: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}
