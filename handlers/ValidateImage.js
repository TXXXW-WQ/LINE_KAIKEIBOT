function ValidateImage(messageId) {
  try {
    const image = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
    // Logger.log('画像の取得に成功しました。')
    this.session = {
      ...this.session,
      step:9,
      receipt_image: image
    }

  } catch (e) {
    Logger.log('画像の取得中にエラーが発生しました: ' + e.toString());
  }
}
