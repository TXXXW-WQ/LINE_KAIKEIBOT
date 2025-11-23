function Price(inputdate) {
  try {
    const replyToken = this.replyToken;
    if (!replyToken) return;

    sendReplyAndButton(replyToken, "使用金額を半角数字で入力してください。\n※空白や単位は入力しないでください。")

    this.session = {
      ...this.session,
      step:5,
      date:inputdate
    }
    
  } catch (e) {
    Logger.log(e, "Priceセッション中にエラーが発生しました。");
  }
}
