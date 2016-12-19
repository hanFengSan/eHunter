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
				data: 'getCurTabRankDataList',
				tableSize: 'getTableSize'
			}),
		},
		created() {
		},
		methods: {
			...mapActions({
				showItemInfo: 'showItemInfo'
			}),
			select(index) {
				this.showItemInfo({
					data: this.curTabRankDataList[index], 
					callback: ()=>{}, 
					cancelCallback: ()=>{}
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