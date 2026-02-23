# eHunter
提供卷轴式/书本式阅读

# 预览
<img src="https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/github_preview_4.png" style="width: 800px; display: block; padding: 10px;"/>
<img src="https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/github_preview_5_1.png" style="width: 800px; display: block; padding: 10px;"/>
<img src="https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/github_preview_3.jpg" style="width: 800px; display: block; padding: 10px;"/>

# 在iPhone和iPad上使用
现在可以在iPhone和iPad上使用eHunter了！可参考以下指南：
CN: [Link](https://github.com/hanFengSan/eHunter/blob/master/misc/iphone_ipad_cn.md)
EN: [Link](https://github.com/hanFengSan/eHunter/blob/master/misc/iphone_ipad_en.md)
JP: [Link](https://github.com/hanFengSan/eHunter/blob/master/misc/iphone_ipad_jp.md)

## 实现方式概要
在在原页面上新创建一个节点, 将vue注入到此节点上. 爬虫是利用fetch实现的.
实现上基本隔离了具体环境, 可很容易得移植到其他漫画网站/平台等.

## 获取
暴力猴/油猴/userscript版本: [openuserjs](https://openuserjs.org/scripts/alexchen/eHunter)


## 运行
1. `npm install`后, 再`npm run dev`就可以进入dev模式了
2. `npm run build-prod`可以直接生成userscript版本


## 项目架构
当前项目基于 `Vite + Vue 3 + TypeScript`，核心目标是：
1. 在目标站点页面内注入阅读器 UI；
2. 将平台解析逻辑与阅读器渲染逻辑分层，便于扩展和维护。

主要目录职责如下：

```
|-eHunter
  |-src
  |  |-main.ts               // 入口：初始化并挂载应用（当前以测试挂载为主）
  |  |-config.ts             // 运行时配置
  |  |-platform/             // 平台层（站点识别、初始化、平台服务工厂）
  |     |-detector.ts        // 域名/环境识别
  |     |-initializer.ts     // 平台初始化流程
  |     |-factory.ts         // 平台服务实例创建
  |     |-eh/                // EH/EXH 平台实现
  |     |-nh/                // NH 平台实现
  |     |-base/              // 跨平台基础能力（请求、队列、重试等）
  |
  |-core
  |  |-App.vue               // 阅读器根组件
  |  |-components/           // 视图层：书页模式、卷轴模式、缩略图、工具栏、弹窗等
  |  |-service/              // 业务服务层（相册数据、下载、重试策略）
  |  |-store/                // 状态管理（应用状态、事件、i18n、布局偏好）
  |  |-model/                // 领域模型（布局、跨页、缩略图展开等）
  |  |-utils/                // 工具函数
  |  |-style/                // 全局样式与主题变量
  |
  |-public/                  // 静态资源
  |-dist/                    // 构建产物
  |-specs/                   // 功能设计与方案文档
  |-misc/                    // 说明文档与辅助资料
```

简化调用链路：
`main.ts -> platform 初始化（识别站点 + 创建平台服务）-> core 阅读器挂载 -> 组件渲染与交互 -> service/store 协同完成数据加载与状态更新`。
