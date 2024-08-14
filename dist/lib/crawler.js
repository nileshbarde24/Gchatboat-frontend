import * as cheerio from 'cheerio';
import Crawler from 'crawler';
import { stderr } from 'node:process';
import resolveURL from '../utils/resolveURL.js';
/* The WebCrawler class is a TypeScript implementation of a web crawler that can extract text from web
pages and follow links to crawl more pages. */
class WebCrawler {
    constructor(urls, progressCallback, selector = 'body', limit = 20, textLengthMinimum = 200) {
        Object.defineProperty(this, "pages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "limit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "urls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "count", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textLengthMinimum", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "selector", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "progressCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "crawler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /* `handleRequest` is a method that handles the response of a web page request made by the `crawler`
      object. It takes in three parameters: `error`, `res`, and `done`. */
        Object.defineProperty(this, "handleRequest", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (error, res, done) => {
                if (error) {
                    stderr.write(error.message);
                    done();
                    return;
                }
                const $ = cheerio.load(res.body);
                // Remove obviously superfluous elements
                $('script').remove();
                $('header').remove();
                $('nav').remove();
                $('style').remove();
                $('img').remove();
                $('svg').remove();
                const title = $('title').text() || '';
                const text = $(this.selector).text();
                // const text = turndownService.turndown(html || '');
                const page = {
                    url: res.request.uri.href,
                    text,
                    title,
                };
                if (text.length > this.textLengthMinimum) {
                    this.pages.push(page);
                    this.progressCallback(this.count + 1, this.pages.length, res.request.uri.href);
                }
                $('a').each((_i, elem) => {
                    if (this.count >= this.limit) {
                        return false; // Stop iterating once the limit is reached
                    }
                    const href = $(elem).attr('href')?.split('#')[0];
                    const uri = res.request.uri.href;
                    const url = href && resolveURL(uri, href);
                    // crawl more
                    if (url && this.urls.some((u) => url.includes(u))) {
                        this.crawler.queue(url);
                        this.count += 1;
                    }
                    return true; // Continue iterating when the limit is not reached
                });
                done();
            }
        });
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async () => {
                this.pages = [];
                return new Promise((resolve) => {
                    this.crawler.on('drain', () => {
                        resolve(this.pages);
                    });
                    this.urls.forEach((url) => {
                        this.crawler.queue(url);
                    });
                });
            }
        });
        this.urls = urls;
        this.selector = selector;
        this.limit = limit;
        this.textLengthMinimum = textLengthMinimum;
        this.progressCallback = progressCallback;
        this.count = 0;
        this.pages = [];
        this.crawler = new Crawler({
            maxConnections: 10,
            callback: this.handleRequest,
            userAgent: 'node-crawler',
        });
    }
}
export default WebCrawler;
//# sourceMappingURL=crawler.js.map