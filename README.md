# svelte-static-deploy

## Installation

I started out using the normal CLI commands to set up a svelte project, like this:

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

The manual shows an excellent example of a GitHub Action. To copy it to the right folder i want to show the .git folder in my vscode installation. Open settings (```⌘ + ` ``` on mac), search for `files.exclude` and remove the `**/.git` glob pattern. You now see the .git folder in your project explorer, go easy on editing in this folder as it will break your git structure.

I created the `.git/workflows` folder, created a new `deploy.yml` file and copied the GitHub actions example file to the corresponding folder.

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

      # If you're using pnpm, add this step then change the commands and cache key below to use `pnpm`
      # - name: Install pnpm
      #   uses: pnpm/action-setup@v2
      #   with:
      #     version: 8

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
          # this should match the `pages` option in your adapter-static options
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

I saw a `404.html` file mentioned in one of the config files so i added one in the `/src` folder. It contains the sentence: `It didn’t work.. boohoo`, nothing more. I can always add HTML later if i want to make a stunning 404 :)

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

