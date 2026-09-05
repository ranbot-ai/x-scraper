import { ICompanyInfo, IFollowingUser } from "../../types";

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

// Extracts followed accounts from a "Following" GraphQL response body.
//
// X's User result type has migrated away from a flat "legacy" object to a
// modular schema (core, avatar, profile_bio, relationship_counts). Both
// shapes are read here, preferring the new one, since the API has been
// observed to return either depending on rollout.
function extractFollowingUsers(jsonData: any): IFollowingUser[] {
  const users: IFollowingUser[] = [];

  const instructions =
    jsonData?.data?.user?.result?.timeline?.timeline?.instructions || [];

  for (const instruction of instructions) {
    if (instruction?.type !== "TimelineAddEntries") continue;

    for (const entry of instruction.entries || []) {
      const userResult = entry?.content?.itemContent?.user_results?.result;

      if (!userResult || userResult.__typename !== "User") continue;

      const legacy = userResult.legacy || {};
      const core = userResult.core || {};
      const avatar = userResult.avatar || {};
      const profileBio = userResult.profile_bio || {};
      const relationshipCounts = userResult.relationship_counts || {};

      const username = core.screen_name || legacy.screen_name;

      if (!username) continue;

      users.push({
        username,
        name: core.name || legacy.name,
        description: profileBio.description || legacy.description,
        avatarUrl: avatar.image_url || legacy.profile_image_url_https,
        verified: userResult.is_blue_verified ?? legacy.verified,
        followersCount: relationshipCounts.followers ?? legacy.followers_count,
      });
    }
  }

  return users;
}

// DOM fallback: parses the rendered /following page when the GraphQL
// response wasn't captured (e.g. request finished before the listener
// was attached, or the API shape changed).
async function scrapeFollowingFromDOM(page: any): Promise<IFollowingUser[]> {
  return await page.evaluate(() => {
    const cells = Array.from(
      document.querySelectorAll('[data-testid="UserCell"]')
    );

    return cells
      .map((cell: any) => {
        const link = cell.querySelector('a[role="link"][href^="/"]');
        const username = link
          ? link.getAttribute("href").replace(/^\//, "")
          : undefined;

        const nameSpan = cell.querySelector(
          'div[dir="ltr"] span span'
        ) as HTMLElement | null;
        const name = nameSpan?.textContent?.trim();

        // Exclude the hidden "Click to Follow X" accessibility helper
        // div (style="display: none") that X renders per cell - it also
        // matches div[dir="auto"] and would otherwise be picked up as
        // the bio for accounts that have no description at all.
        const bioDivs = (
          Array.from(cell.querySelectorAll('div[dir="auto"]')) as HTMLElement[]
        ).filter((div) => div.style.display !== "none");
        const bioDiv = bioDivs[bioDivs.length - 1];
        const description = bioDiv?.textContent?.trim() || undefined;

        const avatarImg = cell.querySelector("img") as HTMLImageElement | null;
        const avatarUrl = avatarImg?.src;

        const verified = !!cell.querySelector('[data-testid="icon-verified"]');

        return { username, name, description, avatarUrl, verified };
      })
      .filter((user: any) => !!user.username);
  });
}

export { scrapeXCompanyInfo, extractFollowingUsers, scrapeFollowingFromDOM };
