/* eslint-disable no-unused-vars,no-undef,indent */
import 'babel-polyfill';
import Vue from 'vue'
import VueResource from 'vue-resource'
import App from '../core'
import store from './store/index.inject'
import VueUtil from './utils/VueUtil.js'
import SettingService from './service/SettingService';
import { setTimeout } from 'timers';

Vue.use(VueResource);
Vue.mixin(VueUtil);

function isAlbumViewPage() {
    return document.location.pathname.includes('/s/');
}

function createEhunterSwitch() {
    let container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.position = 'absolute';
    container.style.right = '100px';
    container.style.top = '-150px';
    container.style.zIndex = '10';
    container.style.cursor = 'pointer';
    container.style.transition = 'all 0.2s cubic-bezier(.46,-0.23,.37,2.38)';
    container.setAttribute('title', 'open eHunter');
    container.setAttribute('id', 'switch');
    container.addEventListener('click', openEhunter);

    let line = document.createElement('span');
    line.style.width = '2px';
    line.style.height = '200px';
    line.style.background = '#2ecc71';
    line.style.boxShadow = '0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647)';
    container.appendChild(line);

    let ring = document.createElement('span');
    ring.style.border = '2px solid #2ecc71';
    ring.style.borderRadius = '50%';
    ring.style.width = '15px';
    ring.style.height = '15px';
    ring.style.boxShadow = '0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647)';
    container.appendChild(ring);

    let i1 = document.getElementById('i1');
    document.body.insertBefore(container, i1);
}

// when user click the ehunter switch
function openEhunter() {
    var element = document.querySelector('#switch');
    element.style.top = '-50px';
    window.setTimeout(() => {
        element.style.top = '-150px';
    }, 2000);
    SettingService.toggleEHunter(true);
    window.setTimeout(() => {
        eHunter.toggleEHunterView(true);
    }, 300);
}

function createEHunterView() {
    document.body.style.overflow = 'hidden';
    let element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.height = '100%';
    element.style.width = '100%';
    element.style.transition = 'all 1s ease';
    element.style.background = '#333333';
    element.style.zIndex = '10';
    element.style.top = '-100%';
    element.style.left = '0px';
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
                render: (h) => h(App())
            })
            .$mount('#app');
    }
}

// some actions of eh will make some wired errors
function blockEhActions() {
    var elt = document.createElement('script');
    elt.innerHTML = `
        if (typeof timerId === 'undefined') {
            const timerId = window.setInterval(() => {
                if (document.onkeyup) {
                    window.onpopstate = null;
                    window.clearInterval(timerId);
                    load_image_dispatch = () => {};
                    api_response = () => {};
                    _load_image = () => {};
                    nl = () => {};
                    hookEvent = () => { console.log('hookEvent') };
                    scroll_space = () => {};
                    document.onkeydown = () => {};
                    document.onkeyup = () => {};
                }
            }, 1000);
        }
    `;
    document.body.appendChild(elt);
}

// add ehunter switch etc.
async function init() {
    if (isAlbumViewPage()) {
        createEhunterSwitch();
        if (await SettingService.getEHunterStatus()) {
            eHunter.toggleEHunterView(true);
        }
    }
}

// export some global function
let eHunter = {
    toggleEHunterView(val) {
        if (document.getElementsByClassName('vue-container').length > 0) {
            document.body.style.overflow = val ? 'hidden' : '';
            document.getElementsByClassName('vue-container')[0].style.top = val ? '0' : '-100%';
        } else {
            blockEhActions();
            createEHunterView();
            createVueView();
            SettingService.initSettings();
        }
    }
}

export default eHunter;

init();
