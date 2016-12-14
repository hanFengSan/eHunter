<template>
	<div class="state-clock">	
		<div class="update">
			<img src="../../assets/update.png" class="update-img">
			<span class="label">{{ string.next_update }}</span>
			<span class="clock">{{ time }}</span>
		</div>
		<div class="date">
			<img src="../../assets/date.png" class="date-img">
			<span class="label">{{ dateLabel }}</span>
			<span class="date-set">{{ date + string.set }}</span>
		</div>
		<div class="intro">
			<div>{{ string.rank_intro }}</div>
			<div>{{ string.set_intro }}</div>
		</div>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'

	export default {

		name: 'StateClock',

		data () {
			return {
				time: '20:13:22',
				dateLabel: '动画BD日榜',
				date: '2016-11-12'
			};
		},
		computed: {
			...mapGetters({
				string: 'getString',
			})
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
		}
	}

</style>