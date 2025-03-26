# esi-web-ui
Web UI (Portal) for managing external-secrets-inc

## Prerequisites
- Node.js (version specified in `./nvmrc` file. We recommend using a node version manager like [nvm](https://github.com/nvm-sh/nvm) or [fnm]https://github.com/Schniz/fnm))
- npm
- make
- gcloud (for helm deployment operations)

## Environment Setup
Copy `.env.example` to `.env` and configure the required environment variables:
```bash
cp .env.example .env
```
See `.env.example` for detailed configuration options.

## Quick Start
```bash
# Install dependencies and setup pre-commit hooks
make setup

# Start development server
make dev
```

## Development

### Available Commands
```bash
# Development
make dev          # Start development server
make install      # Install dependencies
make build        # Build for production

# Component Development
npm run storybook    # Start Storybook
npm run build-storybook  # Build Storybook
npm run chromatic    # Publish to Chromatic (requires CHROMATIC_PROJECT_TOKEN)

# Helm Operations
make helm.login   # Login to helm registry
make helm.push    # Push helm chart to registry
```

### UI Component Development

We maintain a proto Design System in `src/components/ui/` (also refer the README file under `./ui` folder):
- Shadcn components (installed via `npx shadcn@latest add`)
- Custom components (PascalCase naming)
- All components use Tailwind styling

This project uses:
- [Storybook](https://storybook.js.org/) for component development and documentation (can be run locally)
- [Chromatic](https://www.chromatic.com/) for visual testing and component documentation (for online view)
  - `TODO:` Visual testing should be automatically triggered on PRs. We should properly configure CI steps for it
  - Component documentation is published to Chromatic for online view
  - Manual publish: `npm run chromatic` (requires `CHROMATIC_PROJECT_TOKEN` retrieved from [Chromatic](https://www.chromatic.com/))
  - Our Chromatic project ID is `qtkdyngiqi`
  - Access our Storybook online:
    - Latest main branch: https://main-qtkdyngiqi.chromatic.com
    - Specific branch: https://<branch>-qtkdyngiqi.chromatic.com (when published from within a branch)
    - Specific commit: https://<commithash>-qtkdyngiqi.chromatic.com (when published from within a specific commit)
  - Note: For branches with special characters or long names, they will be sanitized (e.g., `feature/fix-bug` becomes `feature-fix-bug`)
  - Check their [Permalinks](https://www.chromatic.com/docs/permalinks/) docs page for reference

### Commit/PR Guidelines
This project follows [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Commits and PRs must follow the conventional commits format especially for release PRs
- If you're on VScode we recommend the [Conventional Commits Extension](https://marketplace.cursorapi.com/items?itemName=vivaxy.vscode-conventional-commits)

### Production Release Process
This project uses an automated release bot that:
- Monitors PRs for conventional commit messages
- Automatically creates/edits a release PR when commits are merged to `main`
- Updates semver numbers based on commit types
- Requires manual approval for release PRs

## Deployment
The project is deployed via Helm charts:
- Charts are stored in `deploy/charts/web-ui`
- Registry: `us-central1-docker.pkg.dev/external-secrets-inc-registry/internal/charts`
- Push new chart: `make helm.push` (requires gcloud authentication)
