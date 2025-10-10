/**
 * 会計報告の開始
 */
function StartFilling() {
  try {
    const replyToken = this.replyToken
    
    if(!replyToken) return;

    this.session = {
      step: 1,
      clubName: null,
      amount: null,
      usage: null,
      receiptId: null
    };

    // クイックリプライを定義
    const quickReplyPayload = {
      quickReply: {
        items: [
          { type: "action", action: { type: "message", label: "あ行", text: "あ行" } },
          { type: "action", action: { type: "message", label: "か行", text: "か行" } },
          { type: "action", action: { type: "message", label: "さ行", text: "さ行" } },
          { type: "action", action: { type: "message", label: "た行", text: "た行" } },
          { type: "action", action: { type: "message", label: "な行", text: "な行" } },
          { type: "action", action: { type: "message", label: "は行", text: "は行" } },
          { type: "action", action: { type: "message", label: "ま行", text: "ま行" } },
          { type: "action", action: { type: "message", label: "や行", text: "や行" } },
          { type: "action", action: { type: "message", label: "ら行", text: "ら行" } },
          { type: "action", action: { type: "message", label: "わ行", text: "わ行" } },

        ]
      }
    };
    sendReplyWithMessageAndQuickReply(replyToken, "部活動名の一文字目を選択してください", quickReplyPayload)
  } catch (e) {
    console.error(e, "報告開始セッション中にエラーが発生しました");
    return;
  }

}