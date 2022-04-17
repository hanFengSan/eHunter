import EHPlatform from './platform/eh'
import NHPlatform from './platform/nh'

switch (window.location.host) {
    case 'exhentai.org':
    case 'e-hentai.org':
        new EHPlatform().init();
    break;
    case 'nhentai.net':
    case 'nhentai.to':
        new NHPlatform().init();
}
