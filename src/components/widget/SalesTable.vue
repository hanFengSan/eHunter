<template>
	<div class="table">
		<div class="header">
			<template v-for="item of data[0]" v-if="item.isActived">
				<span class="header-item" :style="'width:' + item.width + '%'">{{ item.name }}</span>
			</template>
		</div>
		<div class="row" v-for="(row, index) of data" @click="select(index)">
			<template v-for="item of row" v-if="item.isActived">
				<span class="row-item" v-if="item.key !== 'title'" :style="'width:' + item.width + '%'">{{ item.data }}</span>
				<div class="row-item title-wraper" v-if="item.key === 'title'" :style="'width:' + item.width + '%'">
					<span class="title">{{ item.data }}</span>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import Vue from 'vue'

	export default {

		name: 'DailyTable',

		data () {
			return {
				// data: [],
				tableSize: 4
			};
		},
		computed: {
			...mapGetters({
				string: 'getString',
				rankList: 'getRankList',
				curRank: 'getCurRank',
				curSubRank: 'getCurSubRank',
				curTab: 'getCurTab',
				curTabRankDataList: 'getCurTabRankDataList',
				curTabRankData: 'getCurTabRankData',
				curRankData: 'getCurRankData',
				data: 'getCurTabRankDataList'
			}),
			// data() {
			// 	// let result = this.initData(this.curTabRankDataList);
			// 	// this.calcWidth(result);
			// 	// return result;
			// }
		},
		created() {
			this.tableSize = this.getTableSize();
		},
		methods: {
			getDays(date) {
				let arr = date.split('/');
				let dateTime = new Date(`20${arr[0]}/${arr[1]}/${arr[2]}`);
				let timeDiff = Math.abs((new Date()).getTime() - dateTime.getTime());
				let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
				return diffDays + this.string.day;
			},
			select(index) {
				this.$root.$children[0].$emit('showItemInfo', this.data[index], ()=>{}, ()=>{})
			},
			// 装填修饰数据
			initData(list) {
				switch(this.curRankData.name) {
					case this.string.oricon_daily_rank:
					let tabName = this.curTabRankData.name;
					if (tabName === this.string.single || tabName === this.string.album) {
						return this.initMusicDailyData(list);
					} else {
						return this.initNormalDailyData(list);
					}
					break;
					case this.string.oricon_weekly_rank:
					return this.initNormalWeeklyData(list);
					break;
				}
			},
			// 装填一般向日榜数据
			// 配置概述: defaultWidth是初始默认的宽度百分比, width是实际渲染百分比, defaultWidth总和最好小于等于100, 等于100时就是实际效果, 小于100会触发平均剩余量分配算法.isActived为是否显示, 初始化时, 有几个isActive为true,将决定操作环境下最多能够显示几列, isPC()用于区别移动端和PC端, 移动端和PC端能看到的最大列数并不一样.priority为优先级, 计算width时, 将优先满足priority最小的.return的数组, 每一项为一个列的配置.
			initNormalDailyData(list) {
				return list.map(item => {
					// tableSize一定要等于初始值中isActived为true的个数
					return [
					{ 
						name: this.string.rank, 
						key: 'rank', 
						data: item.rank, 
						isActived: true, 
						defaultWidth: 12, 
						width: 0, 
						priority: 2 
					},
					{ 
						name: this.string.title, 
						key: 'title', 
						data: item.title, 
						isActived: true, 
						defaultWidth: 44, 
						width: 0, 
						priority: 1 
					},
					{ 
						name: this.string.artist, 
						key: 'artist', 
						data: item.artist, 
						isActived: true, 
						defaultWidth: 23, 
						width: 0, 
						priority: 4 
					},
					{ 
						name: this.string.releaseDate, 
						key: 'releaseDate', 
						data: this.getDays(item.releaseDate), 
						isActived: true, 
						defaultWidth: this.isPC() ? 10.5 : 21, 
						width: 0, priority: 3 
					},
					{ 
						name: this.string.publisher, 
						key: 'publisher', 
						data: item.publisher, 
						isActived: this.isPC(), 
						defaultWidth:  
						this.isPC() ? 10.5 : 21, 
						width: 0, 
						priority: 5 
					},
					]
				});
			},
			// 装填单曲/专辑的日榜数据
			initMusicDailyData(list) {
				return list.map(item => {
					// tableSize一定要等于初始值中isActived为true的个数
					return [
					{ 
						name: this.string.rank, 
						key: 'rank', 
						data: item.rank, 
						isActived: true, 
						defaultWidth: 12, 
						width: 0, 
						priority: 3 
					},
					{ 
						name: this.string.title, 
						key: 'title', 
						data: item.title, 
						isActived: true, 
						defaultWidth: this.isPC() ? 35 : 44, 
						width: 0, 
						priority: 1 
					},
					{ 
						name: this.string.sales, 
						key: 'sales', 
						data: item.sales === 0 ? '-' : item.sales, 
						isActived: true, 
						defaultWidth: 14, 
						width: 0, 
						priority: 2 
					},
					{ 
						name: this.string.artist, 
						key: 'artist', 
						data: item.artist, 
						isActived: this.isPC(), 
						defaultWidth: this.isPC() ? 18 : 23, 
						width: 0, 
						priority: 5 
					},
					{ 
						name: this.string.releaseDate, 
						key: 'releaseDate', 
						data: this.getDays(item.releaseDate), 
						isActived: true, 
						defaultWidth: this.isPC() ? 10.5 : 21, 
						width: 0, 
						priority: 4 
					},
					{ 
						name: this.string.publisher, 
						key: 'publisher', 
						data: item.publisher, 
						isActived: this.isPC(), 
						defaultWidth:  this.isPC() ? 10.5 : 21, 
						width: 0, 
						priority: 6 
					},
					]
				});
			},
			// 装填一般向周榜数据
			initNormalWeeklyData(list) {
				return list.map(item => {
					// tableSize一定要等于初始值中isActived为true的个数
					return [
					{ 
						name: this.string.rank_prerank, 
						key: 'rank_prerank', 
						data: `${item.rank} / ${item.preRank === -1 ? '-' : item.preRank}`, 
						isActived: true, 
						defaultWidth: this.isPC() ? 8 : 12, 
						width: 0, 
						priority: 3 
					},
					{ 
						name: this.string.title, 
						key: 'title', 
						data: item.title, 
						isActived: true, 
						defaultWidth: this.isPC() ? 30 : 44, 
						width: 0, 
						priority: 1 
					},
					{ 
						name: this.string.weekly_sales, 
						key: 'weekly_sales', 
						data: item.weeklySales, 
						isActived: true, 
						defaultWidth: this.isPC() ? 11 : 14, 
						width: 0, 
						priority: 2 
					},
					{ 
						name: this.string.sales, 
						key: 'sales', 
						data: item.sales, 
						isActived: true, 
						defaultWidth: this.isPC() ? 11 : 14, 
						width: 0, 
						priority: 2 
					},

					{ 
						name: this.string.artist, 
						key: 'artist', 
						data: item.artist, 
						isActived: this.isPC(), 
						defaultWidth: this.isPC() ? 13.5 : 23, 
						width: 0, 
						priority: 5 
					},
					{ 
						name: this.string.releaseDate, 
						key: 'releaseDate', 
						data: this.getDays(item.releaseDate), 
						isActived: this.isPC(), 
						defaultWidth: this.isPC() ? 8.5 : 14, 
						width: 0, 
						priority: 4 
					},
					{ 
						name: this.string.publisher, 
						key: 'publisher', 
						data: item.publisher, 
						isActived: this.isPC(), 
						defaultWidth:  this.isPC() ? 8.5 : 14, 
						width: 0, 
						priority: 6 
					},
					{ 
						name: this.string.top_times, 
						key: 'top_times', 
						data: `${item.topRank} / ${item.times}`, 
						isActived: this.isPC(), 
						defaultWidth:  this.isPC() ? 8.5 : 14, 
						width: 0, 
						priority: 6 
					}
					]
				});

			},
			getTableInfo(callback) {
				console.log('table')
				let info = {
					tableData: this.data,
					tableSize: this.tableSize
				}
				callback(info);
			},
			// 获取可显示的列数
			getTableSize() {
				return this.isPC() ? 8 : 4;
			},
			isPC() {
				if (screen.width <= 1024) {
					return false;
				} else {
					return true;
				}	
			},
			reloadTable(example) {
				// 重置显示项
				example.forEach(exampleItem => {
					this.data.forEach(row => {
						row.forEach(rowItem => {
							if (rowItem.key === exampleItem.key) 
								rowItem.isActived = exampleItem.isActived
						})
					})
				});
				// 重算大小
				this.calcWidth(this.data);
			},
			// 计算各row的width
			calcWidth(data) {
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
								row.find(i => i.key === item.key).width = item.defaultWidth;
								availableWidth -= item.defaultWidth;;
							} else {
								row.find(i => i.key === item.key).width = availableWidth;
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
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import "~style/_responsive";
	@import "~style/_variables";
	.table {
		>.header {
			position: relative;
			height: 3rem;
			color: white;
			background: $contrast_color;
			>.header-item {
				display: inline-block;
				line-height: 3rem;
				text-align: center;
				font-size: cr($target: 14px);
				overflow: hidden;
				text-overflow: ellipsis;
				padding: 0 1.5%;
				white-space: nowrap;
				float: left;
			}
		}
		>.row {
			position: relative;
			height: 3rem;
			color: black;
			background: white;
			&:nth-child(2n+1) {
				background: rgba($contrast_color, .1);
			}		
			&:hover {
				@include responsive($breakpoint-md) {
					background: rgba($contrast_color, .3);
				}
			}
			&:active {
				background: rgba($contrast_color, .3);
			}
			>.row-item {
				display: inline-block;
				line-height: 3rem;
				text-align: center;
				font-size: cr($target: 12px);
				float: left;
				overflow: hidden;
				text-overflow: ellipsis;
				padding: 0 1.5%;
				white-space: nowrap;
				&:nth-child(2n) {
					background: rgba($contrast_color, .1);
				}
				&.title-wraper {
					display: inline-block;
					height: 3rem;
					text-align: left;
					white-space: normal;
					>.title {
						display: inline-block;
						max-height: 2.2rem;
						vertical-align: middle;
						line-height: 1.1rem;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
			}

		}	
	}
</style>