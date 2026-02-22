<template>
    <div class="ehunter-container vue-container">
        <App />
    </div>
</template>

<script setup lang="ts">
import App from './App.vue'
</script>

<style>
body {
    margin: 0;
    overflow: hidden;
}

.ehunter-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background: #333333;
    left: 0px;
    top: 0px;
    z-index: 1;
}
</style>
