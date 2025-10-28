/**
 * webhookによって受信したcontentIdをもとにAPIでコンテンツを取得？
 * @param {string}
 */
function Image(userText) {
  // const GEMINI_API_KEY =  PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  try {
    // if (!API_KEY) {
    //   throw new Error("APIキーが設定されていません。スクリプトプロパティを確認してください。");
    // }
    this.session = {
      ...this.session,
      step: 8,
      objective: userText,
    }
    return 
  } catch {
    Logger.log('領収書の画像処理中にエラーが発生しました。')
  }
  
}
