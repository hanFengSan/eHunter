import Vue from 'vue'
import HelloWorld from 'src/components/HelloWorld'

describe('HelloWorld.vue', function() {
    it('should render correct contents', function() {
        var Constructor = Vue.extend(HelloWorld)
        var vm = new Constructor().$mount()
        expect(vm.$el.querySelector('.hello h1').textContent)
            .to.equal('Welcome to Your Vue.js App')
    })
})
