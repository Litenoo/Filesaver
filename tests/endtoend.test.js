const puppeteer = require('puppeteer');

let browser;
let page;

beforeAll(async ()=>{
    browser = await puppeteer.launch({
        headless:false
    });
    page = await browser.newPage();
});

afterAll(async ()=>{
    await browser.close();
});

describe('testing the explorer functions', ()=>{
    test('There is possible to login and go to "Your Files"', async ()=>{
        await page.goto('http://localhost:3000/login');
        
        await page.click('#email');

        await page.type('#email', 'tester@tester');

        await page.click('#password');

        await page.type('#password', 'tester');

        await page.click('#submit');
        await page.waitForNavigation();

        const currentUrl = await page.url();
        const expectedUrl = 'http://localhost:3000';

        if(currentUrl === expectedUrl){
            console.log('successfully redirected to the index site after login');
        }else{
            console.log('failed to redirect to the index site after login');
        }

        await browser.close();
    });
});