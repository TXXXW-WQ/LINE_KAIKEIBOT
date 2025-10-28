function ValidateImage(messageId) {
  try {
    const image = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  } catch (e) {
    Logger.log('画像の取得中にエラーが発生しました: ' + e.toString());
  }
}
