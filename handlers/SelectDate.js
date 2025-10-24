function SelectDate(clubName) {
  try {
    const replyToken = this.replyToken;

    if (!replyToken) return;

    sendRichDate(replyToken);
    
    this.session = {
      ...this.session,
      step: 3,
      clubName: clubName,
    };
  } catch (e) {
    Logger.log(e, "日付セッション中にエラーが発生しました。");
  }
}
