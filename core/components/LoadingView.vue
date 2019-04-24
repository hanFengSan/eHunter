<template>
  <div class="loading-view">
    <div class="loading-animation">
      <div class="book">
        <div class="book__page"></div>
        <div class="book__page"></div>
        <div class="book__page"></div>
      </div>
      <h4>Reading</h4>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import AwesomeScrollView from './base/AwesomeScrollView.vue';
import TopBar from './TopBar.vue';
import Logger from '../utils/Logger.js';
import Pagination from './widget/Pagination.vue';
import PageView from './PageView.vue';
import SettingService from '../service/SettingService.ts';
import * as tags from '../assets/value/tags';

export default {
    name: 'LoadingView',

    data() {
        return {};
    }
};
</script>

<style lang="scss" scoped>
@import '../style/_variables';
$peter-river: $body_bg;
$clouds: #ecf0f1;
.loading-view {
    display: flex;
    justify-content: center;
    align-items: center;
    background: $body_bg;
    .loading-animation {
        .book {
            top: 50%;
            transform: translateY(-50%);
            position: relative;
            margin: 0 auto;
            border: 5px solid $clouds;
            width: 100px;
            height: 60px;
        }
        .book__page {
            position: absolute;
            left: 50%;
            top: -5px;
            margin: 0 auto;
            border-top: 5px solid $clouds;
            border-bottom: 5px solid $clouds;
            border-right: 5px solid $clouds;
            background: $peter-river;
            width: 50px;
            height: 60px;
            transform-origin: 0% 50%;
            animation: flip 1.2s infinite linear;
            animation-fill-mode: forwards;

            @for $i from 1 through 3 {
                &:nth-child(#{$i}) {
                    z-index: -$i;
                    animation-delay: 1.4s * $i;
                }
            }
        }

        @keyframes flip {
            0% {
                transform: perspective(600px) rotateY(-0deg);
            }

            20% {
                background: darken($peter-river, 10%);
            }

            29.9% {
                background: darken($peter-river, 10%);
            }
            30% {
                transform: perspective(200px) rotateY(-90deg);
                background: $peter-river;
            }

            54.999% {
                opacity: 1;
            }
            55% {
                opacity: 0;
            }

            60% {
                transform: perspective(200px) rotateY(-180deg);
                background: $peter-river;
            }

            100% {
                transform: perspective(200px) rotateY(-180deg);
                background: $peter-river;
            }
        }

        h4 {
            color: #ffffff;
            text-align: center;
            font-family: sans-serif;
            text-transform: uppercase;
            font-size: 20px;
            position: relative;
        }

        h4:after {
            position: absolute;
            content: '';
            -webkit-animation: Dots 2s cubic-bezier(0, 0.39, 1, 0.68) infinite;
            animation: Dots 2s cubic-bezier(0, 0.39, 1, 0.68) infinite;
        }

        /* Dots */

        @-webkit-keyframes Dots {
            0% {
                content: '';
            }
            33% {
                content: '.';
            }
            66% {
                content: '..';
            }
            100% {
                content: '...';
            }
        }

        @keyframes Dots {
            0% {
                content: '';
            }
            33% {
                content: '.';
            }
            66% {
                content: '..';
            }
            100% {
                content: '...';
            }
        }
    }
}
</style>