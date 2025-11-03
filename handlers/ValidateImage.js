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
      'method': 'get',
      'headers': {
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      'payload': JSON.stringify(payload),
      'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      const imageBlob = response.getBlob();
      Logger.log('画像データを取得しました。ファイル名: ' + imageBlob.getName() + ', サイズ: ' + imageBlob.getBytes().length + 'バイト');

      this.session = {
        ...this.session,
        step: 9,
        receipt_image: image
      }
    } else {
      Logger.log("画像取得失敗")
      return
    }


  } catch (e) {
    Logger.log('画像の取得中にエラーが発生しました: ' + e.toString());
  }
}
