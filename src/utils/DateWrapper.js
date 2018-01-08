export default class DateWrapper {
    constructor(date) {
        if (date) {
            this.date = date;
        } else {
            this.date = new Date();
        }
    }

    _paddy(n, p, c) {
        let padChar = typeof c !== 'undefined' ? c : '0';
        let pad = new Array(1 + p).join(padChar);
        return (pad + n).slice(-pad.length);
    }

    addDays(days) {
        this.date.setDate(this.date.getDate() + days);
        return this;
    }

    addMonths(month) {
        this.date.setMonth(this.date.getMonth() + month);
        return this;
    }

    addYears(Years) {
        this.date.setFullYear(this.date.getFullYear() + Years);
        return this;
    }

    getDate() {
        return this.date;
    }

    toString(pattern) {
        pattern = pattern || 'yyyy/MM/dd HH:mm:ss';
        let month = this.date.getMonth() + 1 // begin from 0
        let day = this.date.getDate() // not getDay(), it's wrong
        let year = this.date.getFullYear();
        let hour = this.date.getHours();
        let min = this.date.getMinutes();
        let sec = this.date.getSeconds();
        pattern = pattern
            .replace('MM', this._paddy(month, 2))
            .replace('dd', this._paddy(day, 2))
            .replace('HH', this._paddy(hour, 2))
            .replace('mm', this._paddy(min, 2))
            .replace('ss', this._paddy(sec, 2));
        if (pattern.includes('yyyy')) {
            pattern = pattern.replace('yyyy', year);
        } else if (pattern.includes('yy')) {
            pattern = pattern.replace('yy', year % 100);
        }
        return pattern;
    }

    toGMTString() {
        return this.date.toGMTString();
    }

    setTimeFromDate(date) {
        this.date.setHours(date.getHours());
        this.date.setMinutes(date.getMinutes());
        this.date.setSeconds(date.getSeconds());
        return this;
    }

    setDateFromDate(date) {
        this.date.setMonth(date.getMonth());
        this.date.setDate(date.getDate());
        this.date.setFullYear(date.getFullYear());
        return this;
    }

    clearTime() {
        this.date.setHours(0);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        return this;
    }

    clearDay() {
        this.date.setDate(1);
        this.clearTime();
        return this;
    }

    clearMonth() {
        this.date.setMonth(0);
        this.clearDay();
        return this;
    }
}