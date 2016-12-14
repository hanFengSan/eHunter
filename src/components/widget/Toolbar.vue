<template>
	<div class="toolbar noselect">
		<img class="flower" src="../../assets/flower.png">
		<div class="container">
			<img class="logo" src="../../assets/logo.png">
			<div class="tab ripple" :class="curSubTab === index ? 'active' : ''" v-for="(item, index) of tabs[curTab].val" @click="select(index)">
				{{ item }}
			</div>
			<div class="tab ripple" @click="openSelector()">
				<span class="more"></span>
				<span class="more"></span>
				<span class="more"></span>
			</div>
			<span class="indicator" :style="'left:' + (100/(tabs[curTab].val.length+1)) * curSubTab + '%'"></span>
		</div>
	</div>
</template>

<script>
	export default {

		name: 'Toolbar',

		data () {
			return {
				tabs: [
				{
					name: '映像相关',
					val: ['动画BD', '映像BD', '映像VD', '电影BD']
				},
				{
					name: '音乐相关',
					val: ['单曲日榜', '专辑日榜', '音乐BD', '音乐VD']
				}],
				curTab: 0,
				curSubTab: 0
			};
		},
		methods: {
			select(index) {
				this.curSubTab = index
			},
			openSelector() {
				let nameList = []
				this.tabs.forEach((item) => {
					nameList.push(item.name)
				})
				this.$root.$children[0].$emit('showSelector', nameList, index => this.curTab = index)
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import "~style/_responsive";
	@import "~style/_variables";
	.toolbar {
		position: relative;
		background: $accent_color;
		height: 3 + cr($target: 1px); //box-sizing:boder-box原因, 加上border-top的偏差
		margin-top: 3rem;
		border-top: 1px solid #b889cb;
		>.flower {
			z-index: 40000;
			display: inline-block;
			position: absolute;
			top: 0;
			left: 0;
			transform: translate(0%, -50%);
			height: 6rem;
			pointer-events: none;
		}
		>.container {
			position: relative;
			&:after {
				clear: both;
				content: "";
				display: block;
			}
			@include responsive($breakpoint-xs) {
				padding: 0;
			} 
			>.logo {
				display: inline-block;
				position: absolute;
				left: 50%;
				padding-left: 0.91/54 * 499 * 0.4 * 1rem;
				height: cr($target: 30px);
				top: 0;
				transform: translate(-50%, -100%);
				margin-top: cr($target: 2px);
				z-index: 20000;
			}
			>.tab {
				display: inline-block;
				float: left;
				color: white;
				cursor: pointer;
				width: 1 / 5 * 100%;
				font-size: cr($target: 14px);
				text-align: center;
				vertical-align: middle;
				line-height: 3rem;
				>.more {
					text-align: center;
					vertical-align: middle;
					display: inline-block;
					background: white;
					width: cr($target: 5px);
					height: cr($target: 5px);
					border-radius: 50%;
				}
				&:after {
					content: '';
					display: block;

				}
				&.active {
					color: white;
				}
			}
			>.indicator {
				width: 1/5 * 100%;
				background: white;
				height: cr($target: 3px);
				position: absolute;
				bottom: 0;
				transition-property: left;
				transition-duration: 0.3s;
				transition-timing-function: ease;
			}
		}
	}
</style>