import BaseStorage from './base';

class NotiStorage extends BaseStorage {
  constructor() {
    super();
    this.name = 'notiV2';
    this.default = {};
  }

  async getResultsByName(name) {
    const noti = await this.get();
    return JSON.parse(JSON.stringify(noti[name] || []));
  }

  async putItem(name, results) {
    const noti = await this.get();
    noti[name] = JSON.parse(JSON.stringify(results));
    await this.save(noti);
  }

  async getMsgList() {
    const noti = await this.get();
    return JSON.parse(JSON.stringify(noti.msg || []));
  }

  async pushMsg(item) {
      const noti = await this.get();
      if (!noti.msg) {
          noti.msg = [];
      }
      // cut down size if too big
      if (noti.msg.length > 100) {
          noti.msg.splice(0, 50);
          console.log('cut down size of noti cache');
      }
      noti.msg.push(item);
      this.save(noti);
  }

  async clearMsg() {
    const noti = await this.get();
    noti.msg = [];
    this.save(noti);
  }
}

const instance = new NotiStorage();
export default instance;