<template>
    <teleport to="#ehunter-app">
        <transition name="slow-opacity-fade" appear>
            <div v-if="active" ref="modal" class="simple-modal">
                <div class="simple-dialog" @click.stop="" @wheel.stop="">
                    <div class="background" @click="onClickBackground"></div>
                    <article>
                        <h4>{{ title }}</h4>
                        <p class="markdown" v-if="mdText != undefined" v-html="MdRenderer.render(mdText)"></p>
                        <div class="operation-bar">
                            <flat-button class="operation" v-for="operation in actualOperations" :key="operation.name"
                                :label="operation.name" :type="operation.btnType" mode="inline"
                                @click="onClick(operation)">
                            </flat-button>
                        </div>
                    </article>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
import FlatButton from './FlatButton.vue'
import MdRenderer from '../../utils/MdRenderer'
import { computed, ref, watch } from 'vue'

interface Operation {
    name: string
    btnType: string // plain, positive...
    isCloseModal: boolean
    onClick?: () => void
}

const props = withDefaults(defineProps<{
    active: boolean,
    title: string,
    isCompulsive?: boolean,
    mdText?: string
    operations?: Operation[]
}>(), {
    isCompulsive: false,
})

const emit = defineEmits(['close'])

const modal = ref<HTMLDivElement | null>(null)

const actualOperations = computed((): Operation[] => {
    if (props.operations != undefined && props.operations.length > 0) {
        return props.operations
    }
    return [{
        name: 'CONFIRM',
        btnType: 'plain',
        isCloseModal: true,
    }]
})

function onClickBackground() {
    if (!props.isCompulsive) {
        emit('close')
    }
}

function onClick(operation: Operation) {
    if (operation.onClick) {
        operation.onClick()
    }
    if (operation.isCloseModal) {
        emit('close')
    }
}

function enter(e) {
    if (e.key === 'Enter' && actualOperations.value.length === 1) {
        let modals = document.querySelectorAll('.simple-modal')
        if (modals.length <= 1 || modals[modals.length - 1] === modal.value) {
            onClick(actualOperations.value[0])
        }
    }
    e.stopPropagation()
    return true
}

watch(() => props.active, newVal => {
    if (newVal) {
        setTimeout(() => {
            document.addEventListener('keydown', enter);
        }, 200);
    } else {
        document.removeEventListener('keydown', enter);

    }
})
</script>

<style lang="scss" scoped>
@import "../../style/_responsive";
@import "../../style/_variables";

div {
    display: flex;
}

.simple-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    overflow-y: auto;
}

.simple-dialog {
    box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;

    >.background {
        flex: 1;
        background: $modal_view_bg;
    }

    >article {
        display: flex;
        flex-direction: column;
        position: absolute;
        background: white;
        border-radius: 3px;
        min-width: 430px;
        min-height: 110px;
        max-width: 50%;
        max-height: 88%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        padding: 19px 22px;

        >h4 {
            box-sizing: border-box;
            font-size: 22px;
            text-align: left;
            padding-bottom: 10px;
            color: #000000;
            font-weight: lighter;
        }

        >p {
            color: rgba(0, 0, 0, 0.8);
            text-align: left;
            font-size: 16px;
            overflow: auto;
            flex: 1;
        }

        >.operation-bar {
            flex-direction: row-reverse;
            margin-top: 10px;
            flex-shrink: 0;
        }
    }
}
</style>