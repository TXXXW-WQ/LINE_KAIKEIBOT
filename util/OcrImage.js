function OcrImage(base64EncodedImage, mimeType) {
  const OCR_GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!OCR_GEMINI_API_KEY) {
    Logger.log('エラー:GEMINI_API_KEYがありません。');
    return
  }
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${OCR_GEMINI_API_KEY}`;
  const PROMPT_TEXT = `
    画像からレシートの合計金額を抽出してください。
    抽出した金額を**数値のみ**で、以下のJSON形式で返してください。
    { "amount": (ここに抽出した金額) }
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
      "maxOutputTokens": 512
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
    const responseText = geminiResponse.getContentText();
    const responseJson = JSON.parse(responseText);
    Logger.log(responseJson)
    // モデルの応答内容（JSON文字列）を抽出する
    // 完全な修正案（最初のインデックスアクセスも安全にする）
    const modelOutputText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!modelOutputText) {
      Logger.log("モデルから有効なJSON応答が得られませんでした。");
      return 0;
    }

    // JSON文字列をパースして金額オブジェクトを取得する
    const amountObject = JSON.parse(modelOutputText);

    const extractedAmount = parseInt(amountObject.amount, 10) || 0; // 整数に変換し、失敗時は0
    Logger.log(`抽出された金額 (Gemini): ${extractedAmount}`);
    return extractedAmount;
  } catch (e) {
    Logger.log('OCR金額抽出中にエラーが発生しました。:' + e.toString())
    return
  }

}
