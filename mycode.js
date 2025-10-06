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

    // イベントタイプが 'message' かつ メッセージタイプが 'text' の場合のみ処理
    if (event.type === 'message' && event.message.type === 'text') {
      const userText = event.message.text;

      // ユーザーIDは非同期処理（Push API）で使うため、Reply APIでは必須ではないが一応取得
      const userId = event.source.userId;

      // 応答メッセージを作成
      const replyMessage = `メッセージを受信しました。\n✅ 無料枠対象外のReply APIで応答中...\nあなたが送ったテキスト：\n「${userText}」\n\nここから部活名入力シナリオを開始します。`;

      // Reply APIを使って、即座に応答を返す
      replyLineMessage(replyToken, replyMessage);
    }
  }
  // LINEサーバーに対して、処理が正常に完了したことを示すHTTP 200を返す
  return ContentService.createTextOutput(JSON.stringify({'status': 'ok'})).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Reply Tokenを使って、受信したメッセージに即時応答する (無料枠カウント対象外)
 * @param {string} replyToken - 応答トークン
 * @param {string} text - 送信するテキストメッセージ
 */
function replyLineMessage(replyToken, text) {
  // アクセストークンが設定されているか確認
  const accessToken = PROPERTIES.LINE_CHANNEL_ACCESS_TOKEN;
  if (!accessToken) {
    Logger.log('ERROR: LINE_CHANNEL_ACCESS_TOKENが設定されていません。');
    return;
  }
  
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + accessToken,
  };

  const payload = {
    'replyToken': replyToken, // ★ Reply APIにはこれが必須
    'messages': [
      {
        'type': 'text',
        'text': text,
      }
    ]
  };

  const options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true // エラー時にGASの実行を止めない
  };

  try {
    const response = UrlFetchApp.fetch(REPLY_API_URL, options);
    Logger.log('LINE Reply API response: ' + response.getContentText());
  } catch(e) {
    Logger.log('LINE Reply API call failed: ' + e);
  }
}