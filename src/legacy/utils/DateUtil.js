export default {
    getIntervalFromNow(date) {
        let now = new Date().getTime();
        let start = date instanceof Date ? date.getTime() : date;
        let interval = now - start;
        if (interval < 60 * 1000) { // sec level
            return `${(interval / 1000).toFixed(0)}秒前`;
        }
        if (60 * 1000 <= interval && interval < 60 * 60 * 1000) { // min level
            return `${(interval / (60 * 1000)).toFixed(0)}分钟前`;
        }
        if (60 * 60 * 1000 <= interval && interval < 24 * 60 * 60 * 1000) { // hour level
            return `${(interval / (60 * 60 * 1000)).toFixed(0)}小时前`;
        }
        if (24 * 60 * 60 * 1000 && interval < 365 * 24 * 60 * 60 * 1000) { // day level
            return `${(interval / (24 * 60 * 60 * 1000)).toFixed(0)}天前`;
        }
        return `${(interval / (365 * 24 * 60 * 60 * 1000)).toFixed(0)}年前`; // year level
    }
}
