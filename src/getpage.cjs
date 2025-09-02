// src/getpage.cjs
const fs = require('fs');
const { chromium } = require('playwright');

const realUAs = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.224 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.200 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.89 Safari/537.36",
];

function randomUA() {
  return realUAs[Math.floor(Math.random() * realUAs.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let lastMouse = { x: 100, y: 100 };
async function humanLikeMove(page, targetX, targetY) {
  const steps = randomBetween(25, 45);
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const ease = 1 - Math.pow(1 - t, 3);
    const x = lastMouse.x + (targetX - lastMouse.x) * ease + randomBetween(-1, 1);
    const y = lastMouse.y + (targetY - lastMouse.y) * ease + randomBetween(-1, 1);
    await page.mouse.move(x, y);
    await page.waitForTimeout(randomBetween(5, 20));
    lastMouse = { x, y };
  }
}

async function pressAndHold(page) {
  await page.waitForTimeout(randomBetween(1000, 5000));
  const viewport = page.viewportSize();
  const x = viewport.width * 0.23;
  const y = viewport.height * 0.4;

  await humanLikeMove(page, x, y);
  
  await page.mouse.down({ button: 'left' });
  for (let i = 0; i < randomBetween(5, 12); i++) {
    await page.mouse.move(x + randomBetween(-2, 2), y + randomBetween(-2, 2));
    await page.waitForTimeout(randomBetween(1000, 10000));
  }
  await page.mouse.up({ button: 'left' });
  await page.screenshot({ path: "screenshot/" + Date.now() + ".png" });
}

async function getpage(url, quiet = false) {
  const stateFile = 'state.json';
  const browser = await chromium.launch({
    headless: true, // non-headless so Fiverr sees a real browser
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
  });

  const viewport = {
    width: 1280 + Math.floor(Math.random() * 100),
    height: 720 + Math.floor(Math.random() * 100),
    deviceScaleFactor: Math.random() > 0.5 ? 1 : 2,
  };

  const context = await browser.newContext({
    viewport,
    userAgent: randomUA(),
    locale: 'en-US',
    timezoneId: 'America/New_York',
    storageState: fs.existsSync(stateFile) ? stateFile : undefined,
  });

  const page = await context.newPage();

  // Manual spoofing
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4] });

    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(param) {
      if (param === 37445) return 'Intel Inc.';
      if (param === 37446) return 'Intel Iris OpenGL Engine';
      return getParameter(param);
    };
  });

  try {
    await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
  } catch (e) {
    console.warn("⚠️ Failed to load page:", url);
    return null;
  }

  if (!quiet) console.log(`✅ Browser opened (${url})`);

  // Only run human-like movement if needed for sliders or interaction
  // await pressAndHold(page);

  // Save session for future runs
  await context.storageState({ path: stateFile });

  return page;
}

module.exports = getpage;
