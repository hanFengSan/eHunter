import BaseStorage from './base';

class SubsStorage extends BaseStorage {
    constructor() {
      super();
      this.name = 'subsV2';
      this.default = {};
    }

    async getSubsList() {
        const subs = await this.get();
        return JSON.parse(JSON.stringify(subs.list || []));
    }

    async addSubsItem(item) {
      const subs = await this.get();
      if (!subs.list) {
          subs.list = [];
      }
      subs.list.push(item);
      await this.save(subs);
    }

    async delSubsItemByName(name) {
      const subs = await this.get();
      const target = subs.list.find(i => i.name === name);
      if (target) {
          subs.list.splice(subs.list.indexOf(target), 1);
      }
      await this.save(subs);
    }
}

const instance = new SubsStorage();
export default instance;
