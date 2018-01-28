<template>
    <div class="popup-container">
        <h1>E-HUNTER</h1>
        <mu-tabs :value="activeTab" @change="handleTabChange">
            <mu-tab :value="read.name" title="阅读"/>
            <mu-tab :value="notification.name" title="通知"/>
            <mu-tab :value="about.name" title="关于"/>
        </mu-tabs>
        <div class="read" v-if="activeTab === read.name">
            <mu-list>
                <mu-sub-header>视图开启设置</mu-sub-header>
                <mu-list-item disableRipple @click="handleToggle(read, 'eHunterView')" title="卷轴式阅读">
                    <mu-switch v-model="read.eHunterView" slot="right"/>
                </mu-list-item>
                <mu-list-item disableRipple @click="handleToggle(read, 'thumbView')" title="缩略图侧栏">
                    <mu-switch v-model="read.thumbView" slot="right"/>
                </mu-list-item>
                <mu-list-item disableRipple @click="handleToggle(read, 'paginationView')" title="当前页码">
                    <mu-switch v-model="read.paginationView" slot="right"/>
                </mu-list-item>
                <mu-list-item disableRipple @click="handleToggle(read, 'syncScroll')" title="页码同步(若页面乱跳请关闭)">
                    <mu-switch v-model="read.syncScroll" slot="right"/>
                </mu-list-item>
            </mu-list>
            <mu-list>
                <mu-sub-header>视图大小</mu-sub-header>
                <div class="slider-item">
                    <mu-slider :step="1" :min="30" :max="100" v-model="read.viewScale" class="demo-slider"/>
                </div>
                <div class="slider-text">{{ read.viewScale + '%' }}</div>
            </mu-list>
            <!--<mu-list>
                <mu-sub-header>存储</mu-sub-header>
                <mu-list-item disableRipple @click="handleToggle(read, 'cacheImg')" title="缓存图片">
                    <mu-switch v-model="read.cacheImg" slot="right"/>
                </mu-list-item>
                <mu-list-item title="清除缓存" class="action">
                </mu-list-item>
            </mu-list>-->
        </div>
        <div v-if="activeTab === notification.name" class="notification">
            <notification></notification>
        </div>
        <div v-if="activeTab === about.name" class="about">
            <table>
                <tr>
                    <td>作者</td>
                    <td>寒枫</td>
                </tr>
                <tr>
                    <td>github</td>
                    <td><a target="_blank" href="https://github.com/hanFengSan/eHunter">https://github.com/hanFengSan/eHunter</a>
                    </td>
                </tr>
                <tr>
                    <td>反馈</td>
                    <td>如果有bug或建议的要反馈, 可以在github上开issue, 或电邮我c360785655@gmail.com</td>
                </tr>
                <tr>
                    <td>其他</td>
                    <td>如果觉得这个扩展对你有帮助的话, 可以在商店里点个赞, 或帮忙推荐给朋友什么的, 有人喜欢我才有动力继续做得更好(ﾟ▽ﾟ)/</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    // import SettingService from 'src/service/SettingService.js'
    import Notification from 'src/components/Notification.vue'

    export default {
        name: 'PopupApp',

        data() {
            return {
                activeTab: '',
                read: {
                    name: Symbol(),
                    eHunterView: true,
                    thumbView: true,
                    paginationView: true,
                    syncScroll: true,
                    viewScale: 80,
                    cacheImg: true
                },
                notification: {
                    name: Symbol()
                },
                about: {
                    name: Symbol()
                }
            }
        },

        components: {
            Notification
        },

        watch: {
            // 'read.viewScale'() {
            //     SettingService.instance.setSettingItem('setAlbumWidth', this.read.viewScale);
            // },
            // 'read.eHunterView'() {
            //     SettingService.instance.setSettingItem('toggleEHunter', this.read.eHunterView);
            // },
            // 'read.thumbView'() {
            //     SettingService.instance.setSettingItem('toggleThumbView', this.read.thumbView);
            // },
            // 'read.paginationView'() {
            //     SettingService.instance.setSettingItem('showPagination', this.read.paginationView);
            // },
            // 'read.syncScroll'() {
            //     SettingService.instance.setSettingItem('toggleSyncScroll', this.read.syncScroll);
            // },
            'read.viewScale': {
                handler: function(val, oldVal) {
                    // SettingService.instance.setSettingItem('setAlbumWidth', this.read.viewScale);
                },
                deep: true
            },
            'read.eHunterView': {
                handler: function(val, oldVal) {
                    // SettingService.instance.setSettingItem('toggleEHunter', this.read.eHunterView);
                },
                deep: true
            },
            'read.thumbView': {
                handler: function(val, oldVal) {
                    // SettingService.instance.setSettingItem('toggleThumbView', this.read.thumbView);
                },
                deep: true
            },
            'read.paginationView': {
                handler: function(val, oldVal) {
                    // SettingService.instance.setSettingItem('showPagination', this.read.paginationView);
                },
                deep: true
            },
            'read.syncScroll': {
                handler: function(val, oldVal) {
                    // SettingService.instance.setSettingItem('toggleSyncScroll', this.read.syncScroll);
                },
                deep: true
            }
        },

        created() {
            this.activeTab = this.read.name;
            this.initValues();
        },

        methods: {
            initValues() {
                // SettingService.instance.getSettingItem('toggleEHunter', (val) => {
                //     this.read.eHunterView = val;
                // });
                // SettingService.instance.getSettingItem('setAlbumWidth', (val) => {
                //     this.read.viewScale = val;
                // });
                // SettingService.instance.getSettingItem('showPagination', (val) => {
                //     this.read.paginationView = val;
                // });
                // SettingService.instance.getSettingItem('toggleThumbView', (val) => {
                //     this.read.thumbView = val;
                // });
                // SettingService.instance.getSettingItem('toggleSyncScroll', (val) => {
                //     this.read.syncScroll = val;
                // });
            },
            handleTabChange (val) {
                this.activeTab = val
            },
            handleToggle (tab, key) {
                tab[key] = !tab[key];
            }
        }
    }

</script>

<style lang="scss">
    @import "~src/style/_variables";

    body {
        font-family: 'San Francisco', 'Helvetica', Arial, "Hiragino Sans GB", "Heiti SC", //macOS & ios
        "Microsoft YaHei", //windows
        'Droid Sans', // android default
        'WenQuanYi Micro Hei', // linux
        sans-serif;
        height: 500px;
    }

    .popup-container {
        width: 300px;
        h1 {
            background: $popup_primary_color;
            padding-top: 20px;
            padding-bottom: 3px;
            margin: 0;
            font-weight: bold;
            font-size: 16px;
            margin-top: 0;
            text-align: center;
            color: $popup_alternate_text_color;
        }

        .read {
            .slider-item {
                padding: 0 10px;
            }
            .slider-text {
                color: $popup_text_color;
                text-align: center;
                font-size: 12px;
                margin-top: -5px;
            }
            .action {
                color: $popup_primary_color !important;
            }
        }

        .notification {
            .tip {
                color: hsla(0, 0%, 0%, .2);
                text-align: center;
                margin-top: 100px;
                font-weight: bolder;
                font-size: 14px;
            }
        }

        .about {
            table {
                padding: 10px;
                word-break: break-all;
                color: $popup_text_color;
                tr {
                    padding-bottom: 10px;
                    td {
                        &:first-child {
                            color: $popup_primary_color;
                            white-space: nowrap;
                            vertical-align: top;
                        }
                        > a {
                            color: rgba($popup_primary_color, 0.7);
                        }
                    }
                }
            }
        }
    }

</style>