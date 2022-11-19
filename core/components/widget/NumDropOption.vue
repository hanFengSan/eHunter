<template>
    <div class="num-drop-option">
        <DropOption :list="dropOptions" :has-custom-option="true" :cur-val="formatName(props.curVal)" @change="onDropOptionChange"
            :format-fn="props.formatFn" />
        <PopSlider :active="popSliderActive" :init="props.curVal" :is-float="props.isFloat" :max="props.max" :min="props.min"
            :step="1" @change="onPopSliderChange" @close="onClosePopSlider" />
    </div>
</template>

<script setup lang="ts">
import DropOption from './DropOption.vue'
import PopSlider from './PopSlider.vue'
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
    min: number,
    max: number,
    curVal: number,
    quickOptions: Array<number>,
    formatFn?: (val: number) => string,
    suffix?: string,
    isFloat?: boolean,
}>(), {
    isFloat: false
})

function formatName(val: number): string {
    let name = String(val)
    if (props.suffix) {
        return name += props.suffix
    }
    if (props.formatFn) {
        return props.formatFn(val)
    }
    return name
}

const dropOptions = computed(() => {
    let arr: Array<any> = props.quickOptions.map(i => ({
        name: formatName(i),
        val: i,
    }))
    arr.push({
        i18nKey: 'custom',
        val: -1,
    })
    return arr
})

const emit = defineEmits(['change'])

const popSliderActive = ref(false)

function onDropOptionChange(val, index) {
    if (index == props.quickOptions.length) {
        popSliderActive.value = true
    } else {
        emit('change', props.quickOptions[index])
    }
}

function onPopSliderChange(val: number) {
    emit('change', val)
}

function onClosePopSlider() {
    popSliderActive.value = false
}
</script>

<style lang="scss" scoped>
@import "../../style/_responsive";
@import "../../style/_variables";

div {
    display: flex;
}

.num-drop-option {
    position: relative;
}
</style>