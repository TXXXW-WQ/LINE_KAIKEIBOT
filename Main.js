// スクリプトプロパティからアクセストークンを取得
const PROPERTIES = PropertiesService.getScriptProperties().getProperties();
const REPLY_API_URL = 'https://api.line.me/v2/bot/message/reply';

function doPost(e) {
  const contens = JSON.parse(e.postData.contents);
  const events = contens.events;

  // ログに受信したイベント情報を出力（デバッグ用）
  Logger.log('Received LINE Webhook: ' + JSON.stringify(events));

  for (const event of events) {
    // 応答トークン（Reply Token）は即時応答に必須
    const replyToken = event.replyToken;
    let userText = null;
    // イベントタイプが 'message' かつ メッセージタイプが 'text' の場合のみ処理
    if (event.type === 'message' && event.message.type === 'text') {
      userText = event.message.text;
    } else if (event.type === 'postback') {
      userText = event.postback.params.date
    } else if (event.type == "image") {
      userText = event.massage.id;
    }
    
    // ユーザーIDは非同期処理（Push API）で使うため、Reply APIでは必須ではないが一応取得
    const userId = event.source.userId;

    const conversationn = new ScenarioController(userId, replyToken)

    conversationn.handleMessage(userText)

  }
  // LINEサーバーに対して、処理が正常に完了したことを示すHTTP 200を返す
  return ContentService.createTextOutput(JSON.stringify({ 'status': 'ok' })).setMimeType(ContentService.MimeType.JSON);
}

