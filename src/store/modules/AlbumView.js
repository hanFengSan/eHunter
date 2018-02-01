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
        pagination: true,
        toggleSyncScroll: true,
        showTopBar: true,
        loadNum: 3
    }
}

// getters
const getters = {
    curIndex: state => state.curIndex,
    albumWidth: state => state.album.width,
    thumbWidth: state => state.thumb.width,
    showPagination: state => state.album.pagination,
    thumbView: state => state.thumb.thumbView,
    toggleSyncScroll: state => state.album.toggleSyncScroll,
    showTopBar: state => state.album.showTopBar,
    loadNum: state => state.album.loadNum
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
    },
    toggleSyncScroll: ({ commit }, isActive) => {
        commit(types.TOGGLE_SYNC_SCROLL, { isActive })
    },
    toggleTopBar: ({ commit }, show) => {
        commit(types.TOGGLE_SHOW_TOP_BAR, { show })
    },
    setLoadNum: ({ commit }, num) => {
        commit(types.SET_LOAD_NUM, { num })
    }
}

// mutations
const mutations = {
    [types.SET_INDEX](state, { index }) {
        state.curIndex = index;
    },
    [types.SET_ALBUM_WIDTH](state, { width }) {
        state.album.width = width;
    },
    [types.SHOW_PAGINATION](state, { show }) {
        state.album.pagination = show;
    },
    [types.TOGGLE_THUMB_VIEW](state, { show }) {
        state.thumb.thumbView = show;
    },
    [types.TOGGLE_SYNC_SCROLL](state, { isActive }) {
        state.album.toggleSyncScroll = isActive;
    },
    [types.TOGGLE_SHOW_TOP_BAR](state, { show }) {
        state.album.showTopBar = show;
    },
    [types.SET_LOAD_NUM](state, { num }) {
        state.album.loadNum = num;
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
