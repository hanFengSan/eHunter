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

  getByName(name, type) {
    return new Promise((resolve, reject) => {
      chrome.storage[type || this.storageType].get(name, async res => {
        let data = res[name];
        resolve(data);
      });
    });  
  }

  delByName(name, type) {
    chrome.storage[type || this.storageType].remove(name);
  }

  save(data) {
    return new Promise((resolve, reject) => {
      chrome.storage[this.storageType].set({ [this.name]: data }, () => resolve());
    });
  }
}
