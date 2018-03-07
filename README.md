[中文版](https://github.com/hanFengSan/eHunter/blob/master/README_CN.md)
# eHunter
Provide a scroll mode and book mode, for a better reading experience.

# Preview
<img src="https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/github_preview_1.jpg" style="width: 800px; display: block; padding: 10px;"/>
<img src="https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/github_preview_2.jpg" style="width: 800px; display: block; padding: 10px;"/>
<img src="https://raw.githubusercontent.com/hanFengSan/eHunter/master/github_image/github_preview_3.jpg" style="width: 800px; display: block; padding: 10px;"/>

## Implementation
It create a  new element in the Eh page, and inject Vue compoents.

## Install
Chrome: [Web store](https://chrome.google.com/webstore/detail/ehunter-more-powerful-e-h/dnnicnedpmjkbkdeijccbjkkcpcbmdoo)
Firefox: [Web store](https://addons.mozilla.org/zh-CN/firefox/addon/ehunter/)
Tampermonkey: [Web store](https://greasyfork.org/zh-CN/scripts/39198-ehunter)
You also can get it from the 'release' of this project.

## Run
1. In a node environment, run `npm install`, and `npm run dev`, then you will in dev mode.
2. In the top of `chrome://extensions`, open the develop mode, and select the `/dist`.
3. run `npm run publish` to package a zip file in `/publish_output` for the web store of Chrome and Firefox.
4. Tampermonkey: run `npm run publish`, add some required comments in the top of `/dist/inject.js`.

## Structure
```
|-eHunter
  |-build
    |-gulpfile.js // gulp file for packaging
    |-webpack.dev.conf.js // webpack file for dev
    |-webpack.prod.conf.js // webpack file for prod
  |-dist // directory of release 
  |-src
    |-assets // resources
      |-img // image files
      |-value
        |-String.js // for i18n
        |-tags.js // tags
        |-version.js // the informations of update in this version
    |-bean // bean class
    |-components // Vue components
      |-widget // button, pagination, switch etc..
        |-AlbumBookView.vue // the component of book mode
        |-AlbumScrollView.vue // the component of scorll mode
        |-ModalManager.vue // manage modals
        |-PageView.vue // the component of page， loading in AlbumBookView and AlbumScrollView
        |-ReaderView.vue // the component of reader，including AlbumBookView, AlbumScrollView,ThumbScrollview and TopBar
        |-ThumbScrollview.vue // the component of thumbnail column
        |-TopBar.vue // top bar
    |-service
      |-parser // the parseres of Eh pages
      |-request // the request classes.
      |-storage
        |-Base
          |-Stroage.js // extend from react-native-storage, supporting chrome.storage.
        |-AlbumCacheService.js // cache the urls of images, the size of images.
        |-LocalStorage.js // wrap Storage.js，basing on the window.localStorage
        |-SyncStorage.js //  wrap Storage.js，basing on the chrome.storage.sync. It can sync the datas with Cloud of Google.
      |-api.js // the api of Eh
      |-InfoService.js // show the dialog of instructions, the dialog of update, etc..
      |-SettingServie.js // save settings and get 
      |-PlatformService.js // some apis, for cross platfroms
      |-StringService.js // provide strings of i18n
    |-store // Vuex
    |-style // the variables of sass, and the style of Markdown
    |-utils
        |-bezier-easing.js // using cubic bezier in the scroll of scroll mode
        |-MdRenderer.js // the renderer of Markdown
        |-VueUtil.js // add some frequently-used functions in Vue
    |-app.inject.vue // the main components of Vue
    |-app.popup.vue // the main components of Vue in popup window
    |-main.inject.js // the entry of webpeck.webpack. some earlier stage processing before injecting view of Vue.
    |-main.popup.js // the entry of webpeck.webpack in popup window.
    |-config.js // version and update server
    |-mainifest.json // the mainifest for chrome and firefox extension
```