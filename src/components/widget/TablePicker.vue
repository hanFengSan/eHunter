<template>
	<popup :cancel-callback="data.cancelCallback" :cancel-callback-param="data.data">
		<div class="container noselect">
			<div class="selector" @click.stop="">
				<div class="item item-ripple" v-for="(item, index) of data.data" :class="item.isActived ? 'active' : ''"
				@click="select(index)">
				<a>{{ item.name }}</a>
			</div>
		</div>
	</div>
</popup>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import Popup from '../base/Popup.vue'

	export default {

		name: 'TablePicker',

		props: ['data'],

		data () {
			return {
			};
		},

		computed: {
			...mapGetters({
				curTabRankDataList: 'getCurTabRankDataList'
			})
		},

		components: { Popup },

		methods: {
			...mapActions({

			}),
			select(index) {
				if (!this.data.data[index].isActived) {				
					let length = this.data.data.filter(t => t.isActived).length;
					if (length === this.data.size) {
						this.data.data.filter(t => t.isActived)[length - 1].isActived = false;
					}
				}
				this.data.data[index].isActived = !this.data.data[index].isActived;
			}
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
			position: relative;
			border-bottom: 1px $split_grey solid;
			text-align: center;
			padding: 8/16 * 1rem 0;
			transition: all ease 0.2s;
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
			&:before {
				position: absolute;
				content: '';
				width: cr($target: 0px);
				height: cr($target: 0px);
				transition: all ease 0.2s;
				border-radius: 50%;
				top: 50%;
				background: $contrast_color;
				left: 10%;
				transform: translate(0%, -50%);
			}
			&.active {
				&:before {
					position: absolute;
					content: '';
					width: cr($target: 12px);
					height: cr($target: 12px);
					border-radius: 50%;
					top: 50%;
					background: $contrast_color;
					left: 10%;
					transform: translate(0%, -50%);
				}
			}

		}
	}

	.item-ripple {
		position: relative;
		overflow: hidden;

		&:after {
			content: "";
			background: rgba($primary_color, .8);
			display: block;
			position: absolute;
			border-radius: 50%;
			padding-top: 240%;
			padding-left: 240%;
			margin-top: -120%;
			margin-left: -120%;
			opacity: 0;
			transition: all 0.5s;
		}

		&:active:after {
			padding-top: 0;
			padding-left: 0;
			margin-top: 0;
			margin-left: 0;
			opacity: 1;
			transition: 0s;
		}

	}


</style>