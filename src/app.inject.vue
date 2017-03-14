<template>
    <div id="app-content">
        <thumb-scroll-view class="thumb-scroll-view"></thumb-scroll-view>
        <album-scroll-view class="album-scroll-view"></album-scroll-view>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'
    import ThumbScrollView from './components/ThumbScrollView.vue'
    import AlbumScrollView from './components/AlbumScrollView.vue'
    
    export default {
        name: 'InjectedApp',

        data() {
            return {

            }
        },

        created() {
            this.initSetting();
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
        > .thumb-scroll-view {}
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