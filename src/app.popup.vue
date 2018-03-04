<template>
    <div class="popup-container">
        <h1>EHUNTER</h1>
        <span>For the best reading experience!</span>
    </div>
</template>

<script>
export default {
    name: 'PopupApp',

    data() {
        return {};
    }
};
</script>

<style lang="scss">
@import '~src/style/_variables';

body {
    font-family: 'San Francisco', 'Helvetica', Arial, 'Hiragino Sans GB', 'Heiti SC', 'Microsoft YaHei', 'Droid Sans',
        'WenQuanYi Micro Hei', sans-serif;
    height: 500px;
}

.popup-container {
    width: 300px;
    h1 {
        background: $popup_primary_color;
        padding: 20px 6px;
        margin: 0;
        font-weight: bold;
        font-size: 21px;
        margin-top: 0;
        text-align: center;
        color: $popup_alternate_text_color;
    }

    > span {
        position: fixed;
        display: flex;
        top: 50%;
        left: 50%;
        font-size: 16px;
        transform: translate(-50%, -50%);
    }
}
</style>