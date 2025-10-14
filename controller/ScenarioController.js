class ScenarioController {
  constructor(userId, replyToken) {
    this.userId = userId;
    this.replyToken = replyToken;
    this.userProp = PropertiesService.getUserProperties();

    // セッションデータの初期化と読み込み
    const sessionJson = this.userProp.getProperty(this.userId);
    this.session = JSON.parse(sessionJson || '{}');

    // 未定義のセッションフィールドを初期化
    if (!this.session.step) {
      this.session = {
        step: 0, // 初期状態
        clubName: null, // 部活名
        date: null, // 日付(部費を使用した日付)
        usage: null, // 使用用途
        objective: null, // 使用目的
        price: null, // 使用金額
        receipt_image: null // 領収書の画像
      };
    }
  }

  // セッションデータを保存するメソッド
  saveSession() {
    this.userProp.setProperty(this.userId, JSON.stringify(this.session));
  }

  deleteSession() {
    this.userProp.deleteProperty(this.userId);
    // メモリ上のセッションも初期化
    this.session = {
      step: 0, // 初期状態
      clubName: null,
      date: null,
      usage: null,
      objective: null,
      price: null,
      receipt_image: null
    };
    console.log(`User ${this.userId} のセッションデータを削除しました。`);
  }

  /**
   * 受信したメッセージに基づき、状態を更新し応答を返す
   * @param {string} userText - ユーザーが送信したテキスト
   */
  handleMessage(userText) {

    let shouldSave = true; // セッション保存フラグ

    if (userText === "報告終了") {
      // デバック用
      console.log(userText);
      this.deleteSession();
      shouldSave = false;
      sendReply(this.replyToken, "セッションデータを削除しました。");
    }
    if (userText === "報告開始" && this.session.step === 0) {
      StartFilling.call(this)
    } else if (this.session.step === 1) {
      SelectClubName.call(this, userText);
    } else if (this.session.step === 2) {
      console.log("日付選択のセッションに移動");
      SelectDate.call(this, userText);
    } else if (this.session.step === 3) {
      console.log("日付確定のセッションに移動");
      FixingDate.call(this, userText);
    } else if (this.session.step === 4) {
      console.log("priceのセッションに移動");
      Price.call(this, userText);
    } else if (this.session.step === 5) {
      console.log("usageのセッションに移動");
      Usage.call(this, userText);
    } else {
      sendError(this.replyToken);
      this.deleteSession();
    }

    // セッションデータを保存
    if (shouldSave) {
      this.saveSession();
    }
  }

}