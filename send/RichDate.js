function sendRichDate(replyToken) {

  const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

  if (!CHANNEL_ACCESS_TOKEN) {
    Logger.log('エラー: チャネルアクセストークンが設定されていません。');
    return;
  }

  const url = 'https://api.line.me/v2/bot/message/reply';

  const today = Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd');
  const payload = {
    replyToken: replyToken,
    messages: [{
      "type": "template",
      "altText": "日付を選択してください",
      "template": {
        "type": "buttons",
        "text": "報告日を入力してください。",
        "actions": [
          {
            "type": "datetimepicker",
            "label": "カレンダーから選択",
            "data": "action=select_report_date",
            "mode": "date",
            "initial": today,
            "max": "2030-12-31"
          }
        ]
      }
    }]
  }
  // デバック用
  console.log(payload);

  const options = {
    'method': 'post',
    'headers': {
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText() || '{}');
    console.log('LINE APIレスポンス: ' + response.getResponseCode());
    console.log(result);
    return result;
  } catch (e) {
    console.log('API実行中にエラーが発生しました: ' + e.toString());
    return { status: 'error', message: e.toString() };
  }
}
