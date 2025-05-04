This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Requirements for running the app

First, create an `.env.local` file in the project, then add the GITHUB_WEBHOOK_SECRET and GITHUB_ACCESS_TOKEN of the dummy repo you want to keep track

Second, make sure LLMStudio is running at localhost:1234

Finally, expose the local:3001 to an url. I'm using ngrok and the syntax is `ngork http 3001`.
After exposing the 3001 port to an url, copy the url to the webhook settings of the dummy repo
