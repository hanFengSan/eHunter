export default class BaseAlbumService {
    getPageCount() {}
    getCurPageNum() {}
    getTitle() {}
    getImgInfos() {}
    async getImgInfo(index) {}
    getImgSrc(index, mode) {}
    getThumbs(cache = true) {}
    async getThumb(index) {}
    getPreviewThumbnailStyle(index, imgInfo, thumb) {}
    getRealCurIndex(index) {}
}
