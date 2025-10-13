function SelectDate(clubName) {
  try {
    const replyToken = this.replyToken;

    if (!replyToken) return;

    this.session = {
      step: 3,
      clubName: clubName,
      amount: null,
      usage: null,
      receiptId: null
    };
    sendRichDate(replyToken)
  } catch (e) {
    console.error(e, "日付セッション中にエラーが発生しました。");
  }
}
