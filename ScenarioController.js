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
        usage: null, // 使用用途
        objective: null, // 使用目的
        price: null, // 使用金額
        receipt_image: null // 領収書の画像
      };
    }
  }
  /**
   * 受信したメッセージに基づき、状態を更新し応答を返す
   * @param {string} userText - ユーザーが送信したテキスト
   */
  handleMessage(userText) {
    if(userText === "報告開始" && this.session.step === 0) {
      handleStart.call(this)
    }
  }

}