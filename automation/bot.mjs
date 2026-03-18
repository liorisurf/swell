/**
 * SWELL Instagram Automation Bot
 *
 * A standalone Playwright-based bot that automates Instagram likes and follows.
 * Reads configuration from automation/.env
 *
 * Usage: node bot.mjs
 * Stop:  Ctrl+C
 */

import { chromium } from 'playwright';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env') });

// ── Configuration ──────────────────────────────────────────────────────────
const CONFIG = {
  username: process.env.IG_USERNAME || '',
  password: process.env.IG_PASSWORD || '',
  maxLikesPerDay: parseInt(process.env.MAX_LIKES_PER_DAY || '20', 10),
  maxFollowsPerDay: parseInt(process.env.MAX_FOLLOWS_PER_DAY || '10', 10),
  targetHashtags: (process.env.TARGET_HASHTAGS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean),
  targetAccounts: (process.env.TARGET_ACCOUNTS || '')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean),
  minDelay: parseInt(process.env.MIN_DELAY || '30', 10) * 1000,
  maxDelay: parseInt(process.env.MAX_DELAY || '120', 10) * 1000,
};

// ── State ──────────────────────────────────────────────────────────────────
let likesToday = 0;
let followsToday = 0;
let isRunning = true;
let rateLimited = false;

// ── Helpers ────────────────────────────────────────────────────────────────
function log(type, message) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const prefix = {
    info: '\x1b[36m[INFO]\x1b[0m',
    like: '\x1b[35m[LIKE]\x1b[0m',
    follow: '\x1b[34m[FOLLOW]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
    warn: '\x1b[33m[WARN]\x1b[0m',
  };
  console.log(`${ts} ${prefix[type] || '[LOG]'} ${message}`);
}

function randomDelay() {
  return CONFIG.minDelay + Math.random() * (CONFIG.maxDelay - CONFIG.minDelay);
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function humanDelay() {
  const delay = randomDelay();
  log('info', `Waiting ${(delay / 1000).toFixed(0)}s before next action...`);
  await sleep(delay);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Instagram Login ────────────────────────────────────────────────────────
async function login(page) {
  log('info', `Logging in as @${CONFIG.username}...`);
  await page.goto('https://www.instagram.com/accounts/login/', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });

  // Wait for login form
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });

  // Type credentials with human-like delays
  await page.fill('input[name="username"]', '');
  await page.type('input[name="username"]', CONFIG.username, { delay: 80 + Math.random() * 60 });
  await sleep(500 + Math.random() * 500);

  await page.fill('input[name="password"]', '');
  await page.type('input[name="password"]', CONFIG.password, { delay: 80 + Math.random() * 60 });
  await sleep(800 + Math.random() * 500);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation or challenge
  try {
    await page.waitForURL('**/instagram.com/**', { timeout: 30000 });
  } catch {
    // May be on a challenge page
  }

  // Check for challenge/checkpoint
  const url = page.url();
  if (url.includes('challenge') || url.includes('checkpoint')) {
    log('warn', 'Instagram challenge detected! Please complete verification manually in the browser.');
    log('warn', 'The bot will wait up to 5 minutes for you to complete the challenge...');

    // Wait for user to manually complete the challenge
    try {
      await page.waitForURL('**/instagram.com/', { timeout: 300000 });
      log('info', 'Challenge completed successfully!');
    } catch {
      log('error', 'Challenge not completed in time. Exiting.');
      throw new Error('Challenge timeout');
    }
  }

  // Handle "Save Your Login Info" popup
  try {
    const notNowBtn = page.locator('button:has-text("Not Now"), div[role="button"]:has-text("Not Now")');
    if (await notNowBtn.first().isVisible({ timeout: 5000 })) {
      await notNowBtn.first().click();
      await sleep(1000);
    }
  } catch {}

  // Handle "Turn on Notifications" popup
  try {
    const notNowBtn = page.locator('button:has-text("Not Now")');
    if (await notNowBtn.first().isVisible({ timeout: 5000 })) {
      await notNowBtn.first().click();
      await sleep(1000);
    }
  } catch {}

  log('info', 'Login successful!');
}

// ── Check for rate limiting ────────────────────────────────────────────────
async function checkRateLimiting(page) {
  const content = await page.content();
  if (
    content.includes('Action Blocked') ||
    content.includes('action was blocked') ||
    content.includes('Try Again Later') ||
    content.includes('temporarily blocked')
  ) {
    log('error', 'RATE LIMITED! Instagram has blocked actions. Stopping bot.');
    rateLimited = true;
    return true;
  }
  return false;
}

// ── Like posts from hashtags ───────────────────────────────────────────────
async function likeHashtagPosts(page) {
  if (CONFIG.targetHashtags.length === 0) {
    log('info', 'No target hashtags configured. Skipping likes.');
    return;
  }

  const hashtags = shuffleArray(CONFIG.targetHashtags);

  for (const hashtag of hashtags) {
    if (!isRunning || rateLimited) break;
    if (likesToday >= CONFIG.maxLikesPerDay) {
      log('info', `Daily like limit reached (${likesToday}/${CONFIG.maxLikesPerDay})`);
      break;
    }

    log('info', `Browsing hashtag #${hashtag}...`);

    try {
      await page.goto(`https://www.instagram.com/explore/tags/${hashtag}/`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      await sleep(2000 + Math.random() * 2000);

      if (await checkRateLimiting(page)) return;

      // Click on the first "Recent" post (or top posts)
      const posts = page.locator('article a[href*="/p/"]');
      const postCount = await posts.count();

      if (postCount === 0) {
        log('warn', `No posts found for #${hashtag}`);
        continue;
      }

      // Like up to 3 posts per hashtag
      const maxPerHashtag = Math.min(3, postCount, CONFIG.maxLikesPerDay - likesToday);

      for (let i = 0; i < maxPerHashtag; i++) {
        if (!isRunning || rateLimited) break;
        if (likesToday >= CONFIG.maxLikesPerDay) break;

        try {
          // Click a post to open it
          await posts.nth(i + 3).click(); // Skip first 3 (top posts), go to recent
          await sleep(2000 + Math.random() * 1500);

          if (await checkRateLimiting(page)) return;

          // Look for the like button (heart icon that is not already liked)
          const likeButton = page.locator(
            'section span button svg[aria-label="Like"], ' +
            'section button svg[aria-label="Like"], ' +
            'span[class*="like"] button svg[aria-label="Like"]'
          ).first();

          if (await likeButton.isVisible({ timeout: 3000 })) {
            await likeButton.click();
            likesToday++;
            log('like', `Liked post from #${hashtag} (${likesToday}/${CONFIG.maxLikesPerDay} today)`);
            await sleep(1000 + Math.random() * 1000);
          } else {
            log('info', 'Post already liked or like button not found. Skipping.');
          }

          // Close the post modal
          try {
            const closeBtn = page.locator('svg[aria-label="Close"]').first();
            if (await closeBtn.isVisible({ timeout: 2000 })) {
              await closeBtn.click();
              await sleep(1000);
            } else {
              await page.goBack();
              await sleep(2000);
            }
          } catch {
            await page.goBack();
            await sleep(2000);
          }

          await humanDelay();
        } catch (err) {
          log('error', `Error liking post: ${err.message}`);
          // Try to recover by going back
          try {
            await page.goto(`https://www.instagram.com/explore/tags/${hashtag}/`, {
              waitUntil: 'networkidle',
              timeout: 15000,
            });
          } catch {}
        }
      }
    } catch (err) {
      log('error', `Error browsing #${hashtag}: ${err.message}`);
    }

    await humanDelay();
  }
}

// ── Follow users from target accounts ──────────────────────────────────────
async function followFromAccounts(page) {
  if (CONFIG.targetAccounts.length === 0) {
    log('info', 'No target accounts configured. Skipping follows.');
    return;
  }

  const accounts = shuffleArray(CONFIG.targetAccounts);

  for (const account of accounts) {
    if (!isRunning || rateLimited) break;
    if (followsToday >= CONFIG.maxFollowsPerDay) {
      log('info', `Daily follow limit reached (${followsToday}/${CONFIG.maxFollowsPerDay})`);
      break;
    }

    log('info', `Visiting @${account}'s followers...`);

    try {
      // Navigate to account profile
      await page.goto(`https://www.instagram.com/${account}/`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      await sleep(2000 + Math.random() * 2000);

      if (await checkRateLimiting(page)) return;

      // Click on followers link
      const followersLink = page.locator(`a[href="/${account}/followers/"]`);
      if (!(await followersLink.isVisible({ timeout: 5000 }))) {
        log('warn', `Cannot access followers of @${account}. Account may be private.`);
        continue;
      }

      await followersLink.click();
      await sleep(3000 + Math.random() * 2000);

      // Wait for followers dialog
      const dialog = page.locator('div[role="dialog"]');
      if (!(await dialog.isVisible({ timeout: 5000 }))) {
        log('warn', 'Followers dialog did not appear.');
        continue;
      }

      // Find follow buttons in the dialog
      const followButtons = dialog.locator('button:has-text("Follow"):not(:has-text("Following"))');
      const btnCount = await followButtons.count();

      if (btnCount === 0) {
        log('warn', `No followable users found in @${account}'s followers.`);
        // Close dialog
        try {
          const closeBtn = page.locator('svg[aria-label="Close"]').first();
          if (await closeBtn.isVisible({ timeout: 2000 })) {
            await closeBtn.click();
          }
        } catch {}
        continue;
      }

      const maxPerAccount = Math.min(3, btnCount, CONFIG.maxFollowsPerDay - followsToday);

      for (let i = 0; i < maxPerAccount; i++) {
        if (!isRunning || rateLimited) break;
        if (followsToday >= CONFIG.maxFollowsPerDay) break;

        try {
          const btn = followButtons.nth(i);
          if (await btn.isVisible({ timeout: 2000 })) {
            await btn.click();
            followsToday++;
            log('follow', `Followed a user from @${account}'s followers (${followsToday}/${CONFIG.maxFollowsPerDay} today)`);
            await sleep(1000 + Math.random() * 1000);

            if (await checkRateLimiting(page)) return;
          }
        } catch (err) {
          log('error', `Error following user: ${err.message}`);
        }

        await humanDelay();
      }

      // Close followers dialog
      try {
        const closeBtn = page.locator('svg[aria-label="Close"]').first();
        if (await closeBtn.isVisible({ timeout: 2000 })) {
          await closeBtn.click();
          await sleep(1000);
        }
      } catch {}
    } catch (err) {
      log('error', `Error processing @${account}: ${err.message}`);
    }

    await humanDelay();
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  // Validate config
  if (!CONFIG.username || !CONFIG.password) {
    log('error', 'Missing IG_USERNAME or IG_PASSWORD in .env file!');
    process.exit(1);
  }

  if (CONFIG.targetHashtags.length === 0 && CONFIG.targetAccounts.length === 0) {
    log('error', 'No TARGET_HASHTAGS or TARGET_ACCOUNTS configured. Nothing to do.');
    process.exit(1);
  }

  log('info', '=== SWELL Instagram Automation Bot ===');
  log('info', `Account: @${CONFIG.username}`);
  log('info', `Limits: ${CONFIG.maxLikesPerDay} likes/day, ${CONFIG.maxFollowsPerDay} follows/day`);
  log('info', `Hashtags: ${CONFIG.targetHashtags.join(', ') || 'none'}`);
  log('info', `Target accounts: ${CONFIG.targetAccounts.join(', ') || 'none'}`);
  log('info', `Delay: ${CONFIG.minDelay / 1000}s - ${CONFIG.maxDelay / 1000}s`);
  log('info', '');

  const browser = await chromium.launch({
    headless: false, // Visible browser so user can see what's happening
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
    ],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });

  // Remove webdriver detection
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const page = await context.newPage();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    log('info', '\nShutting down gracefully...');
    isRunning = false;
    await sleep(2000);
    await browser.close();
    log('info', `Session summary: ${likesToday} likes, ${followsToday} follows`);
    process.exit(0);
  });

  try {
    await login(page);

    log('info', 'Starting automation loop...');
    log('info', '');

    // Main automation loop
    while (isRunning && !rateLimited) {
      // Check if we've hit all daily limits
      if (
        likesToday >= CONFIG.maxLikesPerDay &&
        followsToday >= CONFIG.maxFollowsPerDay
      ) {
        log('info', 'All daily limits reached. Bot will stop.');
        break;
      }

      // Alternate between liking and following
      if (likesToday < CONFIG.maxLikesPerDay) {
        await likeHashtagPosts(page);
      }

      if (!isRunning || rateLimited) break;

      if (followsToday < CONFIG.maxFollowsPerDay) {
        await followFromAccounts(page);
      }

      if (!isRunning || rateLimited) break;

      // Long pause between full cycles (5-15 minutes)
      if (
        likesToday < CONFIG.maxLikesPerDay ||
        followsToday < CONFIG.maxFollowsPerDay
      ) {
        const pauseMs = 300000 + Math.random() * 600000; // 5-15 min
        log('info', `Cycle complete. Pausing for ${(pauseMs / 60000).toFixed(1)} minutes before next cycle...`);
        await sleep(pauseMs);
      }
    }

    if (rateLimited) {
      log('error', 'Bot stopped due to rate limiting. Wait several hours before retrying.');
    }
  } catch (err) {
    log('error', `Fatal error: ${err.message}`);
  } finally {
    log('info', `Session summary: ${likesToday} likes, ${followsToday} follows`);
    await browser.close();
  }
}

main().catch((err) => {
  log('error', `Unhandled error: ${err.message}`);
  process.exit(1);
});
