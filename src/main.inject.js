/* eslint-disable no-unused-vars,no-undef,indent */
import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './app.inject.vue'
import store from './store/index.inject'
import VueUtil from './utils/VueUtil.js'
import SettingService from './service/SettingService.js'

Vue.use(VueResource);
Vue.mixin(VueUtil);

function isAlbumViewPage() {
    return document.location.pathname.includes('/s/');
}

function createEHunterView() {
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

function createVueView() {
    if (document.getElementsByClassName('vue-container')
        .length > 0) {
        const app = new Vue({
                store,
                render: (h) => h(App)
            })
            .$mount('#app');
    }
}

function createListener() {
    SettingService.instance.listen(store);
}

function init() {
    if (isAlbumViewPage()) {
        SettingService.instance.getSettingItem('toggleEHunter', (active) => {
            console.log(active);
            if (active) {
                createEHunterView();
                createVueView();
            } else {
                SettingService.instance.onSettingChange('toggleEHunter', (active) => {
                    init();
                });
            }
        }, true);
        createListener();
    }
}

init();

