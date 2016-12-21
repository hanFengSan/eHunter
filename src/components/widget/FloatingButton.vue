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
	import { mapActions, mapGetters } from 'vuex'
	export default {

		name: 'FloatingButton',

		data () {
			return {
				buttonSize: '3rem'
			};
		},
		methods: {
			...mapActions({
				showSelector: 'showSelector',
				showTablePicker: 'showTablePicker',
				showItemInfo: 'showItemInfo',
				tableSize: 'getTableSize',
				switchTableItems: 'switchTableItems'
			}),
			select() {
				this.buttonSize = '0rem';
				this.showSelector(
				{
					data: ['列表显示项调整', '关于'], 
					callback: index => {
						if (index === 0) {
							this.openTablePicker();
						} else if (index === 1) {
							this.openAbout();
						}

					}, 
					cancelCallback: () => this.buttonSize = '3rem'
				});
			},
			isPC() {
				if (screen.width <= 1024) {
					return false;
				} else {
					return true;
				}	
			},
			openTablePicker() {
				this.showTablePicker(
				{ 
					size: this.tableSize,
					cancelCallback: data => {
						this.buttonSize = '3rem';
						// 由于响应数据过大, 为此进行一系列性能优化处理
						setTimeout(() => this.switchTableItems(data), this.isPC() ? 1 : 300);
					}
				});					
			},
			openAbout() {
				this.showItemInfo(
				{
					data: [
					{name: '作者', data: '寒枫'},
					{name: '相关支持', data: '锅の主'},
					{name: '联系方式', data: 'c360785655@gmail.com'},
					],
					cancelCallback: data => {
						this.buttonSize = '3rem';
					}
				})
			},
			reloadTable(data) {
				this.$root.$children[0].$emit('reloadTable', data);
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