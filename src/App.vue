<template>
  <div>
    <navbar></navbar>
    <router-view
    class="view"
    keep-alive
    transition
    transition-mode="out-in"></router-view>
    <transition name="fade">  
      <popup-mask v-if="hasMask"></popup-mask>
    </transition>   
    <transition name="fade">  
      <selector v-if="selector.show" :data="selector"></selector>
    </transition>
    <transition name="fade">  
      <table-picker v-if="tablePicker.show" :data="tablePicker"></table-picker>
    </transition>
    <transition name="fade">  
      <item-info v-if="itemInfo.show" :data="itemInfo"></item-info>
    </transition>

  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import string from 'assets/value/string-cn.json'
  import Navbar from './components/widget/Navbar.vue'
  import Selector from './components/widget/Selector.vue'
  import PopupMask from './components/widget/PopupMask.vue'
  import TablePicker from './components/widget/TablePicker.vue'
  import ItemInfo from './components/widget/ItemInfo.vue'

  export default {
    data() {
      return {
      }
    },
    computed: {
      ...mapGetters({
        string: 'getString',
        rankList: 'getRankList',
        selector: 'getSelector',
        tablePicker: 'getTablePicker',
        itemInfo: 'getItemInfo',
        hasMask: 'hasMask'
      }),
    },
    created() {

    },
    components: { Navbar, Selector, TablePicker, PopupMask, ItemInfo },
    methods: {
      setModalMode() {
        document.body.style.overflow = "hidden";
        // 屏蔽IOS的滑动
        document.ontouchmove = function(e){ 
          e.preventDefault(); 
        };
      },
      cancelModalMode() {
        document.body.style.overflow = "";
        document.ontouchmove = function(e){ 
          e.default(); 
        };
      },
    }
  }
</script>

<style lang="scss">
  @import "./style/_responsive";
  @import "./style/_variables";

  html {
    font-size: 16px;
  }

  body {
    margin: 0;
    font-family: 
     'San Francisco', 'Helvetica', Arial, "Hiragino Sans GB", "Heiti SC",//macOS & ios
     "Microsoft YaHei", //windows
     'Droid Sans', // android default
     'WenQuanYi Micro Hei', // linux
     sans-serif;
   }

   .container {
    padding: 0 1rem;
    margin-right: auto;
    margin-left: auto;

    @include responsive($breakpoint-xs) {
      // width: 100%;
    } 
    @include responsive($breakpoint-sm) {
      width: $context-sm;
    }   
    @include responsive($breakpoint-md) {
      width: $context-md;
    } 
    @include responsive($breakpoint-lg) {
      width: $context-lg;
    } 
    @include responsive($breakpoint-xl) {
      width: $context-xl;
    }
  }

  * {
    box-sizing: border-box;
  }

  // 消除移动端的tap effect
  * { 
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    -moz-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  // 组件开启的过渡效果
  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s
  }
  .fade-enter, .fade-leave-active {
    opacity: 0
  }

  .ripple {
    position: relative;
    overflow: hidden;

    &:after {
      content: "";
      background: rgba(255,255,255,0.5);
      display: block;
      position: absolute;
      border-radius: 50%;
      padding-top: 240%;
      padding-left: 240%;
      margin-top: -120%;
      margin-left: -120%;
      pointer-events: none;
      opacity: 0;
      transition: all 0.3s;
    }

    &:active:after {
      padding-top: 0;
      padding-left: 0;
      margin-top: 0;
      margin-left: 0;
      opacity: 1;
      transition: 0s;
    }

  }

  .noselect {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently not supported by any browser */
  }

</style>