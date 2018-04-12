import { AlbumService } from '../../../src/service/AlbumService';
import { AlbumCacheService } from '../../../src/service/storage/AlbumCacheService';
import * as tags from '../../../src/assets/value/tags';

describe('service.AlbumService', () => {
    let as;
    before(async function () {
        this.timeout(10000);
        let timer = setTimeout(() => console.error('Cannot connect to e-hentai'), 9500);
        let html = await (await window.fetch('https://e-hentai.org/s/0bb62690b8/1183176-1')).text();
        window.clearTimeout(timer);
        as = new AlbumService(html);
    });
    it('getPageCount', () => {
        expect(as.getPageCount()).to.be.equals(284);
    });
    it('getPageCount', () => {
        expect(as.getBookScreenCount(2)).to.be.equals(143);
    });
    it('getIntroUrl', () => {
        expect(as.getIntroUrl()).to.be.equals('https://e-hentai.org/g/1183176/e6c9e01507/');
    });
    it('setIntroUrl', () => {
        as.setIntroUrl('/123/');
        expect(as.getIntroUrl()).to.be.equals('/123/');
        as.setIntroUrl('https://e-hentai.org/g/1183176/e6c9e01507/');
    });
    it('getAlbumId', () => {
        expect(as.getAlbumId()).to.be.equals('1183176');
    });
    it('getCurPageNum', () => {
        expect(as.getCurPageNum()).to.be.equals(1);
    });
    it('getTitle', () => {
        expect(as.getTitle()).to.be.equals('The Secret of Mobile Suit Development II U.C.0079');
    });
    it('getCacheService', () => {
        expect(as.getCacheService()).to.be.an.instanceof(AlbumCacheService);
    });
    it('getImgInfos', async function () {
        this.timeout(10000);
        let imgInfos = await as.getImgInfos();
        expect(imgInfos).to.have.lengthOf(as.getPageCount());
        imgInfos.forEach(i => {
            expect(i).to.have.property('pageUrl').which.is.a('string').and.not.empty;
            expect(i).to.have.property('src').which.is.a('string');
            expect(i).to.have.property('thumbHeight').which.is.a('number').and.above(0);
            expect(i).to.have.property('thumbWidth').which.is.a('number').and.above(0);
            expect(i).to.have.property('heightOfWidth').which.is.a('number').and.above(0);
        })
    });
    it('getImgInfo', async () => {
        for (let i = 0; i < as.getPageCount(); i++) {
            let imgInfo = await as.getImgInfo(i);
            expect(imgInfo).to.have.property('pageUrl').which.is.a('string').and.not.empty;
            expect(imgInfo).to.have.property('src').which.is.a('string');
            expect(imgInfo).to.have.property('thumbHeight').which.is.a('number').and.above(0);
            expect(imgInfo).to.have.property('thumbWidth').which.is.a('number').and.above(0);
            expect(imgInfo).to.have.property('heightOfWidth').which.is.a('number').and.above(0);
        }
    });
    it('getImgSrc', async function () {
        this.timeout(10000);
        expect(await as.getImgSrc(0)).to.match(/\.(jpg|png|gif|webp)$/);
        expect(await as.getImgSrc(1, tags.MODE_ORIGIN)).to.match(/^https:\/\/e-hentai.org\/fullimg\.php/);
        expect(await as.getImgSrc(2, tags.MODE_CHANGE_SOURCE)).to.match(/\.(jpg|png|gif|webp)$/);
    });
    it('getNewImgSrc', async function () {
        this.timeout(10000);
        let oldSrc = await as.getImgSrc(0);
        expect(await as.getNewImgSrc(0, tags.MODE_CHANGE_SOURCE)).to.match(/\.(jpg|png|gif|webp)$/)
            .and.not.equal(oldSrc);
    });
    it('getThumbs', async function () {
        this.timeout(10000);
        let thumbs = await as.getThumbs();
        expect(thumbs).to.have.lengthOf(as.getPageCount());
        thumbs.forEach(i => {
            expect(i).to.have.property('url').which.is.a('string').and.not.empty;
            expect(i).to.have.property('offset').which.is.a('number').and.least(0);
        });
        thumbs = await as.getThumbs(false);
        expect(thumbs).to.have.lengthOf(as.getPageCount());
        thumbs.forEach(i => {
            expect(i).to.have.property('url').which.is.a('string').and.not.empty;
            expect(i).to.have.property('offset').which.is.a('number').and.least(0);
        });
    });
    it('getThumb', async function () {
        this.timeout(10000);
        let thumb = await as.getThumb(0);
        expect(thumb).to.have.property('url').which.is.a('string').and.not.empty;
        expect(thumb).to.have.property('offset').which.is.a('number').and.least(0);
    });
    it('getPreviewThumbnailStyle', async function () {
        let style = as.getPreviewThumbnailStyle(1, await as.getImgInfo(1), await as.getThumb(1));
        expect(style).to.have.property('background-image').which.match(/url\(.+\.(jpg|png|gif|webp)\)$/);
        expect(style).to.have.property('background-position').which.match(/^(\d|\.)+% \d+/);
        expect(style).to.have.property('background-size').which.match(/^(\d|\.)+%/);
    });
    it('getRealCurIndex', async function () {
        expect(as.getRealCurIndex({ val: 0, updater: tags.SCROLL_VIEW }))
            .to.have.property('val', 0);
        expect(as.getRealCurIndex({ val: as.getPageCount() - 2, updater: tags.SCROLL_VIEW }))
            .to.have.property('val', as.getPageCount() - 2);
        expect(as.getRealCurIndex({ val: as.getPageCount(), updater: tags.SCROLL_VIEW }))
            .to.have.property('val', as.getPageCount() - 1);
    })
});
