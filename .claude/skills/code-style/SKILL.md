# Code Style Skill

Rules for writing code in this project.

---

## TypeScript Style

```text
NO semicolons
NO if-else (use early returns only)
NO pure white (#fff) or pure black (#000) in UI
```

### Early Returns Pattern

```typescript
// ❌ BAD - if-else
function getStatus(level: number): string {
  if (level === 0) {
    return 'picking'
  } else {
    return 'reserve'
  }
}

// ✅ GOOD - early return
function getStatus(level: number): string {
  if (level === 0) return 'picking'
  return 'reserve'
}
```

---

## File Naming

### Code Files — PascalCase

```text
Pattern: PascalCase.type.ts

├── Cell.entity.ts
├── Cell.entity.spec.ts
├── Level.vo.ts
├── Level.vo.spec.ts
├── Cell.repository.ts         # Interface
├── PrismaCell.repository.ts   # Implementation
├── CreateCell.uc.ts
├── CreateCell.uc.spec.ts
├── CellResponse.dto.ts
└── Cell.controller.ts
```

### Documentation Files — kebab-case

```text
├── phase-3-application.md
├── vision.md
└── readme.md
```

---

## File Type Extensions

| Type | Extension | Example |
| ------ | ----------- | --------- |
| Entity | `.entity.ts` | `Cell.entity.ts` |
| Value Object | `.vo.ts` | `Level.vo.ts` |
| Repository Interface | `.repository.ts` | `Cell.repository.ts` |
| Repository Implementation | `.repository.ts` | `PrismaCell.repository.ts` |
| Use Case | `.uc.ts` | `CreateCell.uc.ts` |
| DTO | `.dto.ts` | `CellResponse.dto.ts` |
| Controller | `.controller.ts` | `Cell.controller.ts` |
| Test | `.spec.ts` | `Cell.entity.spec.ts` |
| Module | `.module.ts` | `Warehouse.module.ts` |

---

## Monorepo Commands

**ALWAYS use `bun run --cwd` — NEVER `cd` into directories**

```bash
# ✅ GOOD
bun run --cwd apps/api test
bun run --cwd apps/api prisma generate
bun run --cwd apps/web dev

# ❌ BAD
cd apps/api && bun run test
```

---

## UI Theme

Dark Zinc only. NO light mode.

```text
Background:  zinc-900, zinc-950
Cards:       zinc-800 with zinc-700 borders
Text:        zinc-100, zinc-200, zinc-300
Accent Even: emerald-500, emerald-600
Accent Odd:  sky-500, sky-600

NEVER: #fff (white), #000 (black)
```

---

## HTML

Use semantic elements:

```html
<!-- ✅ GOOD -->
<article>
  <header>
    <h1>Title</h1>
  </header>
  <section>Content</section>
  <footer>Meta</footer>
</article>

<!-- ❌ BAD -->
<div class="article">
  <div class="header">
    <div class="title">Title</div>
  </div>
</div>
```
