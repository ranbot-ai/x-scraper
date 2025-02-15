import { IQueueItem } from "../../types";

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

import { config } from "../environment/config";
import { zproxy } from "../environment/zproxy";
import { scrapedLogging } from "../utils/scrapedLogger";

const fs = require("fs");
const path = require("path");

const wrapperWebProfileInfo = (webProfileInfo: any): any => {
  let webInfo = webProfileInfo.data.user;
  if (webInfo) {
    webInfo.not_found = false;
    webInfo.data_source = "web_profile_info";
  }

  return webInfo;
};

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
    await page.setDefaultNavigationTimeout(config.timeout);
    await page.setRequestInterception(true);

    let url: string = config.endpoint + identifier.identifier;
    let data: any;
    let domains: string[] = [];
    let webProfileInfo: any;

    // return JSON response of AJAX response
    //
    //  Request URL: https://x.com/i/api/graphql/{ID}/UserByScreenName?variables=%7B%22screen_name%22%3A%22x%22%7D
    page.on("response", async (response: any) => {
      const request = response.request();
      const requestURL = request.url();
      const headers = response.headers();

      let responseSize = headers["content-length"];
      if (responseSize === undefined || responseSize === "0") {
        return;
      }

      let hostname = new URL(requestURL).hostname;
      if (!domains.includes(hostname)) {
        domains.push(hostname);
      }

      console.error("// GraphQL: ", requestURL);

      if (
        requestURL.includes("/i/api/graphql/") &&
        requestURL.includes("UserByScreenName?variables=") &&
        request.method() === "GET" &&
        response.status() === 200
      ) {
        try {
          console.error("// Start to parse web profile info ...");
          webProfileInfo = await response.json();
        } catch (error: any) {
          console.error("// Profile response interception error: ", error);
        }
      }
    });

    if (zproxy.enabled) {
      await page.authenticate({ username, password });
      console.log("// Authenticate Bright Data Proxy");
    }

    try {
      await page.goto(url, { waitUntil: "networkidle2" });
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

    const currentURL = await page.evaluate(() =>
      decodeURIComponent(document.location.href)
    );

    console.info("// Visiting URL: ", currentURL);

    // Redirect to the login page
    if (currentURL.match(/accounts\/login\//)) {
      let messages = [`Identifier: ${identifier.identifier}`].join(", ");

      scrapedLogging(`// ${messages}`);
      requeueFailedRequest(page, queueItem, queue, identifier);

      continue;
    }

    // Get raw data from Ajax request URL
    if (webProfileInfo) {
      data = wrapperWebProfileInfo(webProfileInfo);
    } else {
      // await page.waitForSelector(mainSectionSelector);
    }

    if (data) {
      if (data.not_found) {
        // Delete existing profiles
      } else {
        delete data["not_found"]; // Remove key not_found from scraper object
        // Save new profiles
      }

      console.log("// X Data: " + JSON.stringify(data, null, 2));
    }
    await page.close();
  }

  // Closing browser
  await browser.close();
}

export { scrapeXPublicPage };
