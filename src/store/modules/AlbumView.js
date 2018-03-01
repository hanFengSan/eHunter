// import string from 'assets/value/string-cn.json'
import * as types from '../mutation-types'
import Logger from '../../utils/Logger'

// initial state
const state = {
    curIndex: 0,
    readingMode: 1, // 0: scroll mode, 1: book mode
    volumeSize: 10,
    volumePreloadCount: 2, // the preload count of page of next volume
    thumb: {
        width: 150, // px
        thumbView: true
    },
    album: {
        width: 80, // percent, the scale of img
        toggleSyncScroll: true,
        showTopBar: true,
        loadNum: 3 // the sum of pages per loading
    },
    book: {
        screenSize: 2,
        showBookScreenAnimation: false,
        direction: 0 // 0: RTL, 1: LTR
    }
}

// getters
const getters = {
    curIndex: state => state.curIndex,
    albumWidth: state => state.album.width,
    thumbWidth: state => state.thumb.width,
    showThumbView: state => state.thumb.thumbView,
    toggleSyncScroll: state => state.album.toggleSyncScroll,
    showTopBar: state => state.album.showTopBar,
    loadNum: state => state.album.loadNum,
    volumeSize: state => state.volumeSize,
    curVolume: state => {
        let remainder = state.curIndex % state.volumeSize;
        return (state.curIndex - remainder) / state.volumeSize;
    },
    volFirstIndex: state => getters.curVolume(state) * state.volumeSize,
    volumePreloadCount: state => state.volumePreloadCount,
    bookScreenSize: state => state.book.screenSize,
    bookIndex: state => (state.curIndex - state.curIndex % state.book.screenSize) / state.book.screenSize,
    bookLoadNum: state => Math.ceil(state.album.loadNum / state.book.screenSize),
    readingMode: state => state.readingMode,
    showBookScreenAnimation: state => state.book.showBookScreenAnimation,
    bookDirection: state => state.book.direction
}

// actions
const actions = {
    setIndex: ({ commit }, index) => commit(types.SET_INDEX, { index }),
    setAlbumWidth: ({ commit }, width) => commit(types.SET_ALBUM_WIDTH, { width }),
    toggleThumbView: ({ commit }, show) => commit(types.TOGGLE_THUMB_VIEW, { show }),
    toggleSyncScroll: ({ commit }, isActive) => commit(types.TOGGLE_SYNC_SCROLL, { isActive }),
    toggleTopBar: ({ commit }, show) => commit(types.TOGGLE_SHOW_TOP_BAR, { show }),
    setLoadNum: ({ commit }, num) => commit(types.SET_LOAD_NUM, { num }),
    setVolumeSize: ({ commit }, num) => commit(types.SET_VOLUME_SIZE, { num }),
    setBookIndex: ({ commit }, index) => commit(types.SET_BOOK_INDEX, { index }),
    setReadingMode: ({ commit }, mode) => commit(types.SET_READING_MODE, { mode }),
    setBookScreenAnimation: ({ commit }, show) => commit(types.SET_BOOK_SCREEN_ANIMATION, { show }),
    setBookDirection: ({ commit }, mode) => commit(types.SET_BOOK_DIRECTION, { mode }),
    setBookScreenSize: ({ commit }, num) => commit(types.SET_BOOK_SCREEN_SIZE, { num })
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
    },
    [types.SET_VOLUME_SIZE](state, { num }) {
        state.volumeSize = num;
        state.curIndex = 0;
    },
    [types.SET_BOOK_INDEX](state, { index }) {
        state.curIndex = index * state.book.screenSize;
    },
    [types.SET_READING_MODE](state, { mode }) {
        state.readingMode = mode;
        Logger.logText('VUEX', mode);
    },
    [types.SET_BOOK_SCREEN_ANIMATION](state, { show }) {
        state.book.showBookScreenAnimation = show;
    },
    [types.SET_BOOK_DIRECTION](state, { mode }) {
        state.book.direction = mode;
    },
    [types.SET_BOOK_SCREEN_SIZE](state, { num }) {
        state.book.screenSize = num;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
