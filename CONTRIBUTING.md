# Contributing

Thank you for your interest in improving **Arcane Realms**!
This project uses separate client and server packages built with
[Phaser](https://phaser.io/) and Node.js. The guidelines below explain how to
get set up and how to contribute effectively.

## Requirements
- Node.js **18+** is required for both the client and server (Vite 5 and other
dependencies require Node 18 or newer).
- npm comes bundled with Node; yarn/pnpm are not officially supported.

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

## Where to Ask Questions
- **Issues:** Report bugs or request features at
  [GitHub Issues](https://github.com/Arcane-Realms/Arcane-Realms/issues).
- **Discussions:** Join ongoing conversations via
  [GitHub Discussions](https://github.com/Arcane-Realms/Arcane-Realms/discussions).
- **Discord:** Chat with the community on our
  [Discord server](https://discord.gg/arcane-realms).

We appreciate every contribution. Happy hacking!
