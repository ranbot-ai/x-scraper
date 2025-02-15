# X Scraper | 2025 Active

A NodeJS script that scrapes data from X profiles.

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
│   └── config.json
├── package.json
├── src
│   ├── environment
│   │   ├── config.ts
│   │   └── zproxy.ts
│   ├── index.ts
│   ├── pages
│   │   ├── identifiers.ts
│   │   └── index.ts
│   └── utils
│       ├── index.ts
│       └── scrapedLogger.ts
├── tsconfig.json
├── types
│   └── index.d.ts
└── yarn.lock

7 directories, 14 files
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

## Export your X cookies and save them in

```
config/cookies.json
```

## Usage Examples

```NodeJS
env HEADLESS=false IDS=deepseek_ai node build/index.js
```

## Contributors

- [Encore Shao](https://github.com/encoreshao)
