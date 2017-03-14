// import string from 'assets/value/string-cn.json'
import * as types from '../mutation-types'

// initial state
const state = {
    curIndex: 0,
    thumb: { },
    album: { width: 80 }
}

// getters
const getters = {
    curIndex: state => state.curIndex,
    albumWidth: state => state.album.width
}

// actions
const actions = {
    setIndex: ({ commit }, index) => setIndex(commit, index),
    setAlbumWidth: ({ commit }, width) => {
        console.log('vuex get');
        commit(types.SET_ALBUM_WIDTH, { width })
    }
}

// mutations
const mutations = {
    [types.SET_INDEX](state, { index }) {
        state.curIndex = index;
        console.log(`toIndex: ${index}`);
    },
    [types.SET_ALBUM_WIDTH](state, { width }) {
        state.album.width = width;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}

function setIndex(commit, index) {
    commit(types.SET_INDEX, { index });
}
