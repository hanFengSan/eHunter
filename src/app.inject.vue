<template>
    <div id="app-content">
        <thumb-scroll-view class="thumb-scroll-view" :style="{'margin-left': thumbView ? '' : '-152px'}"></thumb-scroll-view>
        <album-scroll-view class="album-scroll-view" :style="{'width': `calc(100% - ${thumbView ? 150 : 0}px)`}"></album-scroll-view>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ThumbScrollView from './components/ThumbScrollView.vue'
    import AlbumScrollView from './components/AlbumScrollView.vue'

    export default {
        name: 'InjectedApp',

        data() {
            return {

            }
        },

        computed: {
            ...mapGetters([
                'thumbView'
            ])
        },

        created() {
        },

        methods: {
            ...mapActions([
                'setAlbumWidth'
            ])
        },

        components: {
            ThumbScrollView, AlbumScrollView
        }
    }

</script>

<style lang="scss">
    @import "~style/_responsive";
    @import "~style/_variables";

    #app-content {
        display: flex;
        > .thumb-scroll-view {
            transition: all 0.3s ease;
        }
        > .album-scroll-view {
            width: calc(100% - 150px);
        }
    }
    body {
        font-family: 'San Francisco', 'Helvetica', Arial, "Hiragino Sans GB", "Heiti SC",//macOS & ios
        "Microsoft YaHei", //windows
        'Droid Sans', // android default
        'WenQuanYi Micro Hei', // linux
        sans-serif;
    }
</style>