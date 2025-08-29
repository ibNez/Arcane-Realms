# Contributing

Thank you for your interest in improving **Arcane Realms**!
This project uses separate client and server packages: a LÖVE (Lua) desktop
client and a Node.js server. The guidelines below explain how to get set up and
how to contribute effectively.

Please review our [Code of Conduct](CODE_OF_CONDUCT.md). We expect all
participants to uphold respectful, inclusive behavior in every project space.

## Requirements
- Node.js **20+** for the server.
- LÖVE **11.x** for the client.
- npm comes bundled with Node; yarn/pnpm are not officially supported.
- Supported operating systems: Windows 10+, macOS 13+, and Linux distributions such as Ubuntu 22.04+.
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
   love .           # launch LÖVE client
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
For the server, run your preferred tooling (e.g. ESLint or Prettier) before
committing and ensure generated files are ignored. For Lua, tools such as
[luacheck](https://github.com/mpeterv/luacheck) or
[StyLua](https://github.com/JohnnyMorganz/StyLua) may be used.

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
- Ensure `npm run build` succeeds in the server before requesting review.
- Link any related GitHub issues in the PR description.
- At least one maintainer approval is required before merging.
- Keep PRs focused—smaller, incremental changes are easier to review.
- Tests must pass with at least **80%** line coverage. Run `npm test -- --coverage`
  in the server package and ensure overall coverage stays above this threshold.
- Continuous integration runs via GitHub Actions—see
  [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the pipeline that
  builds, tests, and checks coverage.

## Where to Ask Questions
- **Issues:** Report bugs or request features at
  [GitHub Issues](https://github.com/Arcane-Realms/Arcane-Realms/issues).
- **Discussions:** Join ongoing conversations via
  [GitHub Discussions](https://github.com/Arcane-Realms/Arcane-Realms/discussions).
- **Discord:** Chat with the community on our
  [Discord server](https://discord.gg/arcane-realms).

We appreciate every contribution. Happy hacking!
