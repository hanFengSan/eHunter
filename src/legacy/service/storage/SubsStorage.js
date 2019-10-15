import BaseStorage from './base';

class SubsStorage extends BaseStorage {
    constructor() {
      super();
      this.name = 'subsV2';
      this.storageType = 'sync';
      this.default = {};
    }

    async migrateOldData() {
      try {
        const oldData = await this.getByName('subs', 'local');
        if (oldData && oldData.list && oldData.list.length > 0) {
          const newData = await this.get();
          if (newData.list && newData.list.length > 0) {
            for (let item of oldData.list) {
              if (!newData.list.find(i => i.name === item.name)) {
                newData.list.push(item);
              }
            }
          } else {
            newData.list = oldData.list;
          }
          await this.save(newData);
          this.delByName('subs', 'local');
        }
      } catch(e) {
      }
    }

    async getSubsList() {
        await this.migrateOldData();
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
