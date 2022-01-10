import EHPlatform from './platform/eh'
import NHPlatform from './platform/nh'
import MHRPlatform from './platform/manhuaren'

switch (window.location.host) {
    case 'exhentai.org':
    case 'e-hentai.org':
        new EHPlatform().init();
        break;
    case 'nhentai.net':
        new NHPlatform().init();
        break
    case 'www.manhuaren.com':
        new MHRPlatform().init();
}
