# Project Overview

# Tech stack & commands

# Code Style & Conventions

# Testing Guidelines

# Architecture notes

# Commit & PR rules

Use **semantic commit messages** following the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<optional scope>): <description>
```

## Types

| Type       | Description                                                  |
|------------|--------------------------------------------------------------|
| `feat`     | A new feature                                                |
| `fix`      | A bug fix                                                    |
| `docs`     | Documentation only changes                                   |
| `style`    | Changes that do not affect the meaning of the code (formatting, whitespace) |
| `refactor` | A code change that neither fixes a bug nor adds a feature    |
| `perf`     | A code change that improves performance                      |
| `test`     | Adding or updating tests                                     |
| `build`    | Changes to the build system or external dependencies         |
| `ci`       | Changes to CI configuration files and scripts                |
| `chore`    | Other changes that don't modify src or test files            |
| `revert`   | Reverts a previous commit                                    |

## Scope (optional)

Use a scope to specify the area of the codebase affected, e.g. `frontend`, `backend`, `auth`, `chat`.

## Examples

```
feat(frontend): add dark mode toggle to settings
fix(backend): handle null user in chat service
docs: update README with setup instructions
test(frontend): add unit tests for UserSidebar
chore: update dependencies
refactor(backend): migrate chat controller to TypeScript
ci: add GitHub Actions workflow for linting
```

## Rules

- Use lowercase for the type and description
- Do not end the description with a period
- Use the imperative mood in the description (e.g. "add" not "added" or "adds")
- Keep the subject line under 72 characters
