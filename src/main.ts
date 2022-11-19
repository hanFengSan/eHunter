import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import TestApp from '../core/TestApp.vue'
import { TestAlbumService } from './platform/test/AlbumService'
import { NameAlbumService } from '../core/service/AlbumService'
import type { AlbumService } from '../core/service/AlbumService'
// import './assets/main.css'

const app = createApp(TestApp)

const testAlbumService: AlbumService = new TestAlbumService('')

app.provide(NameAlbumService, testAlbumService)


app.mount('#app')

// import EHPlatform from './platform/eh'
// import NHPlatform from './platform/nh'

// switch (window.location.host) {
//     case 'exhentai.org':
//     case 'e-hentai.org':
//         new EHPlatform().init();
//     break;
//     case 'nhentai.net':
//         new NHPlatform().init();
// }
