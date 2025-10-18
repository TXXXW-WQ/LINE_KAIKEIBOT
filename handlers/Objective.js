function Ovejective (userText) {
  try {
    const replyToken = this.replyToken;
    sendReply(replyToken, "使用目的を入力してください。\n(例)練習のため");
    this.session = {
      ...this.session,
      step: 7,
      usage: userText,
    };

  }catch (e) {
    console.error(e, "使用目的入力セッション中にエラーが発生しました。")
  }
  
}
