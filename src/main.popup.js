import Vue from 'vue'
import App from './legacy/app.popup.vue'
import MuseUI from 'muse-ui'
import './legacy/style/muse-ui/index.less'

Vue.use(MuseUI)

/* eslint-disable no-unused-vars */
const app = new Vue({
    render: (h) => h(App)
}).$mount('#app')
