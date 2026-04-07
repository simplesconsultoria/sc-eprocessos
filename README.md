# Plone e-Processos 🚀

[![Built with Cookieplone](https://img.shields.io/badge/built%20with-Cookieplone-0083be.svg?logo=cookiecutter)](https://github.com/plone/cookieplone-templates/)
[![Black code style](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![CI](https://github.com/simplesconsultoria/sc-eprocessos/actions/workflows/main.yml/badge.svg)](https://github.com/simplesconsultoria/sc-eprocessos/actions/workflows/main.yml)

Integração do e-Processos com Plone sites

## Quick Start 🏁

### Prerequisites ✅

-   An [operating system](https://6.docs.plone.org/install/create-project-cookieplone.html#prerequisites-for-installation) that runs all the requirements mentioned.
-   [uv](https://6.docs.plone.org/install/create-project-cookieplone.html#uv)
-   [nvm](https://6.docs.plone.org/install/create-project-cookieplone.html#nvm)
-   [Node.js and pnpm](https://6.docs.plone.org/install/create-project.html#node-js) 24
-   [Make](https://6.docs.plone.org/install/create-project-cookieplone.html#make)
-   [Git](https://6.docs.plone.org/install/create-project-cookieplone.html#git)
-   [Docker](https://docs.docker.com/get-started/get-docker/) (optional)


### Installation 🔧

1.  Clone this repository, then change your working directory.

    ```shell
    git clone git@github.com:simplesconsultoria/sc-eprocessos.git
    cd sc-eprocessos
    ```

2.  Install this code base.

    ```shell
    make install
    ```


### Fire Up the Servers 🔥

1.  Create a new Plone site on your first run.

    ```shell
    make backend-create-site
    ```

2.  Start the backend at http://localhost:8080/.

    ```shell
    make backend-start
    ```

3.  In a new shell session, start the frontend at http://localhost:3000/.

    ```shell
    make frontend-start
    ```

Voila! Your Plone site should be live and kicking! 🎉

### Local Stack Deployment 📦

Deploy a local Docker Compose environment that includes the following.

- Docker images for Backend and Frontend 🖼️
- A stack with a Traefik router and a PostgreSQL database 🗃️
- Accessible at [http://sc-eprocessos.localhost](http://sc-eprocessos.localhost) 🌐

Run the following commands in a shell session.

```shell
make stack-create-site
make stack-start
```

And... you're all set! Your Plone site is up and running locally! 🚀

## e-Processos Mock 🎭

The repository ships with a FastAPI-based mock of the e-Processos REST API at [`eprocessos_mock/`](./eprocessos_mock/). It lets you develop and test the whole stack offline, without hitting the real Câmara de Uberlândia instance.

It runs in two modes, controlled by environment variables:

| Mode | Variables | Behavior |
| --- | --- | --- |
| **Replay** (default) | — | Serves cached responses from `eprocessos_mock/data/`. Returns 404 for any endpoint that hasn't been recorded yet. |
| **Record** | `EPROCESSOS_RECORD=1` and `EPROCESSOS_UPSTREAM=https://...` | Forwards each request to the upstream e-Processos instance, persists the response under `eprocessos_mock/data/`, and rewrites all upstream URLs in the payload to be host-relative. |

### Running the mock with Docker Compose

The mock is part of [`docker-compose.yml`](./docker-compose.yml) under the `eprocessos-mock` service. To start it (and the rest of the stack):

```shell
docker compose up -d eprocessos-mock
```

The service listens on `http://localhost:8000` (and on `http://eprocessos-mock:8000` from inside the compose network). Point your Plone backend's `eprocessos.base_url` registry record at it:

```
http://eprocessos-mock:8000
```

### Recording fresh data from a real instance

1. Edit [`docker-compose.yml`](./docker-compose.yml) and uncomment / set the `EPROCESSOS_RECORD` and `EPROCESSOS_UPSTREAM` environment variables on the `eprocessos-mock` service.
2. Restart the service: `docker compose up -d eprocessos-mock`.
3. Hit the endpoints you need (either through the Plone frontend, or by running the seed script below). Each successful response is persisted under `eprocessos_mock/data/`.
4. Once you have what you need, comment the env vars back out and restart — the mock now serves the recorded data without touching the upstream.

### Pre-populating the cache

To bulk-seed the cache, run the [`scripts/seed.py`](./eprocessos_mock/scripts/seed.py) helper. It walks every list endpoint, then fetches each item's detail endpoint:

```shell
cd eprocessos_mock
uv run --with httpx python scripts/seed.py
```

The script reads two optional environment variables:

- `MOCK_URL` — the base URL of the running mock (default `http://localhost:8000`)
- `SEED_YEAR` — year for the `ano`-aware endpoints (`normas`, `materias`, `sessoes`); defaults to `2026`

The script must be run while the mock is in **record** mode — otherwise it will only fetch what's already cached. Failed endpoints are reported but don't abort the run.

### Storage layout

Recorded responses live under `eprocessos_mock/data/<endpoint>/` as JSON:

```
data/
├── vereadores/
│   ├── list.json          # /@@vereadores
│   ├── 546914.json        # /@@vereadores/546914
│   └── ...
├── normas/
│   ├── list_<hash>.json   # /@@normas?ano=2026&tipo=1 (hashed query string)
│   └── 18503.json
└── sapl_documentos/       # binary image proxy (vereador photos)
```

Query parameters are hashed into the filename so different `ano`/`tipo` combinations don't collide.

## Project structure 🏗️

This monorepo consists of the following distinct sections:

- **backend**: Houses the API and Plone installation, utilizing pip instead of buildout, and includes a policy package named sc.eprocessos.
- **frontend**: Contains the React (Volto) package.
- **devops**: Encompasses Docker stack, Ansible playbooks, and cache settings.
- **docs**: Scaffold for writing documentation for your project.

### Why this structure? 🤔

- All necessary codebases to run the site are contained within the repository (excluding existing add-ons for Plone and React).
- Specific GitHub Workflows are triggered based on changes in each codebase (refer to .github/workflows).
- Simplifies the creation of Docker images for each codebase.
- Demonstrates Plone installation/setup without buildout.

## Code quality assurance 🧐

To check your code against quality standards, run the following shell command.

```shell
make check
```

### Format the codebase

To format and rewrite the code base, ensuring it adheres to quality standards, run the following shell command.

```shell
make format
```

| Section | Tool | Description | Configuration |
| --- | --- | --- | --- |
| backend | Ruff | Python code formatting, imports sorting  | [`backend/pyproject.toml`](./backend/pyproject.toml) |
| backend | `zpretty` | XML and ZCML formatting  | -- |
| frontend | ESLint | Fixes most common frontend issues | [`frontend/.eslintrc.js`](.frontend/.eslintrc.js) |
| frontend | prettier | Format JS and Typescript code  | [`frontend/.prettierrc`](.frontend/.prettierrc) |
| frontend | Stylelint | Format Styles (css, less, sass)  | [`frontend/.stylelintrc`](.frontend/.stylelintrc) |

Formatters can also be run within the `backend` or `frontend` folders.

### Linting the codebase
or `lint`:

 ```shell
make lint
```

| Section | Tool | Description | Configuration |
| --- | --- | --- | --- |
| backend | Ruff | Checks code formatting, imports sorting  | [`backend/pyproject.toml`](./backend/pyproject.toml) |
| backend | Pyroma | Checks Python package metadata  | -- |
| backend | check-python-versions | Checks Python version information  | -- |
| backend | `zpretty` | Checks XML and ZCML formatting  | -- |
| frontend | ESLint | Checks JS / Typescript lint | [`frontend/.eslintrc.js`](.frontend/.eslintrc.js) |
| frontend | prettier | Check JS / Typescript formatting  | [`frontend/.prettierrc`](.frontend/.prettierrc) |
| frontend | Stylelint | Check Styles (css, less, sass) formatting  | [`frontend/.stylelintrc`](.frontend/.stylelintrc) |

Linters can be run individually within the `backend` or `frontend` folders.

## Internationalization 🌐

Generate translation files for Plone and Volto with ease:

```shell
make i18n
```

## Credits and acknowledgements 🙏

Generated using [Cookieplone (2.0.0.a1.dev0)](https://github.com/plone/cookieplone) and [cookieplone-templates (0f1e1aa)](https://github.com/plone/cookieplone-templates/commit/0f1e1aa8c8da289805aa7ae184e67e04412abc00) on 2026-04-02 14:13:00.235258. A special thanks to all contributors and supporters!
