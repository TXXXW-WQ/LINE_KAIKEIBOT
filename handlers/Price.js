function Price (inputdate) {
  try {
    const replyToken = this.replyToken;

    if (!replyToken) return;


    this.session = {
      step: 5,
      date: inputdate
    };
    sendReply(replyToken, "使った金額を半角英数字で入力してください。\n※空白や全角数字は入力しないでください")
  } catch (e) {
    console.error(e, "Priceセッション中にエラーが発生しました。");
  }
}
