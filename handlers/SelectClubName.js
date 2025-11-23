function SelectClubName(initial) {
  try {
    const replyToken = this.replyToken
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('部活マスタ');

    // A列（部活名）とB列（ひともじめ）の2列を取得
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    // getRange(開始行:2, 開始列:1, 行数, 列数:2)
    const range = sheet.getRange(2, 1, lastRow - 1, 2);
    const clubData = range.getValues(); // [[部活名1, ひともじめ1], [部活名2, ひともじめ2], ...]


    const initialMap = {
      'あ行': ['あ', 'い', 'う', 'え', 'お'],
      'か行': ['か', 'き', 'く', 'け', 'こ'],
      'さ行': ['さ', 'し', 'す', 'せ', 'そ'],
      'た行': ['た', 'ち', 'つ', 'て', 'と'],
      'な行': ['な', 'に', 'ぬ', 'ね', 'の'],
      'は行': ['は', 'ひ', 'ふ', 'へ', 'ほ'],
      'ま行': ['ま', 'み', 'む', 'め', 'も'],
      'や行': ['や', 'ゆ', 'よ'],
      'ら行': ['ら', 'り', 'る', 'れ', 'ろ'],
      'わ行': ['わ', 'を', 'ん']
    };

    const targetInitials = initialMap[initial];
    if (!targetInitials) {
      sendError(replyToken)
      return [];
    }

    // フィルタリング: B列の「ひともじめ」が、targetInitialsに含まれるかチェック
    const clubList = clubData
      .filter(([clubName, initialChar]) => {
        if (!clubName || !initialChar) return false;
        const charToCheck = String(initialChar).toLowerCase();
        return targetInitials.some(i => i === charToCheck);
      })
      .map(([clubName, initialChar]) => clubName);

    // フィルタリング結果に基づきFlex Messageのcontentsを生成 ★

    if (clubList.length === 0) {
      sendReplyAndButton(replyToken, `「${initial}」から始まる部活は見つかりませんでした。\n正式名称の一文字目を平仮名で入力してください。`);
      return;
    }

    let flexContents = [];
    const maxButtons = 10; // Flex Messageに表示する最大ボタン数

    // 部活名のボタンを生成
    clubList.slice(0, maxButtons).forEach((clubName, index) => {
      flexContents.push({
        "type": "button",
        "style": "link",
        "height": "sm",
        "action": {
          "type": "message",
          "label": clubName,
          "text": clubName // 選択された部活名をメッセージとして返信させる
        }
      });

      // ボタンの間にセパレーターを挟む (最後のボタンの後は不要)
      if (index < maxButtons - 1 && index < clubList.length - 1) {
        flexContents.push({
          "type": "separator"
        });
      }
    });


    // Flex Message 全体のJSONを構築し、送信 
    const flexJson = {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "md",
        "contents": [
          {
            "type": "text",
            "text": `「${initial}」の部活を${clubList.length}件見つけました。`,
            "size": "md",
            "align": "center",
            "weight": "bold",
            "color": "#1DB446"
          },
          {
            "type": "text",
            "text": "部活動名を選択したください。",
            "size": "sm",
            "align": "center",
            "margin": "md"
          },
          {
            "type": "separator"
          },
          ...flexContents // 動的に生成したボタン配列
        ]
      }
    };

    // sendFlexMessage は、以前に定義した Flex Message 送信用のヘルパー関数を使用
    sendFlexMessage(replyToken, flexJson);

    this.session = {
      ...this.session,
      step: 2,
    };

  } catch (e) {
    Logger.log('スプレッドシートからのデータ取得中にエラーが発生: ' + e.toString());
    return [];
  }
}

