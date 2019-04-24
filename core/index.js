/* eslint-disable no-unused-vars,no-undef,indent */
import "@babel/polyfill";
import Vue from 'vue'
import launcher from './launcher'
import store from './store'
import VueUtil from './utils/VueUtil.js'
import SettingService from './service/SettingService.ts'
import { setTimeout } from 'timers'

Vue.mixin(VueUtil);

function createAppView(containerClass, vueRootId, vueInstance) {
    if (document.getElementsByClassName(containerClass)
        .length > 0) {
        let app = new Vue({
                store,
                render: (h) => h(vueInstance)
            })
            .$mount(vueRootId);
        SettingService.initSettings();
        return app;
    }
}

export default {
    launcher,
    createAppView,
    SettingService
}