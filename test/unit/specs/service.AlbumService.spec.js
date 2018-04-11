import { AlbumService } from '../../../src/service/AlbumService';
import 'babel-polyfill';

describe('service.AlbumService', () => {
    let html = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
        <head>
        <title>The Secret of Mobile Suit Development II U.C.0079</title>
        <link rel="stylesheet" type="text/css" href="https://exhentai.org/z/0339/x.css" />

        </head>
        <body>
        <div id="i1" class="sni" style="width:1300px"><h1>The Secret of Mobile Suit Development II U.C.0079</h1><div id="i2"><div class="sn"><a onclick="return load_image(1, '0bb62690b8')" href="https://exhentai.org/s/0bb62690b8/1183176-1"><img src="https://exhentai.org/img/f.png" /></a><a id="prev" onclick="return load_image(1, '0bb62690b8')" href="https://exhentai.org/s/0bb62690b8/1183176-1"><img src="https://exhentai.org/img/p.png" /></a><div><span>1</span> / <span>284</span></div><a id="next" onclick="return load_image(2, 'b3ac718987')" href="https://exhentai.org/s/b3ac718987/1183176-2"><img src="https://exhentai.org/img/n.png" /></a><a onclick="return load_image(284, '3875c9174a')" href="https://exhentai.org/s/3875c9174a/1183176-284"><img src="https://exhentai.org/img/l.png" /></a></div><div>_G_4.jpg :: 1280 x 1810 :: 582.3 KB</div></div><div id="i3"><a onclick="return load_image(2, 'b3ac718987')" href="https://exhentai.org/s/b3ac718987/1183176-2"><img id="img" src="http://220.93.198.81:27279/h/030e3c09234f7cf6700e1a29089b6963eca61e0b-596304-1280-1810-jpg/keystamp=1523255400-ef003cecd4;fileindex=58904701;xres=1280/_G_4.jpg" style="width:1280px;height:1810px" onerror="this.onerror=null; nl('14042-423126')" /></a></div><div id="i4"><div>_G_4.jpg :: 1280 x 1810 :: 582.3 KB</div><div class="sn"><a onclick="return load_image(1, '0bb62690b8')" href="https://exhentai.org/s/0bb62690b8/1183176-1"><img src="https://exhentai.org/img/f.png" /></a><a id="prev" onclick="return load_image(1, '0bb62690b8')" href="https://exhentai.org/s/0bb62690b8/1183176-1"><img src="https://exhentai.org/img/p.png" /></a><div><span>1</span> / <span>284</span></div><a id="next" onclick="return load_image(2, 'b3ac718987')" href="https://exhentai.org/s/b3ac718987/1183176-2"><img src="https://exhentai.org/img/n.png" /></a><a onclick="return load_image(284, '3875c9174a')" href="https://exhentai.org/s/3875c9174a/1183176-284"><img src="https://exhentai.org/img/l.png" /></a></div></div><div id="i5"><div class="sb"><a href="https://exhentai.org/g/1183176/e6c9e01507/"><img src="https://exhentai.org/img/b.png" referrerpolicy="no-referrer" /></a></div></div><div id="i6" class="if"> &nbsp; <img src="https://exhentai.org/img/mr.gif" class="mr" /> <a href="https://exhentai.org/?f_shash=0bb62690b8570700a02ec1c6036d6b3e81e0fb72&amp;fs_from=_G_4.jpg+from+The+Secret+of+Mobile+Suit+Development+II+U.C.0079">Show all galleries with this file</a>  &nbsp; <img src="https://exhentai.org/img/mr.gif" class="mr" /> <a href="#" id="loadfail" onclick="return nl('14042-423126')">Click here if the image fails loading</a> </div><div id="i7" class="if"> &nbsp; <img src="https://exhentai.org/img/mr.gif" class="mr" /> <a href="https://exhentai.org/fullimg.php?gid=1183176&amp;page=1&amp;key=d40elnf92hi">Download original 1633 x 2309 1.60 MB source</a></div></div><p class="ip">[<a href="https://exhentai.org/">Front Page</a>]</p><script type="text/javascript">var gid=1183176;var startpage=1;var startkey="0bb62690b8";var showkey="17x5is992hi";var base_url="https://exhentai.org/";var api_url = "https://exhentai.org/api.php";var prl=9999;var si=14042;var xres = 1280;var yres = 1810;</script><script type="text/javascript" src="https://exhentai.org/z/0339/ehg_show.c.js"></script>
        </body>
        </html>
    `;
    // let html;
    before(done => {
        try {
            window.fetch('https://e-hentai.org/s/0bb62690b8/1183176-1')
                .then(res => {
                    console.log(res);
                }, err => {
                    console.log(err);
                })
        } catch (e) {

        }
        done();
    });
    let as = new AlbumService(html);
    it('getPageCount', () => {
        expect(as.getPageCount()).to.be.equals(284);
    });
    it('getPageCount', () => {
        expect(as.getBookScreenCount(2)).to.be.equals(143);
    });
    it('getIntroUrl', () => {
        expect(as.getIntroUrl()).to.be.equals(143);
    });
});
