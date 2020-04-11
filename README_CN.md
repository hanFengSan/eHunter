# eHunter
提供卷轴式/书本式阅读

# 预览
<img src="https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/github_preview_4.jpg" style="width: 800px; display: block; padding: 10px;"/>
<img src="https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/github_preview_5.jpg" style="width: 800px; display: block; padding: 10px;"/>
<img src="https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/github_preview_3.jpg" style="width: 800px; display: block; padding: 10px;"/>

## 实现方式概要
在在原页面上新创建一个节点, 将vue注入到此节点上. 爬虫是利用fetch实现的.
实现上基本隔离了具体环境, 可很容易得移植到其他漫画网站/平台等.

## 获取
油猴版本: [openuserjs](https://openuserjs.org/scripts/alexchen/eHunter)
Chrome版本: 新版本即将上架
Firefox版本: 新版本即将上架


## 运行
1. `npm install`后, 再`npm run dev`就可以进入dev模式了(当然,我个人喜好用yarn).
2. 在`chrome://extensions`页面顶部打开开发者模式, 选择项目的`/dist`文件夹就OK了.
3. `npm run publish`可以直接生成chrome&firefox用的zip压缩文件到`publish_output`文件夹.
4. 油猴的话, `npm run build`后, `/dist/inject.js`就是目标文件.
5. 运行`npm run test`执行单元测试.


## 项目结构
由于v1.0升级到v2.0时，有些弃用的功能以及相关文件，比如订阅通知等，所以有些杂物并未投入使用，以下不会说明。
```
|-eHunter
  |-build
    |-gulpfile.js // 部署用的gulp脚本
    |-webpack.dev.conf.js // 开发中打包用的webpack脚本
    |-webpack.prod.conf.js // 生产中打包用的webpack脚本
  |-dist // release文件夹
  |-src
    |-assets // 资源文件夹
      |-img // image files
      |-value
        |-String.js // 多语言化
        |-tags.js // 标志
        |-version.js // 新版本更新信息
    |-bean // bean类
    |-components // vue组件
      |-widget // 按钮、分页组件、开关等小组件
        |-AlbumBookView.vue // 书本模式组件
        |-AlbumScrollView.vue // 滚动模式组件
        |-ModalManager.vue // 弹窗管理组件
        |-PageView.vue // 图片页组件， 装载于AlbumBookView和AlbumScrollView之中
        |-ReaderView.vue // 阅读器组件，载入AlbumBookView、AlbumScrollView、ThumbScrollview和TopBar
        |-ThumbScrollview.vue // 滚动缩略图栏组件
        |-TopBar.vue // 顶栏组件
    |-service // 业务类
      |-parser // 解析页面用的各种praser类
      |-request // 异步请求队列序列化/请求失败自动重试等功能的请求服务类
      |-storage
        |-Base
          |-Stroage.js // 继承于react-native-storage，使得支持chrome.storage. 目前弃用了chrome.storage作为底层，而是使用window.localStorage
        |-AlbumCacheService.js // 实现画廊中图片地址、图片数量、图片高宽等的缓存，加速浏览。队列化存储，支持10个画廊的缓存。
        |-LocalStorage.js // 封装Storage.js，使用window.localStorage为底层
        |-SyncStorage.js // 封装Storage.js，使用chrome.storage.sync为底层, 可在chrome上实现云端同步数据
      |-api.js // 请求url的封装
      |-InfoService.js // 消息服务类，实现弹窗用户引导等
      |-SettingServie.js // 设置服务类
      |-PlatformService.js // 平台接口的隔离层, 用于屏蔽各平台api上的差异
      |-StringService.js // 提供多语言化
    |-store // vuex相关
    |-style // sass的变量以及markdown样式
    |-utils // 工具类
        |-bezier-easing.js // 二次贝塞尔曲线生成，用于滚动模式的滚动
        |-MdRenderer.js // md解析类
        |-VueUtil.js // vue的一些常用操作封装
    |-app.inject.vue // vue主组件
    |-app.popup.vue // 弹出框的vue主组件
    |-background.js // chrome的后台任务, 目前并未使用
    |-main.inject.js // webpack入口; vue注入前的前期处理
    |-main.popup.js // webpack入口
    |-config.js // 定义版本和更新查询接口
    |-mainifest.json // chrome&firefox extension的文件/权限/说明用的清单
```