function Ovejective (userText) {
  try {
    const replyToken = this.replyToken;
    sendReply(replyToken, "領収書の画像を送信してください。");
    this.session = {
      step: 7,
      objective: userText,
    };

  }catch (e) {
    console.error(e, "使用目的入力セッション中にエラーが発生しました。")
  }
  
}
