<template>
    <div class="popup-container">
        <h1>EHUNTER</h1>
        <mu-tabs :value="activeTab" @change="handleTabChange">
            <mu-tab :value="read.name" :title="['READING', '阅读漫画'][lang]"/>
            <mu-tab :value="notification.name" :title="['SUBSCRIPTION','标签订阅'][lang]"/>
        </mu-tabs>
        <div class="read" v-if="activeTab === read.name">
            <span>{{['Read a gallery to use eHunter','打在网站阅读漫画,体验eHunter'][lang]}}</span>
        </div>
        <div v-if="activeTab === notification.name" class="notification">
            <notification></notification>
        </div>
    </div>
</template>

<script>
import Notification from './components/Notification.vue';
import lang from './utils/lang';

export default {
    name: 'PopupApp',

    data() {
        return {
          lang,
            activeTab: '',
            read: {
                name: Symbol(),
                eHunterView: true,
                thumbView: true,
                thumbBackground: true,
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
        };
    },

    components: {
        Notification
    },

    created() {
        this.activeTab = this.read.name;
    },

    methods: {
        handleTabChange(val) {
            this.activeTab = val;
        },
        handleToggle(tab, key) {
            tab[key] = !tab[key];
        }
    }
};
</script>

<style lang="scss">
@import './style/_variables';

body {
    font-family: 'San Francisco', 'Helvetica', Arial, 'Hiragino Sans GB', 'Heiti SC', 'Microsoft YaHei', 'Droid Sans',
        'WenQuanYi Micro Hei', sans-serif;
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
        > span {
            position: fixed;
            top: 50%;
            left: 50%;
            white-space: nowrap;
            font-size: 16px;
            transform: translate(-50%, -50%);
        }
    }

    .notification {
        .tip {
            color: hsla(0, 0%, 0%, 0.2);
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
