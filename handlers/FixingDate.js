function FixingDate(receivedDate) {
  const replyToken = this.replyToken;

  if (!replyToken) return;
  this.session = {
    step: 4
  }
  const [Yer, Mon, Day] = receivedDate.split("-");
  sendFixingDateButton(replyToken, Yer, Mon, Day);

}
