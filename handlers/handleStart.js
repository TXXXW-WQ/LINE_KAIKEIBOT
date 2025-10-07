/**
 * 会計報告の開始
 */
function handleStart () {
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
        { type: "action", action: { type: "message", label: "その他・入力", text: "その他・入力" } }
      ]
    }
  };

  sendReplyWithMessageAndQuickReply('会計報告を開始します。部活名の**頭文字**を選択するか、正式名称を入力してください。', quickReplyPayload);
}