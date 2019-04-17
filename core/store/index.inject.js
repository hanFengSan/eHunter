import Vue from 'vue'
import Vuex from 'vuex'
import String from './modules/String'
import AlbumView from './modules/AlbumView'
import Modal from './modules/Modal'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    modules: {
        String,
        AlbumView,
        Modal
    },
    strict: debug
})
