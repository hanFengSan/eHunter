/* eslint-disable no-unused-vars,no-undef,indent */
import core from '../core'
import { setTimeout } from 'timers'
import AlbumService from './service/AlbumService.nh.js'
import config from './config'
import BaseApp from './app.base.js'

export default class NHApp extends BaseApp {
    isAlbumViewPage() {
        return window.location.pathname.split('/').length === 5;
    }

    createEhunterSwitch() {
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
        container.addEventListener('click', this.openEhunterBySwitch.bind(this));

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
    openEhunterBySwitch() {
        var element = document.querySelector('#switch');
        element.style.top = '-50px';
        window.setTimeout(() => {
            element.style.top = '-150px';
        }, 2000);
        core.SettingService.toggleEHunter(true);
        window.setTimeout(() => {
            this.toggleEHunterView(true);
        }, 300);
    }

    createEHunterContainer() {
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

    // some actions of eh will make some wired errors
    blockEhActions() {
        var elt = document.createElement('script');
        elt.innerHTML = `
            console._clear = console.clear;
            console.clear = function () {}
        `;
        document.body.appendChild(elt);
    }

    // add ehunter switch etc.
    async init() {
        if (this.isAlbumViewPage()) {
            this.createEhunterSwitch();
            if (await core.SettingService.getEHunterStatus()) {
                this.toggleEHunterView(true);
            }
        }
    }

    toggleEHunterView(val) {
        if (document.getElementsByClassName('vue-container').length > 0) {
            this.showEHunterView(val);
        } else {
            this.initEHunter();
        }
    }

    showEHunterView(val) {
        document.body.style.overflow = val ? 'hidden' : '';
        document.getElementsByClassName('vue-container')[0].style.top = val ? '0' : '-100%';
    }

    initEHunter() {
        this.blockEhActions();
        this.createEHunterContainer();
        core.createAppView('vue-container', '#app',
            core.launcher
            .setAlbumService(AlbumService)
            .setEHunterService({
                showEHunterView: this.showEHunterView
            })
            .setConfig(config)
            .instance());
    }

}
