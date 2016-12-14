import stringCN from '../../assets/value/string-cn.json'
import stringEN from '../../assets/value/string-en.json'
import * as types from '../mutation-types'

// initial state
const state = {
  string: stringCN
}

// getters
const getters = {
  getString: state => { return state.string }
}

// actions
const actions = {
  setString ({ commit }, lang) {
    commit(types.SET_STRING, lang)
  }
}

// mutations
const mutations = {
  [types.SET_STRING] (state, { lang }) {
    switch (lang) {
      case 'cn':
        state.string = stringCN
        // state.string.displayed_lang += '12'
        break
      case 'en':
        state.string = stringEN
        break
      case 'jp':
        state.string = stringJP
        break
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}