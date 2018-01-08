import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './app.popup.vue'
import MuseUI from 'muse-ui'
import 'src/style/muse-ui/index.less'

Vue.use(VueResource)
Vue.use(MuseUI)

/* eslint-disable no-unused-vars */
const app = new Vue({
    render: (h) => h(App)
}).$mount('#app')

// var storage = new Storage({
//     // 最大容量，默认值1000条数据循环存储
//     size: 100,

//     // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
//     // 如果不指定则数据只会保存在内存中，重启后即丢失
//     storageBackend: Platform.storage.local,

//     // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
//     defaultExpires: 1000 * 3600 * 24,

//     // 读写时在内存中缓存数据。默认启用。
//     enableCache: false
// });

// storage.save({
//     key: 'loginState', // 注意:请不要在key中使用_下划线符号!
//     data: {
//         from: 'some other site',
//         userid: 'some userid',
//         token: 'some token'
//     },

//     // 如果不指定过期时间，则会使用defaultExpires参数
//     // 如果设为null，则永不过期
//     expires: 1000 * 3600
// });

// // 读取
// storage.load({
//     key: 'loginState'
// }).then(ret => {
//     console.log(ret);
// }).catch(err => {
//     console.warn(err);
// });

// async function test() {
//     // for (let i = 0; i < 50; i++) {
//     //     try {
//     //         await storage.save({
//     //             key: 'fuck', // 注意:请不要在key中使用_下划线符号!
//     //             id: i, // 注意:请不要在id中使用_下划线符号!
//     //             data: {
//     //                 name: '寒枫' + i
//     //             },
//     //             expires: null
//     //         });
//     //     } catch (e) {
//     //         console.log(e);
//     //     }
//     // }

    // // load 读取
    // storage.load({
    //     key: 'fuck',
    //     id: '150'
    // }).then(ret => {
    //     console.log(ret.name);
    // }).catch(err => {
    //     console.warn(err.message);
    // })
// }

// test();
