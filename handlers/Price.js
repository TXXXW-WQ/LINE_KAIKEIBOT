function Price(inputdate) {
  try {
    const replyToken = this.replyToken;
    if (!replyToken) return;

    const amount = parseInt(inputdate);
    const clubName = this.session.clubName;
    if (!clubName) {
      Logger.log('Error: 部活名がセッションに設定されていません。');
      return;
    }
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('残高');
    const range = sheet.getRange(2, 1, lastRow - 1, 2);
    const balance = range.getValues();
    const balanceData = range.getValues();

    let checkBlance = null

    for (let i = 0; i < balanceData.length; i++) {
      const row = balanceData[i];
      const sheetClubName = row[0]; // A列の値 (インデックス0)
      const currentBalance = row[1]; // B列の値 (インデックス1)

      // A列の部活名がセッションの部活名と一致した場合
      if (sheetClubName === clubName) {
        Logger.log(`Found balance for ${clubName}: ${currentBalance}`);
        checkBlance = currentBalance; // B列の値（残高）を返す
      }
    }

    if (!checkBlance) return;

    if (checkBlance - amount >= 0) {

      sendReply(replyToken, "使用用途を入力してください。\n (例)ボール");
      this.session = {
        step: 5,
        date: amount
      };

    } else {
      sendReply(replyToken, "使った金額を半角英数字で入力してください。(空白や全角数字は入力しないでください)");
      return
    }


  } catch (e) {
    console.error(e, "Priceセッション中にエラーが発生しました。");
  }
}
