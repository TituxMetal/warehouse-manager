# Feature Shape: Cell Creation

## Problem

The warehouse module has a complete domain and application layer (26 use cases, all tested) but
nothing is wired to the outside world — no HTTP endpoints, no database persistence, no frontend. The
very first user-visible capability must be the crown jewel: creating a warehouse cell with real
parameters and seeing the generated structure. Without this, the app has no data and nothing to
show.

## Solution (Broad Strokes)

The user fills out a form with cell parameters (cell number, aisle range, location types, positions
per aisle, levels). A live summary panel shows what the structure will look like before creation. On
submit, the system generates the complete hierarchy — cell, aisles (odd/even sides), bays (variable
width: 3 or 4 positions), and locations (position × level) — and persists everything. The user then
sees the created cell in a list.

**Main UI elements:**

- Cell creation form with parameter inputs
- Live summary panel (aisle breakdown, position ranges, level list, total locations count)
- Cell list page showing created cells with key stats

**Data involved:**

- Cell, Aisle, Bay, Location entities (all already modeled in domain layer)
- Form input: cell number, aisle start/end, start/end location types, positions per aisle, level
  count, has picking toggle
- Structure generation uses the existing CellStructureCalculator domain service

## User Flow

1. User navigates to warehouse section
2. User sees list of cells (empty initially, or with previously created cells)
3. User clicks "Create Cell"
4. Form appears with inputs for cell parameters (with sensible defaults)
5. As user changes parameters, a live summary panel updates showing:
   - Number of aisles and their configuration (first aisle type, middle aisles, last aisle type)
   - Odd/even position ranges
   - Levels list (marking picking level)
   - Total location count
6. User submits the form
7. System validates input and generates the full structure
8. User sees the new cell in the list with stats (aisle count, location count)
9. User can click a cell to see its details (covered by Warehouse Browsing feature)

## Dependencies

**Requires:**

- Authentication (done) — cell creation is behind auth
- Domain layer (done) — entities, value objects, repository interfaces
- Application layer (done) — mappers, DTOs, service facades
- CellStructureCalculator domain service (done) — generates aisle configs, position ranges, bay
  distributions, level arrays
- Warehouse infrastructure — Prisma repositories, controllers, NestJS module wiring (must be built
  as part of this feature's implementation)

**Enables:**

- Warehouse Browsing — without cells, there's nothing to browse
- Location Search — without locations, there's nothing to find
- All remaining warehouse features depend on having data in the database

## What Must Exist (Backend)

**Infrastructure (new — does not exist yet):**

- Prisma repository implementations for Cell, Aisle, Bay, Location
- NestJS controllers exposing HTTP endpoints for Cell operations (at minimum: create, list)
- NestJS WarehouseModule wiring repositories, use cases, services, and controllers together
- The existing use cases and services will be connected to real Prisma repos via dependency
  injection

**Application additions (new):**

- Input DTO for cell creation with validation:
  - Cell number: integer 1-9
  - Aisle start/end: positive integers, start <= end
  - Start/end location types: 'odd' | 'even' | 'both'
  - Positions per aisle: minimum 6 (minimum for one bay per side)
  - Level count: minimum 2
  - Has picking: boolean
- CreateCell use case — the most complex operation in the system:
  - Uses CellStructureCalculator to compute aisle configs, position ranges, bay distributions
  - Creates Cell entity
  - Creates Aisle entities (one or two per aisle number depending on location type)
  - Creates Bay entities per aisle (variable width 3 or 4, using bay start positions)
  - Creates Location entities per bay × level (position derived from bay via getPositions)
- Batch creation support — a cell can generate 17,000+ locations, individual creates would be too
  slow

**API endpoints (minimum for this feature):**

- `POST /warehouse/cells` — create a cell (the complex orchestration)
- `GET /warehouse/cells` — list all cells (use case already exists)

**Validations:**

- Cell number must be unique (no duplicate cells)
- Aisle range must be valid (start <= end)
- Positions per aisle must be sufficient for at least one bay per side (minimum 6)
- Level count minimum 2 (ground level + at least one beam)

## What Must Exist (Frontend)

**Pages/routes:**

- Cell list page (warehouse section landing page)
- Cell creation page (or modal)

**Components:**

- Cell list — grid of cell cards showing number, aisle count, total locations
- Cell creation form — inputs for all parameters with defaults
- Live summary panel — recalculates and displays structure preview on every parameter change
- Cell card — displays cell stats

**State management:**

- Cells store (list of cells)
- Loading and error states
- Form state with live computation for preview

**User interactions:**

- Form input with live preview feedback
- Form submission with validation
- Navigation between list and creation
- Error display for validation failures and server errors

## Open Questions

1. **Batch creation strategy:** The repository interfaces only have `create(single)`. A real cell
   can generate 17,000+ locations. Should we add `createMany` to the repository interfaces, or
   handle batching inside the Prisma repository implementation? The reference app batched in groups
   of 1000.

2. **`aislesCount` semantics:** Does this field store the number of aisle _numbers_ (physical
   corridors) or the number of aisle _records_ (database rows — doubled for 'both' type aisles)? The
   reference stored the record count. This affects the `getTotalLocations()` formula.

3. **`locationsPerAisle` semantics:** The form collects total positions across both sides. Does the
   entity store the full count or the per-side count? The reference divided by 2 before storing. The
   CellStructureCalculator takes the full count and divides internally.

4. **Entity construction for creation:** All entity constructors require `id`, `createdAt`,
   `updatedAt` as positional arguments. For creation, these come from the database. What convention
   should we use — pass 0 and sentinel dates? Check how the users module handles this.

5. **Duplicate cell validation:** Should the backend reject creating a cell with a number that
   already exists? The Cell table has a unique constraint on `number`, so Prisma would throw. But
   should the use case check explicitly and throw a domain exception?

6. **Live preview computation:** Should the preview run the CellStructureCalculator on the frontend
   (duplicating logic) or call a backend preview endpoint? The reference computed it client-side
   with utility functions.

## Out of Scope

- Warehouse browsing pages (cell detail, aisle detail) — separate feature
- Cell editing/modification — only creation
- Tunnel bay support (locations with reduced levels at cross-aisles)
- Seed data — creation is the mechanism for populating the database
- Block reason association during cell creation
- Aisle, Bay, or Location CRUD endpoints beyond what cell creation needs

## Risks / Gotchas

- **Performance:** A cell with 20 aisles × 104 positions × 5 levels = ~17,000 locations. Individual
  INSERT queries would take very long. Batch creation is essential.

- **Entity constructor mismatch:** The existing entity constructors take positional arguments (not
  options objects). The Phase 5 doc pseudocode uses object syntax that doesn't match. The
  implementation plan must use the actual constructor signatures.

- **Bay width is variable:** The reference app hardcoded all bays to width 4. The new system uses
  `calculateBayDistribution()` + `generateBayStartPositions()` for a mix of 3-wide and 4-wide bays.
  The CreateCell use case must chain these correctly.

- **Position calculation depends on aisle side:** `BayEntity.getPositions(isOdd)` returns different
  position numbers for odd vs even aisles. The use case needs to know which aisle side each bay
  belongs to.

- **Test mock explosion:** Adding `createMany` or `findByAddress` to repository interfaces will
  break every existing test that mocks those interfaces (they must include all methods). This is
  mechanical but widespread — plan for it.

- **Frontend live preview:** Computing the structure preview client-side means either duplicating
  the CellStructureCalculator logic in TypeScript/React, or calling a backend endpoint on every
  input change (with debouncing). The reference duplicated the logic.
