const puppeteer = require('puppeteer');
const path = require('path');

const WIDTH = 390;
const HEIGHT = 844;
const DEVICE_SCALE = 2; // Retina 2x for crisp screenshots

const FILE_URL = 'file://' + path.resolve(__dirname, 'franq-quiz-v3.html');
const OUT_DIR = path.resolve(__dirname, 'screenshots');

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: DEVICE_SCALE });

  // Go to the app
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // 1. SPLASH — capture quickly before it transitions
  await delay(500);
  await page.screenshot({ path: path.join(OUT_DIR, '01-splash.png'), fullPage: false });
  console.log('✓ 01-splash.png');

  // Wait for splash to finish (it auto-transitions after ~2.5s)
  await delay(3000);

  // 2. LOGIN
  await page.screenshot({ path: path.join(OUT_DIR, '02-login.png'), fullPage: false });
  console.log('✓ 02-login.png');

  // Fill in login and submit
  await page.type('#loginName', 'Daniel Ferretti');
  await page.evaluate(() => {
    const roleInput = document.getElementById('loginRole');
    if (roleInput) roleInput.value = 'Personal Banker';
  });
  await delay(300);

  // Click the login button
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.includes('ENTRAR') || b.textContent.includes('Entrar')) {
        b.click();
        break;
      }
    }
  });
  await delay(1000);

  // Skip tutorial if it shows up
  for (let i = 0; i < 5; i++) {
    const tutBtn = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const b of btns) {
        const txt = b.textContent.trim();
        if (txt === 'Próximo' || txt === 'Proximo' || txt.includes('Vamos') || txt.includes('jogar')) {
          b.click();
          return true;
        }
      }
      return false;
    });
    if (tutBtn) await delay(400);
    else break;
  }
  await delay(500);

  // 3. HOME
  await page.screenshot({ path: path.join(OUT_DIR, '03-home.png'), fullPage: false });
  console.log('✓ 03-home.png');

  // 4. TOPICS — click on the Topics nav tab
  await page.evaluate(() => {
    const navItems = document.querySelectorAll('.nav-item, [onclick*="topics"]');
    for (const n of navItems) {
      const txt = n.textContent.toLowerCase();
      if (txt.includes('tópico') || txt.includes('topico') || txt.includes('topics')) {
        n.click();
        break;
      }
    }
    // Fallback: try showScreen
    if (typeof showScreen === 'function') showScreen('topics');
  });
  await delay(800);
  await page.screenshot({ path: path.join(OUT_DIR, '04-topics.png'), fullPage: false });
  console.log('✓ 04-topics.png');

  // 5. MATCHMAKING — click on a topic to start a match
  await page.evaluate(() => {
    const tiles = document.querySelectorAll('.topic-tile, .topic-card, [onclick*="startMatch"]');
    if (tiles.length > 0) tiles[0].click();
    else if (typeof startMatch === 'function') startMatch('mercado');
  });
  await delay(800);
  await page.screenshot({ path: path.join(OUT_DIR, '05-matchmaking-search.png'), fullPage: false });
  console.log('✓ 05-matchmaking-search.png');

  // Wait for opponent reveal
  await delay(2500);
  await page.screenshot({ path: path.join(OUT_DIR, '06-matchmaking-found.png'), fullPage: false });
  console.log('✓ 06-matchmaking-found.png');

  // Wait for countdown + game start
  await delay(5000);

  // 7. GAMEPLAY
  await page.screenshot({ path: path.join(OUT_DIR, '07-gameplay.png'), fullPage: false });
  console.log('✓ 07-gameplay.png');

  // Play through 5 rounds (select first visible answer each time)
  for (let round = 0; round < 5; round++) {
    await delay(500);
    // Click an answer
    await page.evaluate(() => {
      const answers = document.querySelectorAll('.answer-btn:not(.removed):not(.dimmed)');
      if (answers.length > 0) answers[0].click();
    });
    // Wait for explanation + next round transition
    await delay(3000);
  }

  // 8. RESULTS
  await delay(1500);
  await page.screenshot({ path: path.join(OUT_DIR, '08-results.png'), fullPage: false });
  console.log('✓ 08-results.png');

  // Go home
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const b of btns) {
      if (b.textContent.includes('Início') || b.textContent.includes('Inicio')) {
        b.click();
        break;
      }
    }
    if (typeof showScreen === 'function') showScreen('home');
  });
  await delay(800);

  // 9. LEADERBOARD
  await page.evaluate(() => {
    const navItems = document.querySelectorAll('.nav-item, [onclick*="leaderboard"]');
    for (const n of navItems) {
      const txt = n.textContent.toLowerCase();
      if (txt.includes('ranking') || txt.includes('leader')) {
        n.click();
        break;
      }
    }
    if (typeof showScreen === 'function') showScreen('leaderboard');
  });
  await delay(800);
  await page.screenshot({ path: path.join(OUT_DIR, '09-leaderboard.png'), fullPage: false });
  console.log('✓ 09-leaderboard.png');

  // 10. PROFILE
  await page.evaluate(() => {
    const navItems = document.querySelectorAll('.nav-item, [onclick*="profile"]');
    for (const n of navItems) {
      const txt = n.textContent.toLowerCase();
      if (txt.includes('perfil') || txt.includes('profile')) {
        n.click();
        break;
      }
    }
    if (typeof showScreen === 'function') showScreen('profile');
  });
  await delay(800);
  await page.screenshot({ path: path.join(OUT_DIR, '10-profile.png'), fullPage: false });
  console.log('✓ 10-profile.png');

  // 11. SETTINGS
  await page.evaluate(() => {
    if (typeof showScreen === 'function') showScreen('settings');
    if (typeof renderSettings === 'function') renderSettings();
  });
  await delay(800);
  await page.screenshot({ path: path.join(OUT_DIR, '11-settings.png'), fullPage: false });
  console.log('✓ 11-settings.png');

  await browser.close();
  console.log('\n✅ All screenshots saved to ./screenshots/');
})();
