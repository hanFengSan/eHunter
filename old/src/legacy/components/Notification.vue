<template>
    <div class="notification">
        <footer>
            <mu-tabs :value="activeTab" @change="handleTabChange">
                <mu-tab :value="msg.name" :title="['Activities','标签动态'][lang]"/>
                <mu-tab :value="tag.name" :title="['Subscribe', '标签订阅'][lang]"/>
            </mu-tabs>
        </footer>

        <!-- msg tab -->
        <div class="msg" v-if="activeTab === msg.name">
            <mu-sub-header>{{ ['Notifications','历史消息列表'][lang] }}</mu-sub-header>
            <svg class="clear-all-btn" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" @click="clearMsg()">
                <path d="M5 13h14v-2H5v2zm-2 4h14v-2H3v2zM7 7v2h14V7H7z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
            <div>
                <div class="msg-item" v-for="(item, index) of msg.list" :key="index" @click="open(item)">
                    <div class="avatar" :style="{'background': GalleryType.getTypeColor(item.type[0])}">{{ item.name[0].toUpperCase() }}</div>
                    <div class="msg-content">
                        <a v-if="lang==0" class="msg-link" :href="item.url" :title="`${item.name}: updated ${item.updatedNum} items`" @click.stop="" target="_blank">{{ `${item.name}: updated ${item.updatedNum} items` }}</a>
                        <a v-if="lang==1" class="msg-link" :href="item.url" :title="`${item.name}更新了${item.updatedNum}项`" @click.stop="" target="_blank">{{ `${item.name}更新了${item.updatedNum}项` }}</a>
                        <span class="time">{{ DateUtil.getIntervalFromNow(item.time) }}</span>
                    </div>
                    <div class="diff-list" v-show="item.open">
                        <div class="diff-item" v-for="(notification, index) of item.diffs" :key="index">
                            <span :title="notification.title">{{ `${index + 1}.  ${notification.title}` }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- tag tab -->
        <div class="tag" v-if="activeTab === tag.name">
            <!--subscribed tag list -->
            <div class="tag-list-container">
                <mu-sub-header>{{['Tag Subscription List', '标签订阅列表'][lang]}}</mu-sub-header>
                <div class="subscribed-tag-list">
                    <div class="item" v-for="(item, index) of tag.subscribedTagList" :key="index">
                        <span class="tag" @click="openTagPopup(index)" :style="{'background': GalleryType.getTypeColor(item.type[0])}">{{ item.name }}</span>
                    </div>
                </div>
                <!-- popup of tag info -->
                <mu-popup position="bottom" popupClass="tag-popup" :open="tag.popup" @close="closeTagPopup()">
                    <header>
                        {{['Tag Details', '标签详情'][lang]}}
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
                                <td>{{['Tag Name', '标签名称'][lang]}}:</td>
                                <td>{{ tag.subscribedTagList[tag.curTagIndex].name }}</td>
                            </tr>
                            <tr>
                                <td>{{['Target', '目标网站'][lang]}}:</td>
                                <td><span v-for="(site, index) of tag.subscribedTagList[tag.curTagIndex].site" :key="index">{{ site }}&nbsp;&nbsp;</span></td>
                            </tr>
                            <tr>
                                <td>{{['Type', '画册类型'][lang]}}:</td>
                                <td><span v-for="(type, index) of tag.subscribedTagList[tag.curTagIndex].type" :key="index">{{ type }}&nbsp;&nbsp;</span></td>
                            </tr>
                            <tr>
                                <td>{{['Interval', '检查间隔'][lang]}}:</td>
                                <td>{{ UpdateInterval.getText(tag.subscribedTagList[tag.curTagIndex].time)[lang] }}</td>
                            </tr>
                            <tr>
                                <td>{{['Lang', '画册语言'][lang]}}:</td>
                                <td><span v-for="(lang, index) of tag.subscribedTagList[tag.curTagIndex].lang" :key="index">{{ lang }}&nbsp;&nbsp;</span></td>
                            </tr>
                        </table>
                        <div class="tag-test-btn">
                          <mu-flat-button :label="['TEST TAG', '测试标签'][lang]" @click="testTag(tag.subscribedTagList[tag.curTagIndex])" primary/>
                        </div>
                    </div>
                </mu-popup>
                <div class="add-tag-button">
                    <mu-flat-button :label="tag.isEdited?['CANCEL','收起订阅栏'][lang]:['ADD','添加订阅'][lang]" @click="tag.isEdited=!tag.isEdited" primary/>
                </div>
            </div>

            <!-- add new tag-->
            <div class="new-tag-container" :class="{'show':tag.isEdited, 'hide':!tag.isEdited}">
                <div class="tag-input">
                    <mu-text-field :hintText="['Tag(s), split by comma', '多标签则逗号间隔'][lang]" v-model="tag.tagName" :label="['Tag(s)', '标签名称'][lang]"/>
                </div>
                <div class="lang-selector">
                    <mu-select-field :label="['Target', '作用网站'][lang]" :hintText="['must be accessible', '需确保网站可访问'][lang]" v-model="tag.site" :maxHeight="150">
                        <mu-menu-item v-for="(item, index) in tag.sites" :title="item" :key="index" :value="index"/>
                    </mu-select-field>
                </div>
                <div class="type-selector">
                    <mu-select-field multiple :label="['Type(Optional)', '画册类型(可选)'][lang]" :hintText="['Default all types', '默认全类型'][lang]" v-model="tag.type" :maxHeight="150">
                        <mu-menu-item v-for="(item, index) in tag.types" :title="item" :key="index" :value="index"/>
                    </mu-select-field>
                </div>
                <div class="lang-selector">
                    <mu-select-field :label="['Lang(Optional)', '语言类型(可选)'][lang]" :hintText="['Default all langs','默认不限语言'][lang]" v-model="tag.lang" :maxHeight="150">
                        <mu-menu-item v-for="(item, index) in tag.langs" :title="item" :key="index" :value="index"/>
                    </mu-select-field>
                </div>
   
                <div class="time-selector">
                    <mu-select-field :label="['Interval of inspection','检查间隔'][lang]" v-model="tag.time" :maxHeight="150">
                        <mu-menu-item v-for="(item, index) in tag.times" :title="item" :key="index" :value="index"/>
                    </mu-select-field>
                </div>
                <div class="add">
                    <mu-flat-button @click="addTag()" :label="['CONFIRM','添加'][lang]" primary/>
                </div>
            </div>

        </div>
        <!-- toast -->
        <mu-toast v-if="toast.show" class="toast" :message="toast.msg" @close="hideToast"/>
    </div>
</template>

<script>
    import GalleryType from '../service/type/GalleryType'
    import UpdateInterval from '../service/type/UpdateInterval'
    import SubsStorage from '../service/storage/SubsStorage'
    import NotiStorage from '../service/storage/NotiStorage'
    import NotificationService from '../service/NotificationService'
    import DateUtil from '../utils/DateUtil'
    import lang from '../utils/lang'

    export default {
        name: 'Notification',

        data () {
            return {
                lang,
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
                    times: UpdateInterval.getTypes(),
                    types: GalleryType.getTypes(),
                    langs: ['Chinese', 'English', 'Spanish'],
                    isEdited: false,
                    popup: false,
                    curTagIndex: -1,
                    subscribedTagList: []
                },
                GalleryType,
                UpdateInterval,
                DateUtil: DateUtil
            }
        },

        async created() {
            this.activeTab = this.msg.name;
            this.tag.subscribedTagList = await SubsStorage.getSubsList();
            let list = (await NotiStorage.getMsgList()).reverse();
            list.forEach((item) => {
                item.open = false;
                this.msg.list.push(item);
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
            async deleteTag(index) {
                await SubsStorage.delSubsItemByName(this.tag.subscribedTagList[index].name);
                this.tag.subscribedTagList.splice(index, 1);
                this.tag.popup = false;
                this.tag.curTagIndex = -1;
                this.showToast(['Deleted', '已删除'][this.lang]);
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
            async addTag() {
                if (this.tag.tagName === '') {
                    this.showToast(['Please input a tag','请输入标签名称'][this.lang]);
                    return;
                }
                if (this.tag.site === '') {
                    this.showToast(['Please choose a target','请选择目标网站'][this.lang]);
                    return;
                }
                if (this.tag.subscribedTagList.find(i => i.name === this.tag.tagName)) {
                    this.showToast(['this tag already exists','该标签已存在'][this.lang]);
                    return;
                }
                let newItem = {
                    name: this.tag.tagName,
                    site: this.tag.site !== '' ? [this.tag.sites[this.tag.site]] : [],
                    type: this.tag.type.map((i) => {
                        return this.tag.types[i]
                    }),
                    time: UpdateInterval.getVal(this.tag.times[this.tag.time]),
                    lang: this.tag.lang !== '' ? [this.tag.langs[this.tag.lang]] : []
                };
                this.tag.subscribedTagList.push(newItem);
                this.tag.tagName = '';
                this.tag.type = [];
                this.tag.lang = '';
                this.tag.site = '';
                await SubsStorage.addSubsItem(newItem);
                this.showToast(['Done','添加成功'][this.lang]);
            },
            async clearMsg() {
                await NotiStorage.clearMsg();
                this.showToast(['Cleared','清除成功'][this.lang]);
                this.msg.list = [];
            },
            open(msgItem) {
                msgItem.open = !msgItem.open;
                console.log(msgItem.open);
            },
            testTag(tag) {
              window.open(NotificationService.getTagUrl(tag));
            }
        }
    }
</script>

<style lang="scss">
    @import "../style/_responsive";
    @import "../style/_variables";

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
        .tag-detail {
            .tag-test-btn {
              display: flex;
              justify-content: center;
              align-items: center;
            }
        }
    }

    //toast
    .toast {
    }

</style>