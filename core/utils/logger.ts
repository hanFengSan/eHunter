class Logger {
  /**
   * 打印带标签的文本日志
   * @param tag - 日志标签
   * @param text - 日志内容
   */
  logText(tag: string, text: string | number): void {
    console.log(`%c[${tag}] %c${text}`, 'color:red', 'color:black')
  }

  /**
   * 打印带标签的对象日志
   * @param tag - 日志标签
   * @param obj - 要打印的对象
   * @param str - 是否使用 JSON.parse 处理
   */
  logObj(tag: string, obj: unknown, str: boolean = false): void {
    this.logText(tag, ':')
    console.log(str ? JSON.parse(JSON.stringify(obj)) : obj)
    this.logText(tag, '----------')
  }
}

const instance = new Logger();
export default instance;
