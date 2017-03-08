import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './NewApp.vue'

Vue.use(VueResource)

/* eslint-disable no-unused-vars */
const app = new Vue({
    render: (h) => h(App)
}).$mount('#app')
