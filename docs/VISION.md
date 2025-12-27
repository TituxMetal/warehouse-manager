# Warehouse Manager — Project Vision

> A warehouse management system built by a warehouse worker who lives the domain every day.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Domain Knowledge](#2-domain-knowledge)
3. [Technical Architecture](#3-technical-architecture)
4. [Progress Tracking](#4-progress-tracking)

**Related Documents:**

- [Coaching Skill](.claude/skills/coaching/SKILL.md) — Rules for Claude Code sessions
- [Phase Files](docs/phases/) — Detailed instructions per phase

---

## 1. Project Overview

### Vision & Motivation

This project exists at the intersection of two passions: **logistics operations** and **clean
software craftsmanship**.

As a warehouse command preparator (order picker), I experience the pain points of enterprise
warehouse management systems every day. This project is my answer — not to replace those systems
tomorrow, but to prove that modern, elegant solutions are possible.

### Goals

- **Personal skill growth** in fullstack TypeScript development
- **Practice clean/hexagonal architecture** in a real domain I understand deeply
- **Build fully typesafe, thoroughly tested code** with maximum unit test coverage
- **Create a demo** that could one day show my hierarchy what's possible
- **Continuous learning** and curiosity-driven development

### Non-Goals

- ❌ NOT a commercial product
- ❌ NOT replacing Infolog tomorrow
- ❌ NOT feature-complete with enterprise WMS systems

---

## 2. Domain Knowledge

### Warehouse Addressing System

The warehouse uses a hierarchical addressing format: `CELL-AISLE-POSITION-LEVEL`

| Component    | Value  | Format   | Description                                 |
| ------------ | ------ | -------- | ------------------------------------------- |
| **Cell**     | `4`    | 1 digit  | Major warehouse section (1-9)               |
| **Aisle**    | `016`  | 3 digits | Corridor, exists TWICE (odd/even positions) |
| **Position** | `0026` | 4 digits | Specific slot along aisle (0001-9999)       |
| **Level**    | `30`   | 2 digits | Vertical height (00, 10, 20, 30, 40, 50)    |

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

| Layer    | Technology      | Purpose                       |
| -------- | --------------- | ----------------------------- |
| Runtime  | Bun 1.3.x       | JS runtime & package manager  |
| Monorepo | Turborepo 2.x   | Build orchestration           |
| Backend  | NestJS 11.x     | API with dependency injection |
| ORM      | Prisma 7.x      | Type-safe database access     |
| Database | SQLite          | Data persistence (dev & prod) |
| Auth     | Better Auth 1.4 | Authentication                |
| Frontend | Astro 5.x       | SSR + static generation       |
| UI       | React 19.x      | Interactive components        |
| State    | Nanostores      | Lightweight reactive state    |
| Styling  | TailwindCSS 4.x | Utility-first CSS             |
| Testing  | Bun test        | Unit & integration tests      |

### Hexagonal Architecture

```text
┌─────────────────────────────────────────────┐
│              INFRASTRUCTURE                  │
│   Controllers, Prisma Repos, External APIs   │
├─────────────────────────────────────────────┤
│               APPLICATION                    │
│      Use Cases, Services, DTOs               │
├─────────────────────────────────────────────┤
│                 DOMAIN                       │
│   Entities, Value Objects, Repo Interfaces   │
│        (No dependencies on outer layers)     │
└─────────────────────────────────────────────┘
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

### File Naming Convention

```text
PascalCase.type.ts

Examples:
├── Cell.entity.ts
├── Cell.entity.spec.ts
├── Level.vo.ts
├── Level.vo.spec.ts
├── PrismaCell.repository.ts
├── CreateCell.uc.ts
├── CreateCell.uc.spec.ts
└── CellResponse.dto.ts
```

### UI Theme

Dark Zinc only. NO light mode. NO pure white/black.

```text
Background:  zinc-900, zinc-950
Cards:       zinc-800 with zinc-700 borders
Text:        zinc-100, zinc-200, zinc-300
Accent Even: Green (emerald)
Accent Odd:  Blue (sky)
```

---

## 4. Progress Tracking

### Phase Checklist

- [x] **Phase 0:** Project Setup
- [x] **Phase 1:** Schema Migration
- [x] **Phase 2:** Domain Layer
- [ ] **Phase 3:** Application Layer ← **NEXT**
- [ ] **Phase 4:** Infrastructure Layer
- [ ] **Phase 5:** Frontend Integration
- [ ] **Phase 6:** Seed Data & Polish

### Future Phases (Post-MVP)

| Phase | Feature                 |
| ----- | ----------------------- |
| 7     | Products in Locations   |
| 8     | Stock movement tracking |
| 9     | Search functionality    |

---

_Document created: December 22, 2025_ _Last updated: December 26, 2025_
