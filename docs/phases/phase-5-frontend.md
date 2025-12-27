# Phase 5: Frontend Integration

**Goal:** Port visualization from astro-warehouse-visualizer to the new architecture.

---

## Structure

```text
apps/web/src/
├── features/
│   └── warehouse/
│       ├── components/
│       │   ├── WarehouseOverview.tsx
│       │   ├── CellCard.tsx
│       │   ├── AisleView.tsx
│       │   ├── BayGrid.tsx
│       │   ├── LocationCell.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useWarehouse.ts
│       │   └── index.ts
│       ├── services/
│       │   ├── warehouse.api.ts
│       │   └── index.ts
│       ├── stores/
│       │   ├── warehouse.store.ts
│       │   └── index.ts
│       ├── types/
│       │   ├── warehouse.types.ts
│       │   └── index.ts
│       └── index.ts
├── pages/
│   └── warehouse/
│       ├── index.astro
│       └── [cellId]/
│           ├── index.astro
│           └── [aisleId].astro
```

---

## Steps

| Step | Action                                                   | Verification                |
| ---- | -------------------------------------------------------- | --------------------------- |
| 5.1  | Create `features/warehouse/` folder structure            | Folders exist               |
| 5.2  | Create `types/warehouse.types.ts` matching API responses | Types defined               |
| 5.3  | Create `services/warehouse.api.ts` — API client          | API calls work              |
| 5.4  | Create `stores/warehouse.store.ts` — Nanostore           | Store works                 |
| 5.5  | Create `hooks/useWarehouse.ts` — React hook for state    | Hook works                  |
| 5.6  | Port `WarehouseOverview.tsx` — grid of cells             | Renders cells               |
| 5.7  | Port `CellCard.tsx` — cell summary card                  | Shows stats                 |
| 5.8  | Port `AisleView.tsx` — green/blue odd/even               | Colors correct              |
| 5.9  | Port `BayGrid.tsx` — positions grid                      | Grid displays               |
| 5.10 | Port `LocationCell.tsx` — single location                | Shows status                |
| 5.11 | Create `pages/warehouse/index.astro`                     | Page renders                |
| 5.12 | Create `pages/warehouse/[cellId]/index.astro`            | Routing works               |
| 5.13 | Create `pages/warehouse/[cellId]/[aisleId].astro`        | Routing works               |
| 5.14 | Apply dark zinc theme                                    | No white/black              |
| 5.15 | Write component tests                                    | Tests pass                  |
| 5.16 | Run all checks                                           | Tests, typecheck, lint pass |
| 5.17 | Commit with atomic commits                               | Committed                   |
| 5.18 | Update VISION.md progress                                | Checklist updated           |
| 5.19 | Create PR to develop                                     | PR created                  |

---

## Reference

Port patterns from `reference/astro-warehouse-visualizer/src/`:

- Component structure
- Color scheme (green for even, blue for odd)
- Grid layouts

**DO NOT PORT:**

- Lucia auth
- Astro actions (API is NestJS now)

---

## Theme Rules

```text
THEME: Dark Zinc (NO light mode)

Background:  zinc-900, zinc-950
Cards:       zinc-800 with zinc-700 borders
Text:        zinc-100, zinc-200, zinc-300
Accent Even: Green (emerald-500, emerald-600)
Accent Odd:  Blue (sky-500, sky-600)

NEVER: pure white (#fff), pure black (#000)
```

---

## API Service Pattern

```typescript
// warehouse.api.ts
const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000'

export const warehouseApi = {
  async getCells() {
    const res = await fetch(`${API_BASE}/cells`)
    return res.json()
  },

  async getCell(id: number) {
    const res = await fetch(`${API_BASE}/cells/${id}`)
    return res.json()
  },

  async getAisle(cellId: number, aisleId: number) {
    const res = await fetch(`${API_BASE}/cells/${cellId}/aisles/${aisleId}`)
    return res.json()
  }
}
```

---

## Nanostore Pattern

```typescript
// warehouse.store.ts
import { atom, computed } from 'nanostores'
import type { Cell, Aisle } from '../types/warehouse.types'

export const $cells = atom<Cell[]>([])
export const $selectedCell = atom<Cell | null>(null)
export const $selectedAisle = atom<Aisle | null>(null)
export const $isLoading = atom(false)
export const $error = atom<string | null>(null)

export const $cellCount = computed($cells, cells => cells.length)
```

---

## Commits for this Phase

Suggested atomic commits:

1. `feat(web): add warehouse types and API service`
2. `feat(web): add warehouse store with nanostores`
3. `feat(web): add WarehouseOverview and CellCard components`
4. `feat(web): add AisleView and BayGrid components`
5. `feat(web): add LocationCell component`
6. `feat(web): add warehouse pages with routing`
7. `style(web): apply dark zinc theme`
8. `test(web): add component tests`
9. `docs: update VISION.md for Phase 5 completion`
