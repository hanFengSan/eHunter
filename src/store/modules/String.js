import stringCN from '../../assets/value/string-cn.json'
import stringEN from '../../assets/value/string-en.json'
import * as types from '../mutation-types'

// initial state
const state = {
    string: stringCN
}

// getters
const getters = {
    getString: state => {
        return state.string
    }
}

// actions
const actions = {
    setString({
        commit
    }, lang) {
        commit(types.SET_STRING, lang)
    }
}

// mutations
const mutations = {
    [types.SET_STRING](state, {
        lang
    }) {
        /* eslint-disable indent */
        switch (lang) {
            case 'cn':
                state.string = stringCN
                break
            case 'en':
                state.string = stringEN
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
