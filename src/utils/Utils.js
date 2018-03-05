export default {
    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
