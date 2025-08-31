const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

async function getpage(url,headless = false,quiet=false) {
  const browser = await chromium.launch({ headless,args: [
    '--window-position=-32000,-32000',
  ] });
  const context = await browser.newContext({
    viewport: {
      width: 1280 + Math.floor(Math.random() * 100),
      height: 720 + Math.floor(Math.random() * 100),
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });
  
  const page = await context.newPage();
  try {
    await page.goto(url, { timeout: 45000, waitUntil: 'domcontentloaded' });
  } catch (e) {
    console.warn("⚠️ Failed to load page:", url);
    return null;
  }

  if (!quiet) console.log("Browser opened with your session cookie! ("+url+")");

  return page
}

module.exports = getpage