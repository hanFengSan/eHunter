/* eslint-disable no-unused-vars,no-undef,indent */
import core from '../../../core/index'
import { AlbumServiceImpl } from './service/AlbumServiceImpl'
import config from '../../config'
import { BasePlatform } from '../base'

export default class EHPlatform extends BasePlatform {
    isAlbumViewPage() {
        return document.location.pathname.includes('/s/');
    }

    // some actions of eh will make some wired errors
    blockHostActions() {
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

    initEHunter() {
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
