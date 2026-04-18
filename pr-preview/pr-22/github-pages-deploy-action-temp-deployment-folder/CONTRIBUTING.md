# Contributing

Thank you for considering helping improve JSONC.org.

## Types of contributions

### Changes to the spec itself

For changes to the spec itself, please make sure that the topic of your changes have been adequately discussed in an issue/discussion before making changes.

### Adding a new tool or library

If you would like to add a tool or library to the site, please include enough information for us to evaluate whether it should be listed.

We may refuse to list a tool if there are already listed tools that accomplish the same task. The goal is not to maintain a complete directory of every JSONC-related project. If your tool overlaps with an existing entry, please explain why it should still be included, for example because it offers better DX, better performance, better platform support or better maintenance.

When proposing a new entry, please provide in the PR comment:

- The name of the tool or library with a brief description of what it does.
- A link to the source repository.
- The programming language or ecosystem it targets.
- The main use case it covers (parsing, serializing, editing, validating or converting).
- Whether it supports the JSONC features by default or via an optional argument (for both comments and trailing commas).
- If similar tools are already listed, a short explanation of what sets it apart with some evidence such as benchmark results, documentation quality, API ergonomics, adoption or active maintenance.

## How to make changes?

For simple textual contributions, you probably only need to make your edit directly to the index.markdown file, so you can skip the Prerequisites and Local Development sections of this guide.

For more involved contributions, you can make your edits and preview the changes using the guide below. Note that you can also create a codespace for this repo and all prerequisites will already be installed.

## Prerequisites

- Ruby and Bundler
- Git

## Local Development

This site is built with Jekyll and GitHub Pages. To preview how your changes will look like on the deployed site:

1. Install dependencies:

```bash
bundle install
```

2. Start the local site preview:

```bash
bundle exec jekyll serve --livereload --host 0.0.0.0 --port 4000
```

3. Open the site at:

- http://localhost:4000

If you are working in a dev container or Codespaces, use the forwarded URL for port 4000.

> [!WARNING]
> Some GitHub metadata fields may differ locally if API authentication is not configured.
> In practice, this mainly affects values provided by `site.github`, such as the repository URL, owner name, owner URL, and other GitHub-derived page metadata.
> This usually does not affect the main page content, but small details in the header, footer, or SEO tags may not exactly match the deployed site.

## Making Changes

1. Create a new branch stemming from `main`.
2. Make your changes.
3. Verify your updates in the local preview if needed.
4. Commit with a clear message.
5. Open a pull request.

## Content Guidelines

- Keep wording concise and clear.
- Preserve existing formatting style.
- Prefer small, reviewable pull requests.


