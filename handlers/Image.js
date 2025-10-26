/**
 * webhookによって受信したcontentIdをもとにAPIでコンテンツを取得？
 * @param {string}
 */
function Image(messageId) {
  const GEMINI_API_KEY =  PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const image = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  try {
    if (!API_KEY) {
      throw new Error("APIキーが設定されていません。スクリプトプロパティを確認してください。");
    }
    this.session = {
      ...this.session,
      step: 8,
      receipt_image: image
    }
    return 
  } catch {
    Logger.log('領収書の画像処理中にエラーが発生しました。')
  }
  
}
