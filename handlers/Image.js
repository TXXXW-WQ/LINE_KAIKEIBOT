/**
 * webhookによって受信したcontentIdをもとにAPIでコンテンツを取得？
 * @param {string}
 */
function Image(userText) {
  const replyToken = this.replyToken;
  if (!replyToken) {
    Logger.log("replyTokenがありません。")
    return
  }
  try {
    sendReply(replyToken, "領収書の画像を送信してください。\nはっきりと文字が識別できるように撮影してください。")
    this.session = {
      ...this.session,
      step: 8,
      objective: userText,
    }
    send
  } catch {
    Logger.log('領収書の画像処理中にエラーが発生しました。')
  }
  
}
