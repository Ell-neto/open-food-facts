const puppeteer = require('puppeteer');

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  return browser;
}

module.exports = { launchBrowser };