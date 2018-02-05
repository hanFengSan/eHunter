// import string from 'assets/value/string-cn.json'
import * as types from '../mutation-types'
import Logger from '../../utils/Logger'

// initial state
const state = {
    curIndex: 0,
    volumeSize: 10,
    thumb: {
        width: 150, // px
        thumbView: true
    },
    album: {
        width: 80, // percent, the scale of img
        toggleSyncScroll: true,
        showTopBar: true,
        loadNum: 3 // the sum of pages per loading
    }
}

// getters
const getters = {
    curIndex: state => state.curIndex,
    albumWidth: state => state.album.width,
    thumbWidth: state => state.thumb.width,
    thumbView: state => state.thumb.thumbView,
    toggleSyncScroll: state => state.album.toggleSyncScroll,
    showTopBar: state => state.album.showTopBar,
    loadNum: state => state.album.loadNum,
    volumeSize: state => state.volumeSize,
    curVolume: state => {
        let remainder = state.curIndex % state.volumeSize;
        return (state.curIndex - remainder) / state.volumeSize;
    },
    volFirstIndex: state => getters.curVolume(state) * state.volumeSize
}

// actions
const actions = {
    setIndex: ({ commit }, index) => commit(types.SET_INDEX, { index }),
    setAlbumWidth: ({ commit }, width) => commit(types.SET_ALBUM_WIDTH, { width }),
    toggleThumbView: ({ commit }, show) => commit(types.TOGGLE_THUMB_VIEW, { show }),
    toggleSyncScroll: ({ commit }, isActive) =>
        commit(types.TOGGLE_SYNC_SCROLL, { isActive }),
    toggleTopBar: ({ commit }, show) =>
        commit(types.TOGGLE_SHOW_TOP_BAR, { show }),
    setLoadNum: ({ commit }, num) =>
        commit(types.SET_LOAD_NUM, { num })
}

// mutations
const mutations = {
    [types.SET_INDEX](state, { index }) {
        state.curIndex = index;
    },
    [types.SET_ALBUM_WIDTH](state, { width }) {
        state.album.width = width;
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
