# svelte-static-deploy

## Sveltekit Installation with adapter-static

We start out using the CLI commands to set up a svelte project, like this:

```bash
$ npm create svelte@latest
Need to install the following packages:
create-svelte@5.3.3
Ok to proceed? (y) y

create-svelte version 5.3.3

┌  Welcome to SvelteKit!
│
◇  Where should we create your project?
│    (hit Enter to use current directory)
│
◇  Directory not empty. Continue?
│  Yes
│
◇  Which Svelte app template?
│  Skeleton project
│
◇  Add type checking with TypeScript?
│  No
│
◇  Select additional options (use arrow keys/space bar)
│  none
│
└  Your project is ready!

Install community-maintained integrations:
  https://github.com/svelte-add/svelte-add

Next steps:
  1: npm install
  2: git init && git add -A && git commit -m "Initial commit" (optional)
  3: npm run dev -- --open

To close the dev server, hit Ctrl-C

Stuck? Visit us at https://svelte.dev/chat
```

After that i installed `@sveltejs/adapter-static` using the following command, which also installs the other packages and adds adapter-static to devDependencies:

```bash
$ npm i -D @sveltejs/adapter-static
```

## Configuration for static deployment

After the installation i used the [sveltekit docs](https://kit.svelte.dev/docs/adapter-static#github-pages) to look at the configuration for GitHub-pages and modified `svelte.config.js` accordingly. My `svelte.config.js` now looks like this:

```js
import adapter from '@sveltejs/adapter-static'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      fallback: '404.html',
    }),
    paths: {
      base: process.argv.includes('dev') ? '' : process.env.BASE_PATH,
    },
  },
}

export default config
```

I saw a `404.html` file mentioned in one of the config files so i added an error page (`+error.svelte`) in the `/src/routes` folder. It contains the sentence: `It didn’t work.. boohoo`, nothing more. I can always add HTML later if i want to make a stunning 404 :)

So much for setup, let’s test our setup, first locally:
```bash
$ npm run dev
```

This works.. we get our basic svelte site.. didn’t expect anything other than this.. Let’s build!

```bash
$ npm run build
```

This works, creates a build folder, looks A-okay, let’s commit to GitHub.

```bash
$ git add .
$ git commit -m 'Basic static deployed sveltekit site'
$ git push
```

## Implementing Continuous Integration

The manual shows an excellent example implementing CI using a GitHub Action. Go to GitHub pages and choose GitHub Actions (yes it’s a beta feature) as a Build and deployment source and choose the `create your own` link. Copy and paste the code from the docs (i conveniently copied it below so you don’t have to open a new link) and commit the file using the name suggested by the docs: `deploy.yml`.

```yml
name: Deploy to GitHub Pages

on:
  push:
    branches: 'main'

jobs:
  build_site:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm install

      - name: build
        env:
          BASE_PATH: '/${{ github.event.repository.name }}'
        run: |
          npm run build

      - name: Upload Artifacts
        uses: actions/upload-pages-artifact@v2
        with:
          path: 'build/'

  deploy:
    needs: build_site
    runs-on: ubuntu-latest

    permissions:
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v2
```

## Adding `.env` vars to deploy.yml

Your application will run in public space… therefore you are not allowed to use any secret info’s you’d normally put in your `.env` file. If your application relies on an API endpoint that uses a private key, your application might not be suitable for static hosting on GitHub. You can however use a public API endpoint and store the url to this endpoint using GitHub Settings > Secrets and variables > Variables. Note that sveltekit expects public variables to be prefixed using `PUBLIC_` so you are forced to change your local .env file variable name to for example `PUBLIC_HYGRAPH_URL` (that is what i did). Here is my local `.env` file, this is not uploaded to GitHub as it is in `.gitignore`.

```env
PUBLIC_HYGRAPH_URL='http://the-url-to-the-public-API-endpoint.com'
```

To use this variable using the build done by `deploy.yml` we need to add it to the file, this is already done with `BASE_PATH` in the original file we created. Change the file according to the example below.

```yml
...
      - name: build
        env:
          BASE_PATH: '/${{ github.event.repository.name }}'
          PUBLIC_HYGRAPH_URL: ${{ vars.PUBLIC_HYGRAPH_URL }}
        run: |
          npm run build

...
```

Now we have the `PUBLIC_HYGRAPH_URL` available both locally, through the `.env` file, and remote, through the `deploy.yml` script.

To demonstrate that it works i added the env var to the main page in `/src/routes/+page.svelte` using `import { PUBLIC_HYGRAPH_URL } from '$env/static/public’`. Look it up if you want to use it ;)

## Using `BASE_PATH` in your navigation
