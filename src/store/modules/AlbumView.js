// import string from 'assets/value/string-cn.json'
import * as types from '../mutation-types'

// initial state
const state = {
    curIndex: 0,
    thumb: {
        width: 150, // px
        thumbView: true
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
    showPagination: state => state.album.pagination,
    thumbView: state => state.thumb.thumbView
}

// actions
const actions = {
    setIndex: ({ commit }, index) => setIndex(commit, index),
    setAlbumWidth: ({ commit }, width) => commit(types.SET_ALBUM_WIDTH, { width }),
    showPagination: ({ commit }, show) => {
        commit(types.SHOW_PAGINATION, { show })
    },
    toggleThumbView: ({ commit }, show) => {
        commit(types.TOGGLE_THUMB_VIEW, { show })
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
        state.album.pagination = show;
    },
    [types.TOGGLE_THUMB_VIEW](state, { show }) {
        state.thumb.thumbView = show;
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
