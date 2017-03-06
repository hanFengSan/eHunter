import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './InjectedApp.vue'
import store from './store'
import VueUtil from './utils/VueUtil.vue';


Vue.use(VueResource);
Vue.mixin(VueUtil);

if (document.location.pathname.includes('/s/')) {
    document.body.style.overflow = 'hidden';
    let element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.height = '100%';
    element.style.width = '100%';
    element.style.transition = "all 2s ease";
    element.style.background = '#34353b';
    element.style.zIndex = '10';
    element.style.top = "-100%";
    element.classList = "vue-container";
    let i1 = document.getElementById('i1');

    let vue = document.createElement('div');
    vue.setAttribute('id', 'app');
    element.appendChild(vue);

    document.body.insertBefore(element, i1);

    setTimeout(() => {
        element.style.top = "0";
    }, 0);

    // let info = {};
    // info.title = document.getElementsByTagName('h1')[0].textContent;
    // let i2 = document.getElementById('i2');
    // info.curPage = i2.getElementsByTagName('span')[0].textContent;
    // info.sumOfPage = i2.getElementsByTagName('span')[1].textContent;
    // let tmpPic = i2.children[1].textContent.split('::')[1].split('x');
    // info.picSize = { width: tmpPic[0].trim(), height: tmpPic[1].trim() };
    // info.img = {
    //   size: { width: tmpPic[0].trim(), height: tmpPic[1].trim() },
    //   url: document.getElementById('img').getAttribute('src'),
    //   original: document.getElementById('i7').children.length > 0 ?
    //     document.getElementById('i7').children[1].getAttribute('href') : ''
    // }
    // info.introUrl = document.getElementsByClassName('sb')[0].children[0].getAttribute('href').replace(/^.*?org/g, '').replace(/\?p=.*?$/g, '');
    // info.id = info.introUrl.split('/')[2];
    // info.picUrlPattern = window.location.pathname.replace(/-.*$/g, '');
    // window.info = info;
    // console.log(window.info);
}


if (document.getElementsByClassName('vue-container').length > 0) {
    const app = new Vue({
        store,
        render: (h) => h(App)
    }).$mount('#app');
}

const hello = () => console.log('Hello! I am eHunter');

hello();