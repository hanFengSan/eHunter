<template>
    <div class="notification">
        <footer>
            <mu-tabs :value="activeTab" @change="handleTabChange">
                <mu-tab :value="msg.name" title="标签动态"/>
                <mu-tab :value="tag.name" title="标签订阅"/>
            </mu-tabs>
        </footer>

        <!-- msg tab -->
        <div class="msg" v-if="activeTab === msg.name">
            <mu-sub-header>历史消息列表</mu-sub-header>
            <svg class="clear-all-btn" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" @click="clearMsg()">
                <path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
            <div>
                <div class="msg-item" v-for="item of msg.list" @click="open(item)">
                    <div class="avatar" :style="{'background': ColorService.getColorByType(item.type[0])}">{{ item.name[0].toUpperCase() }}</div>
                    <div class="msg-content">
                        <a class="msg-link" :href="item.url" :title="`${item.name}更新了${item.updatedNum}项`" @click.stop="" target="_blank">{{ `${item.name }更新了${item.updatedNum}项` }}</a>
                        <span class="time">{{ DateUtil.getIntervalFromNow(item.time) }}</span>
                    </div>
                    <div class="diff-list" v-show="item.open">
                        <div class="diff-item" v-for="(title, index) of item.diffs">
                            <span>{{ `${index + 1}.  ${title}` }}</span>
                        </div>
                    </div>
                </div>
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
                                <td>作用网站:</td>
                                <td><span v-for="site of tag.subscribedTagList[tag.curTagIndex].site">{{ site }}&nbsp;&nbsp;</span></td>
                            </tr>
                            <tr>
                                <td>类型:</td>
                                <td><span v-for="type of tag.subscribedTagList[tag.curTagIndex].type">{{ type }}&nbsp;&nbsp;</span></td>
                            </tr>
                            <tr>
                                <td>检查间隔:</td>
                                <td>{{ UpdateIntervalService.getTextByVal(tag.subscribedTagList[tag.curTagIndex].time) }}</td>
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
                <div class="lang-selector">
                    <mu-select-field label="作用网站" hintText="需确保网站可访问" v-model="tag.site" :maxHeight="150">
                        <mu-menu-item v-for="item, index in tag.sites" :title="item" :value="index"/>
                    </mu-select-field>
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
    import ColorService from '../service/type/TypeColorService'
    import UpdateIntervalService from '../service/type/UpdateIntervalService'
    import SubsStorageService from '../service/storage/SubsStorageService'
    import NotiStorageService from '../service/storage/NotiStorageService'
    import DateUtil from '../utils/DateUtil'

    export default {
        name: 'Notification',

        data () {
            return {
                activeTab: '',
                toast: { msg: '', show: false },
                msg: {
                    name: Symbol(),
                    list: []
                },
                tag: {
                    name: Symbol(),
                    tagName: '',
                    site: '',
                    type: [],
                    time: 1,
                    lang: '',
                    sites: ['e-hentai', 'exhentai'],
                    times: UpdateIntervalService.getTypes(),
                    types: ColorService.getTypes(),
                    langs: ['Chinese', 'English', 'Spanish'],
                    isEdited: false,
                    popup: false,
                    curTagIndex: -1,
                    subscribedTagList: []
                },
                ColorService: ColorService,
                UpdateIntervalService: UpdateIntervalService,
                DateUtil: DateUtil
            }
        },

        created() {
            this.activeTab = this.msg.name;
            SubsStorageService
                .instance
                .then(instance => {
                    this.tag.subscribedTagList = instance.getSubsList();
                });
            NotiStorageService
                .instance
                .then(instance => {
                    let list = instance.getMsgList().reverse();
                    list.forEach((item) => {
                        item.open = false;
                        this.msg.list.push(item);
                    });
                })
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
                if (this.tag.site === '') {
                    this.showToast('请选择作用网站');
                    return;
                }
                if (this.tag.subscribedTagList.find(i => i.name === this.tag.tagName)) {
                    this.showToast('已存在此标签');
                    return;
                }
                let newItem = {
                    name: this.tag.tagName,
                    site: this.tag.site !== '' ? [this.tag.sites[this.tag.site]] : [],
                    type: this.tag.type.map((i) => {
                        return this.tag.types[i]
                    }),
                    time: UpdateIntervalService.getValByText(this.tag.times[this.tag.time]),
                    lang: this.tag.lang !== '' ? [this.tag.langs[this.tag.lang]] : []
                };
                this.tag.subscribedTagList.push(newItem);
                this.tag.tagName = '';
                this.tag.type = [];
                this.tag.lang = '';
                this.tag.site = '';
                SubsStorageService
                    .instance
                    .then(instance => {
                        instance.addSubsItem(newItem, () => this.showToast('添加成功'));
                    });
            },
            clearMsg() {
                NotiStorageService
                    .instance
                    .then(instance => {
                        this.msg.list = instance.clearMsg(() => {
                            this.msg.list = [];
                            this.showToast('已清空历史消息');
                        });
                    })
            },
            open(msgItem) {
                msgItem.open = !msgItem.open;
                console.log(msgItem.open);
            }
        }
    }
</script>

<style lang="scss">
    @import "~style/_responsive";
    @import "~style/_variables";

    .notification {
        z-index: 200;
        margin-bottom: 60px;
        footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            z-index: 10;            
        }

        >.msg {
            overflow-y: auto;
            position: relative;
            > .clear-all-btn {
                position: absolute;
                top: 16px;
                right: 18px;
                fill: rgba(0, 0, 0, 0.24);
                height: 20px;
                width: 20px;
                cursor: pointer;
                &:hover {
                    fill: $primary_color;
                }
            }
            .msg-item {
                border-bottom: 1px solid rgba(0,0,0,0.1);
                padding: 10px;
                display: block;
                overflow: hidden;
                &:hover {
                    background: rgba($primary_color, 0.1);
                    cursor: pointer;
                }
                &:last-child {
                    border-bottom: none;
                }
                > .avatar {
                    height: 35px;
                    width: 35px;
                    line-height: 35px;
                    text-align: center;
                    display: inline-block;
                    border-radius: 50%;
                    font-size: 17px;
                    font-weight: lighter;
                    color: white;
                    float: left;
                    user-select: none;
                }
                > .msg-content {
                    display: inline-flex;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: calc(100% - 35px);
                    justify-content: space-between;
                    > .msg-link {
                        text-decoration: none;
                        color: rgba(0, 0, 0, 0.6);
                        font-size: 14px;
                        line-height: 35px;
                        white-space: nowrap;
                        margin-left: 10px;
                        display: inline-block;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        &:hover {
                            color: $primary_color;
                        }
                    }
                    > .time {
                        float:right;
                        line-height: 35px;
                        color: $popup_secondary_text_color;
                        font-size: 12px;
                        margin-right: 10px;
                        display: inline-block;
                        user-select: none;
                    }
                }
                > .diff-list {
                    background: $table_grey;
                    padding: 0 5px;
                    margin-top: 5px;
                    > .diff-item {
                        height: 30px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        line-height: 30px;
                        font-size: 12px;
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
                    height: 600px;
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