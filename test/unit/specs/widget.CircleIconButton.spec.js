import CircleIconButton from '../../../core/components/widget/CircleIconButton'
import { destroyVM, createTest, createVue } from '../util'

describe('widget.CircleIconButton', () => {
    let vm;
    afterEach(() => {
        destroyVM(vm);
    });
    it('create', () => {
        vm = createTest(CircleIconButton, {
            icon: 'menu'
        }, true);
        let buttonElm = vm.$el;
        expect(buttonElm.classList.contains('circle-icon-button')).to.be.true;
    });
    it('menu_icon', () => {
        vm = createTest(CircleIconButton, {
            icon: 'menu'
        }, true);
        let buttonElm = vm.$el;
        expect(buttonElm.querySelectorAll('path')[1].attributes['d'].value).to.be.equal('M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z');
    });
    it('close_icon', () => {
        vm = createTest(CircleIconButton, {
            icon: 'close'
        }, true);
        let buttonElm = vm.$el;
        expect(buttonElm.querySelectorAll('path')[1].attributes['d'].value).to.be.equal('M0 0h24v24H0z');
    });
    it('rotate', () => {
        vm = createTest(CircleIconButton, {
            icon: 'close',
            rotate: true
        }, true);
        let buttonElm = vm.$el;
        expect(buttonElm.querySelector('svg').classList.contains('rotate')).to.be.true;
    });
    it('click', done => {
        let result;
        vm = createVue({
            template: `
                <circle-icon-button @click="handleClick"></circle-icon-button>
            `,
            methods: {
                handleClick(evt) {
                    result = evt;
                }
            },
            components: { CircleIconButton }
        }, true);
        vm.$el.click();
        setTimeout(_ => {
            expect(result).to.exist;
            done();
        }, 20);
    });
});

