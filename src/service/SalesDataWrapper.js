import string from 'assets/value/string-cn.json'

function isPC() {
	if (screen.width <= 1024) {
		return false;
	} else {
		return true;
	}	
}

function getDays(date) {
	let arr = date.split('/');
	let dateTime = new Date(`20${arr[0]}/${arr[1]}/${arr[2]}`);
	let timeDiff = Math.abs((new Date()).getTime() - dateTime.getTime());
	let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return diffDays + string.day;
}

// 计算各row的width
export function calcWidth(data) {
	data.map(row => {
		let clonedRow = JSON.parse(JSON.stringify(row));
		clonedRow.sort((a, b) => {
			if (a.priority > b.priority)
				return 1;	
			if (a.priority < b.priority)
				return -1;		
			if (a.priority === b.priority)
				return 0;
		});
		let availableWidth = 100;
		// 按照优先级设定各个的width
		clonedRow.forEach(item => {
			if(item.isActived) {
				if(availableWidth >= item.defaultWidth) {
					row.filter(i => i.key === item.key)[0].width = item.defaultWidth;
					// row.find(i => i.key === item.key).width = item.defaultWidth; // need babel-polyfill
					availableWidth -= item.defaultWidth;;
				} else {
					row.filter(i => i.key === item.key)[0].width = availableWidth;
					// row.find(i => i.key === item.key).width = availableWidth;
					availableWidth = 0;
				}	
			}
		});
		// 将多余的width平均分配
		if (availableWidth > 0) {
			let size = clonedRow.filter(i => i.isActived).length; 
			let average = availableWidth / size;
			row.filter(i => i.isActived).forEach(item => item.width += average);
		}

	});
	return data;
}

// 重新计算所有宽度 !!效率非常低下
export function calcRankListWidth(rankList) {
	// let cloneRankList = JSON.parse(JSON.stringify(rankList));
	rankList.forEach(rank => {
		rank.sub.forEach(subRank => {
			subRank.list.forEach(tab => {
				tab.data.list = calcWidth(tab.data.list);
			})
		})
	});
}

export function getTableSize() {
	return isPC() ? 8 : 4;
}

// 装填一般向日榜数据
// 配置概述: defaultWidth是初始默认的宽度百分比, width是实际渲染百分比, defaultWidth总和最好小于等于100, 等于100时就是实际效果, 小于100会触发平均剩余量分配算法.isActived为是否显示, 初始化时, 有几个isActive为true,将决定操作环境下最多能够显示几列, isPC()用于区别移动端和PC端, 移动端和PC端能看到的最大列数并不一样.priority为优先级, 计算width时, 将优先满足priority最小的.return的数组, 每一项为一个列的配置.
export function initNormalDailyData(list) {
	return calcWidth(list.map(item => {
					// tableSize一定要等于初始值中isActived为true的个数
					return [
					{ 
						name: string.rank, 
						key: 'rank', 
						data: item.rank, 
						isActived: true, 
						defaultWidth: 12, 
						width: 0, 
						priority: 2 
					},
					{ 
						name: string.title, 
						key: 'title', 
						data: item.title, 
						isActived: true, 
						defaultWidth: 44, 
						width: 0, 
						priority: 1 
					},
					{ 
						name: string.artist, 
						key: 'artist', 
						data: item.artist, 
						isActived: true, 
						defaultWidth: 23, 
						width: 0, 
						priority: 4 
					},
					{ 
						name: string.releaseDate, 
						key: 'releaseDate', 
						data: getDays(item.releaseDate), 
						isActived: true, 
						defaultWidth: isPC() ? 10.5 : 21, 
						width: 0, priority: 3 
					},
					{ 
						name: string.publisher, 
						key: 'publisher', 
						data: item.publisher, 
						isActived: isPC(), 
						defaultWidth: isPC() ? 10.5 : 21, 
						width: 0, 
						priority: 5 
					},
					]
				}));
}
// 装填单曲/专辑的日榜数据
export function initMusicDailyData(list) {
	return calcWidth(list.map(item => {
					// tableSize一定要等于初始值中isActived为true的个数
					return [
					{ 
						name: string.rank, 
						key: 'rank', 
						data: item.rank, 
						isActived: true, 
						defaultWidth: 12, 
						width: 0, 
						priority: 3 
					},
					{ 
						name: string.title, 
						key: 'title', 
						data: item.title, 
						isActived: true, 
						defaultWidth: isPC() ? 35 : 44, 
						width: 0, 
						priority: 1 
					},
					{ 
						name: string.sales, 
						key: 'sales', 
						data: item.sales === 0 ? '-' : item.sales, 
						isActived: true, 
						defaultWidth: 14, 
						width: 0, 
						priority: 2 
					},
					{ 
						name: string.artist, 
						key: 'artist', 
						data: item.artist, 
						isActived: isPC(), 
						defaultWidth: isPC() ? 18 : 23, 
						width: 0, 
						priority: 5 
					},
					{ 
						name: string.releaseDate, 
						key: 'releaseDate', 
						data: getDays(item.releaseDate), 
						isActived: true, 
						defaultWidth: isPC() ? 10.5 : 21, 
						width: 0, 
						priority: 4 
					},
					{ 
						name: string.publisher, 
						key: 'publisher', 
						data: item.publisher, 
						isActived: isPC(), 
						defaultWidth:  isPC() ? 10.5 : 21, 
						width: 0, 
						priority: 6 
					},
					]
				}));
}
// 装填一般向周榜数据
export function initNormalWeeklyData(list) {
	return calcWidth(list.map(item => {
					// tableSize一定要等于初始值中isActived为true的个数
					return [
					{ 
						name: string.rank_prerank, 
						key: 'rank_prerank', 
						data: `${item.rank} / ${item.preRank === -1 ? '-' : item.preRank}`, 
						isActived: true, 
						defaultWidth: isPC() ? 8 : 12, 
						width: 0, 
						priority: 3 
					},
					{ 
						name: string.title, 
						key: 'title', 
						data: item.title, 
						isActived: true, 
						defaultWidth: isPC() ? 30 : 44, 
						width: 0, 
						priority: 1 
					},
					{ 
						name: string.weekly_sales, 
						key: 'weekly_sales', 
						data: item.weeklySales, 
						isActived: true, 
						defaultWidth: isPC() ? 11 : 14, 
						width: 0, 
						priority: 2 
					},
					{ 
						name: string.sales, 
						key: 'sales', 
						data: item.sales, 
						isActived: true, 
						defaultWidth: isPC() ? 11 : 14, 
						width: 0, 
						priority: 2 
					},

					{ 
						name: string.artist, 
						key: 'artist', 
						data: item.artist, 
						isActived: isPC(), 
						defaultWidth: isPC() ? 13.5 : 23, 
						width: 0, 
						priority: 5 
					},
					{ 
						name: string.releaseDate, 
						key: 'releaseDate', 
						data: getDays(item.releaseDate), 
						isActived: isPC(), 
						defaultWidth: isPC() ? 8.5 : 14, 
						width: 0, 
						priority: 4 
					},
					{ 
						name: string.publisher, 
						key: 'publisher', 
						data: item.publisher, 
						isActived: isPC(), 
						defaultWidth:  isPC() ? 8.5 : 14, 
						width: 0, 
						priority: 6 
					},
					{ 
						name: string.top_times, 
						key: 'top_times', 
						data: `${item.topRank} / ${item.times}`, 
						isActived: isPC(), 
						defaultWidth:  isPC() ? 8.5 : 14, 
						width: 0, 
						priority: 6 
					}
					]
				}));

}



