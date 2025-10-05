// ====================================================================
// グローバル変数と初期設定
// ====================================================================

// スクリプトプロパティから設定値を取得
const PROPERTIES = PropertiesService.getScriptProperties().getProperties();
const LINE_API_URL = 'https://api.line.me/v2/bot/message/push'; // 返信用URL（Push APIを利用）

/**
 * LINEからのWebhook（メッセージ受信）を処理する
 */
function doPost(e) {
  // JSONデータをパース（解析）
  const contents = JSON.parse(e.postData.contents);
  const events = contents.events;

  // 複数のイベントがまとめて送られてくる可能性があるため、ループで処理
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userId = event.source.userId; // 送信者のユーザーID
      const userText = event.message.text; // 送信されたメッセージのテキスト
      
      // シナリオのメインロジックを実行
      handleLineMessage(userId, userText);
    }
    // TODO: 画像(type === 'image')受信時の処理を追加
  }

  // LINEに対してHTTP 200を返すことが必須（返信メッセージは別処理で行う）
  return ContentService.createTextOutput(JSON.stringify({'status': 'ok'})).setMimeType(ContentService.MimeType.JSON);
}


// ====================================================================
// シナリオの状態管理とロジック（メイン処理）
// ====================================================================

/**
 * LINEメッセージに基づき、ユーザーの状態を更新し、応答を送信する
 * @param {string} userId - LINEのユーザーID
 * @param {string} userText - ユーザーが送信したテキスト
 */
function handleLineMessage(userId, userText) {
  const userProp = PropertiesService.getUserProperties();
  let session = JSON.parse(userProp.getProperty(userId) || '{}'); // 現在のセッション状態を取得

  // ------------------------- 状態別処理ロジック -------------------------

  if (userText === '報告開始' || userText === '再開') {
    // 【Step 0: シナリオ開始】
    session = { step: 1, club: null, amount: null }; // 初期状態にリセット
    sendClubInitialChoices(userId); // 最初のクイックリプライを送信
    
  } else if (session.step === 1) {
    // 【Step 1: 部活名の絞り込み/確定】
    
    if (userText.endsWith('行') && userText.length === 2) {
      // ユーザーが「あ行」「か行」などを選択した場合（絞り込み）
      const initial = userText.charAt(0); // 'あ'
      const clubChoices = getClubChoicesByInitial(initial); // マスタから部活を取得
      
      if (clubChoices.length > 0) {
        sendQuickReply(userId, `${userText}の部活を選択してください。`, clubChoices);
        // 状態はStep 1のまま維持
      } else {
        sendTextMessage(userId, `大変申し訳ありません。「${userText}」に該当する部活が見つかりませんでした。再度選択してください。`);
      }
      
    } else if (getClubFormalName(userText)) {
      // ユーザーが正式な部活名を入力/選択した場合（確定）
      session.club = userText;
      session.step = 2; // 次のステップへ
      sendTextMessage(userId, `「${userText}」ですね。次に、使用した**金額（半角数字のみ）**を入力してください。`);
      
    } else {
      // 不正な入力
      sendTextMessage(userId, '部活名が確認できませんでした。リストから選択するか、正式名称を入力してください。');
      // 状態はStep 1のまま維持
    }
    
  } else if (session.step === 2) {
    // 【Step 2: 金額の入力】
    if (userText.match(/^[0-9]+$/)) {
      session.amount = parseInt(userText);
      session.step = 3; // 次のステップへ
      sendTextMessage(userId, `金額 ${userText}円を受け付けました。次に、**領収書の写真**を送信してください。`);
      
    } else {
      sendTextMessage(userId, '金額は**半角数字のみ**で入力してください。');
      // 状態はStep 2のまま維持
    }
    
  } else if (session.step === 3) {
      // 【Step 3: 領収書の画像受信】
      // ※ doPost(e) の 'image' 処理で対応するため、ここではテキスト入力をエラーとする
      sendTextMessage(userId, '金額を受け付けました。次は写真の送信をお願いします。');
  }

  // ------------------------- セッションの保存 -------------------------
  userProp.setProperty(userId, JSON.stringify(session));
}

// ====================================================================
// データ取得ユーティリティ
// ====================================================================

/**
 * 部活マスタから頭文字に一致する部活名を取得し、クイックリプライ用の配列を返す
 * @param {string} initial - 絞り込みに使う頭文字（例: 'コ', 'サ'）
 * @returns {string[]} - 部活名の配列
 */
function getClubChoicesByInitial(initial) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PROPERTIES.MASTER_SHEET_NAME);
  // データ範囲を取得（ヘッダー行を除く）
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3);
  const values = range.getValues();

  const choices = [];
  for (const row of values) {
    const clubName = row[0]; // A列: 部活名
    const clubInitial = row[2]; // C列: 頭文字
    
    // フリガナの頭文字が一致するかチェック
    if (clubInitial === initial.toUpperCase()) { 
      choices.push(clubName);
    }
  }
  
  // クイックリプライの制限（最大13個）を超えないよう調整
  if (choices.length > 13) {
    // TODO: 13個以上の場合の処理（例: 「その他...」ボタン追加や、手動入力の案内）
    return choices.slice(0, 12).concat(['その他（手動入力）']);
  }
  
  return choices;
}

/**
 * 入力されたテキストがマスタに登録されている正式名称かを確認する
 * @param {string} text - ユーザーからの入力テキスト
 * @returns {string|null} - 正式名称またはnull
 */
function getClubFormalName(text) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PROPERTIES.MASTER_SHEET_NAME);
  const data = sheet.getRange("A:A").getValues().flat(); // A列の部活名を取得
  
  if (data.includes(text)) {
    return text;
  }
  return null;
}


// ====================================================================
// LINEメッセージ送信ユーティリティ
// ====================================================================

/**
 * シンプルなテキストメッセージを送信する
 */
function sendTextMessage(userId, text) {
  sendLinePayload(userId, { type: 'text', text: text });
}

/**
 * 最初のクイックリプライ（あ行/か行）を送信する
 */
function sendClubInitialChoices(userId) {
  const initialChoices = ['あ行', 'か行', 'さ行', 'た行', 'な行', 'は行', 'ま行', 'や行', 'ら行', 'わ行', '手動入力'];
  sendQuickReply(userId, "会計報告を始める部活名を選択するか、頭文字で絞り込んでください。", initialChoices);
}

/**
 * クイックリプライ付きメッセージを送信する
 */
function sendQuickReply(userId, messageText, choicesArray) {
  const quickReplyItems = choicesArray.map(choice => ({
    "type": "action",
    "action": {
      "type": "message",
      "label": choice,
      "text": choice
    }
  }));

  sendLinePayload(userId, {
    "type": "text",
    "text": messageText,
    "quickReply": {
      "items": quickReplyItems
    }
  });
}

/**
 * 実際のLINE API呼び出しを行う汎用関数
 */
function sendLinePayload(userId, messagePayload) {
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + PROPERTIES.LINE_CHANNEL_ACCESS_TOKEN,
  };

  const payload = {
    'to': userId,
    'messages': [messagePayload]
  };

  const options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(LINE_API_URL, options);
    Logger.log('LINE API response: ' + response.getContentText());
  } catch(e) {
    Logger.log('LINE API call failed: ' + e);
  }
}