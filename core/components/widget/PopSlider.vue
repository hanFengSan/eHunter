<template>
  <popover class="PopSlider" :active="active" :custom-style="{ maxWidth: 'min(92vw, 360px)' }" @close="emit('close')">
    <div class="content" @keydown="stopArrowEvent">
      <input ref="inputElem" class="value" type="number" @keydown="watchKeyboard" v-model="value">
      <slider class="slider" :min="min" :max="max" :step="step" :init="init" @change="emitChange"></slider>
      <flat-button class="button" :label="i18n.confirm" type="positive" @click="handleClick"></flat-button>
    </div>
    <SimpleDialog :title="i18n.tips" :active="showErrDialog" :md-text="errText" @close="() => showErrDialog = false" />
  </popover>
</template>

<script setup lang="ts">
import Popover from './Popover.vue'
import Slider from './Slider.vue'
import FlatButton from './FlatButton.vue'
import SimpleDialog from './SimpleDialog.vue'
import { i18n } from '../../store/i18n'
import { ref, watch, computed } from 'vue'

const props = withDefaults(defineProps<{
  active: boolean
  min: number
  max: number
  step: number
  init: number
  isFloat: boolean
}>(), {
  step: 1,
  isFloat: false
})

const emit = defineEmits(['close', 'change'])

const value = ref(props.init)
const inputElem = ref<HTMLInputElement | null>(null)
const showErrDialog = ref(false)
const errText = computed(() => {
  return i18n.value.numberInputTip.replace('{{min}}', props.min).replace('{{max}}', props.max)
})

watch(() => props.init, (newVal) => {
  value.value = newVal
})

function handleClick() {
  handleInput()
  emit('close')
}

function emitChange(val) {
  emit('change', val)
}

function handleInput() {
  inputElem.value!.blur()
  if (!props.isFloat) {
    value.value = Math.floor(value.value)
  }
  if (value.value < props.min || value.value > props.max) {
    value.value = props.init
    showErrDialog.value = true
  } else {
    emitChange(value.value)
  }
}

function watchKeyboard(e) {
  if (e.key === 'Enter') {
    handleInput()
  }
}

function stopArrowEvent(e) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.stopPropagation()
  }
}
</script>

<style lang="scss" scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0;
  /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
  -moz-appearance: textfield;
  /* Firefox */
}

div {
  display: flex;
}

.PopSlider {
  >.content {
    padding: 7px 10px 7px 15px;
    align-items: center;

    >.button {
      margin-left: 8px;
    }

    >.value {
      background: transparent;
      border: none;
      width: 30px;
      color: #2ecc70;
      margin-right: 7px;
      font-size: 13px;
      text-align: center;

      &:focus {
        outline-width: 0;
        color: #222222;
      }
    }
  }
}
</style>
