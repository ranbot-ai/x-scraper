import { IQueueItem } from "../types";
import { scrapeIdentifier } from "./pages/identifiers";
import { scrapeXPublicPage } from "./pages";

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

import { config } from "./environment/config";
import { zproxy } from "./environment/zproxy";
const fs = require("fs-extra");

(async () => {
  console.log(config);

  // Fill up queue
  let queue: IQueueItem[] = await scrapeIdentifier();
  console.log(`>> Queue Size: ${queue.length}`);

  // Start browser
  const userDataDir = `/tmp/chrome-user-data-${Math.floor(
    Math.random() * 100000
  )}`;
  const args = [
    " --user-agent=" + config.user_agent,
    " --disable-background-timer-throttling",
    " --disable-backgrounding-occluded-windows",
    " --disable-renderer-backgrounding",
    " --user-data-dir=" + userDataDir,
    " --devtools=" + config.devtools,
    " --single-process",
    " --no-sandbox",
    " --disable-setuid-sandbox",
    " --disable-web-security",
  ];

  const headless =
    process.env.HEADLESS != null
      ? process.env.HEADLESS === "true"
      : config.headless;

  if (zproxy.enabled) {
    console.log(zproxy);
    args.push(" --proxy-server=" + zproxy.host + ":" + zproxy.port);
    args.push(" --proxy-bypass-list=" + zproxy.bypass_domains.join(";"));
  }

  const browser = await puppeteer.launch({
    headless: headless,
    args: args,
  });

  // Start to scrape X identifiers queues
  if (queue.length === 0) {
    console.log(">> Scraper exiting...");
  } else {
    await scrapeXPublicPage(browser, queue);
  }

  // Delete user data dir
  try {
    await fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        ">> Error clearing user data dir ",
        (error as Error).message
      );
    }
  }
})();
