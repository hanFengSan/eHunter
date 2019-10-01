import lang from '../../utils/lang'

// types of time in subscription
const intervals = {
    '10': ['10min', '10分钟'][lang],
    '30': ['0.5h', '0.5小时'][lang],
    '180': ['3h', '3小时'][lang],
    '360': ['6h', '6小时'][lang],
    '720': ['12h', '12小时'][lang],
};

export default {
    getText(val) {
        return intervals[val];
    },
    getVal(text) {
        for (let key in intervals) {
            if (intervals[key].includes(text)) {
                return Number(key);
            }
        }
    },
    getTypes() {
        let results = [];
        for (let key in intervals) {
            results.push(intervals[key]);
        }
        return results;
    }
};
