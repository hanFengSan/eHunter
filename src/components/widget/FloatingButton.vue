<template>
	<div>
		<div class="content ripple" @click="select()" :style="'height:'+ buttonSize + ';width:'+buttonSize">
			<div class="icon">		
				<div class="icon-line" v-for="x in 3">
					<span class="icon-atom" v-for="y in 3"></span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {

		name: 'FloatingButton',

		data () {
			return {
				buttonSize: '3rem'
			};
		},
		methods: {
			select() {
				this.buttonSize = '0rem';
				this.$root.$children[0].$emit('showSelector', ['列表显示项调整', '关于'], 
					index => {
						if (index === 0) {
							this.showTablePicker();
						} else {
							this.buttonSize = '3rem'
						}

					}, () => this.buttonSize = '3rem')
			},
			showTablePicker() {
				this.$root.$children[0].$emit('showTablePicker', 
					['排名', '标题', '艺术家', '已售天数'], 
					index => {
						this.buttonSize = '3rem'
					},
					() => {
						this.buttonSize = '3rem'
					})
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import "~style/_responsive";
	@import "~style/_variables";

	.content {
		height: 3rem;
		width: 3rem;
		cursor: pointer;
		transition-property: all;
		transition-timing-function: ease;
		transition-duration: 0.3s;
		border-radius: 50%;
		background: $accent_color;
		box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);

		>.icon {
			position: absolute;
			top: 50%;
			left: 50%;
			overflow: hidden;
			transform: translate(-50%, -50%);
			>.icon-line {
				&:after {
					clear: both;
					display: block;
					content: '';
				}
				>.icon-atom {
					margin: cr($target: 1px);
					display: inline-block;
					float: left;
					height: cr($target: 4px);
					width: cr($target: 4px);
					background: white;
				} 
			}
		}
	}
</style>