import lang from './lang';

export default {
    getIntervalFromNow(date) {
        let now = new Date().getTime();
        let start = date instanceof Date ? date.getTime() : date;
        let interval = now - start;
        if (interval < 60 * 1000) { // sec level
            return `${(interval / 1000).toFixed(0)}${['s ago', '秒前'][lang]}`;
        }
        if (60 * 1000 <= interval && interval < 60 * 60 * 1000) { // min level
            return `${(interval / (60 * 1000)).toFixed(0)}${['m ago', '分钟前'][lang]}`;
        }
        if (60 * 60 * 1000 <= interval && interval < 24 * 60 * 60 * 1000) { // hour level
            return `${(interval / (60 * 60 * 1000)).toFixed(0)}${['h ago', '小时前'][lang]}`;
        }
        if (24 * 60 * 60 * 1000 && interval < 365 * 24 * 60 * 60 * 1000) { // day level
            return `${(interval / (24 * 60 * 60 * 1000)).toFixed(0)}${['d ago', '天前'][lang]}`;
        }
        return `${(interval / (365 * 24 * 60 * 60 * 1000)).toFixed(0)}${['y ago', '年'][lang]}`; // year level
    }
}
