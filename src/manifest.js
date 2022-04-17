let config = require('./config');

module.exports.chrome = {
    'manifest_version': 2,
    'name': 'eHunter - more powerful e-hentai/exhentai!',
    'short_name': 'eHunter',
    'description': 'More powerful e-hentai/eHentai/exhentai! Scroll and Book view',
    'version': config.version,
    'content_security_policy': 'script-src \'self\' \'unsafe-eval\'; object-src \'self\'',
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
        'https://www.alexskye.info/',
        'http://alexskye.info/',
        'https://exhentai.org/',
        'http://www.alexskye.info/',
        'http://githubusercontent.com/',
        'https://githubusercontent.com/',
        'https://nhentai.net/',
        'https://nhentai.to/',
        'https://e-hentai.org/',
        'https://raw.githubusercontent.com/',
        'http://raw.githubusercontent.com/',
        'https://jp.animesales.xyz/',
        'http://jp.animesales.xyz/',
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
                '*://nhentai.to/*',
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
`// ==UserScript==
// @name
// @namespace    http://tampermonkey.net/
// @version      ${config.version}
// @description  This extension provides a scroll mode and book mode to e-hentai/exhentai/nhentai, for the best reading experince!  此扩展为e-hentai/exhentai/nhentai提供一个滚动模式和书本模式, 提供良好的阅读体验.
// @supportURL   https://github.com/hanFengSan/eHunter/issues
// @author       Alex Chen
// @match        https://exhentai.org/*
// @match        https://e-hentai.org/*
// @match        https://nhentai.net/*
// @match        https://nhentai.to/*
// @connect      githubusercontent.com
// @connect      jp.animesales.xyz
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==
`