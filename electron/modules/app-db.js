class AppDb {
  constructor(db) {
    this.db = db;
    db.defaults({
      shopes: [],
      quickReply: {
        autoMsg: '请稍等，马上为您解决！',
        autoMsgTime: 30
      }
    }).write();
  }

  getShopes() {
    return this.db.get('shopes').value();
  }

  getShopByUid(shopUid) {
    return this.db.get('shopes').find({ shopUid }).value();
  }

  // 新增店铺
  addShop(data) {
    const index = this.db.get('shopes').value().length;
    this.db
      .get('shopes')
      .push({ ...data, index })
      .write();
  }

  // 更新店铺
  updateShop(data) {
    const { shopUid } = data;
    this.db
      .get('shopes')
      .find({ shopUid })
      .assign({ ...data })
      .write();
  }

  // 更新店铺
  deleteShop(data) {
    const { shopUid } = data;
    this.db.get('shopes').remove({ shopUid }).write();
  }

  getQuickReply() {
    return this.db.get('quickReply').value();
  }

  updateQuickReply(data) {
    this.db
      .get('quickReply')
      .assign({ ...data })
      .write();
  }
}

module.exports = AppDb;
