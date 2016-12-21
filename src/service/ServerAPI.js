import Vue from 'vue'

export function getDailyRankByFlag(flag) {
	const url = `/sales/daily?flag=${flag}&time=${(new Date()).getTime()}`
	return Vue.http.get(url)
}

export function getWeeklyRankByFlag(flag) {
	const url = `/sales/weekly?flag=${flag}&time=${(new Date()).getTime()}`
	return Vue.http.get(url)
}