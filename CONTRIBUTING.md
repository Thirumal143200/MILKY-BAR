# Contributing to MilkBoy

Thank you for your interest in contributing to MilkBoy! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project adheres to the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/milkboy.git
   cd milkboy
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Set up** the development environment:
   ```bash
   cp server/.env.example server/.env
   npm run db:seed --workspace=server
   ```
5. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Workflow

We use **Git Flow** branching strategy:

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch for features |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes |
| `release/*` | Release preparation |
| `hotfix/*` | Critical production fixes |

### Workflow Steps

1. Create a branch from `develop` for features or `main` for hotfixes
2. Make your changes with clear, atomic commits
3. Write or update tests as needed
4. Ensure all checks pass (`npm test`, `npm run lint`)
5. Open a Pull Request to `develop`

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system or external dependencies |
| `ci` | CI/CD configuration |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

### Scopes

| Scope | Description |
|-------|-------------|
| `server` | Backend API changes |
| `web` | Web dashboard changes |
| `mobile` | Mobile app changes |
| `shared` | Shared package changes |
| `db` | Database changes |
| `ai` | AI/ML changes |
| `auth` | Authentication changes |
| `docs` | Documentation changes |
| `ci` | CI/CD changes |
| `deps` | Dependency updates |

### Examples

```
feat(server): add batch testing endpoint
fix(auth): prevent race condition in token refresh
docs(api): update scan endpoint documentation
test(server): add unit tests for image processor
ci: add security scanning to CI pipeline
```

---

## Pull Request Process

1. **Title**: Use conventional commit format
2. **Description**: Fill out the PR template completely
3. **Tests**: All existing tests must pass, new tests must be included
4. **Review**: At least one approval required
5. **CI**: All CI checks must pass
6. **Conflicts**: Resolve any merge conflicts
7. **Squash**: PRs are squash-merged to keep history clean

### PR Description Template

```markdown
## What does this PR do?
Brief description of the changes.

## Type of change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## How has this been tested?
Describe the tests you ran.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have updated the documentation accordingly
```

---

## Code Style

- **TypeScript** for all code (strict mode)
- **Prettier** for formatting (see `.prettierrc`)
- **ESLint** for linting (see `.eslintrc.cjs`)
- Use `const` over `let`, never `var`
- Use explicit types for function parameters and return types
- Use `interface` for object shapes, `type` for unions/intersections
- Use descriptive variable names — no single-letter variables except loop counters

---

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage --workspace=server

# Run specific test file
npx vitest run path/to/test.ts --workspace=server
```

### Testing Guidelines

- **Unit tests**: Test individual functions and methods
- **Integration tests**: Test API endpoints with Supertest
- **Test naming**: Use descriptive `describe` / `it` blocks
- **Mocking**: Mock external dependencies (database, file system)
- **Coverage**: Aim for ≥ 80% code coverage

---

## Reporting Issues

### Bug Reports

Use the GitHub issue template and include:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Screenshots if applicable

### Feature Requests

Open an issue with the `enhancement` label and include:
- Clear description of the feature
- Use cases and benefits
- Any proposed implementation approach

---

## Questions?

Open a [Discussion](https://github.com/YOUR_USERNAME/milkboy/discussions) on GitHub or reach out to the maintainers.

Thank you for contributing! 🎉
