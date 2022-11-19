export default {
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
