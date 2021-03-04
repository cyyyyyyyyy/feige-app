class AppDb {
  constructor(db) {
    this.db = db;
    db.defaults({ shopes: [] }).write();
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
}

module.exports = AppDb;
