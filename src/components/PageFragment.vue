<template>
	<div class="page">	
		<div class="container">
			<state-clock class="state-clock"></state-clock>
			<sales-table class="daily-table"></sales-table>
		</div>
	</div>

</template>

<script>
	import StateClock from './widget/StateClock.vue'
	import SalesTable from './widget/SalesTable.vue'

	export default {

		name: 'PageFragment',

		data () {
			return {

			};
		},

		components: { StateClock, SalesTable }
	};
</script>

<style lang="scss" scoped>
	@import "~style/_responsive";
	@import "~style/_variables";

	.page {
		background: $background_grey;
		padding-bottom: cr($target: 10px);
		>.container {
			background: white;
			@include responsive($breakpoint-xs) {
				padding: 0;
			} 
			box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);
			>.state-clock {
				margin: 0 cr($target: 9px);
				padding-top: cr($target: 20px);
			}
			.daily-table {
				margin: cr($target: 20px) 0;
			}
		}
	}
</style>