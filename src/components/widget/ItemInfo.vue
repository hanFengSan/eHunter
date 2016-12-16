<template>
	<popup :cancel-callback="data.cancelCallback">
		<div class="container">
			<div class="content" @click.stop="">
				<div class="item" v-for="(item, index) of data.data">
					<span class="name">{{ item.name + ':' }}</span>
					<span class="value">{{ item.data }}</span>
				</div>
			</div>
		</div>
	</popup>
</template>

<script>
	import Popup from '../base/Popup.vue'
	import { mapActions } from 'vuex'

	export default {

		name: 'ItemInfo',

		props: ['data'],

		components: { Popup },

		data () {
			return {

			};
		},

		created() {
		},

		methods: {
			...mapActions({
				closePopups: 'closePopups'
			}),
			close() {
				this.closePopups();
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import "~style/_responsive";
	@import "~style/_variables";

	.content {
		width: 80%;
		margin: 0 auto;
		background: white;
		@include responsive($breakpoint-md) {
			width: 50%;
		}
		>.item {
			position: relative;
			overflow: hidden;
			display : flex;
			align-items : center;
			border-bottom: 1px rgba($split_grey, .3) solid;
			padding: cr($target: 8px) cr($target: 5px);
			font-size: cr($target: 12px);
			>.name {
				display: inline-block;
				align-self: baseline;
				float: left;
				width: 25%;
				color: $primary_color;
				text-align: right;
			}
			>.value {
				height: 100%;
				display: inline-block;
				// line-height: cr($target: 18px);
				padding-left: cr($target: 20px);
				color: $text_grey;
				float: left;
				width: 75%;
			}
		}
	}
</style>