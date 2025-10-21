/**
 * webhookによって受信したcontentIdをもとにAPIでコンテンツを取得？
 * @param {string}
 */
function Image(inputDate) {
  const contentJson = inputDate.json();
  
  Logger.log(contentJson);
  const url = "https://api-data.line.me/v2/bot/message/{messageId}/content";
}
