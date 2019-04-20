/* eslint-disable no-unused-vars,no-undef,indent */
import core from '../../../core'
import { AlbumServiceImpl } from './service/AlbumServiceImpl'
import config from '../../config'
import { BasePlatform } from '../base'

export default class NHApp extends BasePlatform {
    isAlbumViewPage() {
        return window.location.pathname.split('/').length === 5;
    }

    blockHostActions(): void {
        var elt = document.createElement('script');
        elt.innerHTML = `
            console._clear = console.clear;
            console.clear = function () {}
        `;
        document.body.appendChild(elt);
    }

    initEHunter(): void {
        super.initEHunter();
        core.createAppView('vue-container', '#app',
            core.launcher
                .setAlbumService(new AlbumServiceImpl(document.documentElement.innerHTML))
                .setEHunterService({
                    showEHunterView: this.showEHunterView
                })
                .setConfig(config)
                .instance());
    }

}
