<template>
    <div id="app-content">
        <thumb-scroll-view class="thumb-scroll-view" :style="{'margin-left': showThumbView ? '' : '-150px'}"></thumb-scroll-view>
        <album-scroll-view class="album-scroll-view" :style="{'width': `calc(100% - ${showThumbView ? 150 : 0}px)`}"></album-scroll-view>
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
                'showThumbView'
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

    .clickable {
        cursor: pointer;
    }
    
    .no-select {
        user-select: none;
    }

    .tips {
        position: relative;
        &:hover {
            &:after {
                content: attr(title-content);
                position: absolute;
                top: -130%;
                left: 50%;
                transform: translate(-50%, 0);
                font-size: 12px;
                padding: 2px 4px;
                border-radius: 2px;
                min-width: 50px;
                text-align: center;
                background: rgba(0, 0, 0, 0.8);
                box-shadow: 0 1px 6px rgba(0,0,0,.117647), 0 1px 4px rgba(0,0,0,.117647);
            }
        }
        &.tips-down {
            &:hover {
                &:after {
                    top: 130%;
                }
            }
        }
    }
</style>