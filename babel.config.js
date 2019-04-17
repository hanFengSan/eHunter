module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    chrome: '42',
                    firefox: '42'
                }
            }
        ]
    ],
    plugins: ['@babel/transform-runtime']
}
