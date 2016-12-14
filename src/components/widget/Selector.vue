<template>
	<popup :cancel-callback="data.cancelCallback">
		<div class="container noselect">
			<div class="selector" @click.stop="">
				<div class="item ripple" v-for="(item, index) of data.data" @click="select(index)">
					<a>{{ item }}</a>
				</div>
			</div>
		</div>
	</popup>
</template>

<script>
	import Popup from '../base/Popup.vue'
	export default {

		name: 'selector',

		props: ['data'],

		data () {
			return {
				height: '0'
			};
		},
		methods: {
			select(index) {
				this.close();
				this.data.callback(index);
			},
			close() {
				this.$root.$children[0].$emit('closePopup');
			}
		},
		components: {
			Popup
		}
	};
</script>

<style lang="scss" scoped>
	@import "~style/_responsive";
	@import "~style/_variables";

	.selector {
		width: 80%;
		margin: 0 auto;
		background: white;
		@include responsive($breakpoint-md) {
			width: 50%;
		}
		>.item {
			border-bottom: 1px $split_grey solid;
			text-align: center;
			padding: 8/16 * 1rem 0;
			>a {
				color: $primary_color;
				font-size: cr($target: 12px);
				line-height: 2rem;
				height: 2rem;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
				vertical-align: middle;
			}
			&:hover {
				cursor: pointer;
			}
			&:last-child {
				border-bottom: 0;
			}
			&:hover {
				background: $split_grey;
			}
			&:active {
				background: $split_grey;
			}

		}
	}
</style>