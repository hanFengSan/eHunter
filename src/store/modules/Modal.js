// import StringService from '../../service/StringService'
import * as types from '../mutation-types'
// import * as tags from '../../service/tags'
// import Logger from '../../utils/Logger'

// initial state
const state = {
    dialogs: []
}

// getters
const getters = {
    dialogs: state => state.dialogs
}

// actions
const actions = {
    addDialog: ({ commit }, dialogBean) => commit(types.ADD_DIALOG, { dialogBean }),
    removeDialog: ({ commit }, dialogBean) => commit(types.REMOVE_DIALOG, { dialogBean })
}

// mutations
const mutations = {
    [types.ADD_DIALOG](state, { dialogBean }) {
        state.dialogs.push(dialogBean);
    },
    [types.REMOVE_DIALOG](state, { dialogBean }) {
        state.dialogs.splice(state.dialogs.indexOf(dialogBean), 1);
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
