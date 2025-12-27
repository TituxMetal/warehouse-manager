# Git Workflow Skill

Rules for commits, branches, and pull requests.

---

## Branch Strategy

```text
main (production, stable)
  └── develop (integration, default)
    ├── feature/phase-3-application
    ├── feature/add-location-search
    └── fix/typo-in-readme
```

| Branch | Purpose |
| -------- | --------- |
| `main` | Production. Only PRs from develop. Always stable. |
| `develop` | Integration. Features merge here. Default branch. |
| `feature/*` | New features and phases |
| `fix/*` | Bug fixes and small corrections |

---

## Atomic Commits

**One logical change per commit.** Not 27 files dumped together.

### Commit Message Format

```text
type(scope): short description

- Detail 1
- Detail 2
- Detail 3
```

### Types

| Type | Use For |
| ------ | --------- |
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no new feature |
| `test` | Adding tests |
| `chore` | Maintenance, deps, config |

### Examples

```bash
# ✅ GOOD - atomic, descriptive
git commit -m "feat(api): add Cell entity with behavior methods

- Cell.entity.ts: getTotalLocations(), getValidLevels()
- Cell.entity.spec.ts: unit tests for all methods"

# ✅ GOOD - single file fix
git commit -m "fix(api): correct level validation range

- Level.vo.ts: change max from 50 to 90"

# ❌ BAD - too vague
git commit -m "feat(api): add domain layer"

# ❌ BAD - no details
git commit -m "fix stuff"
```

---

## Always List Files

Commit messages MUST mention what files are included, especially tests:

```bash
# ✅ GOOD
git commit -m "feat(api): add CreateCell use case

- CreateCell.uc.ts: use case implementation
- CreateCell.uc.spec.ts: unit tests with mocked repo"

# ❌ BAD - tests not mentioned
git commit -m "feat(api): add CreateCell use case"
```

---

## No Signatures

**NEVER add these to commits:**

- ❌ "Generated with Claude Code"
- ❌ "Co-Authored-By: Claude"
- ❌ Any AI attribution

---

## Phase Workflow

### Starting a Phase

```bash
# 1. Create issue (if not exists)
gh issue create --title "Phase 3: Application Layer" \
  --label "api" --assignee @me

# 2. Create branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/phase-3-application
```

### During a Phase

- Commit atomically as you complete logical units
- Run checks after each commit: `bun run typecheck && bun run lint:check`

### Finishing a Phase

```bash
# 1. Update VISION.md checklist (mark phase complete)
# 2. Final commit
git commit -m "docs: mark Phase 3 complete in VISION.md"

# 3. Push and create PR
git push -u origin feature/phase-3-application
gh pr create --base develop --assignee @me \
  --title "Phase 3: Application Layer" \
  --body "Closes #N"
```

---

## Labels

| Label | Color | Description |
| ------- | ------- | ------------- |
| `api` | green | Backend changes |
| `web` | blue | Frontend changes |
| `docs` | cyan | Documentation |
| `infra` | orange | DevOps, CI/CD |

---

## Verify Before Committing

Run checks BEFORE every commit:

```bash
bun run --cwd apps/api test
bun run typecheck
bun run lint:check
```
