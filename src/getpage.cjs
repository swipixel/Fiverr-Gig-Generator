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
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function humanLikeMove(page, targetX, targetY) {
  const start = await page.mouse._lastPosition || { x: 100, y: 100 };
  const steps = randomBetween(25, 45);

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
   
    const ease = 1 - Math.pow(1 - t, 3);

    const x = start.x + (targetX - start.x) * ease + randomBetween(-1, 1);
    const y = start.y + (targetY - start.y) * ease + randomBetween(-1, 1);

    await page.mouse.move(x, y);
    await page.waitForTimeout(randomBetween(5, 20));
  }
}

async function pressAndHold(page) {
  
  await page.waitForTimeout(randomBetween(3000, 5000));
  const viewport = page.viewportSize();
  const x = viewport.width*.23;
  const y = viewport.height*.4;

 
  await humanLikeMove(page, x, y);

  await page.screenshot({path: "screenshot/"+Date.now().toString()+".png"})
 
  await page.mouse.down({ button: 'left' });

 
  await page.waitForTimeout(randomBetween(2500, 4200));

 
  for (let i = 0; i < randomBetween(5, 12); i++) {
    await page.mouse.move(
      x + randomBetween(-2, 2),
      y + randomBetween(-2, 2)
    );
    await page.waitForTimeout(randomBetween(50, 150));
  }

  await page.mouse.up({ button: 'left' });
}

async function getpage(url,headless = false,quiet=false) {
  const browser = await chromium.launch({ headless: headless, args: [
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
  await pressAndHold(page)

  return page
}

module.exports = getpage