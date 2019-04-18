import app from './App.vue'

let service = {}
let config = {}

export default {
    setAlbumService(obj) {
        service.album = obj;
        return this;
    },
    setEHunterService(obj) {
        service.eHunter = obj;
        return this;
    },
    setConfig(obj) {
        config = obj;
        return this;
    },
    instance() {
        return {
            components: { app },
            provide: {
                service,
                config
            },
            data() {
                return {}
            },
            template: '<app></app>'
        }
    }
}
