# X Scraper | 2025 Active

A NodeJS script that scrapes data from X public profiles.

## Configuration

- cp config/zproxy.json.example config/zproxy.json

## Technology

- Node
  - Node Version Manager Tool - [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
  - Node Version: 18.1.0
- [Puppeteer](https://pptr.dev/)
  - Node library which provides a high-level API to control Chrome
- Proxy: Residential Zone
- Typescript
  - TypeScript is JavaScript with syntax for types. [Doc](https://www.typescriptlang.org/)
  - [Node.Js With TypeScript](https://nodejs.dev/en/learn/nodejs-with-typescript/)

## Structure

```
➜  x-scraper git:(main) ✗ tree -I 'node_modules|build'
.
├── LICENSE
├── README.md
├── config
│   ├── config.json
│   ├── cookies.json
│   ├── zproxy.json
│   └── zproxy.json.example
├── log
│   └── development.log
├── package-lock.json
├── package.json
├── src
│   ├── environment
│   │   ├── config.ts
│   │   └── zproxy.ts
│   ├── index.ts
│   ├── pages
│   │   ├── identifiers.ts
│   │   ├── index.ts
│   │   └── pageParse.ts
│   └── utils
│       ├── index.ts
│       └── scrapedLogger.ts
├── tsconfig.json
├── types
│   └── index.d.ts
└── yarn.lock

8 directories, 20 files
```

- `build`: The latest generated javascript code.
- `config`: Configuration.
- `src`: The main coding part of the scraper, written by typescript.
- `types`: Type or Interface definition.

## Scripts Overview

```NodeJS
npm run start:dev
```

Starts the application in development using nodemon and ts-node to do cold reloading.

```NodeJS
npm run build
```

Builds the app at build, cleaning the folder first.

```NodeJS
npm run start
```

Starts the app in production by first building the project with `npm run build`, and then executing the compiled JavaScript at `build/index.js`.

## Make sure your cookies are saved to

```
config/cookies.json
```

## Usage Examples

```NodeJS
┌─────────┬───────┬───────────────────────────────┐
│ (index) │ tries │          identifier           │
├─────────┼───────┼───────────────────────────────┤
│    0    │   0   │ { identifier: 'deepseek_ai' } │
└─────────┴───────┴───────────────────────────────┘
>> Queue Size: 1
{ tries: 0, identifier: { identifier: 'deepseek_ai' } }
// Cookies loaded successfully.
// Visiting URL: https://x.com/deepseek_ai
// Scraped Data: {
  "rawData": {
    "__typename": "User",
    "id": "VXNlcjoxNzE0NTgwOTYyNTY5NTg4NzM2",
    "rest_id": "1714580962569588736",
    "affiliates_highlighted_label": {},
    "has_graduated_access": true,
    "parody_commentary_fan_label": "None",
    "is_blue_verified": true,
    "profile_image_shape": "Circle",
    "legacy": {
      "following": true,
      "can_dm": false,
      "can_media_tag": true,
      "created_at": "Wed Oct 18 09:55:45 +0000 2023",
      "default_profile": true,
      "default_profile_image": false,
      "description": "Unravel the mystery of AGI with curiosity. Answer the essential question with long-termism.",
      "entities": {
        "description": {
          "urls": []
        },
        "url": {
          "urls": [
            {
              "display_url": "deepseek.com",
              "expanded_url": "https://www.deepseek.com/",
              "url": "https://t.co/Un4k2rqn4o",
              "indices": [
                0,
                23
              ]
            }
          ]
        }
      },
      "fast_followers_count": 0,
      "favourites_count": 32,
      "followers_count": 920342,
      "friends_count": 0,
      "has_custom_timelines": false,
      "is_translator": false,
      "listed_count": 2741,
      "location": "",
      "media_count": 84,
      "name": "DeepSeek",
      "normal_followers_count": 920342,
      "pinned_tweet_ids_str": [
        "1884103376868368589"
      ],
      "possibly_sensitive": false,
      "profile_banner_url": "https://pbs.twimg.com/profile_banners/1714580962569588736/1698208997",
      "profile_image_url_https": "https://pbs.twimg.com/profile_images/1717417613775757312/Uk1zNOj4_normal.jpg",
      "profile_interstitial_type": "",
      "screen_name": "deepseek_ai",
      "statuses_count": 131,
      "translator_type": "none",
      "url": "https://t.co/Un4k2rqn4o",
      "verified": false,
      "want_retweets": true,
      "withheld_in_countries": []
    },
    "tipjar_settings": {},
    "legacy_extended_profile": {},
    "is_profile_translatable": false,
    "has_hidden_subscriptions_on_profile": false,
    "verification_info": {
      "is_identity_verified": true,
      "reason": {
        "description": {
          "text": "This account is verified. Learn more",
          "entities": [
            {
              "from_index": 26,
              "to_index": 36,
              "ref": {
                "url": "https://help.twitter.com/managing-your-account/about-twitter-verified-accounts",
                "url_type": "ExternalUrl"
              }
            }
          ]
        },
        "verified_since_msec": "1699427323764"
      }
    },
    "highlights_info": {
      "can_highlight_tweets": true,
      "highlighted_tweets": "32"
    },
    "user_seed_tweet_count": 0,
    "business_account": {},
    "creator_subscriptions_count": 0
  },
  "name": "DeepSeek",
  "pictureUrl": "https://pbs.twimg.com/profile_images/1717417613775757312/Uk1zNOj4_200x200.jpg",
  "following": 0,
  "followers": 920342,
  "dateCreated": "2023-10-18T09:55:45.000Z",
  "description": "Unravel the mystery of AGI with curiosity. Answer the essential question with long-termism.",
  "website": "https://t.co/Un4k2rqn4o",
  "joinedDate": "October 2023"
}
```

## Contributors

- [Encore Shao](https://github.com/encoreshao)
