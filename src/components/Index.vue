<template>
	<div>
		<toolbar></toolbar>
		<floating-button class="floating-button"></floating-button>
		<page-fragment></page-fragment>
	</div>
</template>

<script>
	import Vue from 'vue'
	import { mapGetters, mapActions } from 'vuex'
	import Toolbar from './widget/Toolbar.vue'
	import PageFragment from './PageFragment.vue'
	import FloatingButton from './widget/FloatingButton.vue'

	export default {

		name: 'index',

		data () {
			return {
				data:''
			};
		},

		created() {
			this.setSelector([1,2,3], () => {});
		},

		components: { Toolbar, PageFragment, FloatingButton },

		computed: {
			...mapGetters({
				string: 'getString',
			}),
			...mapActions({
				setSelector: 'setSelector'
			})
		},
		events: {
			showSelector(data, callback) {
				console.log('received')
			}
		},

		created() {
			Vue.http.get('/sales/daily?flag=104102').then(res => {
				this.data = res.data.list[0].title
			}, res => {});
		}
	};
</script>

<style lang="scss" scoped>
	@import "~style/_responsive";
	@import "~style/_variables";

	.floating-button {
		position: fixed;
		right: 5%;
		bottom: 5%;
		z-index: 10000;
	}
</style>