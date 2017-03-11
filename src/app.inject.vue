<template>
    <div id="app-content">
        <thumb-scroll-view class="thumb-scroll-view"></thumb-scroll-view>
        <manga-scroll-view class="manga-scroll-view"></manga-scroll-view>
    </div>
</template>

<script>
    import ThumbScrollView from './components/ThumbScrollView.vue'
    import MangaScrollView from './components/MangaScrollView.vue'

    export default {
        name: 'InjectedApp',

        data() {
            return {

            }
        },

        components: {
            ThumbScrollView, MangaScrollView
        }
    }

</script>

<style lang="scss">
    @import "~style/_responsive";
    @import "~style/_variables";

    #app-content {
        display: flex;
        > .thumb-scroll-view {}
        > .manga-scroll-view {
            width: calc(100% - 150px);
        }
        }
</style>