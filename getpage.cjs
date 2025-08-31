const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);


function randomUA() {
 
  const osList = [
    "Windows NT 10.0; Win64; x64",
    "Macintosh; Intel Mac OS X 10_15_7",
    "X11; Linux x86_64"
  ];
  const os = osList[Math.floor(Math.random() * osList.length)];

 
  const chromeMajor = 115 + Math.floor(Math.random() * 10);
  const chromeMinor = Math.floor(Math.random() * 4000) + 1000;
  const chromeBuild = Math.floor(Math.random() * 100);

 
  const webkitMajor = 537;
  const webkitMinor = 36;

  return `Mozilla/5.0 (${os}) AppleWebKit/${webkitMajor}.${webkitMinor} (KHTML, like Gecko) Chrome/${chromeMajor}.0.${chromeMinor}.${chromeBuild} Safari/${webkitMajor}.${webkitMinor}`;
}

async function pressandhold(page, checkInterval = 200, maxWait = 10000) {
  const start = Date.now();
  let holding = false;

  while (Date.now() - start < maxWait) {
    const element = await page.$('text="Press & Hold"');

    if (element && !holding) {
      // Element appeared → start holding middle button
      const box = await element.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down({ button: 'middle' });
        holding = true;
        console.log("🖱️ Press & Hold started");
      }
    } else if (!element && holding) {
      // Element disappeared → release middle button
      await page.mouse.up({ button: 'middle' });
      console.log("✅ Press & Hold released");
      return true;
    }

    // Small delay between checks
    await page.waitForTimeout(checkInterval);
  }

  // Timeout reached
  if (holding) {
    await page.mouse.up({ button: 'middle' });
    console.log("⚠️ Timeout reached, middle button released anyway");
  } else {
    console.log("⚠️ 'Press & Hold' never appeared");
  }

  return false;
}

async function getpage(url,headless = false,quiet=false) {
  const browser = await chromium.launch({ headless, args: [
    '--disable-blink-features=AutomationControlled'
  ] });

  const userAgent = randomUA()

  const context = await browser.newContext({
    viewport: {
      width: 1280 + Math.floor(Math.random() * 100),
      height: 720 + Math.floor(Math.random() * 100),
    },
    userAgent,
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });
  
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    })
  })
  try {
    await page.goto(url, { timeout: 45000, waitUntil: 'domcontentloaded' });
  } catch (e) {
    console.warn("⚠️ Failed to load page:", url);
    return null;
  }

  if (!quiet) console.log("Browser opened with your session cookie! ("+url+")");
  await pressandhold(page)
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({path: "E:\\Documents\\Best Title Generator\\SCREENS\\"+url.replace("https://www.fiverr.com",'').replace('/','').replace('\\','').replace('?','').replace('=','').slice(0,30)+".png"});

  return page
}

module.exports = getpage