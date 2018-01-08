class Logger {
    o(name, data) {
        console.log('TAG: ' + name);
        console.log(data);
        console.log('----------');
    }
}

let instance = new Logger();
export default instance;
