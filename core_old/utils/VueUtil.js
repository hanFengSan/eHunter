export default {
    methods: {
        px(num) {
            return `${num}px`;
        },
        range(start, count) {
            return Array.apply(0, Array(count))
                .map(function(element, index) {
                    return index + start;
                });
        }
    }
};
