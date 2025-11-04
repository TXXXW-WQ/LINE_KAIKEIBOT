function ValidateImage(messageId) {
  try {

    const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
    if (!CHANNEL_ACCESS_TOKEN) {
      Logger.log('エラー: チャネルアクセストークンが設定されていません。');
      return { status: 'error', message: 'Channel access token is missing.' };
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

// function Test() {
//   const FOLDER_ID = '10R5dRFOlIVVIznlaj1VXrk2JBt9hBBwA';

//   // ★ ダミーのBlobオブジェクトを作成し、image変数に代入
//   // 1. 適当な文字列データを用意
//   const dummyText = "これはテスト用のダミーテキストです。";
  
//   // 2. データをBlobオブジェクトに変換し、ファイル名を設定
//   const image = Utilities.newBlob(dummyText, MimeType.PLAIN_TEXT, 'dummy_test_file.txt'); 
//   // ※ 'dummy_test_file.txt' の部分を 'dummy_image.jpg' などに変えても、中身がテキストなのでDriveにそのまま保存されます。

//   Logger.log('Drive処理直前: ダミーファイル名=' + image.getName());
  
//   try {
//     // ファイルをGoogle Driveに保存
//     const folder = DriveApp.getFolderById(FOLDER_ID);
//     const file = folder.createFile(image); // ★ ダミーのBlobを使用
    
//     Logger.log('保存成功: ' + file.getUrl());

//   } catch(e) {
//     Logger.log('Drive処理中にエラーが発生しました: ' + e.toString());
//   }
// }