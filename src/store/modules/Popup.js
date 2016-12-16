import string from 'assets/value/string-cn.json'
import * as types from '../mutation-types'

// initial state
const state = {
	// 各个组件的状态管理
	component: {
		selector: {
			show: false,
			data: [],
			callback: () => {},
			cancelCallback: () => {}
		},
		tablePicker: {
			show: false,
			data: [],
			size: 4,
			callback: () => {},
			cancelCallback: () => {}
		},
		itemInfo: {
			show: false,
			data: [],
			callback: () => {},
			cancelCallback: () => {}
		}
	}
}

// getters
const getters = {
	getSelector: state => state.component.selector,
	getTablePicker: state => state.component.tablePicker,
	getItemInfo: state => state.component.itemInfo,
	// 检测是否有开启的popup, 以启用遮罩
	hasMask: state => {
		let result = false;
		Reflect.ownKeys(state.component).forEach(key => {
			if (state.component[key].show) {
				result = true;
			}
		});
		return result;
	}
}

// actions
const actions = {
	showSelector({ commit }, { data, callback, cancelCallback }) {
		commit(types.SHOW_SELECTOR, { data, callback, cancelCallback });
	},
	showTablePicker({ commit },  { data, size, callback, cancelCallback }) {
		commit(types.SHOW_TABLE_PICKER, { data, size, callback, cancelCallback });
	},
	showItemInfo({ commit },  { data, callback, cancelCallback }) {
		commit(types.SHOW_ITEM_INFO, { data, callback, cancelCallback });
	},
	closePopups({ commit }) {
		commit(types.CLOSE_POPUPS);
	}
}

// mutations
const mutations = {
	[types.SHOW_SELECTOR](state, { data, callback=() => {}, cancelCallback=() => {}}) {
		state.component.selector.data = data;
		state.component.selector.callback = callback;
		state.component.selector.cancelCallback = cancelCallback;
		state.component.selector.show = true;
	},
	[types.SHOW_TABLE_PICKER](state, { data, size, callback=() => {}, cancelCallback=() => {} }) {
		state.component.tablePicker.data = data;
		state.component.tablePicker.callback = callback;
		state.component.tablePicker.size = size;
		state.component.tablePicker.cancelCallback = cancelCallback;
		state.component.tablePicker.show = true;
	},
	[types.SHOW_ITEM_INFO](state, { data, callback=() => {}, cancelCallback=() => {} }) {
		state.component.itemInfo.data = data;
		state.component.itemInfo.callback = callback
		state.component.itemInfo.cancelCallback = cancelCallback;
		state.component.itemInfo.show = true;
	},
	[types.CLOSE_POPUPS](state) {
		Reflect.ownKeys(state.component).forEach(key => {
			if (state.component[key].show) {
				state.component[key].show = false;
			}
		});
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}