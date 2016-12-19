import string from 'assets/value/string-cn.json'
import * as types from '../mutation-types'
import { getWeeklyRankByFlag, getDailyRankByFlag } from 'src/service/ServerAPI'
import { initMusicDailyData, initNormalDailyData, initNormalWeeklyData } from 'src/service/SalesDataWrapper'
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
			{ name: string.general_bd, flag: '106', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.general_dvd, flag: '104', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.single, flag: '101', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.album, flag: '102', data: { list: [], updateTime: 0, nextUpdateTime: 0 }}
			]
		},
		{
			name: string.bd_detail,
			list: [
			{ name: string.anime_bd, flag: '106103', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.movie_bd, flag: '106101', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.music_bd, flag: '106102', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			]
		},
		{
			name: string.dvd_detail,
			list: [
			{ name: string.anime_dvd, flag: '106103', data: { list: [], updateTime: 0, nextUpdateTime: 0 }}, //lack
			{ name: string.movie_dvd, flag: '106101', data: { list: [], updateTime: 0, nextUpdateTime: 0 }}, //lack
			{ name: string.music_dvd, flag: '104102', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
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
			{ name: string.general_bd, flag: '116', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.general_dvd, flag: '114', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.single, flag: '111', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.album, flag: '11A', data: { list: [], updateTime: 0, nextUpdateTime: 0 }}
			]
		},
		{
			name: string.bd_detail,
			list: [
			{ name: string.anime_bd, flag: '116103', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.movie_bd, flag: '116101', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.music_bd, flag: '116102', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			{ name: string.tv_bd, flag: '116104', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
			]
		},
		{
			name: string.dvd_detail,
			list:[
			{ name: string.anime_dvd, flag: '114103', data: { list: [], updateTime: 0, nextUpdateTime: 0 }}, 
			{ name: string.music_dvd, flag: '114103', data: { list: [], updateTime: 0, nextUpdateTime: 0 }},
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
	getCurTab: state => state.curTab,
	getCurTabRankData: state => {
		return getCurTabRankData(state);
	},
	getCurTabRankDataList: state =>{
		return getCurTabRankData(state).data.list;
	},
	getCurRankData: state => {
		return state.rankList[state.curRank];
	},
	getCurSubRankData: state => {
		return state.rankList[state.curRank].sub[state.curSubRank];
	}
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
	updateTabRank({ commit, state }) {
		updateRankByFlag(state, commit, state.rankList[state.curRank].sub[state.curSubRank].list[state.curTab].flag);
	}
}

function updateRankByFlag(state, commit, flag) {
	let tab = findRankByFlag(state, flag);
	if (tab !== undefined) {
		if (tab.data.list.length === 0) {
			let getRankByFlag = findRankTypeByFlag(state, flag) === string.oricon_daily_rank ? getDailyRankByFlag : getWeeklyRankByFlag
			getRankByFlag(flag)
			.then(res => {
				let data = res.data;
				data.list = wrapSalesData(state, data.list);
				commit(types.UPDATE_RANK, { flag, data });
			})
			.catch(e => {
				console.log(e)
			})
		}
	}
}

// 装填修饰数据, 表格显示相关
function wrapSalesData(state, list) {
	switch(state.rankList[state.curRank].name) {
		case string.oricon_daily_rank:
		let tabName = getCurTabRankData(state).name;
		if (tabName === string.single || tabName === string.album) {
			return initMusicDailyData(list);
		} else {
			return initNormalDailyData(list);
		}
		break;
		case string.oricon_weekly_rank:
		return initNormalWeeklyData(list);
		break;
	}
}

function findRankByFlag(state, flag) {
	for (let rank of state.rankList) {  // 周榜/日榜
		for (let subRank of rank.sub) { // 榜单组
			for (let tab of subRank.list) { // 具体榜单
				if (tab.flag === flag) {
					return tab;
				}
			}
		}
	}
}

function findRankTypeByFlag(state, flag) {
	for (let rank of state.rankList) {  // 周榜/日榜
		for (let subRank of rank.sub) { // 榜单组
			for (let tab of subRank.list) { // 具体榜单
				if (tab.flag === flag) {
					return rank.name;
				}
			}
		}
	}
}

function getCurTabRankData(state) {
	return state.rankList[state.curRank].sub[state.curSubRank].list[state.curTab];
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
	[types.UPDATE_RANK] (state, { flag, data }) {
		let tab = findRankByFlag(state, flag);
		tab.data = data;
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}