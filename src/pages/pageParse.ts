import { ICompanyInfo } from "../../types";

async function scrapeXCompanyInfo(
  page: any,
  companyInfo: ICompanyInfo
): Promise<ICompanyInfo> {
  const currentURL = await page.evaluate(() =>
    decodeURIComponent(document.location.href)
  );

  console.info(`// Visiting URL: ${currentURL}`);

  const isLoggedIn = await page.evaluate(() => {
    return !!document.querySelector('a[href="/compose/post"]');
  });

  if (!isLoggedIn) {
    throw new Error("Login failed: Cookies may have expired");
  }

  const jsonLdData = await page.evaluate(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );

    const data = [];
    for (const script of scripts) {
      try {
        const json = JSON.parse(script.innerHTML);
        data.push(json);
      } catch (e) {}
    }
    return data;
  });

  companyInfo.name = await page
    .$eval('div[data-testid="UserName"] div span', (el: any) =>
      el.textContent?.trim()
    )
    .catch(() => undefined);

  companyInfo.pictureUrl = await page
    .$eval('a[href$="/photo"] img', (el: any) =>
      el.src.replace(/&w=\d+&h=\d+/, "")
    )
    .catch(() => undefined);

  const targetData = jsonLdData.find(
    (item: any) =>
      item?.["@type"] === "ProfilePage" &&
      item.mainEntity?.["@type"] === "Person"
  );

  if (targetData) {
    const mainEntity = targetData.mainEntity;

    // 关注数 (Following)
    companyInfo.following = mainEntity.interactionStatistic?.find(
      (item: any) => item.name === "Friends"
    )?.userInteractionCount;

    // 粉丝数 (Followers)
    companyInfo.followers = mainEntity.interactionStatistic?.find(
      (item: any) => item.name === "Follows"
    )?.userInteractionCount;

    companyInfo.dateCreated = targetData.dateCreated;
    companyInfo.description = mainEntity.description;
  }

  if (companyInfo.description === undefined) {
    companyInfo.description = await page
      .$eval('div[data-testid="UserDescription"]', (el: any) =>
        el.textContent?.trim()
      )
      .catch(() => undefined);
  }

  companyInfo.website = await page
    .$eval('a[data-testid="UserUrl"]', (el: any) => el.getAttribute("href"))
    .catch(() => undefined);

  companyInfo.professionalCategory = await page
    .$eval('span[data-testid="UserProfessionalCategory"]', (el: any) =>
      el.textContent?.trim()
    )
    .catch(() => undefined);

  companyInfo.location = await page
    .$eval('span[data-testid="UserLocation"]', (el: any) =>
      el.textContent?.trim()
    )
    .catch(() => undefined);

  companyInfo.joinedDate = await page
    .$eval('span[data-testid="UserJoinDate"]', (el: any) =>
      el.textContent?.trim().replace(/Joined\ /g, "")
    )
    .catch(() => undefined);

  if (companyInfo.following === undefined) {
    // ========== 新增：获取 Following 和 Followers ==========
    companyInfo.following = await page
      .$eval(
        'a[href$="/following"] span', // 示例选择器，可能需要调整
        (el: any) => el.textContent?.trim().replace(/[^0-9.KM]/g, "") // 提取数字（如 1.2K → 1200）
      )
      .catch(() => undefined);
  }

  if (companyInfo.followers === undefined) {
    companyInfo.followers = await page
      .$eval('a[href$="/verified_followers"] span', (el: any) =>
        el.textContent?.trim().replace(/[^0-9.KM]/g, "")
      )
      .catch(() => undefined);
  }

  return companyInfo;
}

export { scrapeXCompanyInfo };
