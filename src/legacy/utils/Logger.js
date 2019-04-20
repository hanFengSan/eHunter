class Logger {
    logText(tag, text) {
        console.log(`%c[${tag}] %c${text}`, 'color:red', 'color:black');
    }

    logObj(tag, obj, str = false) {
        this.logText(tag, ':');
        console.log(str ? JSON.parse(JSON.stringify(obj)) : obj);
        this.logText(tag, '----------');
    }
}

let instance = new Logger();
export default instance;
