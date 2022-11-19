export default {
    timeout(ms): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
