import { IQueueItem } from "../../types";

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

import { config } from "../environment/config";
import { zproxy } from "../environment/zproxy";
import { scrapeXCompanyInfo } from "./pageParse";

const fs = require("fs");
const path = require("path");

const requeueFailedRequest = async (
  page: any,
  queueItem: any,
  queue: any,
  identifier: any
) => {
  queueItem.tries += 1;
  if (queueItem.tries < config.max_tries) {
    queue.push(queueItem);
    console.log(
      " > Retry " + queueItem.tries + " for " + identifier.identifier
    );
  } else {
    console.log(" > Too many retries for " + identifier.identifier);
  }

  await page.close();
};

async function scrapeXPublicPage(
  browser: any,
  queue: IQueueItem[]
): Promise<void> {
  let username = zproxy.username;
  let password = zproxy.password;

  // Go through every item in the queue and open page in the browser
  while (queue.length > 0) {
    let queueItem: IQueueItem = queue.shift() as IQueueItem;
    console.log(queueItem);
    let identifier = queueItem.identifier;

    // If the identifier in skipped items (explore, business)
    if (config.internal_usernames.includes(identifier.identifier)) continue;

    let page = await browser.newPage();

    // Construct the path to cookies.json using process.cwd()
    const cookiesFilePath = path.join(process.cwd(), "config", "cookies.json");

    // Load cookies if the file exists
    if (fs.existsSync(cookiesFilePath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, "utf8"));
      await page.setCookie(...cookies);
      console.log("// Cookies loaded successfully.");
    } else {
      console.log("// No cookies file found.");
    }

    // Configure the navigation timeout & Interception request
    // await page.setDefaultNavigationTimeout(config.timeout);

    // Speed up navigation by blocking non-essential resources
    await page.setRequestInterception(true);
    page.on("request", (req: any) => {
      if (config.ignore_resource_types.includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    let url: string = config.endpoint + identifier.identifier;

    if (zproxy.enabled) {
      await page.authenticate({ username, password });
      console.log("// Authenticate Bright Data Proxy");
    }

    try {
      await page.goto(url, {
        timeout: config.timeout,
        waitUntil: "networkidle2",
      });
      const companyInfo = await scrapeXCompanyInfo(page);

      console.info(`// Scraped Data: ${JSON.stringify(companyInfo, null, 2)}`);
    } catch (error) {
      console.error("// Error failed to navigate: ", error);

      // Network problem, maybe in China
      if (
        error instanceof Error &&
        (error as Error).message.match(/net::ERR_CONNECTION_RESET/)
      ) {
        console.error("// Error message: ", (error as Error).message);
      } else {
        requeueFailedRequest(page, queueItem, queue, identifier);
      }

      continue;
    }

    await page.close();

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Add delay
  }

  // Closing browser
  await browser.close();
}

export { scrapeXPublicPage };
