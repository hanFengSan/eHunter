/* eslint-disable no-unused-vars,no-undef,indent */
import "@babel/polyfill";
import Vue from 'vue'
import VueResource from 'vue-resource'
import launcher from './launcher'
import store from './store/index.inject'
import VueUtil from './utils/VueUtil.js'
import SettingService from './service/SettingService'
import { setTimeout } from 'timers'

Vue.use(VueResource);
Vue.mixin(VueUtil);

function createAppView(containerClass, containerId, vueInstance) {
    if (document.getElementsByClassName(containerClass)
        .length > 0) {
        let app = new Vue({
                store,
                render: (h) => h(vueInstance)
            })
            .$mount(containerId);
        SettingService.initSettings();
        return app;
    }
}

export default {
    launcher,
    createAppView,
    SettingService
}