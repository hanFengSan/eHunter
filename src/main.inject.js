import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './app.inject.vue'
import store from './store/index.inject'
import VueUtil from './utils/VueUtil.js'

Vue.use(VueResource);
Vue.mixin(VueUtil);

if (document.location.pathname.includes('/s/')) {
    document.body.style.overflow = 'hidden';
    let element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.height = '100%';
    element.style.width = '100%';
    element.style.transition = 'all 2s ease';
    element.style.background = '#34353b';
    element.style.zIndex = '10';
    element.style.top = '-100%';
    element.classList = 'vue-container';
    let i1 = document.getElementById('i1');

    let vue = document.createElement('div');
    vue.setAttribute('id', 'app');
    element.appendChild(vue);

    document.body.insertBefore(element, i1);

    setTimeout(() => {
        element.style.top = '0';
    }, 0);
}

if (document.getElementsByClassName('vue-container').length > 0) {
    /* eslint-disable no-unused-vars */
    const app = new Vue({
        store,
        render: (h) => h(App)
    }).$mount('#app');
}
