// import string from 'assets/value/string-cn.json'
import * as types from '../mutation-types'

// initial state
const state = {
    curIndex: 0,
    thumb: {
        width: 150 // px
    },
    album: {
        width: 80, // percent
        pagination: true
    }
}

// getters
const getters = {
    curIndex: state => state.curIndex,
    albumWidth: state => state.album.width,
    thumbWidth: state => state.thumb.width,
    showPagination: state => state.album.pagination
}

// actions
const actions = {
    setIndex: ({ commit }, index) => setIndex(commit, index),
    setAlbumWidth: ({ commit }, width) => commit(types.SET_ALBUM_WIDTH, { width }),
    showPagination: ({ commit }, show) => {
        commit(types.SHOW_PAGINATION, { show })
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
    },
    [types.SHOW_PAGINATION](state, { show }) {
        console.log(show);
        state.album.pagination = show;
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
