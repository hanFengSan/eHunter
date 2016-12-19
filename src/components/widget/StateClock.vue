<template>
	<div class="state-clock">	
		<div class="update">
			<img src="../../assets/update.png" class="update-img">
			<span class="label">{{ string.next_update }}</span>
			<span class="clock">{{ time }}</span>
		</div>
		<div class="date">
			<img src="../../assets/date.png" class="date-img">
			<span class="label">{{ curTabRankData.name +' ' + curRankData.sName }}</span>
			<span class="date-set">{{ date + string.set }}</span>
		</div>
		<div class="intro">
			<div>{{ string.rank_intro }}</div>
			<div>{{ string.set_intro }}</div>
			<div class="error">{{ error }}</div>
		</div>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'

	export default {

		name: 'StateClock',

		data () {
			return {
				time: '00:00:00',
				timerId: 0
			};
		},
		created() {
			this.timerId = setInterval(() => {
				let date = new Date();
				let remainder = this.curTabRankData.data.nextUpdateTime - date.getTime();
				let ms = remainder % 1000;
				remainder = (remainder - ms) / 1000;
				let secs = remainder % 60;
				remainder = (remainder - secs) / 60;
				let mins = remainder % 60;
				remainder = (remainder - mins) / 60;
				let hrs = remainder % 24;
				let days = (remainder - hrs) / 24;
				this.time = `${days === 0 ? '' : days + '天'} ${this.paddy(hrs, 2)}:${this.paddy(mins, 2)}:${this.paddy(secs, 2)}`;
			}, 1000);
		},
		destroyed() {
			clearInterval(this.timerId);
		},
		methods: {
			paddy(n, p, c) {
				let pad_char = typeof c !== 'undefined' ? c : '0';
				let pad = new Array(1 + p).join(pad_char);
				return (pad + n).slice(-pad.length);
			}
		},
		computed: {
			...mapGetters({
				string: 'getString',
				curRankData: 'getCurRankData',
				curTabRankData: 'getCurTabRankData',
				error: 'getError'
			}),
			date() {
				let date = new Date(this.curTabRankData.data.updateTime);
				return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import "~style/_responsive";
	@import "~style/_variables";

	.state-clock {
		>.update {
			font-size: cr($target: 10px);
			color: $primary-color;
			vertical-align: middle;
			>.update-img {
				height: cr($target: 10px);
				vertical-align: middle;
			}
			>.label {
				vertical-align: middle;
			}
			>.clock {
				vertical-align: middle;
			}
		}
		>.date {
			color: $primary-color;
			font-weight: bolder;
			padding: cr($target: 5px) 0;
			>.date-img {
				height: cr($target: 16px);
				vertical-align: middle;
			}
			>.label {
				font-size: cr($target: 18px);

				vertical-align: middle;
			}
			>.date-set {
				font-size: cr($target: 18px);

				vertical-align: middle;
			}
		}
		>.intro {
			font-size: cr($target: 12px);
			opacity: .55;
			.error {
				color: red;
			}
		}
	}

</style>