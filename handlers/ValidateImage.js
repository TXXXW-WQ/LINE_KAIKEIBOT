function ValidateImage(messageId) {
  try {
    const OCR_GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('OCR_GEMINI_API_KEY');
    const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${OCR_GEMINI_API_KEY}`;
    const SPREADSHEET_URL = '（ここに画像を挿入したいスプレッドシートのURLを貼り付け）'; // ★変更：対象スプレッドシートのURL
    const SHEET_NAME = 'シート1'; // ★変更：対象シート名
    const TARGET_CELL = 'A1'; // ★変更：画像を挿入したいセル（例: 'A1'）
    if (!OCR_GEMINI_API_KEY) {
      Logger.log('エラー:GEMINI_API_KEYがありません。');
      return
    }
    if (!CHANNEL_ACCESS_TOKEN) {
      Logger.log('エラー: チャネルアクセストークンが設定されていません。');
      return
    }
    const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;

    const options = {
      'method': 'get',
      'headers': {
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
      },
      'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
      const imageBlob = response.getBlob();
      Logger.log(`画像取得に成功しました${imageBlob}`)
      // Logger.log('画像データを取得しました。ファイル名: ' + imageBlob.getName() + ', サイズ: ' + imageBlob.getBytes().length + 'バイト');

      const FOLDER_ID = '10R5dRFOlIVVIznlaj1VXrk2JBt9hBBwA';

      Logger.log('Drive処理直前')
      // ファイルをGoogle Driveに保存
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const file = folder.createFile(imageBlob);
      const PROMPT_TEXT = `
      画像から金額を抽出してください。
      以下の優先順位で金額を探してください：
      1. 合計、総額、お支払い金額、計、小計
      2. 最も大きい金額
      3. ¥マークまたは円の後の数字

      見つかった金額を数値のみで返してください。
      例: 1100

      金額のみを数値で回答してください。
      `;
      const payload = {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: Utilities.base64Encode(imageBlobForGemini.getBytes()), // BlobをBase64エンコード
                  mimeType: imageBlobForGemini.getContentType(),              // MIMEタイプを指定
                },
              },
              {
                text: PROMPT_TEXT,
              },
            ],
          },
        ],
      };

      const options = {
        method: 'post',
        contentType: 'application/json', // JSONとしてデータを送信
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      };

      const geminiResponse = UrlFetchApp.fetch(API_URL, options);
      Logger.log('画像をGoogle Driveに保存しました。URL: ' + file.getUrl());


      this.session = {
        ...this.session,
        step: 9,
      }
      Logger.log('処理終了')
    } else {
      Logger.log(`画像取得失敗: ${response.getResponseCode()}`);
      return
    }


  } catch (e) {
    Logger.log('画像の取得中にエラーが発生しました: ' + e.toString());
  }
}

