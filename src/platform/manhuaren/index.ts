/* eslint-disable no-unused-vars,no-undef,indent */
import core from '../../../core'
import { AlbumServiceImpl } from './service/AlbumServiceImpl'
import config from '../../config'
import { BasePlatform } from '../base'

export default class MHRApp extends BasePlatform {
    isAlbumViewPage() {
        return document.querySelector(".readForm") != null;
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
        let newImgs = []
        let scripts = Array.prototype.slice.call(document.querySelectorAll("script"),0)
        let target
        for(let i in scripts){
            if(scripts[i].innerHTML.search("eval") == 0) target = scripts[i]
        }
        eval(target.innerHTML.replace("return p","p = p.replace('var ','');return p"))
        super.initEHunter();
        core.createAppView('vue-container', '#app',
            core.launcher
                .setAlbumService(new AlbumServiceImpl(document.documentElement.innerHTML,newImgs))
                .setEHunterService({
                    showEHunterView: this.showEHunterView
                })
                .setConfig(config)
                .instance());
    }

}
