import Crawler, { CrawlerRequestResponse } from 'crawler';
type ProgressCallback = (linksFound: number, linksCrawled: number, currentUrl: string) => void;
interface Page {
    url: string;
    text: string;
    title: string;
}
declare class WebCrawler {
    pages: Page[];
    limit: number;
    urls: string[];
    count: number;
    textLengthMinimum: number;
    selector: string;
    progressCallback: ProgressCallback;
    crawler: Crawler;
    constructor(urls: string[], progressCallback: ProgressCallback, selector?: string, limit?: number, textLengthMinimum?: number);
    handleRequest: (error: Error | null, res: CrawlerRequestResponse, done: () => void) => void;
    start: () => Promise<unknown>;
}
export default WebCrawler;
