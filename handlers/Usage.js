/**
 * @param {Integer} inputPrice - 入力された金額
 * @param {Integer} balance - 部費の残高(スプレッドシート参照)
 */
function Usage(inputDate) {
  const replyToken = this.replyToken;
  const inputPrice = inputDate;
  const balance; 
  // 入力値の検証
  if (balance - inputPrice < 0) {
    sendReply(replyToken, "入力値が正しくありません\nもう一度金額を入力してください。")
  }
}
