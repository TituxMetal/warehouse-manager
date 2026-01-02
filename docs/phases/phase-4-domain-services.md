# Phase 4: Domain Services

> Business logic that spans multiple entities.

## Goal

Create domain services that encapsulate complex business logic. These are pure classes with no
infrastructure dependencies — they only use domain entities and value objects.

## Why This Phase?

Some operations require calculations and logic that don't belong to a single entity:

- **CellStructureCalculator**: Knows how to generate aisle configurations, calculate positions, and
  create level arrays
- **LocationAddressParser**: Knows how to parse "4-016-0026-30" into value objects

This logic is **domain knowledge** — it's the business rules of warehouse management.

## What to Build

```text
apps/api/src/warehouse/domain/services/
├── index.ts
├── CellStructureCalculator.service.ts
├── CellStructureCalculator.service.spec.ts
├── LocationAddressParser.service.ts
└── LocationAddressParser.service.spec.ts
```

## CellStructureCalculator

**Purpose:** Encapsulates all business logic for generating warehouse structure.

**Reference:** See `/reference/astro-warehouse-visualizer/src/utils/implementation.ts`

### Interface

```typescript
interface AisleConfig {
  number: number
  locationType: 'odd' | 'even' | 'both'
}

interface PositionRange {
  start: number
  end: number
  count: number
}

class CellStructureCalculator {
  // Generate aisle configurations based on start/end and location types
  generateAisleConfiguration(
    aisleStart: number,
    aisleEnd: number,
    startLocationType: 'odd' | 'even' | 'both',
    endLocationType: 'odd' | 'even' | 'both'
  ): AisleConfig[]

  // Calculate position ranges for odd/even aisles
  calculatePositionRanges(locationsPerAisle: number): {
    odd: PositionRange
    even: PositionRange
  }

  // Generate level array [0, 10, 20, 30, ...]
  generateLevels(levelCount: number): number[]

  // Calculate how many bays needed
  calculateBayCount(locationsPerSide: number, positionsPerBay?: number): number
}
```

### Implementation Notes

- First aisle uses `startLocationType`
- Last aisle uses `endLocationType`
- Middle aisles always have `'both'` (odd and even sides)
- Odd positions: 1, 3, 5, 7, 9...
- Even positions: 2, 4, 6, 8, 10...
- Levels: 0 (picking), 10, 20, 30, 40, 50 (reserve)
- Default 4 positions per bay

### Tests to Write

- `generateAisleConfiguration` with various start/end types
- `generateAisleConfiguration` with same start and end aisle
- `calculatePositionRanges` with even count
- `calculatePositionRanges` with odd count
- `generateLevels` with 1, 3, 6 levels
- `calculateBayCount` edge cases

## LocationAddressParser

**Purpose:** Parse and format warehouse addresses in format `CELL-AISLE-POSITION-LEVEL`.

### Interface

```typescript
class LocationAddressParser {
  // Parse "4-016-0026-30" into value objects
  parse(address: string): {
    cell: CellValueObject
    aisle: AisleValueObject
    position: PositionValueObject
    level: LevelValueObject
  }

  // Format value objects into "4-016-0026-30"
  format(
    cell: CellValueObject,
    aisle: AisleValueObject,
    position: PositionValueObject,
    level: LevelValueObject
  ): string

  // Check if address format is valid
  isValid(address: string): boolean
}
```

### Implementation Notes

- Address format: `C-AAA-PPPP-LL` (1-3-4-2 digits)
- Regex: `/^(\d)-(\d{3})-(\d{4})-(\d{2})$/`
- Throws `InvalidAddressException` on parse failure
- Uses existing value objects for validation

### Tests to Write

- `parse` valid address
- `parse` invalid format throws
- `parse` out-of-range values (let VO throw)
- `format` produces correct string
- `isValid` returns true/false correctly

## Architecture Notes

```text
Domain Services:
├── NO @Injectable() decorator (pure domain)
├── NO repository dependencies
├── NO infrastructure imports
├── ONLY use domain entities and value objects
└── ONLY pure logic and calculations
```

In NestJS, these will be instantiated in the module and injected where needed. But the classes
themselves have no NestJS dependencies.

## IMPORTANT: Bay Schema Decision (2026-01-01)

### Reference Documents

Please first reference to the following reference documents:

- [CELL_STRUCTURE.md](./CELL_STRUCTURE.md)
- [BAY_CONCEPT.md](./BAY_CONCEPT.md)

### The Problem

The `calculateBayCount` method originally had a `positionsPerBay` parameter (default 4). But:

1. **Schema inconsistency:** Bay model has `width: Int` but `getPositions()` hardcodes
   `bayIndex * 4`
2. **Physical reality:** Bays can have 3 OR 4 positions depending on beam length
3. **Current assumption:** All code assumes width=4, which will break if width varies

### Decision: Option B — Add `startPosition` to Bay Schema

**Why NOW instead of later:**

- Currently: Only domain layer exists (no infrastructure, no frontend, no data)
- Later: Would require changes to repositories, controllers, DTOs, frontend, data migration
- Cost of change increases exponentially over time

**Changes Required:**

1. **Schema:** Add `startPosition Int` to Bay model
2. **Bay entity:** Fix `getPositions()` to use `this.width` and `this.startPosition`
3. **CellStructureCalculator:** Remove `positionsPerBay` parameter OR keep for initial calculation

**Physical Constraints:**

- Minimum positions per bay = 3 (physical beam constraint)
- Maximum positions per bay = 4 (typical)
- A bay CANNOT have 1 or 2 positions

### Implementation Notes for `calculateBayCount`

After schema change, this method may need rethinking:

- If all bays in an aisle have same width → simple division
- If bays can have different widths → method signature may change
- Consider: Is this method even needed, or does use case handle it?

## Verification

- [ ] All domain services have unit tests
- [ ] No imports from application or infrastructure layers
- [ ] `bun run --cwd apps/api test` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run lint:check` passes

## Commits

- `feat(api): add CellStructureCalculator domain service`
- `feat(api): add LocationAddressParser domain service`

## References

- Reference implementation: `/reference/astro-warehouse-visualizer/src/utils/implementation.ts`
- Full roadmap: `docs/ROADMAP.md`
