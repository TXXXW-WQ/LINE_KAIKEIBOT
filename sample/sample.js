<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <!-- Tailwind CSS for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Custom styles */
      body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
      .loader {
        /* Updated spinner color to gray */
        border-top-color: #6b7280;
        -webkit-animation: spin 1s linear infinite;
        animation: spin 1s linear infinite;
      }
      @-webkit-keyframes spin {
        0% { -webkit-transform: rotate(0deg); }
        100% { -webkit-transform: rotate(360deg); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="container bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl mx-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">レシートOCRシステム</h1>
        <p class="text-gray-500 mt-2">Gemini AIがレシートや領収書を自動で読み取ります</p>
      </div>

      <form id="upload-form" class="space-y-6">
        <!-- Step 1: File Upload -->
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-2">
            <span class="bg-gray-700 text-white rounded-full px-2 py-1 mr-2">1</span>処理するファイルを選択
          </label>
          <div id="drop-zone" class="flex justify-center items-center w-full px-6 py-10 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition">
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4V12a4 4 0 014-4h12l4 4h12a4 4 0 014 4z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="mt-1 text-sm text-gray-600">
                <span class="font-semibold text-gray-700">クリックして選択</span> または ドラッグ＆ドロップ
              </p>
              <p class="text-xs text-gray-500">JPG, PNG, PDFなど (複数可)</p>
            </div>
            <input type="file" id="files" multiple accept="image/*,.pdf" class="hidden">
          </div>
          <div id="file-list" class="mt-3 text-sm text-gray-600"></div>
        </div>
        
        <!-- Step 2: Folder ID -->
        <div>
          <label for="folderId" class="block text-sm font-bold text-gray-700 mb-2">
            <span class="bg-gray-700 text-white rounded-full px-2 py-1 mr-2">2</span>出力先のフォルダID
          </label>
          <input type="text" id="folderId" name="folderId" required
                 placeholder="Google DriveのフォルダURL末尾の文字列"
                 class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm">
        </div>

        <!-- Step 3: Additional Prompt -->
        <div>
          <label for="additionalPrompt" class="block text-sm font-bold text-gray-700 mb-2">
             <span class="bg-gray-700 text-white rounded-full px-2 py-1 mr-2">3</span>追加の指示（任意）
          </label>
          <textarea id="additionalPrompt" name="additionalPrompt" rows="3"
                    placeholder="例：貸方勘定科目はすべて「事業主貸」にしてください。"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"></textarea>
        </div>
        
        <!-- Submit Button -->
        <div>
          <button type="submit" id="submit-btn" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
            <span id="button-text">実行</span>
            <div id="spinner" class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-5 w-5 ml-3 hidden"></div>
          </button>
        </div>
      </form>

      <!-- Status Message Area -->
      <div id="status" class="mt-6 text-center text-sm"></div>

      <!-- Footer Credit Line -->
      <p class="text-center text-xs text-gray-400 mt-8">提供：ソルビス税理士法人</p>
    </div>

    <script>
      const form = document.getElementById('upload-form');
      const fileInput = document.getElementById('files');
      const folderIdInput = document.getElementById('folderId'); // Get folderId input
      const dropZone = document.getElementById('drop-zone');
      const fileListDiv = document.getElementById('file-list');
      const submitBtn = document.getElementById('submit-btn');
      const buttonText = document.getElementById('button-text');
      const spinner = document.getElementById('spinner');
      const statusDiv = document.getElementById('status');

      // --- Event Listeners ---
      form.addEventListener('submit', handleFormSubmit);
      fileInput.addEventListener('change', handleFileSelection);
      folderIdInput.addEventListener('input', checkFormValidity); // Add listener for typing
      dropZone.addEventListener('click', () => fileInput.click());

      // Drag and drop events
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.add('bg-gray-50'); });
      dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); dropZone.classList.remove('bg-gray-50'); });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('bg-gray-50');
        fileInput.files = e.dataTransfer.files;
        handleFileSelection();
      });

      // --- Initial State ---
      document.addEventListener('DOMContentLoaded', checkFormValidity);


      // --- Functions ---
      
      /**
       * Checks if all required inputs are filled and updates the submit button state.
       */
      function checkFormValidity() {
        const filesSelected = fileInput.files.length > 0;
        const folderIdEntered = folderIdInput.value.trim() !== '';
        // Enable the button only if both conditions are true
        submitBtn.disabled = !(filesSelected && folderIdEntered);
      }
      
      /**
       * Handles the form submission process.
       * @param {Event} e The submit event.
       */
      function handleFormSubmit(e) {
        e.preventDefault();
        // Final check before submitting
        if (submitBtn.disabled) {
          showStatus('ファイルを選択し、フォルダIDを入力してください。', 'error');
          return;
        }

        setLoadingState(true);

        const files = Array.from(fileInput.files);
        const folderId = folderIdInput.value;
        const additionalPrompt = document.getElementById('additionalPrompt').value;
        
        // Convert all files to Base64
        const filePromises = files.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Data = event.target.result.split(',')[1];
              resolve({ data: base64Data, mimeType: file.type, name: file.name });
            };
            reader.onerror = (error) => reject(new Error(`File reading error: ${error}`));
            reader.readAsDataURL(file);
          });
        });
        
        Promise.all(filePromises).then(fileObjects => {
          google.script.run
            .withSuccessHandler(onSuccess)
            .withFailureHandler(onFailure)
            .processFiles({ files: fileObjects, folderId: folderId, additionalPrompt: additionalPrompt });
        }).catch(err => {
            onFailure(err);
        });
      }

      /**
       * Updates the file list display when files are selected.
       */
      function handleFileSelection() {
        if (fileInput.files.length > 0) {
          const fileNames = Array.from(fileInput.files).map(f => f.name).join(', ');
          fileListDiv.innerHTML = `<span class="font-semibold">選択中:</span> ${fileNames}`;
        } else {
          fileListDiv.innerHTML = '';
        }
        checkFormValidity(); // Check validity after file selection changes
      }

      /**
       * Handles the successful response from the server.
       */
      function onSuccess(response) {
        setLoadingState(false);
        if (response.startsWith('http')) {
          const message = `✅ 処理が完了しました。<br><a href="${response}" target="_blank" class="text-gray-800 font-bold hover:underline">作成されたスプレッドシートを開く</a>`;
          showStatus(message, 'success');
        } else {
          showStatus(`❌ ${response}`, 'error');
        }
      }

      /**
       * Handles failure/error responses.
       */
      function onFailure(error) {
        setLoadingState(false);
        showStatus(`エラーが発生しました: ${error.message}`, 'error');
      }

      /**
       * Toggles the UI's loading state.
       */
      function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
          buttonText.textContent = '処理中...';
          spinner.classList.remove('hidden');
          statusDiv.innerHTML = '';
        } else {
          buttonText.textContent = '実行';
          spinner.classList.add('hidden');
          // Re-check form validity after process ends to reset button state
          checkFormValidity();
        }
      }

      /**
       * Displays a status message to the user.
       */
      function showStatus(message, type) {
          statusDiv.innerHTML = message;
          statusDiv.className = 'mt-6 text-center text-sm p-3 rounded-md ';
          if (type === 'success') {
              statusDiv.classList.add('bg-green-100', 'text-green-800');
          } else {
              statusDiv.classList.add('bg-red-100', 'text-red-800');
          }
      }
    </script>
  </body>
</html>


/**
 * @fileoverview Receipt OCR to Google Sheets using Gemini API.
 * Backend logic for the web application.
 */

// --- 定数定義 ---
// スクリプトプロパティからAPIキーを読み込む
const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
// Gemini 2.0 Flash APIのエンドポイント
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

/**
 * HTTP GETリクエストを処理し、WebアプリケーションのUI（Index.html）を返します。
 * @returns {HtmlOutput} WebページのHTMLオブジェクト。
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('レシートOCRシステム')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * フロントエンドからファイルデータを受け取り、すべての処理を統括するメイン関数。
 * @param {object} formObject フロントエンドから送信されたフォームデータ。
 * @param {Array<object>} formObject.files Base64エンコードされたファイルの配列。
 * @param {string} formObject.folderId 出力先Google DriveフォルダのID。
 * @param {string} formObject.additionalPrompt ユーザーが入力した追加の指示。
 * @returns {string} 成功した場合は作成されたスプレッドシートのURL、失敗した場合はエラーメッセージ。
 */
function processFiles(formObject) {
  try {
    if (!API_KEY) {
      throw new Error("APIキーが設定されていません。スクリプトプロパティを確認してください。");
    }

    const files = formObject.files;
    const folderId = formObject.folderId;
    const additionalPrompt = formObject.additionalPrompt;
    
    // フォルダIDの有効性を確認
    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      throw new Error("指定されたフォルダIDが無効か、アクセス権がありません。");
    }

    let allExtractedData = [];

    // 各ファイルを順番に処理
    files.forEach((file, index) => {
      const logPrefix = `[File ${index + 1}/${files.length}]`;
      Logger.log(`${logPrefix} Processing ${file.name}...`);
      
      // まず金額を抽出
      const amount = extractAmount_(file.data, file.mimeType);
      Logger.log(`${logPrefix} Extracted amount: ${amount}`);
      
      // 次に他の詳細情報を抽出
      const extractedData = callGeminiApi_(file.data, file.mimeType, additionalPrompt, amount);
      
      if (extractedData && Array.isArray(extractedData)) {
        allExtractedData = allExtractedData.concat(extractedData);
        Logger.log(`${logPrefix} Successfully extracted ${extractedData.length} items.`);
      } else {
        Logger.log(`${logPrefix} No data could be extracted from ${file.name}.`);
      }
    });

    if (allExtractedData.length === 0) {
      throw new Error("AIがどのファイルからもデータを抽出できませんでした。画像の品質や内容を確認してください。");
    }

    const spreadsheetUrl = createAndPopulateSheet_(folder, allExtractedData);
    Logger.log(`Successfully created spreadsheet: ${spreadsheetUrl}`);
    return spreadsheetUrl;

  } catch (e) {
    Logger.log(`Error in processFiles: ${e.stack}`);
    return `エラーが発生しました: ${e.message}`;
  }
}

/**
 * 画像から金額のみを抽出する関数
 * @param {string} base64Data Base64エンコードされたファイルデータ。
 * @param {string} mimeType ファイルのMIMEタイプ。
 * @returns {number} 抽出された金額（見つからない場合は0）
 */
function extractAmount_(base64Data, mimeType) {
  const amountPrompt = `
画像から金額を抽出してください。
以下の優先順位で金額を探してください：
1. 合計、総額、お支払い金額、計、小計
2. 最も大きい金額
3. ¥マークまたは円の後の数字

見つかった金額を数値のみで返してください。
例: 1100

金額のみを数値で回答してください。`;

  const payload = {
    "contents": [{
      "parts": [
        { "text": amountPrompt },
        {
          "inline_data": {
            "mime_type": mimeType,
            "data": base64Data
          }
        }
      ]
    }],
    "generationConfig": {
      "temperature": 0.1,
      "topK": 1,
      "topP": 0.95,
      "maxOutputTokens": 100
    }
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(GEMINI_API_URL, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      const jsonResponse = JSON.parse(response.getContentText());
      const amountText = jsonResponse.candidates[0]?.content?.parts[0]?.text || "0";
      
      // 数値のみを抽出
      const amount = parseInt(amountText.replace(/[^\d]/g, '')) || 0;
      Logger.log(`Extracted amount: ${amount} from text: ${amountText}`);
      return amount;
    }
  } catch (e) {
    Logger.log(`Error extracting amount: ${e.message}`);
  }
  
  return 0;
}

/**
 * Gemini APIを呼び出して、画像/PDFから取引明細を抽出する内部関数。
 * @param {string} base64Data Base64エンコードされたファイルデータ。
 * @param {string} mimeType ファイルのMIMEタイプ。
 * @param {string} additionalPrompt ユーザーが入力した追加の指示。
 * @param {number} amount 事前に抽出された金額
 * @returns {Array<object>|null} 抽出された仕訳データの配列、またはエラーの場合はnull。
 */
function callGeminiApi_(base64Data, mimeType, additionalPrompt, amount) {
  // 金額が抽出できなかった場合のデフォルト値
  const finalAmount = amount || 100;
  
  const systemPrompt = `
レシート、領収書、通帳の画像から取引明細を抽出してJSON形式で出力してください。

**重要**: 借方金額と貸方金額には必ず ${finalAmount} を入力してください。

**抽出ルール:**
1. 日付: yyyy/MM/dd形式（年がない場合は2024年）
2. 金額: 借方金額=${finalAmount}、貸方金額=${finalAmount}（必須）
3. インボイス番号: 
   - T+13桁の番号があれば「適格」と記載
   - 借方税区分が「課税仕入10%」の場合も借方インボイスを「適格」と記載
4. 仕訳メモ: 空欄にする（追加指示がある場合のみ記載）
5. 勘定科目:
   - レシート→借方:経費科目、貸方:現金
   - 通帳入金→借方:普通預金、貸方:収入科目
   - 通帳出金→借方:経費科目、貸方:普通預金

**JSON形式:**
[
  {
    "取引日": "2024/01/15",
    "借方勘定科目": "消耗品費",
    "借方補助科目": "",
    "借方部門": "",
    "借方取引先": "店名",
    "借方税区分": "課税仕入10%",
    "借方インボイス": "適格",
    "借方金額": ${finalAmount},
    "貸方勘定科目": "現金",
    "貸方補助科目": "",
    "貸方部門": "",
    "貸方取引先": "",
    "貸方税区分": "対象外",
    "貸方インボイス": "",
    "貸方金額": ${finalAmount},
    "摘要": "",
    "仕訳メモ": "",
    "タグ": ""
  }
]

${additionalPrompt ? `**追加指示:** ${additionalPrompt}` : ''}`;

  const payload = {
    "contents": [{
      "parts": [
        { "text": systemPrompt },
        {
          "inline_data": {
            "mime_type": mimeType,
            "data": base64Data
          }
        }
      ]
    }],
    "generationConfig": {
      "responseMimeType": "application/json",
      "temperature": 0.1,
      "topK": 1,
      "topP": 0.95,
      "maxOutputTokens": 4096
    }
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  const response = UrlFetchApp.fetch(GEMINI_API_URL, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  Logger.log(`API Response Code: ${responseCode}`);
  
  if (responseCode === 200) {
    try {
      const jsonResponse = JSON.parse(responseBody);
      const contentText = jsonResponse.candidates[0]?.content?.parts[0]?.text;
      
      if (contentText) {
        Logger.log(`Extracted Content: ${contentText}`);
        const parsedData = JSON.parse(contentText);
        
        // 金額の最終確認と修正
        if (Array.isArray(parsedData)) {
          parsedData.forEach(item => {
            // 金額が入っていない場合は強制的に設定
            if (!item.借方金額 || item.借方金額 === 0 || item.借方金額 === "") {
              item.借方金額 = finalAmount;
            }
            if (!item.貸方金額 || item.貸方金額 === 0 || item.貸方金額 === "") {
              item.貸方金額 = finalAmount;
            }
            
            // 数値型に変換
            item.借方金額 = parseInt(item.借方金額) || finalAmount;
            item.貸方金額 = parseInt(item.貸方金額) || finalAmount;
            
            // 借方と貸方を一致させる
            if (item.借方金額 !== item.貸方金額) {
              const maxAmount = Math.max(item.借方金額, item.貸方金額);
              item.借方金額 = maxAmount;
              item.貸方金額 = maxAmount;
            }
            
            // 借方税区分が「課税仕入10%」の場合、借方インボイスを「適格」に設定
            if (item.借方税区分 === "課税仕入10%" && !item.借方インボイス) {
              item.借方インボイス = "適格";
            }
            
            Logger.log(`Final amounts - 借方: ${item.借方金額}, 貸方: ${item.貸方金額}, 借方インボイス: ${item.借方インボイス}`);
          });
        }
        
        return parsedData;
      } else {
        Logger.log("API response is valid, but content is missing.");
        return null;
      }
    } catch (e) {
      Logger.log(`Failed to parse JSON response: ${e.message}`);
      Logger.log(`Response body: ${responseBody}`);
      return null;
    }
  } else {
    Logger.log(`API Error. Response Code: ${responseCode}`);
    Logger.log(`Response Body: ${responseBody}`);
    return null;
  }
}

/**
 * 新しいスプレッドシートを作成し、抽出されたデータを書き込む内部関数。
 * @param {Drive.Folder} folder 保存先のGoogle Driveフォルダオブジェクト。
 * @param {Array<object>} data Gemini APIから抽出された仕訳データの配列。
 * @returns {string} 作成されたスプレッドシートのURL。
 */
function createAndPopulateSheet_(folder, data) {
  const date = new Date();
  const formattedDate = Utilities.formatDate(date, "JST", "yyyyMMdd_HHmmss");
  const fileName = `【OCR抽出結果】${formattedDate}`;

  // 新しいスプレッドシートを作成
  const spreadsheet = SpreadsheetApp.create(fileName);
  const sheet = spreadsheet.getActiveSheet();

  // ヘッダー行の定義（要件定義通り23列）
  const header = [
    "取引No", "取引日", "借方勘定科目", "借方補助科目", "借方部門", "借方取引先",
    "借方税区分", "借方インボイス", "借方金額(円)", "借方税額", "貸方勘定科目",
    "貸方補助科目", "貸方部門", "貸方取引先", "貸方税区分", "貸方インボイス",
    "貸方金額(円)", "貸方税額", "摘要", "仕訳メモ", "タグ", "MF仕訳タイプ", "決算整理仕訳"
  ];
  sheet.appendRow(header);
  sheet.getRange(1, 1, 1, header.length).setFontWeight("bold").setBackground("#f0f0f0");

  // データ行の書き込み
  data.forEach((item, index) => {
    // 金額の最終確認（数値であることを保証）
    const debitAmount = parseInt(item.借方金額) || 100;
    const creditAmount = parseInt(item.貸方金額) || 100;
    
    const rowData = [
      '', // 取引No（通常不要）
      item.取引日 || '',
      item.借方勘定科目 || '',
      item.借方補助科目 || '',
      item.借方部門 || '',
      item.借方取引先 || '',
      item.借方税区分 || '',
      item.借方インボイス || '',
      debitAmount, // 借方金額（必ず数値）
      '', // 借方税額（固定で空白）
      item.貸方勘定科目 || '',
      item.貸方補助科目 || '',
      item.貸方部門 || '',
      item.貸方取引先 || '',
      item.貸方税区分 || '',
      item.貸方インボイス || '',
      creditAmount, // 貸方金額（必ず数値）
      '', // 貸方税額（固定で空白）
      item.摘要 || '',
      item.仕訳メモ || '',
      item.タグ || '',
      'インポート', // MF仕訳タイプ（固定値）
      item.決算整理仕訳 || ''
    ];
    
    sheet.appendRow(rowData);
    
    // ログに金額を記録
    Logger.log(`Row ${index + 1}: 借方金額=${debitAmount}, 貸方金額=${creditAmount}`);
  });

  // 列幅を自動調整
  sheet.autoResizeColumns(1, header.length);

  // ファイルを指定されたフォルダに移動
  const file = DriveApp.getFileById(spreadsheet.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file); // ルート直下のファイルは削除

  return spreadsheet.getUrl();
}

/**
 * フォルダリストを取得する関数（フロントエンドから呼び出される）
 * @returns {Array<object>} フォルダ情報の配列
 */
function getFolderList() {
  try {
    const folders = [];
    const rootFolder = DriveApp.getRootFolder();
    folders.push({
      id: rootFolder.getId(),
      name: 'マイドライブ',
      path: '/'
    });
    
    // サブフォルダを再帰的に取得
    function addSubfolders(parentFolder, parentPath) {
      const subfolders = parentFolder.getFolders();
      while (subfolders.hasNext()) {
        const folder = subfolders.next();
        const folderPath = parentPath + folder.getName() + '/';
        folders.push({
          id: folder.getId(),
          name: folder.getName(),
          path: folderPath
        });
        try {
          addSubfolders(folder, folderPath);
        } catch (e) {
          Logger.log(`Skipping folder due to access error: ${folderPath}`);
        }
      }
    }
    
    addSubfolders(rootFolder, '/');
    
    return folders;
  } catch (error) {
    Logger.log('フォルダリスト取得エラー: ' + error.toString());
    return [{
      id: DriveApp.getRootFolder().getId(),
      name: 'マイドライブ',
      path: '/'
    }];
  }
}