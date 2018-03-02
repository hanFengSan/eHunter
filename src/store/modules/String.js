import StringService from '../../service/StringService'
import * as types from '../mutation-types'
import * as tags from '../../service/tags'
// import Logger from '../../utils/Logger'

// initial state
const state = {
    string: StringService.en
}

// getters
const getters = {
    string: state => {
        return state.string
    }
}

// actions
const actions = {
    setString({ commit }, langCode) {
        // Logger.logText('String', lang);
        commit(types.SET_STRING, { langCode })
    }
}

// mutations
const mutations = {
    [types.SET_STRING](state, { langCode }) {
        /* eslint-disable indent */
        switch (langCode) {
            case tags.LANG_CN:
                state.string = StringService.cn;
                break;
            case tags.LANG_EN:
                state.string = StringService.en;
                break;
            case tags.LANG_JP:
                state.string = StringService.jp;
                break;
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
