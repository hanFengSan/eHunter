import core from '../../../core'

export abstract class BasePlatform {
    abstract isAlbumViewPage(): boolean;

    // add ehunter switch etc.
    async init(): Promise<void> {
        if (this.isAlbumViewPage()) {
            this.createEhunterSwitch();
            if (await core.SettingService.getEHunterStatus()) {
                this.toggleEHunterView(true);
            }
        }
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
        var element = <HTMLElement>document.querySelector('#switch');
        if (element) {
            element.style.top = '-50px';
            window.setTimeout(() => {
                if (element) {
                    element.style.top = '-150px';
                }
            }, 2000);
            core.SettingService.toggleEHunter(true);
            window.setTimeout(() => {
                this.toggleEHunterView(true);
            }, 300);
        }
    }

    createEHunterContainer() {
        document.body.style.overflow = 'hidden';
        let element = <HTMLElement>document.createElement('div');
        element.style.position = 'fixed';
        element.style.height = '100%';
        element.style.width = '100%';
        element.style.transition = 'all 1s ease';
        element.style.background = '#333333';
        element.style.zIndex = '10';
        element.style.top = '-100%';
        element.style.left = '0px';
        element.classList.add('vue-container');
        let i1 = document.getElementById('i1');

        let vue = document.createElement('div');
        vue.setAttribute('id', 'app');
        element.appendChild(vue);

        document.body.insertBefore(element, i1);

        setTimeout(() => {
            element.style.top = '0';
        }, 0);
    }

    toggleEHunterView(open: boolean): void {
        if (document.getElementsByClassName('vue-container').length > 0) {
            this.showEHunterView(open);
        } else {
            this.initEHunter();
        }
    }

    showEHunterView(show: boolean): void {
        document.body.style.overflow = show ? 'hidden' : '';
        (<HTMLElement>document.getElementsByClassName('vue-container')[0]).style.top = show ? '0' : '-100%';
    }

    blockHostActions(): void { }

    initEHunter(): void {
        this.blockHostActions();
        this.createEHunterContainer();
    }
}
