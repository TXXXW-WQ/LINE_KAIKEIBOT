function ValidateImage(messageId) {
  try {
    const replyToken = this.replyToken
    if (!replyToken) {
      Logger.log('replyTokenがありません。');
    }
    const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
    const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;

    const payload = {
      replyToken: replyToken
    }
    const options = {
      'method': 'post',
      'headers': {
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      'payload': JSON.stringify(payload),
      'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(url, options);
    this.session = {
      ...this.session,
      step: 9,
      receipt_image: image
    }

  } catch (e) {
    Logger.log('画像の取得中にエラーが発生しました: ' + e.toString());
  }
}
