function ValidateImage(messageId) {
  try {
    const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

    if (!CHANNEL_ACCESS_TOKEN) {
      Logger.log('エラー: チャネルアクセストークンが設定されていません。');
      return
    }
    const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;

    const imageOptions = {
      'method': 'get',
      'headers': {
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
      },
      'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(url, imageOptions);
    if (response.getResponseCode() === 200) {
      const imageBlob = response.getBlob();
      // Logger.log(`画像取得に成功しました${imageBlob}`)
      // Logger.log('画像データを取得しました。ファイル名: ' + imageBlob.getName() + ', サイズ: ' + imageBlob.getBytes().length + 'バイト');
      const mimeType = imageBlob.getContentType();
      const base64EncodedImage = Utilities.base64Encode(imageBlob.getBytes());
      Logger.log('Base64エンコードが完了しました。');

      const ocrResultAmount = OcrImage(base64EncodedImage, mimeType)

      if (ocrResultAmount === this.session.price && ocrResultAmount != 0) {
        Logger.log('画像の金額と入力された金額が一致しました。')
        sendReply(this.replyToken, "報告が完了しました。セッションを終了します")
        this.session = {
          ...this.session,
          step: 10,
          endFlag: true
        }
        // スプレッドシートへの書き込みと終了処理-未実装
        const SPREED_FAIL = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = SPREED_FAIL.getSheetByName('会計ログ')
        const startRow = sheet.getLastRow() + 1;
        const sessionInfo = Object.values(this.session)
        const culum = sessionInfo.length
        const addRange = sheet.getRange(startRow,1,1,culum)
        const inputDate = [sessionInfo]
        addRange.setValues(inputDate)
      } else {
        this.session = {
          ...this.session,
          step: 9,
        }
        sendReply(this.replyToken, "領収書の金額と入力された金額の検証に失敗しました。\nもう一度画像を送信するか初めからやり直してください。")
        return
      }


    } else {
      Logger.log(`画像取得失敗: ${response.getResponseCode()}`);
      return
    }


  } catch (e) {
    Logger.log('画像の取得中にエラーが発生しました: ' + e.toString());
  }
}

