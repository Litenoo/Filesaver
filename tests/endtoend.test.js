const puppeteer = require('puppeteer');
const forms = require('../forms.json');

let browser;
let page;

beforeAll(async () => {
    browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-features=site-per-process'],
        slowMo: 15,
    });
    page = await browser.newPage();
    page.setDefaultTimeout('30000');
});

afterAll(async () => {
    await browser.close();
});

describe('testing the explorer functions', () => {
    test('There is possible to login and go to "Your Files"', async () => {
        try {
            await page.goto('http://localhost:3000/login');

            await page.click('#email');
            await page.type('#email', 'tester@tester');
            await page.click('#password');
            await page.type('#password', 'tester');
            await page.click('#submit');

            let currentUrl = await page.url();
            let expectedUrl = 'http://localhost:3000/';

            if (currentUrl !== expectedUrl) {
                console.log('failed to redirect to the index site after login');
            } else {
                console.log('successfully redirected to the index site after login');
            }

            page.click('#gotoFiles');
            await page.waitForNavigation();

            expectedUrl = 'http://localhost:3000/fileMenager?';
            currentUrl = await page.url();

            if (currentUrl !== expectedUrl) {
                console.log('gotoFiles btn doesnt work');
            } else {
                console.log('gotoFiles btn works');
            }


        } catch (err) {
            console.error(err);
        }
    }, 12000);

    test('Testing options buttons', async () => {

        try {
            await page.waitForSelector('.option');
            const options = await page.$$('.option');
            expect(options.length).toBe(3);

            await page.click('#upload');
            let element = await page.$$('#filename');
            if (!element) {
                console.throw(new Error('there is no form dispalyed'));
            }

            await page.click('#newFolder');
            element = await page.$$('#newFolderForm');
            if (!element) {
                console.throw(new Error('there is no form dispalyed'));
            }

            await page.click('#delete');
            element = await page.$$('#filesToDel');
            if (!element) {
                console.throw(new Error('there is no form dispalyed'));
            }
        } catch (err) {
            console.error(err);
        }
    }, 12000)
});
