<template>
<div class="slider"         
        @mousedown="handleMouseDown"
        @click="handleClick"
        ref="slider">
    <div class="track"></div>
    <div class="fill" :style="{ 'width': fillScale + '%' }"></div>
    <div class="thumb"
        :style="{ 'left': fillScale + '%', 'width': isHolding ? '15px': undefined, 'height': isHolding ? '15px': undefined }" ></div>
</div>
</template>

<script>
export default {
    name: 'Slider',

    props: ['min', 'max', 'step', 'init'],

    data() {
        return {
            val: 0,
            isHolding: false,
            oldMouseX: 0,
            oldVal: 0,
            widthRatio: 0,
            stepPrecision: 0
        };
    },

    created() {
        this.val = this.init;
        this.stepPrecision = this.getStepPrecision(this.step);
    },

    computed: {
        fillScale() {
            return (this.val - this.min) / ((this.max - this.min) / 100);
        }
    },

    methods: {
        getWidthRatio() {
            return this.$refs.slider.offsetWidth / (this.max - this.min);
        },
        handleMouseDown(e) {
            this.isHolding = true;
            this.handleClick(e);
            this.oldMouseX = e.clientX;
            this.oldVal = this.val;
            this.widthRatio = this.getWidthRatio();
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
            e.preventDefault();
        },
        handleMouseUp(e) {
            this.isHolding = false;
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
            e.preventDefault();
        },
        handleMouseMove(e) {
            if (this.isHolding) {
                const x = this.oldVal + (e.clientX - this.oldMouseX) / this.widthRatio;
                this.onChange(x);
            }
            e.preventDefault();
        },
        handleClick(e) {
            const x = this.min + e.offsetX / this.getWidthRatio();
            this.onChange(x);
        },
        onChange(x) {
            if (x > this.max) {
                this.val = this.getValByStep(this.max);
            } else {
                this.val = this.getValByStep(x < this.min ? this.min : x);
            }
            this.$emit('change', this.val);
        },
        getStepPrecision(val) {
            return String(String(this.step).match('.[0-9]')).length - 1;
        },
        getValByStep(x) {
            for (let i = this.min; i <= this.max; i = i + this.step) {
                if (i > x) {
                    if (i === this.min) {
                        return Number(i.toFixed(this.stepPrecision));
                    } else {
                        return Number((i - this.step).toFixed(this.stepPrecision));
                    }
                }
            }
            return this.max;
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../style/_responsive";
@import "../../style/_variables";

div {
    display: flex;
}

.slider {
    position: relative;
    width: 200px;
    height: 20px;
    cursor: pointer;    
    > .track {
        position: absolute;
        left: 0;
        height: 2px;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
        background: $slider_track_bg;
    }
    > .fill {
        position: absolute;
        left: 0;
        height: 2px;
        width: 20%;
        top: 50%;
        transform: translateY(-50%);
        background: $slider_track_fill_color;
    }
    > .thumb {
        position: absolute;
        width: 12px;
        height: 12px;
        top: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: $slider_thumb_color;
        pointer-events: none;
        transition: width 0.1s ease, height 0.1s ease;
    }
}
</style>