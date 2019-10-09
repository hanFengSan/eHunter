export default class BaseStorage {
  constructor() {
    this.name = 'fill_in_child';
    this.storageType = 'local';
    this.default = {};
  }

  get() {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].get(this.name, async res => {
        let data = res[this.name];
        if (typeof data === 'undefined') {
          data = this.default;
          await this.save(data);
        }
        resolve(data);
      });
    });  
  }

  save(data) {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].set({ [this.name]: data }, () => resolve());
    });
  }
}
