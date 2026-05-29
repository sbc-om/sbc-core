## SBC Core

SBC Core is a modular ERP platform kernel built as a pnpm monorepo. The console app runs on Next.js, core services live in `packages/*`, and business capabilities are shipped as installable modules under `modules/*`.

## Development

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Start infrastructure services:

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d
```

4. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## File Storage

The global file manager module supports two backends:

- `STORAGE_DRIVER="s3"`: uses MinIO or any S3-compatible service through `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_BUCKET`, and `STORAGE_REGION`.
- `STORAGE_DRIVER="local"`: stores files on the app server filesystem under `FILE_STORAGE_ROOT`.

With the default local development setup, MinIO is available at:

- API: [http://localhost:9000](http://localhost:9000)
- Console: [http://localhost:9001](http://localhost:9001)

The documents module will create the configured bucket automatically on first use when `STORAGE_DRIVER` is set to `s3`.

## Validation

```bash
pnpm typecheck
pnpm build
```

## Notes

- The global file manager UI is exposed at `/files`.
- The current bootstrap installs `base`, `iam`, and `documents` automatically.
- The repository architecture and engineering rules are defined in `AGENTS.md`.
