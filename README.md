This is a [Next.js](https://nextjs.org/) project bootstrapped with pre-installed Shadcn components.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Running on Docker

**Build the Dockerfile**

`docker build . -t wholesale`

**Run the Docker container**

`docker run -p 3000:3000 -it -v .:/app wholesale`

![Dashboard IMG](https://cdn.discordapp.com/attachments/1399767716155490435/1399767748279799928/WholeSale.png?ex=688a32cd&is=6888e14d&hm=779e51a276304b681d91a4cbaedabf5495aa34df8e5d8a11adbf1db617d658fe&)