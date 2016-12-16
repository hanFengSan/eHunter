import Vue from 'vue'
import Vuex from 'vuex'
import String from './modules/String'
import RankList from './modules/RankList'
import Popup from './modules/Popup'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
  	String,
  	RankList,
  	Popup
  },
  strict: debug
})