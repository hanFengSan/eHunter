# eHunter
卷轴式阅读, 标签更新订阅

# 大概实现
在在原页面上新创建一个节点, 将vue注入到此节点上. 爬虫是利用fetch实现的.

# 运行
`npm install`后, 再`npm run dev`就可以进入dev模式了(当然,我个人喜好用yarn, 强烈推荐yarn), 在`chrome://extensions`页面顶部打开开发者模式, 选择项目的`/dist`文件夹就OK了.

# 待解决问题
content script貌似并不允许操作宿主的cookie, 而如果缩略图是`large`模式, 将无法愉快的使用爬虫.

# 项目结构
|-eHunter
  |-build
    |-gulpfile.js // 部署用的gulp脚本
    |-webpack.dev.conf.js // 打包用的webpack脚本(还缺少个prod的233, 下次补上)
  |-dist // release文件夹
  |-src
    |-assets // 资源文件夹
    |-components // vue组件
    |-service // 业务类
      |-parser // 解析页面用的各种praser class
      |-request // 异步请求队列序列化/请求失败自动重试等功能的请求服务类
      |-storage // 差不多是个model层吧...
      |-type // 一些类型的服务类
      |-api.js // 请求url的封装
      |-NotificationService.js // 通知服务
      |-SettingServie.js // 设置服务类
    |-store // vuex相关
    |-style // sass的变量还有muse-ui的定制等
    |-utils // 工具类
    |-app.injuect.vue // 卷轴阅读的vue主组件
    |-app.popup.vue // 弹出框的vue主组件
    |-background.js // chrome的后台任务, 目前只用于通知服务
    |-main.inject.js // webpack入口; vue注入前的前期处理
    |-main.popup.js // webpack入口
    |-mainifest.json // chrome extension的文件/权限/说明用的清单