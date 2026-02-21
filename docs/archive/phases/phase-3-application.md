# Phase 3: Simple Application Layer

> Use cases that DON'T need domain services.

## Goal

Create DTOs, mappers, and simple use cases that can work with existing domain entities and
repository interfaces. Complex use cases (CreateCell, GetLocationByAddress) are deferred to Phase 5.

## Why This Scope?

In hexagonal architecture, we build from the inside out. Simple read/write operations only need:

- Repository interfaces (already exist in domain layer)
- DTOs (data transfer objects)
- Mappers (entity ↔ DTO conversion)

Complex operations that require business logic calculations (like generating warehouse structure)
need domain services, which are Phase 4.

## Prerequisites

Add missing repository interface to domain layer:

```text
apps/api/src/warehouse/domain/repositories/BlockReason.repository.ts
```

## What to Build

```text
apps/api/src/warehouse/application/
├── dtos/
│   ├── index.ts
│   ├── CellResponse.dto.ts
│   ├── AisleResponse.dto.ts
│   ├── BayResponse.dto.ts
│   ├── LocationResponse.dto.ts
│   ├── BlockReasonResponse.dto.ts
│   ├── CreateBlockReason.dto.ts
│   ├── UpdateBlockReason.dto.ts
│   └── BlockLocation.dto.ts
├── mappers/
│   ├── index.ts
│   ├── Cell.mapper.ts + spec
│   ├── Aisle.mapper.ts
│   ├── Bay.mapper.ts
│   ├── Location.mapper.ts
│   └── BlockReason.mapper.ts
├── use-cases/
│   ├── index.ts
│   ├── cell/
│   │   ├── GetAllCells.uc.ts + spec
│   │   ├── GetCellById.uc.ts + spec
│   │   ├── GetCellByNumber.uc.ts
│   │   ├── GetCellWithAisles.uc.ts
│   │   ├── GetCellStatistics.uc.ts
│   │   └── DeleteCell.uc.ts
│   ├── aisle/
│   │   ├── GetAisleById.uc.ts
│   │   ├── GetAislesByCellId.uc.ts
│   │   ├── GetAisleWithBays.uc.ts
│   │   └── GetAisleWithLocations.uc.ts
│   ├── bay/
│   │   ├── GetBayById.uc.ts
│   │   ├── GetBaysByAisleId.uc.ts
│   │   └── GetBayWithLocations.uc.ts
│   ├── location/
│   │   ├── GetLocationById.uc.ts
│   │   ├── GetLocationsByBayId.uc.ts
│   │   ├── GetLocationsByAisleId.uc.ts
│   │   ├── GetPickingLocations.uc.ts
│   │   ├── GetAvailableLocations.uc.ts
│   │   ├── GetBlockedLocations.uc.ts
│   │   ├── BlockLocation.uc.ts + spec
│   │   └── UnblockLocation.uc.ts + spec
│   └── block-reason/
│       ├── GetAllBlockReasons.uc.ts
│       ├── GetBlockReasonById.uc.ts
│       ├── CreateBlockReason.uc.ts + spec
│       ├── UpdateBlockReason.uc.ts
│       └── DeleteBlockReason.uc.ts
├── services/
│   ├── index.ts
│   ├── Cell.service.ts + spec
│   ├── Aisle.service.ts
│   ├── Bay.service.ts
│   ├── Location.service.ts
│   └── BlockReason.service.ts
└── index.ts
```

## Use Cases in This Phase

| Entity      | Use Case              | Type  | Description               |
| ----------- | --------------------- | ----- | ------------------------- |
| Cell        | GetAllCells           | Read  | List all cells            |
| Cell        | GetCellById           | Read  | Get by ID                 |
| Cell        | GetCellByNumber       | Read  | Get by number (1-9)       |
| Cell        | GetCellWithAisles     | Read  | Get with nested aisles    |
| Cell        | GetCellStatistics     | Read  | Count locations by status |
| Cell        | DeleteCell            | Write | Cascade delete            |
| Aisle       | GetAisleById          | Read  | Get by ID                 |
| Aisle       | GetAislesByCellId     | Read  | Get all for a cell        |
| Aisle       | GetAisleWithBays      | Read  | Get with nested bays      |
| Aisle       | GetAisleWithLocations | Read  | Get with all locations    |
| Bay         | GetBayById            | Read  | Get by ID                 |
| Bay         | GetBaysByAisleId      | Read  | Get all for an aisle      |
| Bay         | GetBayWithLocations   | Read  | Get with nested locations |
| Location    | GetLocationById       | Read  | Get by ID                 |
| Location    | GetLocationsByBayId   | Read  | Get all in a bay          |
| Location    | GetLocationsByAisleId | Read  | Get all in an aisle       |
| Location    | GetPickingLocations   | Read  | Get all level-0           |
| Location    | GetAvailableLocations | Read  | Get unblocked available   |
| Location    | GetBlockedLocations   | Read  | Get all blocked           |
| Location    | BlockLocation         | Write | Set blockReasonId         |
| Location    | UnblockLocation       | Write | Remove blockReasonId      |
| BlockReason | GetAllBlockReasons    | Read  | List all                  |
| BlockReason | GetBlockReasonById    | Read  | Get by ID                 |
| BlockReason | CreateBlockReason     | Write | Create new                |
| BlockReason | UpdateBlockReason     | Write | Update existing           |
| BlockReason | DeleteBlockReason     | Write | Delete (if not in use)    |

**Total: 26 use cases** (all simple, no domain services needed)

## NOT in This Phase

These require domain services (Phase 5):

- ❌ `CreateCell` — needs `CellStructureCalculator`
- ❌ `GetLocationByAddress` — needs `LocationAddressParser`

## Implementation Order

1. **DTOs** (no dependencies)
2. **Mappers** (depend on DTOs + entities)
3. **Read use cases** (depend on mappers + repo interfaces)
4. **Write use cases** (depend on mappers + repo interfaces)
5. **Services** (depend on use cases)

## Verification

- [x] All use cases have unit tests with mocked repositories
- [x] All DTOs use class-validator decorators
- [x] `bun run --cwd apps/api test` passes
- [x] `bun run typecheck` passes
- [x] `bun run lint:check` passes

## Commits

Use atomic commits:

- `feat(api): add IBlockReasonRepository interface`
- `feat(api): add warehouse response DTOs`
- `feat(api): add warehouse application mappers`
- `feat(api): add GetAllCells use case with tests`
- `feat(api): add BlockLocation use case with tests`
- etc.

## References

- Pattern: See `apps/api/src/users/application/` for existing patterns
- Full roadmap: See `docs/ROADMAP.md`
