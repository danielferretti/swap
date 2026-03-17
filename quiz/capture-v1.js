const puppeteer = require('puppeteer');
const path = require('path');

const WIDTH = 390;
const HEIGHT = 844;
const DEVICE_SCALE = 2;

const FILE_URL = 'file://' + path.resolve(__dirname, 'franq-quiz.html');
const OUT_DIR = path.resolve(__dirname, 'screenshots');

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: DEVICE_SCALE });

  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for splash to finish and login to appear
  await delay(4000);

  // Fill login and enter
  await page.evaluate(() => {
    const nameInput = document.getElementById('loginName') || document.querySelector('input[placeholder*="nome"]') || document.querySelector('input');
    if (nameInput) { nameInput.value = 'Daniel Ferretti'; nameInput.dispatchEvent(new Event('input')); }
    const roleInput = document.getElementById('loginRole') || document.querySelectorAll('input')[1];
    if (roleInput) { roleInput.value = 'Personal Banker'; roleInput.dispatchEvent(new Event('input')); }
  });
  await delay(300);

  // Click login button
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.toUpperCase().includes('ENTRAR') || b.textContent.includes('Jogar') || b.textContent.includes('LOGIN')) {
        b.click(); break;
      }
    }
  });
  await delay(1500);

  // Capture the home screen
  await page.screenshot({ path: path.join(OUT_DIR, 'v1-home.png'), fullPage: false });
  console.log('✓ v1-home.png');

  await browser.close();
})();
