// get img page urls from manga intro page
import ReqQueueService from 'src/service/request/ReqQueueService.js'
import IntroHtmlParser from './IntroHtmlParser.js'

class ImgUrlListParser {
    constructor(introUrl, sumOfImgPage) {
        this.introUrl = introUrl;
        this.introHtmls = {};
        this.FirstPage = {};
        this.ThumbSumPerPage = 40;
        this.sumOfIntroPage = this._getSumOfIntroPage(sumOfImgPage);
        this.introPageUrls = this._getIntroPageUrls();
        console.log(sumOfImgPage);
    }

    request() {
        return new Promise((resolve, reject) => {
            this._request(resolve, reject);
        });
    }

    _getSumOfIntroPage(sumOfImgPage) {
        // 40 is the thumb sum per intro page when small thumb model
        if (sumOfImgPage < 40) {
            return 1;
        }
        let reminder = sumOfImgPage % 40;
        if (reminder > 1) {
            return (sumOfImgPage - reminder) / 40 + 1;
        } else {
            return sumOfImgPage / 40;
        }
    }

    _getIntroPageUrls() {
        let urls = [];
        for (let i = 0; i < this.sumOfIntroPage; i++) {
            urls.push(`${this.introUrl}?p=${i}`);
        }
        return urls;
    }

    _request(resolve, reject) {
        (new ReqQueueService(this.introPageUrls))
            .request()
            .then(map => {
                let result = this.introPageUrls.reduce((imgUrls, introUrl) =>
                    imgUrls = imgUrls.concat(new IntroHtmlParser(map.get(introUrl)).getImgUrls()), []);
                resolve(result);
            }, err => {
                reject(err);
                // TODO: show tip for this error
            });
    }



    _initFirstPage() {
        return new Promise((resolve, reject) => {
            (new TextReqService(introUrl))
                .request()
                .then(html => {
                    this.FirstPage.html = document.createElement('html');
                    this.FirstPage.html.innerHTML = html;
                    this.FirstPage.document = html.ownerDocument;
                    resolve();
                }, err => {
                    // TODO: show tip for this err
                });
        });
    }
}

export default ImgUrlListParser;