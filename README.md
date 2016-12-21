# anime-sales
网站[anime-sales](http://anime-sales.com)的前端部分, 后台project地址: [后台地址](https://github.com/hanFengSan/anime-sales-server),网站提供oricon销量榜的中文化&集成服务. 项目采用了响应式布局, 秉着`mobile first`的理念, 在PC端移动端中都有着不错的可视化&操作体验.

## 效果预览
<div>
	<img src="https://github.com/hanFengSan/anime-sales/github_image/anime-sales-preview1.png">
</div>
<div>
	<img src="https://github.com/hanFengSan/anime-sales/github_image/anime-sales-preview2.png">
</div>


## Usage

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```
project采用的是前后端分离的构建方式, `npm run dev`运行时, 会监听本机的`8100`端口去获取后台json数据, 可在`dev-server.js`中更改代理位置.

## 项目简介
使用`webpack+Vue2+Vuex+Sass`编写. 
**项目结构:**
```
-----src
     |-assets // 资源文件夹
       |value
         |-string-cn.json // 中文环境字符串json
         |-string-en.json // 英文环境字符串json
         |-*.jpg // 图片资源
     |-components // Vue的组件文件夹
       |-base // 基类
         |-Popup.vue // 继承用于各种弹出内容
       |-widget // 页面小组件
         |-FloatingButton.vue // 浮动圆形按钮组件
         |-ItemInfo.vue // 展示map形式信息组件
         |-Navbar.vue // navbar组件
         |-PopupMask.vue // 弹出层遮罩组件
         |-SalesTable.vue // 销量表格组件
         |-Selector.vue // 弹出式选择框组件
         |-StateClock.vue // 表格上方的计时等信息组件
         |-TablePicker.vue // 表格显示项选择组件
         |-Toolbar.vue // navbar下方的toolbar组件
       |-Index.vue // index页面
       |-PageFragment // 页面Fragment组件
     |-config // Vue相关配置
       |-routes.js // vue-route, 路由配置
     |-service
       |-SalesDataWarapper.js // 封装从服务器获取的数据, 添加表格展示等方面的相关数据
       |-ServerAPI.js // 服务器接口封装 
     |-store //vuex相关, 在project中基本等于DAO层233
       |-modules
         |-Popup.js // 弹出层状态存储
         |-RankList.js // 所有销量数据的存储, 和toolbar/周榜日榜选择的状态存储, 表格相关状态的存储
         |-String.js // 文本环境状态, 原打算用于多语言环境切换, 现在覆盖不全
       |-index.js // vuex的配置
       |-mutation-types.js // mutation相关字符串
     |-style // sass相关库
       |-_responsive.scss // 在github上参考了一个忘记叫啥了的响应式样式项目, 此文件用于提供响应式布局样式服务
       |-_variables.scss // project的sass变量
     |-App.vue // project组件, 页面组件/弹出层组件都在此处配置
     |-main.js
```

