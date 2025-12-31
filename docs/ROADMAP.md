# Warehouse Module — Complete Implementation Roadmap

> The full picture: every use case, domain service, repository, controller, and endpoint.

---

## Table of Contents

1. [Phase Overview](#1-phase-overview)
2. [Complete Use Case Inventory](#2-complete-use-case-inventory)
3. [Domain Services Inventory](#3-domain-services-inventory)
4. [API Endpoints Inventory](#4-api-endpoints-inventory)
5. [Phase 3: Simple Application Layer](#5-phase-3-simple-application-layer)
6. [Phase 4: Domain Services](#6-phase-4-domain-services)
7. [Phase 5: Complex Use Cases](#7-phase-5-complex-use-cases)
8. [Phase 6: Infrastructure Layer](#8-phase-6-infrastructure-layer)
9. [Phase 7: Frontend Integration](#9-phase-7-frontend-integration)
10. [Future Phases](#10-future-phases)

---

## 1. Phase Overview

| Phase | Name                   | Description                                             | Depends On |
| ----- | ---------------------- | ------------------------------------------------------- | ---------- |
| 0     | Project Setup          | Monorepo, tooling, configs                              | -          |
| 1     | Schema Migration       | Prisma schema for warehouse                             | Phase 0    |
| 2     | Domain Layer           | Entities, VOs, repo interfaces                          | Phase 1    |
| **3** | **Simple Application** | DTOs, mappers, simple use cases (no domain services)    | Phase 2    |
| **4** | **Domain Services**    | CellStructureCalculator, LocationAddressParser          | Phase 2    |
| **5** | **Complex Use Cases**  | CreateCell, GetLocationByAddress (need domain services) | Phase 3, 4 |
| **6** | **Infrastructure**     | Prisma repos, controllers, endpoints                    | Phase 5    |
| 7     | Frontend Integration   | Astro pages, React components                           | Phase 6    |
| 8     | Seed & Polish          | Seed data, error handling, validation                   | Phase 7    |

**Key insight:** Phase 3 and 4 can be worked on in parallel. Phase 5 requires both.

---

## 2. Complete Use Case Inventory

### 2.1 Cell Use Cases

| Use Case            | Type  | Needs Domain Service? | Description                              |
| ------------------- | ----- | --------------------- | ---------------------------------------- |
| `GetAllCells`       | Read  | ❌ No                 | List all cells                           |
| `GetCellById`       | Read  | ❌ No                 | Get cell by ID                           |
| `GetCellByNumber`   | Read  | ❌ No                 | Get cell by number (1-9)                 |
| `GetCellWithAisles` | Read  | ❌ No                 | Get cell with nested aisles              |
| `GetCellStatistics` | Read  | ❌ No                 | Count locations by status                |
| `CreateCell`        | Write | ✅ **Yes**            | Creates cell + aisles + bays + locations |
| `DeleteCell`        | Write | ❌ No                 | Cascade delete cell                      |

### 2.2 Aisle Use Cases

| Use Case                | Type | Needs Domain Service? | Description                  |
| ----------------------- | ---- | --------------------- | ---------------------------- |
| `GetAisleById`          | Read | ❌ No                 | Get aisle by ID              |
| `GetAislesByCellId`     | Read | ❌ No                 | Get all aisles for a cell    |
| `GetAisleWithBays`      | Read | ❌ No                 | Get aisle with nested bays   |
| `GetAisleWithLocations` | Read | ❌ No                 | Get aisle with all locations |

### 2.3 Bay Use Cases

| Use Case              | Type | Needs Domain Service? | Description                   |
| --------------------- | ---- | --------------------- | ----------------------------- |
| `GetBayById`          | Read | ❌ No                 | Get bay by ID                 |
| `GetBaysByAisleId`    | Read | ❌ No                 | Get all bays for an aisle     |
| `GetBayWithLocations` | Read | ❌ No                 | Get bay with nested locations |

### 2.4 Location Use Cases

| Use Case                | Type  | Needs Domain Service? | Description                             |
| ----------------------- | ----- | --------------------- | --------------------------------------- |
| `GetLocationById`       | Read  | ❌ No                 | Get location by ID                      |
| `GetLocationsByBayId`   | Read  | ❌ No                 | Get all locations in a bay              |
| `GetLocationsByAisleId` | Read  | ❌ No                 | Get all locations in an aisle           |
| `GetLocationByAddress`  | Read  | ✅ **Yes**            | Parse "4-016-0026-30" and find location |
| `GetPickingLocations`   | Read  | ❌ No                 | Get all level-0 locations               |
| `GetAvailableLocations` | Read  | ❌ No                 | Get unblocked available locations       |
| `GetBlockedLocations`   | Read  | ❌ No                 | Get all blocked locations               |
| `BlockLocation`         | Write | ❌ No                 | Set blockReasonId on location           |
| `UnblockLocation`       | Write | ❌ No                 | Remove blockReasonId from location      |

### 2.5 BlockReason Use Cases

| Use Case             | Type  | Needs Domain Service? | Description                         |
| -------------------- | ----- | --------------------- | ----------------------------------- |
| `GetAllBlockReasons` | Read  | ❌ No                 | List all block reasons              |
| `GetBlockReasonById` | Read  | ❌ No                 | Get block reason by ID              |
| `CreateBlockReason`  | Write | ❌ No                 | Create new block reason             |
| `UpdateBlockReason`  | Write | ❌ No                 | Update block reason                 |
| `DeleteBlockReason`  | Write | ❌ No                 | Delete block reason (if not in use) |

### 2.6 Obstacle Use Cases (Future - Phase 8+)

| Use Case                | Type  | Needs Domain Service? | Description               |
| ----------------------- | ----- | --------------------- | ------------------------- |
| `GetAllObstacles`       | Read  | ❌ No                 | List all obstacles        |
| `GetObstacleById`       | Read  | ❌ No                 | Get obstacle by ID        |
| `GetObstaclesByAisleId` | Read  | ❌ No                 | Get obstacles in an aisle |
| `CreateObstacle`        | Write | ❌ No                 | Create obstacle           |
| `UpdateObstacle`        | Write | ❌ No                 | Update obstacle           |
| `DeleteObstacle`        | Write | ❌ No                 | Delete obstacle           |

---

### Summary

| Category      | Total  | No Domain Service | Needs Domain Service     |
| ------------- | ------ | ----------------- | ------------------------ |
| Cell          | 7      | 6                 | 1 (CreateCell)           |
| Aisle         | 4      | 4                 | 0                        |
| Bay           | 3      | 3                 | 0                        |
| Location      | 9      | 8                 | 1 (GetLocationByAddress) |
| BlockReason   | 5      | 5                 | 0                        |
| **Total MVP** | **28** | **26**            | **2**                    |

---

## 3. Domain Services Inventory

### 3.1 CellStructureCalculator

**Purpose:** Encapsulates all business logic for generating warehouse structure.

**Location:** `apps/api/src/warehouse/domain/services/CellStructureCalculator.service.ts`

**Methods:**

```typescript
class CellStructureCalculator {
  // Generate aisle configurations (odd/even/both sides)
  generateAisleConfiguration(
    aisleStart: number,
    aisleEnd: number,
    startLocationType: 'odd' | 'even' | 'both',
    endLocationType: 'odd' | 'even' | 'both'
  ): AisleConfig[]

  // Calculate position ranges for odd/even aisles
  calculatePositionRanges(locationsPerAisle: number): {
    odd: { start: number; end: number; count: number }
    even: { start: number; end: number; count: number }
  }

  // Generate level array [0, 10, 20, 30, 40, 50]
  generateLevels(levelCount: number): number[]

  // Calculate how many bays needed
  calculateBayCount(locationsPerAisle: number, positionsPerBay: number): number
}
```

**Used by:** `CreateCell.uc.ts`

**Reference:** `/reference/astro-warehouse-visualizer/src/utils/implementation.ts`

---

### 3.2 LocationAddressParser

**Purpose:** Parse and format warehouse addresses.

**Location:** `apps/api/src/warehouse/domain/services/LocationAddressParser.service.ts`

**Methods:**

```typescript
class LocationAddressParser {
  // Parse "4-016-0026-30" into components
  parse(address: string): {
    cell: CellValueObject
    aisle: AisleValueObject
    position: PositionValueObject
    level: LevelValueObject
  }

  // Format components into "4-016-0026-30"
  format(
    cell: CellValueObject,
    aisle: AisleValueObject,
    position: PositionValueObject,
    level: LevelValueObject
  ): string

  // Validate address format
  isValid(address: string): boolean
}
```

**Used by:** `GetLocationByAddress.uc.ts`

---

## 4. API Endpoints Inventory

### 4.1 Cell Endpoints

| Method | Endpoint                          | Use Case          | Auth Required |
| ------ | --------------------------------- | ----------------- | ------------- |
| GET    | `/warehouse/cells`                | GetAllCells       | Yes           |
| GET    | `/warehouse/cells/:id`            | GetCellById       | Yes           |
| GET    | `/warehouse/cells/number/:number` | GetCellByNumber   | Yes           |
| GET    | `/warehouse/cells/:id/aisles`     | GetCellWithAisles | Yes           |
| GET    | `/warehouse/cells/:id/statistics` | GetCellStatistics | Yes           |
| POST   | `/warehouse/cells`                | CreateCell        | Yes           |
| DELETE | `/warehouse/cells/:id`            | DeleteCell        | Yes           |

### 4.2 Aisle Endpoints

| Method | Endpoint                          | Use Case              | Auth Required |
| ------ | --------------------------------- | --------------------- | ------------- |
| GET    | `/warehouse/aisles/:id`           | GetAisleById          | Yes           |
| GET    | `/warehouse/cells/:cellId/aisles` | GetAislesByCellId     | Yes           |
| GET    | `/warehouse/aisles/:id/bays`      | GetAisleWithBays      | Yes           |
| GET    | `/warehouse/aisles/:id/locations` | GetAisleWithLocations | Yes           |

### 4.3 Bay Endpoints

| Method | Endpoint                          | Use Case            | Auth Required |
| ------ | --------------------------------- | ------------------- | ------------- |
| GET    | `/warehouse/bays/:id`             | GetBayById          | Yes           |
| GET    | `/warehouse/aisles/:aisleId/bays` | GetBaysByAisleId    | Yes           |
| GET    | `/warehouse/bays/:id/locations`   | GetBayWithLocations | Yes           |

### 4.4 Location Endpoints

| Method | Endpoint                                | Use Case              | Auth Required |
| ------ | --------------------------------------- | --------------------- | ------------- |
| GET    | `/warehouse/locations/:id`              | GetLocationById       | Yes           |
| GET    | `/warehouse/locations/address/:address` | GetLocationByAddress  | Yes           |
| GET    | `/warehouse/bays/:bayId/locations`      | GetLocationsByBayId   | Yes           |
| GET    | `/warehouse/aisles/:aisleId/locations`  | GetLocationsByAisleId | Yes           |
| GET    | `/warehouse/locations/picking`          | GetPickingLocations   | Yes           |
| GET    | `/warehouse/locations/available`        | GetAvailableLocations | Yes           |
| GET    | `/warehouse/locations/blocked`          | GetBlockedLocations   | Yes           |
| POST   | `/warehouse/locations/:id/block`        | BlockLocation         | Yes           |
| POST   | `/warehouse/locations/:id/unblock`      | UnblockLocation       | Yes           |

### 4.5 BlockReason Endpoints

| Method | Endpoint                       | Use Case           | Auth Required |
| ------ | ------------------------------ | ------------------ | ------------- |
| GET    | `/warehouse/block-reasons`     | GetAllBlockReasons | Yes           |
| GET    | `/warehouse/block-reasons/:id` | GetBlockReasonById | Yes           |
| POST   | `/warehouse/block-reasons`     | CreateBlockReason  | Yes           |
| PATCH  | `/warehouse/block-reasons/:id` | UpdateBlockReason  | Yes           |
| DELETE | `/warehouse/block-reasons/:id` | DeleteBlockReason  | Yes           |

---

## 5. Phase 3: Simple Application Layer

> Use cases that DON'T need domain services.

### 5.1 Prerequisites (from Domain Layer)

Add missing repository interface:

```text
apps/api/src/warehouse/domain/repositories/
└── BlockReason.repository.ts  (NEW)
```

### 5.2 Files to Create

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
│   ├── Cell.mapper.ts
│   ├── Cell.mapper.spec.ts
│   ├── Aisle.mapper.ts
│   ├── Bay.mapper.ts
│   ├── Location.mapper.ts
│   └── BlockReason.mapper.ts
├── use-cases/
│   ├── index.ts
│   ├── cell/
│   │   ├── GetAllCells.uc.ts
│   │   ├── GetAllCells.uc.spec.ts
│   │   ├── GetCellById.uc.ts
│   │   ├── GetCellById.uc.spec.ts
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
│   │   ├── BlockLocation.uc.ts
│   │   ├── BlockLocation.uc.spec.ts
│   │   ├── UnblockLocation.uc.ts
│   │   └── UnblockLocation.uc.spec.ts
│   └── block-reason/
│       ├── GetAllBlockReasons.uc.ts
│       ├── GetBlockReasonById.uc.ts
│       ├── CreateBlockReason.uc.ts
│       ├── CreateBlockReason.uc.spec.ts
│       ├── UpdateBlockReason.uc.ts
│       └── DeleteBlockReason.uc.ts
├── services/
│   ├── index.ts
│   ├── Cell.service.ts
│   ├── Cell.service.spec.ts
│   ├── Aisle.service.ts
│   ├── Bay.service.ts
│   ├── Location.service.ts
│   └── BlockReason.service.ts
└── index.ts
```

### 5.3 Implementation Order

1. **DTOs first** (no dependencies)
2. **Mappers** (depend on DTOs + entities)
3. **Read use cases** (depend on mappers + repo interfaces)
4. **Write use cases** (depend on mappers + repo interfaces)
5. **Services** (depend on use cases)

### 5.4 Verification

- [ ] All use cases have unit tests with mocked repositories
- [ ] `bun run --cwd apps/api test` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run lint:check` passes

---

## 6. Phase 4: Domain Services

> Business logic that spans multiple entities.

### 6.1 Files to Create

```text
apps/api/src/warehouse/domain/services/
├── index.ts
├── CellStructureCalculator.service.ts
├── CellStructureCalculator.service.spec.ts
├── LocationAddressParser.service.ts
└── LocationAddressParser.service.spec.ts
```

### 6.2 CellStructureCalculator Implementation

Based on reference: `/reference/astro-warehouse-visualizer/src/utils/implementation.ts`

```typescript
// Types
interface AisleConfig {
  number: number
  locationType: 'odd' | 'even' | 'both'
}

interface PositionRange {
  start: number
  end: number
  count: number
}

// Implementation
export class CellStructureCalculator {
  generateAisleConfiguration(
    aisleStart: number,
    aisleEnd: number,
    startLocationType: 'odd' | 'even' | 'both',
    endLocationType: 'odd' | 'even' | 'both'
  ): AisleConfig[] {
    const aisles: AisleConfig[] = []

    // First aisle
    aisles.push({ number: aisleStart, locationType: startLocationType })

    // Middle aisles (always 'both')
    for (let i = aisleStart + 1; i < aisleEnd; i++) {
      aisles.push({ number: i, locationType: 'both' })
    }

    // Last aisle (if different from first)
    if (aisleStart !== aisleEnd) {
      aisles.push({ number: aisleEnd, locationType: endLocationType })
    }

    return aisles
  }

  calculatePositionRanges(locationsPerAisle: number): {
    odd: PositionRange
    even: PositionRange
  } {
    return {
      odd: {
        start: 1,
        end: locationsPerAisle - 1,
        count: Math.ceil(locationsPerAisle / 2)
      },
      even: {
        start: 2,
        end: locationsPerAisle,
        count: Math.floor(locationsPerAisle / 2)
      }
    }
  }

  generateLevels(levelCount: number): number[] {
    return [0, ...Array.from({ length: levelCount - 1 }, (_, i) => (i + 1) * 10)]
  }

  calculateBayCount(locationsPerSide: number, positionsPerBay: number = 4): number {
    return Math.ceil(locationsPerSide / positionsPerBay)
  }
}
```

### 6.3 LocationAddressParser Implementation

```typescript
export class LocationAddressParser {
  private static readonly ADDRESS_REGEX = /^(\d)-(\d{3})-(\d{4})-(\d{2})$/

  parse(address: string): {
    cell: CellValueObject
    aisle: AisleValueObject
    position: PositionValueObject
    level: LevelValueObject
  } {
    const match = address.match(LocationAddressParser.ADDRESS_REGEX)
    if (!match) {
      throw new InvalidAddressException(address)
    }

    return {
      cell: new CellValueObject(parseInt(match[1], 10)),
      aisle: new AisleValueObject(parseInt(match[2], 10)),
      position: new PositionValueObject(parseInt(match[3], 10)),
      level: new LevelValueObject(parseInt(match[4], 10))
    }
  }

  format(
    cell: CellValueObject,
    aisle: AisleValueObject,
    position: PositionValueObject,
    level: LevelValueObject
  ): string {
    return `${cell.toString()}-${aisle.toString()}-${position.toString()}-${level.toString()}`
  }

  isValid(address: string): boolean {
    return LocationAddressParser.ADDRESS_REGEX.test(address)
  }
}
```

### 6.4 Verification

- [ ] All domain services have unit tests
- [ ] No dependencies on application or infrastructure layers
- [ ] `bun run --cwd apps/api test` passes
- [ ] `bun run typecheck` passes

---

## 7. Phase 5: Complex Use Cases

> Use cases that NEED domain services.

### 7.1 Files to Create

```text
apps/api/src/warehouse/application/use-cases/
├── cell/
│   ├── CreateCell.uc.ts
│   └── CreateCell.uc.spec.ts
└── location/
    ├── GetLocationByAddress.uc.ts
    └── GetLocationByAddress.uc.spec.ts
```

### 7.2 CreateCell.uc.ts

This is the most complex use case. It:

1. Uses `CellStructureCalculator` to generate structure
2. Creates Cell entity
3. Creates Aisle entities (odd/even for each aisle number)
4. Creates Bay entities (based on positions per bay)
5. Creates Location entities (position × level for each bay)

```typescript
@Injectable()
export class CreateCellUseCase {
  constructor(
    private readonly cellRepository: ICellRepository,
    private readonly aisleRepository: IAisleRepository,
    private readonly bayRepository: IBayRepository,
    private readonly locationRepository: ILocationRepository,
    private readonly structureCalculator: CellStructureCalculator,
    private readonly mapper: CellMapper
  ) {}

  async execute(dto: CreateCellDto): Promise<CellResponseDto> {
    // 1. Generate structure using domain service
    const aisleConfigs = this.structureCalculator.generateAisleConfiguration(
      dto.aisleStart,
      dto.aisleEnd,
      dto.startLocationType,
      dto.endLocationType
    )
    const levels = this.structureCalculator.generateLevels(dto.levelCount)
    const positionRanges = this.structureCalculator.calculatePositionRanges(dto.locationsPerAisle)

    // 2. Create cell
    const cell = await this.cellRepository.create(...)

    // 3. Create aisles
    for (const config of aisleConfigs) {
      // Create odd side, even side, or both based on config.locationType
    }

    // 4. Create bays for each aisle

    // 5. Create locations for each bay × level

    return this.mapper.toResponse(cell)
  }
}
```

### 7.3 GetLocationByAddress.uc.ts

```typescript
@Injectable()
export class GetLocationByAddressUseCase {
  constructor(
    private readonly locationRepository: ILocationRepository,
    private readonly addressParser: LocationAddressParser,
    private readonly mapper: LocationMapper
  ) {}

  async execute(address: string): Promise<LocationResponseDto> {
    const parsed = this.addressParser.parse(address)

    const location = await this.locationRepository.findByAddress(
      parsed.cell,
      parsed.aisle,
      parsed.position,
      parsed.level
    )

    if (!location) {
      throw new LocationNotFoundException(address)
    }

    return this.mapper.toResponse(location)
  }
}
```

### 7.4 Update Services

Add the new use cases to the service facades:

```typescript
// Cell.service.ts
async create(dto: CreateCellDto): Promise<CellResponseDto> {
  return this.createCellUseCase.execute(dto)
}

// Location.service.ts
async getByAddress(address: string): Promise<LocationResponseDto> {
  return this.getLocationByAddressUseCase.execute(address)
}
```

---

## 8. Phase 6: Infrastructure Layer

### 8.1 Files to Create

```text
apps/api/src/warehouse/infrastructure/
├── repositories/
│   ├── index.ts
│   ├── PrismaCell.repository.ts
│   ├── PrismaCell.repository.spec.ts
│   ├── PrismaAisle.repository.ts
│   ├── PrismaBay.repository.ts
│   ├── PrismaLocation.repository.ts
│   └── PrismaBlockReason.repository.ts
├── mappers/
│   ├── index.ts
│   ├── PrismaCell.mapper.ts        (Prisma model → Domain entity)
│   ├── PrismaAisle.mapper.ts
│   ├── PrismaBay.mapper.ts
│   ├── PrismaLocation.mapper.ts
│   └── PrismaBlockReason.mapper.ts
├── controllers/
│   ├── index.ts
│   ├── Cell.controller.ts
│   ├── Cell.controller.spec.ts
│   ├── Aisle.controller.ts
│   ├── Bay.controller.ts
│   ├── Location.controller.ts
│   └── BlockReason.controller.ts
└── index.ts
```

### 8.2 Warehouse Module

```typescript
// apps/api/src/warehouse/Warehouse.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [
    CellController,
    AisleController,
    BayController,
    LocationController,
    BlockReasonController
  ],
  providers: [
    // Domain services
    CellStructureCalculator,
    LocationAddressParser,

    // Repositories
    { provide: 'ICellRepository', useClass: PrismaCellRepository },
    { provide: 'IAisleRepository', useClass: PrismaAisleRepository },
    { provide: 'IBayRepository', useClass: PrismaBayRepository },
    { provide: 'ILocationRepository', useClass: PrismaLocationRepository },
    { provide: 'IBlockReasonRepository', useClass: PrismaBlockReasonRepository },

    // Use cases
    ...CellUseCases,
    ...AisleUseCases,
    ...BayUseCases,
    ...LocationUseCases,
    ...BlockReasonUseCases,

    // Services
    CellService,
    AisleService,
    BayService,
    LocationService,
    BlockReasonService,

    // Mappers
    CellMapper,
    AisleMapper,
    BayMapper,
    LocationMapper,
    BlockReasonMapper
  ],
  exports: [CellService, LocationService, BlockReasonService]
})
export class WarehouseModule {}
```

---

## 9. Phase 7: Frontend Integration

### 9.1 Files to Create

```text
apps/web/src/features/warehouse/
├── components/
│   ├── CellList.tsx
│   ├── CellCard.tsx
│   ├── CellForm.tsx
│   ├── AisleView.tsx
│   ├── LocationGrid.tsx
│   ├── LocationCard.tsx
│   └── AddressSearch.tsx
├── hooks/
│   ├── useCells.ts
│   ├── useCell.ts
│   ├── useLocations.ts
│   └── useLocationByAddress.ts
├── services/
│   ├── cell.api.ts
│   ├── location.api.ts
│   └── block-reason.api.ts
├── stores/
│   ├── cells.store.ts
│   └── selectedCell.store.ts
└── types/
    ├── cell.types.ts
    └── location.types.ts
```

### 9.2 Pages

```text
apps/web/src/pages/
├── warehouse/
│   ├── index.astro           → Cell list
│   ├── cells/
│   │   ├── [id].astro        → Cell detail
│   │   └── new.astro         → Create cell form
│   └── locations/
│       └── [...address].astro → Location by address
```

---

## 10. Future Phases

### Phase 8+: Products in Locations

- Product entity and repository
- StockMovement entity (in/out tracking)
- ProductLocation junction table
- Use cases: AddProductToLocation, RemoveProductFromLocation, GetLocationStock

### Phase 9+: Search & Filtering

- Full-text search across locations
- Filter by status, level, aisle
- Pagination for large datasets

### Phase 10+: Obstacle Management

- Obstacle CRUD use cases
- Obstacle-Location relationship
- Auto-blocking locations with obstacles

---

## Appendix: Dependency Graph

```text
                         ┌─────────────────────┐
                         │  Controllers        │
                         │  (Infrastructure)   │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │  Services           │
                         │  (Application)      │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
   ┌──────────▼──────────┐ ┌───────▼────────┐ ┌─────────▼─────────┐
   │  Simple Use Cases   │ │ Complex UCs    │ │  DTOs & Mappers   │
   │  (Phase 3)          │ │ (Phase 5)      │ │  (Phase 3)        │
   └──────────┬──────────┘ └───────┬────────┘ └───────────────────┘
              │                    │
              │            ┌───────▼────────┐
              │            │ Domain Services│
              │            │ (Phase 4)      │
              │            └───────┬────────┘
              │                    │
   ┌──────────▼────────────────────▼──────────┐
   │              Domain Layer                │
   │    Entities, VOs, Repo Interfaces        │
   │              (Phase 2 - DONE)            │
   └──────────────────────────────────────────┘
```

---

_Document created: December 27, 2025_
