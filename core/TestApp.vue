<template>
    <div class="ehunter-container vue-container">
        <App />
    </div>
</template>

<script setup lang="ts">
import App from './App.vue'
</script>

<style>
.ehunter-container {
    position: absolute;
    height: 100%;
    width: 100%;
    background: #333333;
    left: 0;
    top: 0;
    z-index: 1;
}
</style>
