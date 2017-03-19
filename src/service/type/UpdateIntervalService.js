// types of time in subscription
export default {
    _intervals: {
        '10': '10分钟',
        '30': '0.5小时',
        '180': '3小时',
        '360': '6小时',
        '720': '12小时'
    },
    getTextByVal(val) {
        return this._intervals[val];
    },
    getValByText(text) {
        for (let i in this._intervals) {
            if (this._intervals[i] === text) {
                return i;
            }
        }
    },
    getTypes() {
        let results = [];
        for (let i in this._intervals) {
            results.push(this._intervals[i]);
        }
        return results;
    }
};
