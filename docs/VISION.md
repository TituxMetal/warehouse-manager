# Warehouse Manager — Project Vision & Migration Plan

> A warehouse management system built by a warehouse worker who lives the domain every day.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Domain Knowledge](#2-domain-knowledge)
3. [Technical Architecture](#3-technical-architecture)
4. [Migration Plan](#4-migration-plan)
5. [Source Material](#5-source-material)
6. [Claude Code Coaching](#6-claude-code-coaching)

---

## 1. Project Overview

### Vision & Motivation

This project exists at the intersection of two passions: **logistics operations** and **clean
software craftsmanship**.

As a warehouse command preparator (order picker), I experience the pain points of enterprise
warehouse management systems every day. This project is my answer — not to replace those systems
tomorrow, but to prove that modern, elegant solutions are possible.

The goal is not to compete with enterprise systems, but to prove — primarily to myself — that I can
build something better. The craft is the reward.

### Goals

- **Personal skill growth** in fullstack TypeScript development
- **Practice clean/hexagonal architecture** in a real domain I understand deeply
- **Build fully typesafe, thoroughly tested code** with maximum unit test coverage
- **Create a demo** that could one day show my hierarchy what's possible
- **Continuous learning** and curiosity-driven development

### Non-Goals

- ❌ This is **NOT** a commercial product
- ❌ This is **NOT** replacing Infolog tomorrow (maybe someday, maybe never)
- ❌ This is **NOT** trying to be feature-complete with enterprise WMS systems
- ❌ This is **NOT** about external validation — the craft is the reward

---

## 2. Domain Knowledge

### Warehouse Addressing System

The warehouse uses a hierarchical addressing format: `CELL-AISLE-POSITION-LEVEL`

**Example:** `4-016-0026-30`

| Component    | Value  | Description                                                                                                             |
| ------------ | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Cell**     | `4`    | Major warehouse section (1 digit)                                                                                       |
| **Aisle**    | `016`  | Corridor within cell (3 digits, zero-padded). Each aisle exists TWICE — once for odd positions, once for even positions |
| **Position** | `0026` | Specific slot along the aisle (4 digits, zero-padded)                                                                   |
| **Level**    | `30`   | Vertical height (2 digits). Values: 00, 10, 20, 30, 40, 50                                                              |

### Physical Structure

```text
TOP VIEW — WAREHOUSE CELL (AISLE WITH TUNNEL)
═══════════════════════════════════════════════════════════════════════════

              POSITIONS 0001→0100      0101→0104       0105→0200
              (6 levels each)        (TUNNEL BAY)     (6 levels each)
              ←─────────────────→    ←──────────→    ←─────────────────→

    Aisle 001 ODD   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │    │    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    ─────────────── │  (corridor)   │    │    │    │  (corridor)   │
    Aisle 001 EVEN  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │    │    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
                    │               │  CROSS  │    │               │
    Aisle 002 ODD   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  AISLE  │    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    ─────────────── │  (corridor)   │ TUNNEL  │    │  (corridor)   │
    Aisle 002 EVEN  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ (only   │    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
                    │               │ levels  │    │               │
         ...        │      ...      │ 40, 50  │    │      ...      │
                    │               │ above)  │    │               │
    Aisle 020 EVEN  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │    │    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│

                               CROSS-AISLE TUNNEL
        Ground level is OPEN for circulation. Only levels 40 & 50 exist
               above the tunnel (positions 0101-0104 in this example).
```

```text
SIDE VIEW — AISLE WITH TUNNEL BAY
═══════════════════════════════════════════════════════════════════════════

  Positions:   0098  0099  0100 │ 0101  0102  0103  0104 │ 0105  0106  0107
                                │                        │
  Level 50     ▓▓▓▓  ▓▓▓▓  ▓▓▓▓ │ ▓▓▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓ │ ▓▓▓▓  ▓▓▓▓  ▓▓▓▓
  Level 40     ▓▓▓▓  ▓▓▓▓  ▓▓▓▓ │ ▓▓▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓ │ ▓▓▓▓  ▓▓▓▓  ▓▓▓▓
  Level 30     ▓▓▓▓  ▓▓▓▓  ▓▓▓▓ │                        │ ▓▓▓▓  ▓▓▓▓  ▓▓▓▓
  Level 20     ▓▓▓▓  ▓▓▓▓  ▓▓▓▓ │      T U N N E L       │ ▓▓▓▓  ▓▓▓▓  ▓▓▓▓
  Level 10     ▓▓▓▓  ▓▓▓▓  ▓▓▓▓ │      (open space)      │ ▓▓▓▓  ▓▓▓▓  ▓▓▓▓
  Level 00     ░░░░  ░░░░  ░░░░ │  ←── circulation ──→   │ ░░░░  ░░░░  ░░░░
  ═════════════════════════════════════════════════════════════════════════
               FULL LEVELS      │    TUNNEL BAY          │    FULL LEVELS
              (6 levels)        │   (only 40, 50)        │    (6 levels)
```

```text
SIDE VIEW — ONE BAY (between two uprights/montants)
═══════════════════════════════════════════════════════════════════════════

     Upright                                    Upright
    (Montant)                                  (Montant)
        │                                          │
        │   ┌──────────────────────────────────┐   │
Level 50│   │  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓      │   │  ← Reserve
        │   ├──────────────────────────────────┤   │  ← Beam (Lisse)
Level 40│   │  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓      │   │  ← Reserve
        │   ├──────────────────────────────────┤   │  ← Beam (Lisse)
Level 30│   │  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓      │   │  ← Reserve
        │   ├──────────────────────────────────┤   │  ← Beam (Lisse)
Level 20│   │  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓      │   │  ← Reserve
        │   ├──────────────────────────────────┤   │  ← Beam (Lisse)
Level 10│   │  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓      │   │  ← Reserve
        │   ├──────────────────────────────────┤   │  ← Beam (Lisse)
Level 00│   │  ░░░░░░░  ░░░░░░░  ░░░░░░░      │   │  ← PICKING
        │   └──────────────────────────────────┘   │
        │                                          │
     ═══╧══════════════════════════════════════════╧═══  Ground

              Pos 1      Pos 2      Pos 3
           ←────────── 3 positions ──────────→
           ←─────────── ONE BAY ─────────────→
```

### Glossary

| Term (EN)                | Term (FR)             | Definition                                                                                                        |
| ------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Cell**                 | Cellule               | Major warehouse zone containing multiple aisles                                                                   |
| **Aisle**                | Allée                 | A corridor with storage on both sides (odd/even faces)                                                            |
| **Cross-aisle / Tunnel** | Allée de circulation  | Perpendicular passage cutting ACROSS all aisles, allowing workers to move between aisles without going to the end |
| **Aisle corridor**       | Allée de stockage     | The path BETWEEN odd and even rack faces (parallel to positions)                                                  |
| **Upright**              | Montant / Échelle     | Vertical steel column forming the rack structure                                                                  |
| **Beam**                 | Lisse                 | Horizontal rail that supports pallets, defines levels                                                             |
| **Bay**                  | Travée                | The space between two uprights, contains 3-4 positions                                                            |
| **Position**             | Emplacement           | One pallet slot within a bay                                                                                      |
| **Level**                | Niveau                | Vertical height (00, 10, 20, 30, 40, 50)                                                                          |
| **Picking location**     | Emplacement picking   | Ground level (00) accessible to order pickers                                                                     |
| **Reserve location**     | Emplacement réserve   | Upper levels (10-50) for stock replenishment or homogeneous shipping                                              |
| **Upright protector**    | Protection de montant | Yellow guards protecting the vertical posts from forklift damage                                                  |

### Location Types

| Type                                       | Description                                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Picking** (`level 00`, `isPicking=true`) | Ground-level locations accessible by order pickers for daily order preparation                      |
| **Reserve** (`levels 10-50`)               | Upper levels that supply picking locations below, or store homogeneous products for direct shipping |
| **Shipping dock**                          | Ground-level but NOT picking — reserved for outbound staging                                        |
| **Tunnel bay**                             | Bays with only levels 40-50, ground is open for forklift/picker circulation                         |

### Obstacles & Block Reasons

Certain locations cannot store products due to physical obstacles:

- Concrete pillars
- Fire hoses / safety equipment
- Waste collection zones (cardboard, plastic film, strapping)
- Pallet storage (empty pallets, broken pallets)

These are tracked with `BlockReason` (why it's blocked) and `Obstacle` (what's physically there).

---

## 3. Technical Architecture

### Monorepo Structure

```text
warehouse-manager/
├── apps/
│   ├── api/                         # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/                # Better Auth module (existing)
│   │   │   ├── users/               # User module (existing)
│   │   │   ├── warehouse/           # Warehouse domain (NEW)
│   │   │   │   ├── domain/          # Entities, repository interfaces
│   │   │   │   ├── application/     # Use cases, services, DTOs
│   │   │   │   └── infrastructure/  # Prisma repos, controllers
│   │   │   └── shared/              # Shared domain/infrastructure
│   │   └── prisma/                  # Database schema & migrations
│   │
│   └── web/                         # Astro frontend
│       ├── src/
│       │   ├── components/          # Shared React/Astro components
│       │   ├── features/            # Feature-based organization
│       │   │   └── warehouse/       # Warehouse UI (NEW)
│       │   │       ├── components/
│       │   │       ├── hooks/
│       │   │       ├── services/
│       │   │       ├── stores/      # Nanostores
│       │   │       └── types/
│       │   ├── pages/               # Astro pages
│       │   └── lib/                 # Better Auth client, API client
│       └── public/
│
├── packages/
│   ├── eslint-config/               # Shared ESLint configuration
│   └── ts-config/                   # Shared TypeScript configuration
│
├── docker/                          # Docker configs
├── docs/                            # Documentation
│   └── VISION.md                    # This document
└── scripts/                         # Utility scripts
```

### Tech Stack

| Layer                | Technology            | Version | Purpose                                      |
| -------------------- | --------------------- | ------- | -------------------------------------------- |
| **Runtime**          | Bun                   | 1.3.x   | Fast JS runtime & package manager            |
| **Monorepo**         | Turborepo             | 2.x     | Build orchestration, caching                 |
| **Backend**          | NestJS                | 11.x    | API framework with dependency injection      |
| **ORM**              | Prisma                | 7.x     | Type-safe database access (generated folder) |
| **Database**         | SQLite                | -       | Data persistence (dev AND prod)              |
| **Auth**             | Better Auth           | 1.4.x   | Authentication (API adapter + React client)  |
| **Frontend**         | Astro                 | 5.x     | SSR + Static site generation                 |
| **UI Library**       | React                 | 19.x    | Interactive components                       |
| **State Management** | Nanostores            | -       | Lightweight reactive state                   |
| **Styling**          | TailwindCSS           | 4.x     | Utility-first CSS                            |
| **Testing**          | Bun test              | -       | Unit & integration tests                     |
| **Code Quality**     | ESLint 9 + Prettier 3 | -       | Linting & formatting                         |
| **Git Hooks**        | Husky + CommitLint    | -       | Conventional commits                         |
| **CI/CD**            | GitHub Actions        | -       | Automated builds & deploys                   |
| **Containers**       | Docker                | -       | Deployment packaging                         |

### Architecture Principles

**Backend — Hexagonal/Clean Architecture:**

```text
┌─────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                        │
│  Controllers, Prisma Repositories, External Services     │
├─────────────────────────────────────────────────────────┤
│                     APPLICATION                          │
│        Use Cases, Application Services, DTOs             │
├─────────────────────────────────────────────────────────┤
│                       DOMAIN                             │
│     Entities, Value Objects, Repository Interfaces       │
│            (No dependencies on outer layers)             │
└─────────────────────────────────────────────────────────┘
```

**Frontend — Feature-based Organization:**

```text
features/
└── warehouse/
    ├── components/      # UI components for this feature
    ├── hooks/           # React hooks
    ├── services/        # API calls
    ├── stores/          # Nanostores
    └── types/           # TypeScript types
```

## NEW SECTION: Add after "Architecture Principles" in Section 3

---

### Domain Layer Design

**CRITICAL: Entities are NOT just data classes.**

In proper hexagonal/clean architecture, the domain layer contains **business logic**, not just data
structures. This is the whole point of the architecture — to keep business rules in the domain,
independent of frameworks.

#### Value Objects

Value objects encode domain rules and validation. They are **immutable** and compared by value.

```text
apps/api/src/warehouse/domain/value-objects/
├── level.vo.ts          # Validates: 0-90, multiples of 10
├── position.vo.ts       # Validates: 1-9999
├── aisle-number.vo.ts   # Validates: 1-999
└── cell-number.vo.ts    # Validates: 1-9
```

**Example Value Object:**

```typescript
// level.vo.ts
export class LevelValueObject {
  private constructor(private readonly _value: number) {}

  static create(value: number): LevelValueObject {
    if (value < 0 || value > 90) {
      throw new Error(`Level must be between 0 and 90, got ${value}`)
    }
    if (value % 10 !== 0) {
      throw new Error(`Level must be multiple of 10, got ${value}`)
    }
    return new LevelValueObject(value)
  }

  get value(): number {
    return this._value
  }

  // BEHAVIOR: Format for display
  toString(): string {
    return this._value.toString().padStart(2, '0')
  }

  // BEHAVIOR: Domain logic
  isPicking(): boolean {
    return this._value === 0
  }

  isReserve(): boolean {
    return this._value > 0
  }

  // BEHAVIOR: Comparison
  equals(other: LevelValueObject): boolean {
    return this._value === other._value
  }
}
```

#### Entities

Entities have **identity** (an ID) and **behavior** (methods that operate on their data). They
encapsulate business rules.

**WRONG — Anemic entity (just data):**

```typescript
// ❌ This is NOT proper domain modeling
export class LocationEntity {
  constructor(
    public readonly id: string,
    public readonly position: number,
    public readonly level: number,
    public readonly status: string,
    public readonly blockReasonId: string | null
  ) {}
}
```

**RIGHT — Rich entity (data + behavior):**

```typescript
// ✅ This IS proper domain modeling
export class LocationEntity {
  constructor(
    private readonly _id: string,
    private readonly _position: PositionValueObject,
    private readonly _level: LevelValueObject,
    private _status: LocationStatus,
    private _blockReasonId: string | null,
    private readonly _aisleId: string,
    private readonly _bayId: string
  ) {}

  // === GETTERS (expose data) ===
  get id(): string {
    return this._id
  }
  get position(): PositionValueObject {
    return this._position
  }
  get level(): LevelValueObject {
    return this._level
  }
  get status(): LocationStatus {
    return this._status
  }
  get blockReasonId(): string | null {
    return this._blockReasonId
  }

  // === BEHAVIOR (domain logic) ===

  /**
   * Check if this is a picking location (ground level)
   */
  isPicking(): boolean {
    return this._level.isPicking()
  }

  /**
   * Check if this location is blocked by an obstacle
   */
  isBlocked(): boolean {
    return this._blockReasonId !== null
  }

  /**
   * Check if this location can receive products
   */
  isAvailable(): boolean {
    return this._status === LocationStatus.AVAILABLE && !this.isBlocked()
  }

  /**
   * Format the full warehouse address
   * Requires parent context (cell, aisle numbers)
   */
  formatAddress(cellNumber: CellNumberVO, aisleNumber: AisleNumberVO): string {
    return `${cellNumber.toString()}-${aisleNumber.toString()}-${this._position.toString()}-${this._level.toString()}`
  }

  /**
   * Block this location with a reason
   */
  block(reasonId: string): void {
    if (this._blockReasonId !== null) {
      throw new Error('Location is already blocked')
    }
    this._blockReasonId = reasonId
    this._status = LocationStatus.BLOCKED
  }

  /**
   * Unblock this location
   */
  unblock(): void {
    if (this._blockReasonId === null) {
      throw new Error('Location is not blocked')
    }
    this._blockReasonId = null
    this._status = LocationStatus.AVAILABLE
  }
}
```

#### Entity Methods by Entity

Reference the `reference/astro-warehouse-visualizer/src/utils/warehouse.ts` file for business logic
that should be moved INTO entities:

| Entity                | Methods to Implement                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **CellEntity**        | `getTotalLocations()`, `getValidLevels()`, `getAisleCount()`                             |
| **AisleEntity**       | `getLabel()` (e.g., "Aisle 016 (Odd)"), `getPositionRange()`                             |
| **BayEntity**         | `getPositions()`, `isTunnelBay()`, `getAvailableLevels()`                                |
| **LocationEntity**    | `isPicking()`, `isBlocked()`, `isAvailable()`, `formatAddress()`, `block()`, `unblock()` |
| **BlockReasonEntity** | `getDisplayName()`                                                                       |
| **ObstacleEntity**    | `getDisplayName()`, `isPermanent()`                                                      |

#### The Principle

> **"If you have a utility function that takes entity data and does something with it, that function
> probably belongs IN the entity."**

Look at `reference/astro-warehouse-visualizer/src/utils/warehouse.ts` — most of those utility
functions should become entity methods in proper clean architecture.

#### Testing Entities

Test the **behavior**, not just construction:

```typescript
// ❌ Weak test — only tests construction
describe('LocationEntity', () => {
  it('should create a location', () => {
    const location = new LocationEntity(...)
    expect(location.id).toBe('123')
  })
})

// ✅ Strong test — tests behavior
describe('LocationEntity', () => {
  it('should identify picking locations at level 00', () => {
    const location = LocationEntity.create({ level: 0, ... })
    expect(location.isPicking()).toBe(true)
  })

  it('should identify reserve locations at level 10+', () => {
    const location = LocationEntity.create({ level: 30, ... })
    expect(location.isPicking()).toBe(false)
  })

  it('should report availability based on status and block reason', () => {
    const available = LocationEntity.create({ status: 'AVAILABLE', blockReasonId: null })
    const blocked = LocationEntity.create({ status: 'AVAILABLE', blockReasonId: 'pillar' })

    expect(available.isAvailable()).toBe(true)
    expect(blocked.isAvailable()).toBe(false)
  })

  it('should format warehouse address correctly', () => {
    const location = LocationEntity.create({ position: 26, level: 30 })
    const address = location.formatAddress(
      CellNumberVO.create(4),
      AisleNumberVO.create(16)
    )
    expect(address).toBe('4-016-0026-30')
  })
})
```

---

### Key Technical Decisions

| Decision         | Choice                           | Rationale                                                   |
| ---------------- | -------------------------------- | ----------------------------------------------------------- |
| Database         | SQLite (dev & prod)              | Simple, no external dependencies, sufficient for this scope |
| Auth library     | Better Auth                      | Modern, maintained, NestJS adapter, replaces Lucia          |
| Prisma version   | 7.x with generated folder        | Latest features, better type generation                     |
| State management | Nanostores                       | Lightweight, works great with Astro, already familiar       |
| API style        | REST                             | Simple, testable, sufficient for this scope                 |
| Testing strategy | Unit test everything possible    | Build confidence, catch regressions early                   |
| Visualization    | TailwindCSS grids (start simple) | What works now, can add SVG later if needed                 |

### UI Design

```text
THEME: Dark Zinc (NO light mode)

Colors:
├── Background:     zinc-900, zinc-950
├── Cards:          zinc-800 with zinc-700 borders
├── Text:           zinc-100, zinc-200, zinc-300
├── Accent (Even):  Green (emerald/green)
├── Accent (Odd):   Blue (blue/sky)
└── NEVER:          pure white (#fff), pure black (#000)
```

---

## 4. Migration Plan

### Phase 0: Project Setup

**Goal:** Create new repository from sample-project template

**Method:** Use `createNewProject-script` + manual adjustments

| Step | Who    | Action                                                      | Verification    |
| ---- | ------ | ----------------------------------------------------------- | --------------- |
| 0.1  | YOU    | Run `createNewProject-script` to create `warehouse-manager` | Folder created  |
| 0.2  | YOU    | Manual adjustments if needed                                | —               |
| 0.3  | Claude | Verify: `bun install`, `bun run dev`                        | Both apps start |
| 0.4  | YOU    | Create `docs/VISION.md` with this document                  | File exists     |
| 0.5  | YOU    | Initial commit: `feat: initialize warehouse-manager`        | Committed       |

---

### Phase 1: Schema Migration

**Goal:** Add warehouse domain models to Prisma schema

| Step | Action                                                                      | Verification          |
| ---- | --------------------------------------------------------------------------- | --------------------- |
| 1.1  | Open `apps/api/prisma/schema.prisma`                                        | File open             |
| 1.2  | Add `Cell` model                                                            | Model added           |
| 1.3  | Add `Aisle` model with `isOdd` field                                        | Model added           |
| 1.4  | Add `Bay` model                                                             | Model added           |
| 1.5  | Add `Location` model with `isPicking`, `status`                             | Model added           |
| 1.6  | Add `BlockReason` model                                                     | Model added           |
| 1.7  | Add `Obstacle` model                                                        | Model added           |
| 1.8  | Run `bun run --cwd apps/api prisma generate`                                | Types in `generated/` |
| 1.9  | Run `bun run --cwd apps/api prisma migrate dev --name add-warehouse-models` | Migration created     |
| 1.10 | Commit: `feat(api): add warehouse domain models to prisma schema`           | Committed             |

**Reference:** See `astro-warehouse-visualizer/prisma/schema.prisma` for model structure

**DO NOT migrate:** User, Session, UserAuth — Better Auth handles authentication

---

### Phase 2: Domain Layer (Backend)

**Goal:** Create warehouse domain entities and repository interfaces

**Structure:**

```text
apps/api/src/warehouse/
├── domain/
│   ├── entities/
│   │   ├── cell.entity.ts
│   │   ├── aisle.entity.ts
│   │   ├── bay.entity.ts
│   │   ├── location.entity.ts
│   │   ├── block-reason.entity.ts
│   │   └── obstacle.entity.ts
│   └── repositories/
│       ├── cell.repository.interface.ts
│       ├── aisle.repository.interface.ts
│       ├── bay.repository.interface.ts
│       └── location.repository.interface.ts
```

| Step | Action                                                     | Verification       |
| ---- | ---------------------------------------------------------- | ------------------ |
| 2.1  | Create `warehouse/domain/entities/` folder structure       | Folders exist      |
| 2.2  | Create entity files with properties matching Prisma models | Files created      |
| 2.3  | Create `warehouse/domain/repositories/` folder             | Folder exists      |
| 2.4  | Create repository interfaces                               | Interfaces defined |
| 2.5  | Write unit tests for entities                              | Tests pass         |
| 2.6  | Commit: `feat(api): add warehouse domain layer`            | Committed          |

**Reference:** Check `apps/api/src/users/` for existing patterns

---

### Phase 3: Infrastructure Layer (Backend)

**Goal:** Implement Prisma repositories and create NestJS module

**Structure:**

```text
apps/api/src/warehouse/
├── infrastructure/
│   ├── repositories/
│   │   ├── prisma-cell.repository.ts
│   │   ├── prisma-aisle.repository.ts
│   │   ├── prisma-bay.repository.ts
│   │   └── prisma-location.repository.ts
│   └── controllers/
│       ├── cell.controller.ts
│       ├── aisle.controller.ts
│       └── location.controller.ts
├── warehouse.module.ts
```

| Step | Action                                                            | Verification               |
| ---- | ----------------------------------------------------------------- | -------------------------- |
| 3.1  | Create `infrastructure/repositories/` with Prisma implementations | Repos implement interfaces |
| 3.2  | Write unit tests for repositories (mock Prisma)                   | Tests pass                 |
| 3.3  | Create `infrastructure/controllers/` with CRUD endpoints          | Controllers created        |
| 3.4  | Create `warehouse.module.ts`                                      | Module configured          |
| 3.5  | Register in `app.module.ts`                                       | API endpoints respond      |
| 3.6  | Write integration tests                                           | Tests pass                 |
| 3.7  | Commit: `feat(api): add warehouse infrastructure layer`           | Committed                  |

---

### Phase 4: Application Layer (Backend)

**Goal:** Create use cases and application services

**Structure:**

```text
apps/api/src/warehouse/
├── application/
│   ├── use-cases/
│   │   ├── create-cell.use-case.ts
│   │   ├── get-cell-overview.use-case.ts
│   │   ├── get-aisle-details.use-case.ts
│   │   └── find-location.use-case.ts
│   ├── services/
│   │   └── warehouse.service.ts
│   └── dtos/
│       ├── create-cell.dto.ts
│       └── cell-response.dto.ts
```

| Step | Action                                               | Verification           |
| ---- | ---------------------------------------------------- | ---------------------- |
| 4.1  | Create `application/` folder structure               | Folders exist          |
| 4.2  | Create DTOs for requests/responses                   | DTOs typed             |
| 4.3  | Create use cases with business logic                 | Use cases work         |
| 4.4  | Write unit tests for use cases                       | Tests pass             |
| 4.5  | Update controllers to use application layer          | Controllers refactored |
| 4.6  | Commit: `feat(api): add warehouse application layer` | Committed              |

---

### Phase 5: Frontend Integration

**Goal:** Port visualization from astro-warehouse-visualizer

**Structure:**

```text
apps/web/src/
├── features/
│   └── warehouse/
│       ├── components/
│       │   ├── WarehouseOverview.tsx
│       │   ├── CellCard.tsx
│       │   ├── AisleView.tsx
│       │   ├── BayGrid.tsx
│       │   └── LocationCell.tsx
│       ├── hooks/
│       │   └── useWarehouse.ts
│       ├── services/
│       │   └── warehouse.api.ts
│       ├── stores/
│       │   └── warehouse.store.ts
│       └── types/
│           └── warehouse.types.ts
├── pages/
│   └── warehouse/
│       ├── index.astro
│       └── [cellId]/
│           ├── index.astro
│           └── [aisleId].astro
```

| Step | Action                                           | Verification     |
| ---- | ------------------------------------------------ | ---------------- |
| 5.1  | Create `features/warehouse/` structure           | Folders exist    |
| 5.2  | Create TypeScript types matching API             | Types defined    |
| 5.3  | Create Nanostore for warehouse state             | Store works      |
| 5.4  | Create API service                               | API calls work   |
| 5.5  | Port WarehouseOverview component                 | Renders cells    |
| 5.6  | Port CellCard component                          | Shows stats      |
| 5.7  | Port AisleView (green/blue odd/even)             | Colors correct   |
| 5.8  | Port BayGrid with positions                      | Grid displays    |
| 5.9  | Create Astro pages with routing                  | Navigation works |
| 5.10 | Apply dark zinc theme                            | No white/black   |
| 5.11 | Write component tests                            | Tests pass       |
| 5.12 | Commit: `feat(web): add warehouse visualization` | Committed        |

**Reference:** See `astro-warehouse-visualizer/src/` for component patterns

---

### Phase 6: Seed Data & Polish

**Goal:** Create realistic test data and polish UX

| Step | Action                                   | Verification       |
| ---- | ---------------------------------------- | ------------------ |
| 6.1  | Create `apps/api/prisma/seed.ts`         | Seed script exists |
| 6.2  | Seed realistic warehouse (3 cells)       | Data in DB         |
| 6.3  | Add loading states                       | Skeletons show     |
| 6.4  | Add error handling                       | Errors displayed   |
| 6.5  | Add breadcrumb navigation                | Breadcrumbs work   |
| 6.6  | Final UI polish                          | Matches design     |
| 6.7  | Commit: `feat: add seed data and polish` | Committed          |

---

### Future Phases (Not MVP)

| Phase | Feature                        |
| ----- | ------------------------------ |
| 7     | Add Products to Locations      |
| 8     | Stock movement tracking        |
| 9     | Search ("where is product X?") |
| 10    | Mobile-responsive view         |
| 11+   | TBD based on learning goals    |

---

## 5. Source Material

### From `reference/astro-warehouse-visualizer` — PORT

| What          | Where                  | Notes                           |
| ------------- | ---------------------- | ------------------------------- |
| Prisma models | `prisma/schema.prisma` | Adapt to Prisma 7 syntax        |
| Domain logic  | Throughout             | Odd/even, bay structure, levels |
| UI components | `src/components/`      | Rewrite in feature structure    |
| Visual design | CSS/styles             | Dark theme, green/blue accents  |

### From `reference/astro-warehouse-visualizer` — DISCARD

| What                                   | Why                        |
| -------------------------------------- | -------------------------- |
| Lucia auth (`src/lib/auth.ts`)         | Better Auth replaces this  |
| Astro actions (`src/actions/`)         | API will be in NestJS      |
| User/Session/UserAuth models           | Better Auth has its own    |
| `previewFeatures = ["driverAdapters"]` | Prisma 7 doesn't need this |

### From `sample-project` — KEEP

| What                      | Action                         |
| ------------------------- | ------------------------------ |
| Monorepo structure        | Keep as-is                     |
| NestJS clean architecture | Extend with warehouse module   |
| Astro + React frontend    | Extend with warehouse features |
| Better Auth               | Keep as-is                     |
| Prisma 7 setup            | Extend with warehouse models   |
| Testing, linting, CI/CD   | Keep as-is                     |
| Users module              | Reference as pattern           |

---

## 6. Claude Code Coaching

### Coaching Prompt

Use this prompt when starting a Claude Code session:

```markdown
Coach me through the Warehouse Manager migration plan at docs/VISION.md

## PRIORITY HIERARCHY (in order of importance):

1. **I WRITE THE CODE** — You guide and explain, I implement. Never write code for me unless I
   explicitly ask.
2. **VERIFY BEFORE ACTING** — Check that commands exist in package.json before running them.
3. **ATOMIC WORK** — One logical step at a time, wait for my confirmation before proceeding.
4. **FOLLOW CODE STYLE** — NO semicolons, NO if-else (early returns only), semantic HTML.

## YOUR RESPONSIBILITIES:

- Read files yourself (use Read tool, never ask me to paste)
- Run verification commands yourself: `bun run --cwd apps/api test`, `bun run typecheck`,
  `bun run lint:check`
- Use monorepo commands ONLY: `bun run --cwd apps/api ` — NEVER `cd` into directories
- Reference existing patterns in codebase and `reference/astro-warehouse-visualizer`
- Challenge the plan if something doesn't make sense

## GIT WORKFLOW:

- **Atomic commits**: One logical change per commit (not 27 files in one commit)
- **Commit messages**: List ALL files including tests (e.g., "Add X entity with tests")
- **Before final phase commit**: Update VISION.md progress checklist first
- **No signatures**: No "Generated with Claude Code" or "Co-Authored-By"
- **Branches**: Create from develop, PR back to develop

## PHASE WORKFLOW:

1. Read/create GitHub issue (with labels: api, web, docs, infra)
2. Create branch: `git checkout -b feature/`
3. Guide me through each step — I write the code
4. After changes: YOU run all verification checks
5. Guide me through atomic commits
6. Update VISION.md progress, final commit
7. Create PR to develop with labels and assignee

## CRITICAL REMINDERS:

- "Continue without questions" means don't ask CLARIFYING questions — it does NOT mean write all
  code yourself
- If session resumes mid-task, summarize where we are and what I need to do next
- Tests are learning opportunities — guide me to write them, don't write them for me

## Current Phase: [PHASE NUMBER]
```

### Code Style Rules

```text
ALWAYS:
├── NO semicolons
├── NO if-else (use early returns)
├── Semantic HTML
├── Monorepo commands: bun run --cwd apps/api (NEVER cd)
├── Check existing patterns before suggesting new code
├── Zinc gray scale (no pure white/black)
└── Maximum unit test coverage

NEVER:
├── Write code without guidance (I write, you guide)
├── Use commands without verifying they exist
├── Commit many unrelated files together
├── Skip updating progress checklist
├── No signatures in commits
├── No "Co-Authored-By"
├── Merge manually EXCEPT if I ask you to do
└── Don't ask to paste code — use Read tool
```

### Git Workflow (GitFlow)

**Branching Strategy:**

```text
main (production-ready, stable releases)
  └── develop (integration branch, default)
        ├── feature/phase-1-schema-migration
        ├── feature/phase-2-domain-layer
        └── fix/something-broken
```

| Branch      | Purpose                                                    |
| ----------- | ---------------------------------------------------------- |
| `main`      | Production. Only receives PRs from develop. Always stable. |
| `develop`   | Integration. Features merge here. Default branch.          |
| `feature/*` | Work branches for phases/features.                         |
| `fix/*`     | Small fixes that don't need an issue.                      |

**Atomic Commit Examples:**

```bash
# ✅ GOOD - logical units
git add src/warehouse/domain/value-objects/
git commit -m "feat(api): add warehouse value objects with validation and tests

- Level.vo.ts: validates 0-90, multiples of 10
- Position.vo.ts: validates 1-9999
- AisleNumber.vo.ts: validates 1-999
- CellNumber.vo.ts: validates 1-9
- All value objects have unit tests"

# ❌ BAD - dump everything
git add src/warehouse/
git commit -m "feat(api): add warehouse domain layer"
```

**Starting a New Phase:**

```bash
# 1. Create GitHub issue
gh issue create --title "Phase X: [Name]" \
  --body "[Description]" \
  --label "enhancement,api" --assignee @me

# 2. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/phase-x-name

# 3. Work in atomic steps, commit logically
# 4. Update VISION.md checklist
# 5. Create PR to develop
gh pr create --base develop --assignee @me \
  --title "Phase X: [Name]" \
  --body "Closes #N"
```

**Releasing to Main:**

```bash
# 1. Create PR from develop to main
gh pr create --base main --head develop --assignee @me \
  --title "Release: Phase 1 complete" \
  --body "Schema migration for warehouse domain"

# 3. Sync develop with main (important after rebase!)
git checkout develop && git pull origin develop
git rebase origin/main
git push --force-with-lease

# 4. Optional: Tag the release
git checkout main && git pull
git tag -a v0.1.0 -m "Phase 1: Schema Migration"
git push origin v0.1.0
```

**Quick Fix (no issue needed):**

```bash
git checkout develop && git pull
git checkout -b fix/typo-in-readme
# ... make changes ...
git push -u origin fix/typo-in-readme
gh pr create --base develop --assignee @me --title "Fix typo in README"
```

**Labels:**

| Label   | Color     | Description           |
| ------- | --------- | --------------------- |
| `api`   | `#0E8A16` | Backend API changes   |
| `web`   | `#1D76DB` | Frontend changes      |
| `docs`  | `#0075CA` | Documentation         |
| `infra` | `#D93F0B` | Infrastructure/DevOps |

---

## Progress Tracking

### Phase Checklist

- [x] **Phase 0:** Project Setup
- [x] **Phase 1:** Schema Migration
- [x] **Phase 2:** Domain Layer
- [ ] **Phase 3:** Infrastructure Layer
- [ ] **Phase 4:** Application Layer
- [ ] **Phase 5:** Frontend Integration
- [ ] **Phase 6:** Seed Data & Polish

---

_Document created: December 22, 2025_ _Last updated: December 26, 2025_
