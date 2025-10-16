function SelectDate(clubName) {
  try {
    const replyToken = this.replyToken;

    if (!replyToken) return;

    sendRichDate(replyToken);
    
    this.session = {
      step: 3,
      clubName: clubName,
      amount: null,
      usage: null,
      receiptId: null
    };
  } catch (e) {
    console.error(e, "日付セッション中にエラーが発生しました。");
  }
}
