import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import App from './App.vue'
import routes from './config/routes'
import store from './store'

Vue.use(VueRouter)
Vue.use(VueResource)

const router = new VueRouter({
  routes
})

const app = new Vue({
  router,
  store,
  render: (h) => h(App),
  http: {
    root: '/',
    headers: {}
  },
  events: {
  	showSelector(data, callback) {
  	  console.log('received')
  	}
  }
}).$mount('#app')