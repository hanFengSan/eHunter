import Vue from 'vue'
import Vuex from 'vuex'
import String from './modules/String'
import RankList from './modules/RankList'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
  	String,
  	RankList
  },
  strict: debug
})