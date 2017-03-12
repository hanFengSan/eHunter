<template>
    <div id="app-content">
        <thumb-scroll-view class="thumb-scroll-view"></thumb-scroll-view>
        <manga-scroll-view class="manga-scroll-view"></manga-scroll-view>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'
    import ThumbScrollView from './components/ThumbScrollView.vue'
    import MangaScrollView from './components/MangaScrollView.vue'

    export default {
        name: 'InjectedApp',

        data() {
            return {

            }
        },

        created() {
            /* eslint-disable no-undef */
            chrome.runtime.onMessage.addListener((msg, sender, response) => {
                console.log(msg);
                switch (msg.setting) {
                case 'setAlbumWidth':
                    window.setTimeout(() => {
                        this.setAlbumWidth(msg.value);
                    }, 0);
                    console.log('set album width to ' + msg.value);
                    break;
                }
                response();
            });
        },

        methods: {
            ...mapActions([
                'setAlbumWidth'
            ])
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
    body {
        font-family: 'San Francisco', 'Helvetica', Arial, "Hiragino Sans GB", "Heiti SC",//macOS & ios
        "Microsoft YaHei", //windows
        'Droid Sans', // android default
        'WenQuanYi Micro Hei', // linux
        sans-serif;
    }
</style>