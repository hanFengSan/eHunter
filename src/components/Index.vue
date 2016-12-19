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
			};
		},

		created() {
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
		},

		created() {
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