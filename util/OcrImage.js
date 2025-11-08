function OcrImage(base64EncodedImage) {
  const OCR_GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('OCR_GEMINI_API_KEY');
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${OCR_GEMINI_API_KEY}`;
  const PROMPT_TEXT = `
      画像から金額を抽出してください。
      合計金額を数値のみで返してください。
      例: 1100
      `;
  const payload = {
    "contents": [{
      "parts": [
        { "text": PROMPT_TEXT },
        {
          "inline_data": {
            "mime_type": mimeType,
            "data": base64EncodedImage
          }
        }
      ]
    }],
    "generationConfig": {
      "responseMimeType": "application/json",
      "temperature": 0.1,
      "topK": 1,
      "topP": 0.95,
      "maxOutputTokens": 100
    }
  };

  const geminiOptions = {
    method: 'post',
    contentType: 'application/json', // JSONとしてデータを送信
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const geminiResponse = UrlFetchApp.fetch(API_URL, geminiOptions);

    if (responseCode !== 200) {
      Logger.log(`Gemini API呼び出し失敗: ${responseCode} - ${geminiResponse.getContentText()}`);
      return;
    }
    const responseText = geminiResponse.getContentText();
    const responseJson = JSON.parse(responseText);
    // モデルの応答からテキスト部分を抽出
    const extractedText = responseJson.candidates[0].content.parts[0].text.trim();
    extractedAmount = parseInt(extractedText, 10);
    Logger.log(`抽出された金額 (Gemini): ${extractedAmount}`);
    return extractedAmount
  } catch (e) {
    Logger.log('OCR金額抽出中にエラーが発生しました。:' + e.toString())
    return
  }

}
