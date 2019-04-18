let config = require('./config');

module.exports.chrome = {
    'manifest_version': 2,
    'name': 'eHunter - more powerful e-hentai/exhentai!',
    'short_name': 'eHunter',
    'description': 'More powerful e-hentai/eHentai/exhentai! Scroll and Book view',
    'version': config.version,
    'content_security_policy': 'script-src \'self\'; object-src \'self\'',
    'browser_action': {
        'default_popup': 'popup.html',
        'default_title': 'eHunter',
        'default_icon': {
            '16': './img/ehunter_icon.png',
            '32': './img/ehunter_icon.png'
        }
    },
    'icons': {
        '16': './img/ehunter_icon.png',
        '24': './img/ehunter_icon.png',
        '48': './img/ehunter_icon.png',
        '96': './img/ehunter_icon.png',
        '128': './img/ehunter_icon.png'
    },
    'author': 'Alex Chen',
    'incognito': 'spanning',
    'permissions': [
        'activeTab',
        'https://alexskye.info/',
        'https://alexskye.xyz/',
        'https://www.alexskye.info/',
        'http://alexskye.info/',
        'https://exhentai.org/',
        'http://www.alexskye.info/',
        'http://githubusercontent.com/',
        'https://githubusercontent.com/',
        'https://nhentai.net/',
        'https://e-hentai.org/',
        'https://raw.githubusercontent.com/',
        'http://raw.githubusercontent.com/',
        'storage',
        'background',
        'notifications',
        'cookies'
    ],
    'content_scripts': [
        {
            'matches': [
                '*://alexskye.org/*',
                '*://alexskye.info/*',
                '*://anime-sales.com/*',
                '*://exhentai.org/*',
                '*://hanfengsan.org/*',
                '*://e-hentai.org/*',
                '*://nhentai.net/*',
                '*://mingzuozhibiba.cn/*'
            ],
            'js': [
                'inject.js'
            ],
            'run_at': 'document_end'
        }
    ],
    'web_accessible_resources': [
        'img/*'
    ],
    'background': {
        'scripts': ['background.js']
    }
};

module.exports.tampermonkey =
    '// ==UserScript==' + '\n' +
    '// @name         eHunter' + '\n' +
    '// @namespace    http://tampermonkey.net/' + '\n' +
    '// @version      ' + config.version + '\n' +
    '// @description  This extension provides a scroll mode and book mode to e-hentai/exhentai, for the best reading experince!  此扩展为e-hentai/exhentai提供一个滚动模式和书本模式, 提供良好的阅读体验.' + '\n' +
    '// @supportURL   https://github.com/hanFengSan/eHunter/issues' + '\n' +
    '// @author       Alex Chen' + '\n' +
    '// @match        https://exhentai.org/*' + '\n' +
    '// @match        https://e-hentai.org/*' + '\n' +
    '// @connect      alexskye.info' + '\n' +
    '// @connect      githubusercontent.com' + '\n' +
    '// @grant        GM_xmlhttpRequest' + '\n' +
    '// ==/UserScript==';
