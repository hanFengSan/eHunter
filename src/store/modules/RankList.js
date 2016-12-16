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
		list: [
		{ name: string.general_bd, id: 0 },
		{ name: string.general_dvd, id: 0 },
		{ name: string.single, id: 0 },
		{ name: string.album, id: 0 }
		],
		more: [
		{
			name: string.bd_detail,
			list:[
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
		}]
	}
	],
}

// getters
const getters = {
	getRankList: state => { return state.rankList }
}

// actions
const actions = {
	setString ({ commit }, rankList) {
		commit(types.SET_RANK_LIST, rankList)
	}
}

// mutations
const mutations = {
	[types.SET_STRING] (state, { lang }) {

	}
}

export default {
	state,
	getters,
	actions,
	mutations
}