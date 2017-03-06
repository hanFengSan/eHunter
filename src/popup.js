import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import App from './NewApp.vue'
import store from './store'

Vue.use(VueResource)

const app = new Vue({
    store,
    render: (h) => h(App)
}).$mount('#app')