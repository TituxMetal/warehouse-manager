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
| **Cell**     | `4`    | Major warehouse section (1-2 digits)                                                                                    |
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

### From `astro-warehouse-visualizer` — PORT

| What          | Where                  | Notes                           |
| ------------- | ---------------------- | ------------------------------- |
| Prisma models | `prisma/schema.prisma` | Adapt to Prisma 7 syntax        |
| Domain logic  | Throughout             | Odd/even, bay structure, levels |
| UI components | `src/components/`      | Rewrite in feature structure    |
| Visual design | CSS/styles             | Dark theme, green/blue accents  |

### From `astro-warehouse-visualizer` — DISCARD

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
Continue coaching me through the Warehouse Manager migration plan at docs/VISION.md

Your role: Coach/Teacher, NOT implementer

## Rules:

1. Read files yourself - Don't ask me to paste code, use the Read tool
2. Run verification commands yourself - After ANY code change, YOU run: bun run test, bun run
   typecheck, bun run lint:check
3. Guide me step-by-step - Explain what to do and why, I write the code
4. Be critical - Challenge the plan if something doesn't make sense
5. Read GitHub issues - Use gh issue view <number> before starting a phase
6. No signatures in commits - No "Generated with Claude Code" or "Co-Authored-By"
7. ALWAYS check existing code patterns before suggesting new code
8. NO semicolons, NO if-else (use early returns), use semantic HTML
9. Use monorepo commands (bun run --cwd apps/api) - NEVER cd into directories
10. Reference astro-warehouse-visualizer for domain logic and UI patterns

## Workflow per phase:

- Read GitHub issue first (if exists)
- Create branch from develop: git checkout -b feature/<branch-name>
- Guide me through each step, wait for confirmation
- After completion: YOU run all checks
- Create PR to develop with labels
- Update this file with checkmarks and next phase prompt

## Current Phase: [PHASE NUMBER]
```

### Code Style Rules

```text
ALWAYS:
├── NO semicolons
├── NO if-else (use early returns)
├── Semantic HTML
├── Monorepo commands: bun run --cwd apps/api (NEVER cd)
├── Check existing patterns before new code
├── Zinc gray scale (no pure white/black)
└── Maximum unit test coverage

NEVER:
├── No signatures in commits
├── No "Co-Authored-By"
├── Don't ask to paste code — use Read tool
└── Don't ask to run commands — run them yourself
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

**Starting a New Phase:**

```bash
# 1. Create GitHub issue (for phases, not tiny fixes)
gh issue create --title "Phase 1: Schema Migration" \
  --body "Add warehouse domain models to Prisma schema" \
  --label "enhancement,api"

# 2. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/phase-1-schema-migration

# 3. Work, commit, push
# Commits follow conventional commits (commitlint enforces)
# Reference issue: feat(api): add Cell model (#1)

# 4. Create PR to develop
git push -u origin feature/phase-1-schema-migration
gh pr create --base develop \
  --title "Phase 1: Schema Migration" \
  --body "Closes #1"

# 5. Merge PR with REBASE, delete branch
gh pr merge --rebase --delete-branch
```

**Releasing to Main:**

```bash
# 1. Create PR from develop to main
gh pr create --base main --head develop \
  --title "Release: Phase 1 complete" \
  --body "Schema migration for warehouse domain"

# 2. Merge PR with REBASE (linear history, no merge commits)
gh pr merge --rebase

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
gh pr create --base develop --title "Fix typo in README"
gh pr merge --rebase --delete-branch
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
- [ ] **Phase 1:** Schema Migration
- [ ] **Phase 2:** Domain Layer
- [ ] **Phase 3:** Infrastructure Layer
- [ ] **Phase 4:** Application Layer
- [ ] **Phase 5:** Frontend Integration
- [ ] **Phase 6:** Seed Data & Polish

---

_Document created: December 22, 2025_ _Last updated: December 24, 2025_
