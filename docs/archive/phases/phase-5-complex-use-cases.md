# Phase 5: Complex Use Cases

> Use cases that NEED domain services.

## Goal

Implement the use cases that require domain services from Phase 4. These are the complex
orchestration operations that can't work without the business logic calculators.

## Prerequisites

- ✅ Phase 3: Simple Application Layer (DTOs, mappers, simple use cases)
- ✅ Phase 4: Domain Services (CellStructureCalculator, LocationAddressParser)

## What to Build

```text
apps/api/src/warehouse/application/use-cases/
├── cell/
│   ├── CreateCell.uc.ts
│   └── CreateCell.uc.spec.ts
└── location/
    ├── GetLocationByAddress.uc.ts
    └── GetLocationByAddress.uc.spec.ts
```

Also update the service facades to include these use cases.

## CreateCell Use Case

**The most complex use case in the system.** It orchestrates creation of the entire warehouse
structure.

### Dependencies

- `CellStructureCalculator` (domain service)
- `ICellRepository`
- `IAisleRepository`
- `IBayRepository`
- `ILocationRepository`
- `CellMapper`

### Input DTO

```typescript
class CreateCellDto {
  cellNumber: number // 1-9
  aisleStart: number // First aisle number
  aisleEnd: number // Last aisle number
  startLocationType: 'odd' | 'even' | 'both'
  endLocationType: 'odd' | 'even' | 'both'
  locationsPerAisle: number // Total positions per aisle
  levelCount: number // Number of levels (1-6)
  hasPicking: boolean // Whether level 0 is picking
}
```

### Workflow

```typescript
async execute(dto: CreateCellDto): Promise<CellResponseDto> {
  // 1. Use domain service to generate structure
  const aisleConfigs = this.structureCalculator.generateAisleConfiguration(
    dto.aisleStart,
    dto.aisleEnd,
    dto.startLocationType,
    dto.endLocationType
  )

  const levels = this.structureCalculator.generateLevels(dto.levelCount)
  const positionRanges = this.structureCalculator.calculatePositionRanges(dto.locationsPerAisle)
  const bayCount = this.structureCalculator.calculateBayCount(dto.locationsPerAisle / 2)

  // 2. Create cell entity
  const cell = new CellEntity({
    number: new CellValueObject(dto.cellNumber),
    aislesCount: aisleConfigs.length,
    locationsPerAisle: dto.locationsPerAisle,
    levelsPerLocation: dto.levelCount
  })
  const savedCell = await this.cellRepository.create(cell)

  // 3. Create aisles based on configs
  for (const config of aisleConfigs) {
    if (config.locationType === 'both' || config.locationType === 'odd') {
      // Create odd aisle
      await this.aisleRepository.create(new AisleEntity({
        number: new AisleValueObject(config.number),
        isOdd: true,
        cellId: savedCell.id
      }))
    }
    if (config.locationType === 'both' || config.locationType === 'even') {
      // Create even aisle
      await this.aisleRepository.create(new AisleEntity({
        number: new AisleValueObject(config.number),
        isOdd: false,
        cellId: savedCell.id
      }))
    }
  }

  // 4. Create bays for each aisle
  const aisles = await this.aisleRepository.findByCellId(savedCell.id)
  for (const aisle of aisles) {
    for (let bayNum = 1; bayNum <= bayCount; bayNum++) {
      await this.bayRepository.create(new BayEntity({
        number: bayNum,
        width: 4, // positions per bay
        aisleId: aisle.id
      }))
    }
  }

  // 5. Create locations for each bay × level
  const bays = await this.bayRepository.findByAisleIds(aisles.map(a => a.id))
  for (const bay of bays) {
    const positions = bay.getPositions() // calculates based on bay number and aisle odd/even
    for (const position of positions) {
      for (const level of levels) {
        await this.locationRepository.create(new LocationEntity({
          position: new PositionValueObject(position),
          level: new LevelValueObject(level),
          isPicking: level === 0 && dto.hasPicking,
          status: 'available',
          bayId: bay.id,
          aisleId: bay.aisleId
        }))
      }
    }
  }

  // 6. Return response
  return this.mapper.toResponse(savedCell)
}
```

### Performance Consideration

For large cells, consider batch inserts:

```typescript
// Instead of individual creates
await this.locationRepository.createMany(locations)
```

### Tests to Write

- Creates cell with correct metadata
- Creates correct number of aisles (odd/even based on config)
- Creates correct number of bays per aisle
- Creates correct number of locations (positions × levels)
- Level 0 has isPicking when hasPicking=true
- Handles single aisle (start === end)
- Handles 'odd' only, 'even' only, and 'both' configurations

## GetLocationByAddress Use Case

**Finds a location by its human-readable address.**

### Dependencies

- `LocationAddressParser` (domain service)
- `ILocationRepository`
- `LocationMapper`

### Workflow

```typescript
async execute(address: string): Promise<LocationResponseDto> {
  // 1. Parse address using domain service
  const parsed = this.addressParser.parse(address)
  // Throws InvalidAddressException if format is wrong

  // 2. Find location in repository
  const location = await this.locationRepository.findByAddress(
    parsed.cell,
    parsed.aisle,
    parsed.position,
    parsed.level
  )

  // 3. Handle not found
  if (!location) {
    throw new LocationNotFoundException(address)
  }

  // 4. Return response
  return this.mapper.toResponse(location)
}
```

### Repository Method Needed

Add to `ILocationRepository`:

```typescript
findByAddress(
  cell: CellValueObject,
  aisle: AisleValueObject,
  position: PositionValueObject,
  level: LevelValueObject
): Promise<LocationEntity | null>
```

### Tests to Write

- Returns location for valid address
- Throws InvalidAddressException for malformed address
- Throws LocationNotFoundException when not found
- Handles edge cases (cell 1, level 0, etc.)

## Update Service Facades

Add the new use cases to services:

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

## Verification

- [ ] CreateCell use case has comprehensive tests
- [ ] GetLocationByAddress use case has tests
- [ ] Service facades updated
- [ ] `bun run --cwd apps/api test` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run lint:check` passes

## Commits

- `feat(api): add CreateCell use case with tests`
- `feat(api): add GetLocationByAddress use case with tests`
- `feat(api): update Cell.service with create method`
- `feat(api): update Location.service with getByAddress method`

## References

- Reference implementation: `/reference/astro-warehouse-visualizer/src/actions/cell.ts`
- Domain services: Phase 4
- Full roadmap: `docs/ROADMAP.md`
