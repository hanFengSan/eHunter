<template>
	<div class="table">
		<div class="header">
			<span class="header-item rank">{{ string.rank }}</span>
			<span class="header-item title">{{ string.title }}</span>
			<span class="header-item artist">{{ string.artist }}</span>
			<span class="header-item date">{{ string.releaseDate }}</span>
		</div>
		<div class="body" v-for="item of data">
			<span class="body-item rank">{{ item.rank }}</span>
			<div class="body-item ellipsis title-wraper">
				<span class="title">{{ item.title }}</span>
			</div>
			<span class="body-item artist">{{ item.artist }}</span>
			<span class="body-item date">{{ getDays(item.releaseDate) + '天' }}</span>
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
				data: []
			};
		},
		computed: {
			...mapGetters({
				string: 'getString',
			})
		},
		created() {
			Vue.http.get('/sales/daily?flag=104102').then(res => {
				this.data = res.data.list
			}, res => {});
		},
		methods: {
			getDays(date) {
				let arr = date.split('/');
				let dateTime = new Date(`20${arr[0]}-${arr[1]}-${arr[2]}`);
				let timeDiff = Math.abs((new Date()).getTime() - dateTime.getTime());
				let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
				return diffDays;
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
				float: left;
				&.rank {
					width: 12%;
				}
				&.title {
					width: 44%;
					// text-align: left;
				}
				&.artist {
					width: 23%;
				}
				&.date {
					width: 21%;
				}
			}
		}
		>.body {
			position: relative;
			height: 3rem;
			color: black;
			background: white;
			&:nth-child(2n+1) {
				background: rgba($contrast_color, .1);
			}		
			// &:nth-child(2n+1) {
			// 	background: rgba($primary_color, .1);
			// }
			// &:nth-child(2n+1) {
			// 	background: rgba($background_grey, 1);
			// }
			>.body-item {
				display: inline-block;
				line-height: 3rem;
				text-align: center;
				font-size: cr($target: 12px);
				float: left;
				overflow: hidden;
				text-overflow: ellipsis;
				&:nth-child(2n) {
					background: rgba($contrast_color, .1);
				}
				&.rank {
					width: 12%;
				}
				&.title-wraper {
					width: 44%;
					display: inline-block;
					height: 3rem;
					text-align: left;
					padding: 0 1%;
					>.title {
						display: inline-block;
						// color: $primary_color;
						max-height: 2.2rem;
						vertical-align: middle;
						line-height: 1.1rem;
						overflow: hidden;
						text-overflow: ellipsis;
					}

				}
				&.artist {
					width: 23%;
					padding: 0 1%;
					white-space: nowrap;

				}
				&.date {
					width: 21%;
				}
			}

		}	
	}
</style>