class AppDb {
  constructor(db) {
    this.db = db;
    db.defaults({ shopes: [] }).write();
  }

  getShopes() {
    return this.db.get('shopes').value();
  }

  getAppByIndex(index) {
    return this.db.get('shopes').find({ index }).value();
  }

  // 新增店铺
  addShop(data) {
    const index = this.db.get('shopes').value().length;
    this.db
      .get('shopes')
      .push({ ...data, index })
      .write();
  }

  removeApp(id) {
    this.db.get('shopes').remove({ id }).write();
  }

  updateEnt(entId, data) {
    this.db.get('shopes').find({ entId }).assign(data).write();
  }
}

module.exports = AppDb;
