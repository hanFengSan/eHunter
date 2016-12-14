import Vue from 'vue'
import Vuex from 'vuex'
import String from './modules/String'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
  	String
  },
  strict: debug
})