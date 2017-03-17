<template>
    <div class="notification">
        <footer>
            <mu-tabs :value="activeTab" @change="handleTabChange">
                <mu-tab :value="news.name" title="标签动态"/>
                <mu-tab :value="tag.name" title="标签订阅"/>
            </mu-tabs>
        </footer>
        <div class="news" v-if="activeTab === news.name">
            <div class="news-item" v-for="item of news.list">
                <span class="avatar" :style="{'background': news.typeColor[item.type]}">{{ item.tagName[0] }}</span>
                <a class="news-link" :href="item.url" target="_blank">{{ item.tagName + '更新了' + item.updatedNum + '项' }}</a>
            </div>
        </div>
        <div class="tag" v-if="activeTab === tag.name">
            <div class="tag-input">
                <mu-text-field hintText="回车确认标签订阅" label="标签名称"/>
            </div>
            <div class="type-selector">
                <mu-select-field multiple label="类型" hintText="非必填项" v-model="tag.type" :maxHeight="150">
                    <mu-menu-item v-for="item, index in tag.types" :title="item" :value="index"/>
                </mu-select-field>
            </div>
            <div class="updated-interval">
                检查间隔:
                <div class="time">
                    <mu-dropDown-menu :value="tag.time">
                        <mu-menu-item v-for="item, index in tag.types" :title="item" :value="index" />
                    </mu-dropDown-menu>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    export default {
        name: 'Notification',

        data () {
            return {
                activeTab: '',
                news: {
                    name: Symbol(),
                    typeColor: ['#e74c3c', '#e67e22', '#f1c40f', '#27ae60', '#2ecc71', '#3498db', '#2980b9', '#9b59b6', '#8e44ad', '#bdc3c7', '#2c3e50'],
                    list: [
                        { tagName: 'chinese', updatedNum: 5, text: '', url: 'https://exhentai.org', type: 10 },
                        { tagName: 'manga', updatedNum: 3, text: '', url: 'https://exhentai.org', type: 2 },
                        { tagName: 'wife', updatedNum: 3, text: '', url: 'https://exhentai.org', type: 3 }
                    ]
                },
                tag: {
                    type: '',
                    time: '',
                    times: ['10分钟', '0.5小时', '3小时', '6小时', '12小时'],
                    types: ['doujishi', 'manga', 'artist cg', 'game cg', 'western', 'non-h', 'image set', 'costplay', 'asian porn', 'misc'],
                    name: Symbol()
                }
            }
        },

        created() {
            this.activeTab = this.news.name;
        },

        methods: {
            handleTabChange (val) {
                this.activeTab = val
            }
        }
    }
</script>

<style lang="scss">
    @import "~style/_responsive";
    @import "~style/_variables";

    .notification {
        footer {
            position: fixed;
            bottom: 0;
            width: 100%;
        }

        >.news {
            overflow-y: auto;
            > .news-item {
                border-bottom: 1px solid rgba(0,0,0,0.1);
                padding: 10px;
                display: flex;
                >.avatar {
                    height: 35px;
                    width: 35px;
                    line-height: 35px;
                    text-align: center;
                    display: inline-block;
                    border-radius: 50%;
                    font-size: 17px;
                    font-weight: lighter;
                    color: white;
                }
                > .news-link {
                    text-decoration: none;
                    color: rgba(0, 0, 0, 0.6);
                    font-size: 14px;
                    line-height: 35px;
                    white-space: nowrap;
                    margin-left: 10px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }

        > .tag {
            > .tag-input {
                text-align: center;
                margin-top: 10px;
            }
            > .type-selector {
                text-align: center;
                margin-top: 10px;
            }
        }

        // muse-ui custom
        .mu-tab-text {
        }

        .mu-tabs {
            border-top: 1px solid rgba(0,0,0,0.1);
            background: white;
        }

        .mu-tab-link {
            color: rgba(0,0,0,0.4) !important;
        }
        .mu-tab-active {
            color: rgba(0,0,0,0.6) !important;
        }

        .mu-text-field-hint {
            color: rgba(0, 0, 0, 0.27) !important;
        }

        .mu-text-field-line {
            background-color: rgba(0, 0, 0, 0.34) !important;
        }

        .mu-menu-item-wrapper {
            color: rgba(0, 0, 0, 0.34) !important;
        }
    }

</style>