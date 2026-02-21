// get img page urls from album intro page
import { ReqQueue } from '../../base/request/ReqQueue'
import { IntroHtmlParser } from './IntroHtmlParser'
import { ImgPageInfo } from '../../../../core/bean/ImgPageInfo'

export class ImgUrlListParser {
    private introUrl: string;
    private sumOfIntroPage: number;
    private introPageUrls: string[];

    constructor(introUrl, sumOfImgPage) {
        this.introUrl = introUrl;
        this.sumOfIntroPage = 0;
        this.introPageUrls = [];
    }

    async request(): Promise<Array<ImgPageInfo>> {
        let introResultMap = await new ReqQueue([this.introUrl]).request();
        this.sumOfIntroPage = new IntroHtmlParser(introResultMap.get(this.introUrl), this.introUrl).getMaxPageNumber();
        this.introPageUrls = this._getIntroPageUrls();
        let result = await this._request();
        return result
    }


    _getIntroPageUrls(): string[] {
        let urls: string[] = [];
        for (let i = 0; i < this.sumOfIntroPage; i++) {
            urls.push(`${this.introUrl}?p=${i}`);
        }
        return urls;
    }

    async _request(): Promise<Array<ImgPageInfo>> {
        let resultMap = await new ReqQueue(this.introPageUrls).request()    
        let result = this.introPageUrls.reduce((imgUrls, introUrl) => {
            imgUrls = imgUrls.concat(new IntroHtmlParser(resultMap.get(introUrl), introUrl).getImgUrls());
            return imgUrls;
        }, <Array<ImgPageInfo>>[]);
        let index = 0;
        result.forEach(i => {
            i.index = index++
        });
        return result
    }
}
