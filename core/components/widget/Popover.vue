<template>
    <Transition name="slide-fade">
        <div class="popover" v-if="active" :style="customStyle" @click.stop="">
                <slot></slot>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps({
  active: Boolean,
  customStyle: Object,
  isCloseToRight: Boolean,
})

const emit = defineEmits(['close'])

function handleClick(e) {
    e.stopPropagation(); // avoiding emit click event within popover
}

function handleOuterClick() {
    emit('close')
}

// user a timer, avoiding call 'close' when 'open'
let timer:any;
watch(() => props.active, async (newVal, oldVal) => {
    if (newVal) {
        timer = setTimeout(() => {
            document.addEventListener('click', handleOuterClick);
        }, 100);
    }
    if (oldVal) {
        document.removeEventListener('click', handleOuterClick);
        if (timer) {
            clearTimeout(timer);
        }
    }
})
</script>

<style lang="scss" scoped>
.popover {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border-radius: 2px;
    color: black;
    box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    z-index: 1;
}
</style>