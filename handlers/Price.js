function Price (date) {
  try {
    const replyToken = this.replyToken;

    if (!replyToken) return;


    this.session = {
      step: 4,
      date:date
    };
    SendReply(replyToken, "日付を受信しました")
  } catch (e) {
    console.error(e, "Priceセッション中にエラーが発生しました。");
  }
}
