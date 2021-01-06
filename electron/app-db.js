const { v4: uuidv4 } = require('uuid');

class AppDb {
  constructor(db) {
    this.db = db;
    db.defaults({ apps: [] }).write();
  }

  getApps() {
    return this.db.get('apps').value();
  }

  getAppByIndex(index) {
    return this.db.get('apps').find({ index }).value();
  }

  addApp() {
    const index = this.db.get('apps').value().length;
    this.db.get('apps').push({ id: uuidv4(), name: '', unreadCount: 0, index }).write();
  }

  removeApp(id) {
    this.db.get('apps').remove({ id }).write();
  }

  updateApp(id, data) {
    this.db.get('apps').find({ id }).assign(data).write();
  }
}

module.exports = AppDb;
