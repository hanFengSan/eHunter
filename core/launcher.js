import app from './app.vue'

let service = {}
let config = {}
let disableLoading = false;

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
    disableLoading(disable) {
        disableLoading = disable;
        return this;
    },
    instance() {
        return {
            components: { app },
            provide: {
                service,
                config,
                disableLoading
            },
            data() {
                return {}
            },
            template: '<app></app>'
        }
    }
}
