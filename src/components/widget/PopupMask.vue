<template>
	<div class="popup" @click="close">
		<div class="content">
			<slot></slot>
		</div>
	</div>
</template>

<script>
	import { mapActions } from 'vuex'
	export default {

		name: 'Popup',

		props: ['cancelCallback'],
		
		data () {
			return {

			};
		},
		methods: {
			...mapActions({
				closePopups: 'closePopups'
			}),
			close() {
				if (this.cancelCallback !== undefined) {
					this.cancelCallback();
				}
				this.closePopups();			
			}
		}
	};
</script>

<style lang="scss" scoped>
	.popup {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 30000;
		overflow-y: auto;
		margin: 0 auto;
		background: rgba(black, .5);
		>.content {
			position: fixed;
			top: 50%;
			width: 100%;
			transform: translateY(-50%);
			z-index: 11000;
			border-radius: 2%;
		}
	}
</style>