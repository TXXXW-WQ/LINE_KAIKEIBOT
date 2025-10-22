/**
 * webhookによって受信したcontentIdをもとにAPIでコンテンツを取得？
 * @param {string}
 */
function Image(messageId) {
  
  const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  
}
