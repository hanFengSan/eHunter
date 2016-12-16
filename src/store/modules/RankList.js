import string from 'assets/value/string-cn.json'
import * as types from '../mutation-types'

// initial state
const state = {
	rankList: [
	{
		name: string.oricon_daily_rank,
		sName: string.daily_rank,
		sub: [
		{
			name: string.general,
			list: [
			{ name: string.general_bd, id: 0 },
			{ name: string.general_dvd, id: 0 },
			{ name: string.single, id: 0 },
			{ name: string.album, id: 0 }
			]
		},
		{
			name: string.bd_detail,
			list: [
			{ name: string.anime_bd, id: 0 },
			{ name: string.movie_bd, id: 0 },
			{ name: string.music_bd, id: 0 },
			]
		},
		{
			name: string.dvd_detail,
			list: [
			{ name: string.anime_dvd, id: 0 },
			{ name: string.movie_dvd, id: 0 },
			{ name: string.music_dvd, id: 0 },
			]
		}]
	},
	{
		name: string.oricon_weekly_rank,
		sName: string.weekly_rank,
		sub: [
		{
			name: string.general,
			list:[
			{ name: string.general_bd, id: 0 },
			{ name: string.general_dvd, id: 0 },
			{ name: string.single, id: 0 },
			{ name: string.album, id: 0 }
			]
		},
		{
			name: string.bd_detail,
			list: [
			{ name: string.anime_bd, id: 0 },
			{ name: string.movie_bd, id: 0 },
			{ name: string.music_bd, id: 0 },
			{ name: string.tv_bd, id: 0 },
			]
		},
		{
			name: string.dvd_detail,
			list:[
			{ name: string.anime_dvd, id: 0 },
			{ name: string.music_dvd, id: 0 },
			]
		}
		]
	}
	],
	curRank: 0, // 周榜还是日榜
	curSubRank: 0, // 榜单小分类
	curTab: 0, // 榜单小分类下的第几个
}

// getters
const getters = {
	getRankList: state => state.rankList,
	getCurRank: state => state.curRank,
	getCurSubRank: state => state.curSubRank,
	getCurTab: state => state.curTab
}

// actions
const actions = {
	setString ({ commit }, rankList) {
		commit(types.SET_RANK_LIST, rankList);
	},
	setCurRank ({ commit, state }, num) {
		commit(types.SET_CUR_RANK, { num });
	},
	setCurSubRank ({ commit }, num) {
		commit(types.SET_CUR_SUB_RANK, { num });
	},
	setCurTab ({ commit }, num) {
		commit(types.SET_CUR_TAB, { num });
	},
}

// mutations
const mutations = {
	[types.SET_STRING] (state, { list }) {

	},
	[types.SET_CUR_RANK] (state, { num }) {
		state.curRank = num;
		// 重置子项
		state.curSubRank = state.curTab = 0;
	},
	[types.SET_CUR_SUB_RANK] (state, { num }) {
		state.curSubRank = num;
		// 重置子项
		state.curTab = 0;
	},
	[types.SET_CUR_TAB] (state, { num }) {
		state.curTab = num;
	},

}

export default {
	state,
	getters,
	actions,
	mutations
}