const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

async function getpage(url,headless = False) {
  const browser = await chromium.launch({ headless }); // headed mode reduces detection
  const context = await browser.newContext({
    viewport: {
      width: 1280 + Math.floor(Math.random() * 100),
      height: 720 + Math.floor(Math.random() * 100),
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...', // your real/fake UA
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });
  
  const page = await context.newPage();
  await page.goto(url);

  console.log("Browser opened with your session cookie!");

  return page
}

module.exports = getpage