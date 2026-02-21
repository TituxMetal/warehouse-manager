# Warehouse Manager — MVP Definition

## Overview

A warehouse management visualization tool built by a warehouse worker who lives the domain every
day. Create warehouse cell structures with real parameters and browse them visually — aisles, bays,
positions, levels — exactly as they exist in the physical warehouse.

**Target users:** Initially myself, demoing to hierarchy what a modern WMS could look like.
Potentially useful for warehouse planning and onboarding new workers.

## Core Value

1. **Create real warehouse structures** — Define cell parameters and generate the complete hierarchy
   (aisles, bays, locations) automatically
2. **Visualize the warehouse** — Browse the structure the way you'd walk through it: cells → aisles
   → bays → positions → levels
3. **Find any location instantly** — Search by warehouse address (e.g. `4-016-0026-30`) and see its
   context

## Reference

Functional prototype: `reference/astro-warehouse-visualizer/`

This prototype serves as the visual and functional reference. The real project is being rebuilt from
scratch with proper hexagonal architecture, a separated NestJS API layer, and improvements
(variable-width bays, proper domain modeling, typed API client).

## MVP Scope

### MVP Core (Must Ship)

The minimum to have something impressive and demonstrable: create a cell, browse the structure,
search a location.

### MVP Full (Nice to Have)

Block reason management, location blocking/unblocking, cell statistics, and admin tools.

---

## MVP Core Features

### 1. Authentication (done)

- [x] User registration (email/password)
- [x] User login/logout
- [x] Protected routes

### 2. Cell Creation

- [ ] Create a warehouse cell with full parameters:
  - Cell number (1-9)
  - Aisle range (start to end)
  - Location types per side (odd/even/both for start and end aisles)
  - Positions per aisle
  - Number of levels
  - Picking level toggle
- [ ] Live summary preview showing generated structure before creation
- [ ] View list of created cells

### 3. Warehouse Browsing

- [ ] Warehouse overview (grid of cell cards with key stats)
- [ ] Cell detail (aisles grouped by number, odd/even sides color-coded — sky for odd, emerald for
      even)
- [ ] Aisle detail (two-column layout: odd side / even side, bays with expandable positions, level
      badges — amber for picking, zinc for reserve)

### 4. Location Search

- [ ] Search by warehouse address (e.g. `4-016-0026-30`)
- [ ] Location context view (windowed display: ±2 aisles, ±5 positions around target)
- [ ] Selected location highlighted in context

---

## MVP Full Features (Post-Core)

### 5. Block Reason Management

- [ ] Create, edit, delete block reasons
- [ ] View block reasons list

### 6. Location Blocking

- [ ] Block a location with a reason
- [ ] Unblock a location
- [ ] View all blocked locations

### 7. Cell Statistics

- [ ] Location counts by status for a cell
- [ ] Warehouse-wide statistics (total cells, aisles, locations)

### 8. Cell Deletion

- [ ] Delete a cell with cascade (removes all aisles, bays, locations)
- [ ] Confirmation before deletion

---

## Technical Stack

| Layer                     | Technology                                 |
| ------------------------- | ------------------------------------------ |
| Monorepo                  | Turborepo 2.x                              |
| Runtime & Package Manager | Bun 1.3.x                                  |
| Backend                   | NestJS 11.x (Hexagonal/Clean Architecture) |
| Database                  | SQLite (dev & prod)                        |
| ORM                       | Prisma 7.x                                 |
| Auth                      | Better Auth 1.4.x                          |
| Frontend                  | Astro 5.x + React 19.x                     |
| State                     | Nanostores                                 |
| Styling                   | TailwindCSS v4 (dark zinc theme)           |
| Testing                   | Bun test (backend & frontend)              |
| Linting                   | ESLint 9.x + Prettier 3.x                  |

### Architecture

- **Backend:** Hexagonal/Clean Architecture (domain → application → infrastructure layers)
- **Frontend:** Feature-based folder structure (following auth/profile/admin patterns)
- **Testing:** TDD approach — tests alongside each unit

## Data Model (High-Level)

```text
Cell
├── number (1-9, unique identifier)
├── aislesCount
├── locationsPerAisle
├── levelsPerLocation
└── aisles[]

Aisle
├── number (e.g. 1, 2, ... 37)
├── isOdd (boolean — each corridor has two rack faces: odd and even)
├── cellId (parent)
├── bays[]
└── locations[]

Bay
├── number (sequential within aisle)
├── width (3 or 4 positions — variable, optimized by algorithm)
├── startPosition (base index for position calculation)
├── aisleId (parent)
└── locations[]

Location
├── position (odd side: 1,3,5... / even side: 2,4,6...)
├── level (0=picking, 10, 20, 30, 40, 50)
├── isPicking (true for level 0 when enabled)
├── status (available / occupied / blocked)
├── aisleId, bayId
└── blockReasonId (optional)

BlockReason
├── code (unique, e.g. "PILLAR")
├── name, description
└── permanent (boolean)
```

**Address format:** `cell-aisle-position-level` → `4-016-0026-30`

| Component | Format   | Example | Range       |
| --------- | -------- | ------- | ----------- |
| Cell      | 1 digit  | `4`     | 1-9         |
| Aisle     | 3 digits | `016`   | 001-999     |
| Position  | 4 digits | `0026`  | 0001-9999   |
| Level     | 2 digits | `30`    | 00, 10...90 |

## Out of Scope (for MVP Core & Full)

- Tunnel bay support (bays with reduced levels at cross-aisles)
- Obstacle management (physical obstacles in locations)
- Products in locations / stock tracking
- Stock movement history
- Mileage/frequency-based alerts
- Multi-warehouse support
- Import/export of warehouse definitions
- Public/shared warehouse views

## "Done" Criteria

### MVP Core (Required)

- [ ] Auth works (register, login, logout) — already done
- [ ] Can create a warehouse cell through the UI with real parameters
- [ ] Live preview shows structure before creation
- [ ] Can browse: overview → cell detail → aisle detail (bays, positions, levels)
- [ ] Can search a location by address and see its windowed context
- [ ] Dark zinc theme, consistent with existing UI
- [ ] All tests pass
- [ ] `bun run test`, `bun run typecheck`, `bun run lint:check`, `bun run format:check` all pass

### MVP Full (Stretch Goal)

- [ ] All MVP Core criteria met
- [ ] Block reason CRUD works
- [ ] Can block/unblock locations
- [ ] Cell statistics displayed

## Build Order (High-Level)

> **Note:** This is a bird's-eye view, not a detailed dev plan. Each item represents a complete
> feature (backend + frontend + tests). Detailed step-by-step planning happens in Feature Shapes and
> Implementation Plans — keep sessions focused on ONE feature to avoid context compaction.

### MVP Core

1. **Warehouse infrastructure setup** — Prisma repositories, controllers, NestJS module wiring.
   Proves the hexagonal pattern works end-to-end for the warehouse domain.
2. **Cell Creation** — Full feature: create cell form with live preview, backend orchestration,
   structure generation
3. **Warehouse Browsing** — Full feature: overview, cell detail, aisle detail with bays/positions/
   levels
4. **Location Search** — Full feature: address input, parsed lookup, windowed context view
5. **Polish** — UI refinements, responsive checks, edge case handling

### MVP Full (if time permits)

All the MVP Core features, plus:

1. **Block Reason Management** — CRUD for block reasons
2. **Location Blocking** — Block/unblock through UI
3. **Cell Statistics & Deletion** — Stats display, delete with confirmation

---

_Created: February 20, 2026_
