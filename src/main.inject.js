import EHApp from './app.eh.js'
import NHApp from './app.nh.js'

switch (window.location.host) {
    case 'exhentai.org':
    case 'e-hentai.org':
        new EHApp().init();
    break;
    case 'nhentai.net':
        new NHApp().init();
}
