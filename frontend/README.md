# Plone e-Processos (@simplesconsultoria/volto-eprocessos)

Integração do e-Processos com Plone sites

[![npm](https://img.shields.io/npm/v/@simplesconsultoria/volto-eprocessos)](https://www.npmjs.com/package/@simplesconsultoria/volto-eprocessos)
[![](https://img.shields.io/badge/-Storybook-ff4785?logo=Storybook&logoColor=white&style=flat-square)](https://simplesconsultoria.github.io/volto-eprocessos/)
[![CI](https://github.com/simplesconsultoria/sc-eprocessos/actions/workflows/main.yml/badge.svg)](https://github.com/simplesconsultoria/sc-eprocessos/actions/workflows/main.yml)


## Features

<!-- List your awesome features here -->

## Installation

To install your project, you must choose the method appropriate to your version of Volto.


### Volto 18 and later

Add `@simplesconsultoria/volto-eprocessos` to your `package.json`.

```json
"dependencies": {
    "@simplesconsultoria/volto-eprocessos": "*"
}
```

Add `@simplesconsultoria/volto-eprocessos` to your `volto.config.js`.

```javascript
const addons = ['@simplesconsultoria/volto-eprocessos'];
```

If this package provides a Volto theme, and you want to activate it, then add the following to your `volto.config.js`.

```javascript
const theme = '@simplesconsultoria/volto-eprocessos';
```

### Volto 17 and earlier

Create a new Volto project.
You can skip this step if you already have one.

```
npm install -g yo @plone/generator-volto
yo @plone/volto my-volto-project --addon @simplesconsultoria/volto-eprocessos
cd my-volto-project
```

Add `@simplesconsultoria/volto-eprocessos` to your `package.json`.

```JSON
"addons": [
    "@simplesconsultoria/volto-eprocessos"
],

"dependencies": {
    "@simplesconsultoria/volto-eprocessos": "*"
}
```

Download and install the new add-on.

```
yarn install
```

Start Volto.

```
yarn start
```

## Test installation

Visit http://localhost:3000/ in a browser, login, and check the awesome new features.


## Development

The development of this add-on is done in isolation using pnpm workspaces, the latest `mrs-developer`, and other Volto core improvements.
For these reasons, it only works with pnpm and Volto 18.


### Prerequisites ✅

-   An [operating system](https://6.docs.plone.org/install/create-project-cookieplone.html#prerequisites-for-installation) that runs all the requirements mentioned.
-   [nvm](https://6.docs.plone.org/install/create-project-cookieplone.html#nvm)
-   [Node.js and pnpm](https://6.docs.plone.org/install/create-project.html#node-js) 24
-   [Make](https://6.docs.plone.org/install/create-project-cookieplone.html#make)
-   [Git](https://6.docs.plone.org/install/create-project-cookieplone.html#git)
-   [Docker](https://docs.docker.com/get-started/get-docker/) (optional)

### Installation 🔧

1.  Clone this repository, then change your working directory.

    ```shell
    git clone git@github.com:simplesconsultoria/sc-eprocessos.git
    cd sc-eprocessos/frontend
    ```

2.  Install this code base.

    ```shell
    make install
    ```


### Make convenience commands

Run `make help` to list the available Make commands.


### Set up development environment

Install package requirements.

```shell
make install
```

### Start developing

Start the backend.

```shell
make backend-docker-start
```

In a separate terminal session, start the frontend.

```shell
make start
```

### Lint code

Run ESlint, Prettier, and Stylelint in analyze mode.

```shell
make lint
```

### Format code

Run ESlint, Prettier, and Stylelint in fix mode.

```shell
make format
```

### i18n

Extract the i18n messages to locales.

```shell
make i18n
```

### Unit tests

Run unit tests.

```shell
make test
```

### Document a block

The Volto server publishes the schema and the documentation of every block at the [`@blocks-schema` endpoint](https://6.docs.plone.org/volto/reference/blocks-schema-endpoint.html).
Agents, such as an LLM that creates pages through the Plone MCP server, read it to write block data correctly.

Every block in this add-on ships its documentation in a `docs.block.md` file next to its code, such as [`VereadoresSlider/docs.block.md`](packages/volto-eprocessos/src/components/Blocks/VereadoresSlider/docs.block.md).
There is nothing to register: Volto collects the `*.block.md` files when it builds.
Follow the conventions in [Document your blocks](https://6.docs.plone.org/volto/blocks/documentation.html):

-   The frontmatter names the block by its ID, `block: <id>`.
-   The first paragraph is the summary, which the endpoint uses as the block's `description`.
-   Headings inside the file start at `###`.
-   Describe the stored data, not the editor interface, and explain every field of the schema.
-   Add a minimal example and one that uses every field, as `json` code blocks.

Add a `docs.test.ts` next to it, modeled on [`VereadoresSlider/docs.test.ts`](packages/volto-eprocessos/src/components/Blocks/VereadoresSlider/docs.test.ts).
It resolves the block schema and fails when a field has no explanation, or when an example uses a field the schema does not have, so the documentation cannot drift from the schema.
It runs with `make test`.

A project that customizes one of these blocks documents its changes in its own add-on:

-   A variation gets its own `*.block.md` file, with `variation: <id>` in the frontmatter.
-   For added fields, a `*.block.md` file for the same block replaces this add-on's file, so it must describe every field.
    To keep this file and append to it, set a `docs` function in the block configuration instead.

To read the result, start the frontend and request the endpoint with a token from the `@login` endpoint of the Plone REST API.
The example uses the `admin` user that `make backend-create-site` creates.

```shell
TOKEN=$(curl -s -H "Content-Type: application/json" -d '{"login": "admin", "password": "admin"}' http://localhost:8080/Plone/@login | jq -r .token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/@blocks-schema/vereadoresSlider
curl -H "Authorization: Bearer $TOKEN" -H "Accept: text/markdown" http://localhost:3000/@blocks-schema/vereadoresSlider
```

### Run Cypress tests

Run each of these steps in separate terminal sessions.

In the first session, start the frontend in development mode.

```shell
make acceptance-frontend-dev-start
```

In the second session, start the backend acceptance server.

```shell
make acceptance-backend-start
```

In the third session, start the Cypress interactive test runner.

```shell
make acceptance-test
```

## License

The project is licensed under the MIT license.
