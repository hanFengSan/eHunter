<template>
    <div class="notification">
        <footer>
            <mu-tabs :value="activeTab" @change="handleTabChange">
                <mu-tab :value="news.name" title="标签动态"/>
                <mu-tab :value="tag.name" title="标签订阅"/>
            </mu-tabs>
        </footer>

        <!-- news tab -->
        <div class="news" v-if="activeTab === news.name">
            <div class="news-item" v-for="item of news.list">
                <span class="avatar" :style="{'background': ColorService.getColorByType(item.type[0])}">{{ item.tagName[0] }}</span>
                <a class="news-link" :href="item.url" target="_blank">{{ item.tagName + '更新了' + item.updatedNum + '项' }}</a>
            </div>
        </div>

        <!-- tag tab -->
        <div class="tag" v-if="activeTab === tag.name">
            <!--subscribed tag list -->
            <div class="tag-list-container">
                <mu-sub-header>标签订阅列表</mu-sub-header>
                <div class="subscribed-tag-list">
                    <div class="item" v-for="(item, index) of tag.subscribedTagList">
                        <span class="tag" @click="openTagPopup(index)" :style="{'background': ColorService.getColorByType(item.type[0])}">{{ item.name }}</span>
                    </div>
                </div>
                <!-- popup of tag info -->
                <mu-popup position="bottom" popupClass="tag-popup" :open="tag.popup" @close="closeTagPopup()">
                    <header>
                        标签详情
                        <div class="panel">
                            <svg class="delete-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" @click="deleteTag(tag.curTagIndex)">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                <path d="M0 0h24v24H0z" fill="none"/>
                            </svg>
                            <svg class="close-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" @click="closeTagPopup()">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                <path d="M0 0h24v24H0z" fill="none"/>
                            </svg>
                        </div>
                    </header>
                    <div class="tag-detail">
                        <table v-if="tag.curTagIndex!==-1">
                            <tr>
                                <td>标签名称:</td>
                                <td>{{ tag.subscribedTagList[tag.curTagIndex].name }}</td>
                            </tr>
                            <tr>
                                <td>类型:</td>
                                <td><span v-for="type of tag.subscribedTagList[tag.curTagIndex].type">{{ type }}&nbsp;&nbsp;</span></td>
                            </tr>
                            <tr>
                                <td>检查间隔:</td>
                                <td>{{ tag.times[tag.subscribedTagList[tag.curTagIndex].time] }}</td>
                            </tr>
                            <tr>
                                <td>语言类型:</td>
                                <td><span v-for="lang of tag.subscribedTagList[tag.curTagIndex].lang">{{ lang }}&nbsp;&nbsp;</span></td>
                            </tr>
                        </table>
                    </div>
                </mu-popup>
                <div class="add-tag-button">
                    <mu-flat-button :label="tag.isEdited?'收起订阅栏':'添加订阅'" @click="tag.isEdited=!tag.isEdited" primary/>
                </div>
            </div>

            <!-- add new tag-->
            <div class="new-tag-container" :class="{'show':tag.isEdited, 'hide':!tag.isEdited}">
                <div class="tag-input">
                    <mu-text-field hintText="请输入标签名称" v-model="tag.tagName" label="标签名称"/>
                </div>
                <div class="type-selector">
                    <mu-select-field multiple label="画册类型" hintText="默认全类型订阅" v-model="tag.type" :maxHeight="150">
                        <mu-menu-item v-for="item, index in tag.types" :title="item" :value="index"/>
                    </mu-select-field>
                </div>
                <div class="lang-selector">
                    <mu-select-field label="语言类型" hintText="默认不限语言" v-model="tag.lang" :maxHeight="150">
                        <mu-menu-item v-for="item, index in tag.langs" :title="item" :value="index"/>
                    </mu-select-field>
                </div>
                <div class="time-selector">
                    <mu-select-field label="检查间隔" v-model="tag.time" :maxHeight="150">
                        <mu-menu-item v-for="item, index in tag.times" :title="item" :value="index"/>
                    </mu-select-field>
                </div>
                <div class="add">
                    <mu-flat-button @click="addTag()" label="添加" primary/>
                </div>
            </div>

        </div>
        <!-- toast -->
        <mu-toast v-if="toast.show" class="toast" :message="toast.msg" @close="hideToast"/>
    </div>
</template>

<script>
    import ColorService from 'src/service/TypeColorService'
    import SubsStorageService from 'src/service/storage/SubsStorageService'

    export default {
        name: 'Notification',

        data () {
            return {
                activeTab: '',
                toast: { msg: '', show: false },
                news: {
                    name: Symbol(),
                    list: [
                        { tagName: 'chinese', updatedNum: 5, text: '', url: 'https://exhentai.org', type: ['Manga'] },
                        { tagName: 'manga', updatedNum: 3, text: '', url: 'https://exhentai.org', type: ['Doujishi'] },
                        { tagName: 'wife', updatedNum: 3, text: '', url: 'https://exhentai.org', type: ['Western'] }
                    ]
                },
                tag: {
                    name: Symbol(),
                    tagName: '',
                    type: [],
                    time: 1,
                    lang: '',
                    times: ['10分钟', '0.5小时', '3小时', '6小时', '12小时'],
                    types: ['Doujishi', 'Manga', 'Artist-CG', 'Game-CG', 'Western', 'Non-H', 'Image-Set', 'Cosplay', 'Asian-Porn', 'Misc'],
                    langs: ['Chinese', 'English', 'Spanish', 'Japanese'],
                    isEdited: false,
                    popup: false,
                    curTagIndex: -1,
                    subscribedTagList: []
                    // subscribedTagList: [
                    //     { name: 'shooter', type: ['Manga'], time: 1, lang: ['Chinese'] },
                    //     { name: 'naruto', type: ['Doujishi'], time: 1, lang: ['Chinese'] },
                    //     { name: 'wife', type: ['Non-H'], time: 1, lang: ['Japanese'] },
                    //     { name: 'glass', type: ['Cosplay'], time: 1, lang: ['Chinese'] },
                    //     { name: 'stocking', type: ['Misc'], time: 1, lang: ['English'] },
                    //     { name: 'Yukiyanagi Raki', type: ['Image-Set'], time: 1, lang: ['Chinese'] },
                    //     { name: 'dragon', type: ['Artist-CG'], time: 1, lang: ['Chinese'] },
                    //     { name: 'koinu computer', type: ['Non-H'], time: 1, lang: ['Japanese'] },
                    //     { name: 'motoyon', type: ['Western'], time: 1, lang: ['Chinese'] },
                    //     { name: 'umineko no naku koro ni | when the seagulls cry', type: ['Non-H'], time: 1, lang: ['English'] }
                    // ]
                },
                ColorService: ColorService
            }
        },

        created() {
            this.activeTab = this.news.name;
            SubsStorageService
                .instance
                .then(instance => {
                    this.tag.subscribedTagList = instance.getSubsList();
                });
        },

        methods: {
            handleTabChange (val) {
                this.activeTab = val;
            },
            openTagPopup(index) {
                this.tag.curTagIndex = index;
                this.tag.popup = true;
            },
            closeTagPopup() {
                this.tag.popup = false;
            },
            deleteTag(index) {
                SubsStorageService
                    .instance
                    .then(instance => {
                        instance.delSubsItemByName(this.tag.subscribedTagList[index].name, () => {
                            this.tag.subscribedTagList.splice(index, 1);
                            this.tag.popup = false;
                            this.tag.curTagIndex = -1;
                            this.showToast('删除成功');
                        });
                    });
            },
            showToast(msg) {
                this.toast.msg = msg;
                this.toast.show = true;
                if (this.toastTimer) clearTimeout(this.toastTimer);
                this.toastTimer = setTimeout(() => { this.toast.show = false }, 2000);
            },
            hideToast() {
                this.toast.show = false;
                if (this.toastTimer) clearTimeout(this.toastTimer);
            },
            addTag() {
                if (this.tag.tagName === '') {
                    this.showToast('请输入标签名称');
                    return;
                }
                if (this.tag.subscribedTagList.find(i => i.name === this.tag.tagName)) {
                    this.showToast('已存在此标签');
                    return;
                }
                let newItem = {
                    name: this.tag.tagName,
                    type: this.tag.type.map((i) => {
                        return this.tag.types[i]
                    }),
                    time: this.tag.time,
                    lang: this.tag.lang ? [this.tag.langs[this.tag.lang]] : []
                };
                this.tag.subscribedTagList.push(newItem);
                this.tag.tagName = '';
                this.tag.type = [];
                this.tag.lang = '';
                SubsStorageService
                    .instance
                    .then(instance => {
                        instance.addSubsItem(newItem, () => this.showToast('添加成功'));
                    });
            }
        }
    }
</script>

<style lang="scss">
    @import "~style/_responsive";
    @import "~style/_variables";

    .notification {
        z-index: 200;
        footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            z-index: 10;            
        }

        .avatar {
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

        >.news {
            overflow-y: auto;
            > .news-item {
                border-bottom: 1px solid rgba(0,0,0,0.1);
                padding: 10px;
                display: flex;
                > .news-link {
                    text-decoration: none;
                    color: rgba(0, 0, 0, 0.6);
                    font-size: 14px;
                    line-height: 35px;
                    white-space: nowrap;
                    margin-left: 10px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    &:hover {
                        color: $primary_color;
                    }
                }
            }
        }

        > .tag {
            > .new-tag-container {
                background: $popup_addition_bg;
                transition: all 0.2s ease;
                > .tag-input {
                    text-align: center;
                    margin-top: 10px;
                }
                > .type-selector {
                    text-align: center;
                    margin-top: 10px;
                }
                > .lang-selector {
                    text-align: center;
                    margin-top: 10px;
                }
                > .time-selector {
                    text-align: center;
                    margin-top: 10px;
                }
                > .add {
                    text-align: center;
                }
                &.show {
                    height: 500px;
                    overflow: hidden;
                }
                &.hide {
                    height: 0px;
                    overflow: hidden;
                }
            }
            > .tag-list-container {
                // display: flex;
                > .add-tag-button {
                    text-align: center;
                }
                > .subscribed-tag-list {
                    font-size: 16px;                                        
                    padding: 0 10px 10px 10px;
                    > .item {
                        display: inline-block;
                        cursor: pointer;
                        .tag {
                            line-height:180%;
                            box-sizing: border-box;
                            margin: 5 / 16 * 1em;
                            padding: 0 7/16*1em;
                            text-align: center;
                            display: inline-block;
                            border-radius: 2/16*1em;
                            font-size: 12 / 16 * 1em;
                            font-weight: lighter;
                            color: white;
                            user-select: none;
                            word-break: break-all;
                            transition: all 0.2s ease;
                            &:hover {
                                box-shadow: 0 0 5px 15px rgba(255, 255, 255, 0.3) inset;
                            }
                        }
                    }
                }
                > .new-tag {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px 20px;
                    color: $popup_secondary_text_color;
                    line-height: 20px;
                    transition: all 0.3s ease;
                    user-select: none;
                    cursor: pointer;
                    font-size: 16px;
                    .add-icon {
                        display: inline-block;
                        fill: $popup_secondary_text_color;
                        height: 20px;
                        width: 20px;
                    }
                    &:hover {
                        color: $primary_color;
                        .add-icon {
                            fill: $primary_color;
                        }
                        background: rgba(0, 0, 0, .1);
                    }
                }
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

    // popup style
    .tag-popup {
        width: 90%;
        font-size: 16px;
        > header {
            position: relative;
            background: $primary_color;
            font-size: 14 / 16 * 1em;
            color: white;
            padding: 9/16*1em 9/16*1em;
            line-height: 180%;
            > .panel {
                position: absolute;
                top: 50%;
                transform: translate(0, -50%);
                right: 10 / 16 * 1em; 
                height: 18 / 16 * 1em;               
                > .delete-icon {
                    fill: white;
                    height: 18 / 16 * 1em;
                    width: 18 / 16 * 1em;
                    margin-right: 5px;
                    cursor: pointer;
                }
                > .close-icon {
                    fill: white;
                    height: 18 / 16 * 1em;
                    width: 18 / 16 * 1em;
                    cursor: pointer;
                }

            }
        }
        table {
            padding: 9/16*1em;
            font-size: 14px;
            tr {
                td {
                    &:nth-child(1) {
                        white-space: nowrap;
                        color: #27ae60;
                        vertical-align: top;
                    }
                    &:nth-child(2) {
                        word-break: break-all;
                        color: $popup_secondary_text_color;
                    }
                }
            }
        }
    }

    //toast
    .toast {
    }

</style>