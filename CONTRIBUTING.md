# Contributing

Thank you for your interest in improving **Arcane Realms**!
This project uses separate client and server packages built with
[Phaser](https://phaser.io/) and Node.js. The guidelines below explain how to
get set up and how to contribute effectively.

Please review our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all
participants to uphold respectful, inclusive behavior in every project space.

## Requirements
- Node.js **18+** is required for both the client and server (Vite 5 and other
dependencies require Node 18 or newer).
- npm comes bundled with Node; yarn/pnpm are not officially supported.
- Supported operating systems: Windows 10+, macOS 12+, and Linux distributions such as Ubuntu 20.04+.
- Development requires Git and a compatible shell environment (e.g. Bash, Zsh, or PowerShell; WSL is recommended on Windows).

## Building and Running
1. **Server**
   ```bash
   cd server
   npm install
   npm run dev      # start development server at http://localhost:8080
   npm run build    # compile TypeScript to dist/
   ```
2. **Client**
   ```bash
   cd client
   npm install
   npm run dev      # start Vite dev server at http://localhost:5173
   npm run build    # produce production assets in dist/
   ```
3. **Optional AI services**
   ```bash
   cd ops
   docker compose up -d ollama postgres redis milvus
   # on host
   ollama pull llama3.1:8b
   ollama pull nomic-embed-text
   ```

## Linting and Formatting
There are currently **no dedicated lint or format scripts**.
Please run your preferred tooling (e.g. ESLint or Prettier) before committing
and ensure any generated files are ignored.
> **Recommended:** Use ESLint's [recommended config](https://eslint.org/docs/latest/use/configure/)
> or the TypeScript variant [`plugin:@typescript-eslint/recommended`](https://typescript-eslint.io/linting/configs#recommended).
> Format code with Prettier using a [.prettierrc](https://prettier.io/docs/en/configuration.html) or a shared
> config such as [`prettier-config-standard`](https://github.com/prettier/prettier-config-standard).
> To avoid conflicts between the two tools, add [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier).

## Branch and Commit Guidelines
- Create branches from `main` using prefixes such as
  `feature/short-description`, `fix/bug-name`, or `docs/update`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit
  messages:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation updates
  - `chore:` for build/maintenance tasks

## Pull Request Expectations
- Ensure `npm run build` succeeds in both `server` and `client` before
  requesting review.
- Link any related GitHub issues in the PR description.
- At least one maintainer approval is required before merging.
- Keep PRs focused—smaller, incremental changes are easier to review.
> **TODO:** Explain required test coverage and link to any CI pipelines.

## Where to Ask Questions
- **Issues:** Report bugs or request features at
  [GitHub Issues](https://github.com/Arcane-Realms/Arcane-Realms/issues).
- **Discussions:** Join ongoing conversations via
  [GitHub Discussions](https://github.com/Arcane-Realms/Arcane-Realms/discussions).
- **Discord:** Chat with the community on our
  [Discord server](https://discord.gg/arcane-realms).

We appreciate every contribution. Happy hacking!
