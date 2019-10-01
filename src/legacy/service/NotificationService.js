// a background service for notifying tag's update
import SubsStorage from './storage/SubsStorage'
import NotiStorage from './storage/NotiStorage'
import ReqQueueService from './request/ReqQueueService'
import SearchHtmlParser from './parser/SearchHtmlParser'
import Utils from '../utils/Utils'
import lang from '../utils/lang'

class NotificationService {
    constructor() {
        this.time = 0; // record the duration of running
    }

    static getTagUrl(item) {
      let url = '';
      if (item.site.length > 0) {
          switch (item.site[0]) {
              case 'e-hentai':
                  url += 'https://e-hentai.org/';
                  break;
              case 'exhentai':
                  url += 'https://exhentai.org/';
                  break;
          }
      }
      let category = 1023;
      const value = {
        'Misc': 1,
        'Doujinshi': 2,
        'Manga': 4,
        'Artist CG': 8,
        'Game CG': 16,
        'Image Set': 32,
        'Cosplay': 64,
        'Asian Porn': 128,
        'Non-H': 256,
        'Western': 512,
        'none': 0,
      }
      item.type.forEach(i => {
        category = category - value[i];
      });
      url += `?${category === 1023 ? '' : 'f_cats=' + category + '&'}`;
      const tags = item.name.replace(/，/g, ',').split(',').map(i => i.trim());
      url = tags.reduce((sum, i) => {
        return sum + encodeURIComponent(`"${i}$"`) + '+'
      }, url + 'f_search=')
      if (item.lang.length > 0) {
          url += encodeURIComponent(`language:"${item.lang[0]}$"`);
      }
      url = url.replace(/\+$/g, '')
      return url;
    }

    log(msg) {
        console.log(`${new Date().toLocaleString()}: ${msg}`);
    }

    run() {
        /* eslint-disable no-undef */
        this.log('NotiService run');
        window.setInterval(async () => {
            console.log('run');
            this.time += 10; // 叠加时间
            const tags = await this.getCheckedTags(); // 获取需要更新的tag
            const urls = tags.map(item => NotificationService.getTagUrl(item)); // 获取对应需要请求的url
            const htmlMaps = await this.getUrlHtmls(urls); // 获取url对应的html
            const notifications = [];
            for (let tag of tags) {
              const url = urls[tags.indexOf(tag)];
              const html = htmlMaps.get(url);
              const msg = await this.compare(tag, url, html);
              if (msg) {
                notifications.push(msg);
              }
            }
            this.notify(notifications);
        }, 10 * 60 * 1000); // 10 mins
        // }, 10 * 1000); // debug: 5s
    }

    async getCheckedTags() {
        return (await SubsStorage.getSubsList()).filter(item => this.time % item.time === 0); // 获取需要检查的tag
    }

    async getUrlHtmls(urls) {
      return await (new ReqQueueService(urls)).setNumOfConcurrented(1).request();
    }

    async compare(tag, url, html) {
        const oldResults = await NotiStorage.getResultsByName(tag.name);
        const newResults = new SearchHtmlParser(html).getResults();
        let diffs = [];
        if (oldResults.length === 0) {
          diffs = newResults;
        } else {
          for (let item of newResults) {
            if (item.title !== oldResults[0].title) {
              diffs.push(item);
            } else {
              break;
            }
          }
        }
        if (diffs.length > 0) {
          await NotiStorage.putItem(tag.name, newResults);
          if (oldResults.length > 0) {
            return {
              name: tag.name,
              message: [`${tag.name} Updated: ${diffs.length >= 25 ? '>=25' : diffs.length} items`,`${tag.name}更新了${diffs.length >= 25 ? '>=25' : diffs.length}项`][lang],
              time: new Date().getTime(),
              updatedNum: diffs.length >= 25 ? '>=25' : diffs.length,
              url,
              diffs,
              type: tag.type
            };
          }
        }
    }

    async notify(notifications) {
      if (notifications.length === 0) return;
      for (let item of notifications) {
        await Utils.sleep(100);
        chrome.notifications.create('EHUNTER_UPDATED_NOTI_' + item.time, {
          type: 'basic',
          title: ['TAG Update Notification','标签更新通知'][lang],
          iconUrl: './img/ehunter_icon.png',
          message: item.message,
        }, () => {
          NotiStorage.pushMsg(item);
        });
      }
    }
}

export default NotificationService;
