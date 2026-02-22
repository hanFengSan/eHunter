class Logger {
    /**
     * 在页面侧执行 console.log
     * @param {string} code - 要执行的代码字符串
     */
    executeInPage(code) {
        const script = document.createElement('script');
        script.textContent = code;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    /**
     * 序列化对象为字符串，用于在页面侧打印
     * @param {any} obj - 要序列化的对象
     * @returns {string}
     */
    serializeForPage(obj) {
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        if (typeof obj === 'string') return JSON.stringify(obj);
        if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
        if (typeof obj === 'function') return obj.toString();
        try {
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return String(obj);
        }
    }

    logText(tag, text) {
        const tagStr = JSON.stringify(`[${tag}]`);
        const textStr = JSON.stringify(String(text));
        const code = `console.log('%c' + ${tagStr} + ' %c' + ${textStr}, 'color:red', 'color:black');`;
        this.executeInPage(code);
    }

    logObj(tag, obj, str = false) {
        this.logText(tag, ':');
        
        // 将对象序列化后在页面侧打印
        const serialized = this.serializeForPage(obj);
        const code = str 
            ? `console.log(JSON.parse(${JSON.stringify(serialized)}));`
            : `console.log(${serialized});`;
        this.executeInPage(code);
        
        this.logText(tag, '----------');
    }
}

let instance = new Logger();
export default instance;
