<template>
	<div class="noselect wrapper">	
		<div class="title"></div>
		<div class="navbar">
			<div class="container">
				<div class="selector" @click="select()">
					<span class="text">{{ rankList[curRank].sName }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import { mapGetters, mapActions } from 'vuex'
	import string from 'assets/value/string-cn.json'
	export default {

		name: 'navbar',

		data () {
			return {
			};
		},
		created() {
			// this.$root.$children[0].$on('getCurRank', this.getCurRank);
		},
		computed: {
			...mapGetters({
				string: 'getString',
				rankList: 'getRankList',
				curRank: 'getCurRank'
			})
		},
		methods: {
			...mapActions({
				setCurRank: 'setCurRank',
				showSelector: 'showSelector'
			}),

			select() {
				let list =  this.rankList.map(item => {
					return item.name
				})
				this.showSelector({ data: list, callback: index => {
					this.setCurRank(index);} });
				console.log('navbar')
			}
		}
	};
</script>

<style lang="scss" scoped>
	@import "~style/_responsive";
	@import "~style/_variables";
	.wrapper {
		>.title {
			position: fixed;
			top: 0;
			z-index: 25000;
			height: 3rem - cr($target: 16px)*2;
			width: 100%;
			margin: (3rem - cr($target: 16px))/2 0;
			@include responsive($breakpoint-xs) {	
				background: url('../../assets/title.png') no-repeat center;
				background-size: contain;
			}
			// 准备两个title图片, 应对PC端缩放图片分辨率太低导致的虚化问题
			@include responsive($breakpoint-md) {	
				background: url('../../assets/title_small.png') no-repeat center;
				background-size: contain;
			}
			pointer-events: none;
		}
		>.navbar {
			height: 3rem;
			background: $primary_color;
			position: fixed;
			top: 0;
			width: 100%;
			z-index: 10000;
			>.container {
				position: relative;
				height: 100%;
				>.selector {
					color: rgba(white, .7);
					position: absolute;
					top: 50%;
					right: 0.5rem;
					transform: translateY(-50%);
					margin-right: cr($target: 10px);
					font-size: cr($target: 12px);
					&:hover {
						cursor: pointer;
					}
					&:active {
						background: darken($primary_color, 5%);
					}
					&:after {
						content: '';
						display: inline-block;
						width: 0;
						height: 0;
						border-top: cr($target: 3px) white solid;
						border-bottom: 0;
						border-right: cr($target: 3px) transparent solid;
						border-left: cr($target: 3px) transparent solid;
						vertical-align: middle;
						margin-left: cr($target: 4px);
					}
				}
			}
		}
	}
</style>