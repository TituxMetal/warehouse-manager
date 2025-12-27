# Architecture Skill

Hexagonal/Clean Architecture patterns for this project.

---

## Layer Structure

```text
┌─────────────────────────────────────────────┐
│              INFRASTRUCTURE                  │
│   Controllers, Prisma Repos, External APIs   │
│         (depends on Application)             │
├─────────────────────────────────────────────┤
│               APPLICATION                    │
│         Use Cases, Services, DTOs            │
│           (depends on Domain)                │
├─────────────────────────────────────────────┤
│                 DOMAIN                       │
│   Entities, Value Objects, Repo Interfaces   │
│          (depends on NOTHING)                │
└─────────────────────────────────────────────┘
```

**Dependency Rule:** Arrows point INWARD. Domain never imports from Application or Infrastructure.

---

## Implementation Order

When building a feature, follow this order:

1. **Domain** — Entities, Value Objects, Repository Interfaces
2. **Application** — Use Cases, Services, DTOs
3. **Infrastructure** — Prisma Repos, Controllers

**WHY?** Each layer depends on the one below. You can't build use cases without entities. You can't build controllers without use cases.

---

## Entities Have BEHAVIOR

**Entities are NOT just data classes.** They contain business logic.

### ❌ WRONG — Anemic Entity

```typescript
export class LocationEntity {
  constructor(
    public readonly id: number,
    public readonly level: number,
    public readonly status: string
  ) {}
}
```

### ✅ RIGHT — Rich Entity

```typescript
export class LocationEntity {
  constructor(
    private readonly _id: number,
    private readonly _level: LevelValueObject,
    private _status: LocationStatus,
    private _blockReasonId: number | null
  ) {}

  // Getters
  get id(): number { return this._id }
  get level(): LevelValueObject { return this._level }

  // BEHAVIOR
  isPicking(): boolean {
    return this._level.isPicking()
  }

  isBlocked(): boolean {
    return this._blockReasonId !== null
  }

  isAvailable(): boolean {
    return this._status === 'available' && !this.isBlocked()
  }

  block(reasonId: number): void {
    if (this.isBlocked()) throw new Error('Already blocked')
    this._blockReasonId = reasonId
    this._status = 'blocked'
  }
}
```

---

## Value Objects

Value Objects encapsulate validation and domain rules. They are immutable.

```typescript
export class LevelValueObject {
  private readonly _value: number

  constructor(value: number) {
    if (value < 0 || value > 90) {
      throw new Error(`Level must be 0-90, got ${value}`)
    }
    if (value % 10 !== 0) {
      throw new Error(`Level must be multiple of 10, got ${value}`)
    }
    this._value = value
  }

  get value(): number { return this._value }

  isPicking(): boolean { return this._value === 0 }
  isReserve(): boolean { return this._value > 0 }

  toString(): string {
    return this._value.toString().padStart(2, '0')
  }

  equals(other: LevelValueObject): boolean {
    return this._value === other._value
  }
}
```

---

## Repository Interfaces

Defined in Domain. Implemented in Infrastructure.

```typescript
// Domain — Interface
export interface ICellRepository {
  findById(id: number): Promise<CellEntity | null>
  findAll(): Promise<CellEntity[]>
  create(entity: CellEntity): Promise<CellEntity>
  update(entity: CellEntity): Promise<CellEntity>
  delete(id: number): Promise<void>
}

// Infrastructure — Implementation
@Injectable()
export class PrismaCellRepository implements ICellRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<CellEntity | null> {
    const data = await this.prisma.cell.findUnique({ where: { id } })
    if (!data) return null
    return this.toEntity(data)
  }
  // ...
}
```

---

## Use Cases

Use cases orchestrate domain logic.
They:

- Receive a DTO (input)
- Use repository interfaces (not implementations)
- Return a DTO (output)

```typescript
export class CreateCellUseCase {
  constructor(private readonly cellRepository: ICellRepository) {}

  async execute(dto: CreateCellDto): Promise<CellResponseDto> {
    // Validate
    // Create entity
    // Save via repository
    // Return response
  }
}
```

---

## Testing Strategy

| Layer | Test Type | Mock What |
| ------- | ----------- | ----------- |
| Domain (Entities, VOs) | Unit | Nothing — pure logic |
| Application (Use Cases) | Unit | Repository interfaces |
| Infrastructure (Repos) | Unit | Prisma client |
| Infrastructure (Controllers) | Integration | Nothing or DB |

### Test Behavior, Not Construction

```typescript
// ❌ WEAK
it('should create entity', () => {
  const entity = new LocationEntity(...)
  expect(entity.id).toBe(1)
})

// ✅ STRONG
it('should identify picking locations', () => {
  const picking = new LocationEntity({ level: 0, ... })
  const reserve = new LocationEntity({ level: 30, ... })

  expect(picking.isPicking()).toBe(true)
  expect(reserve.isPicking()).toBe(false)
})
```

---

## The Principle

> "If you have a utility function that takes entity data and does something with it, that function belongs IN the entity."

Look at `reference/astro-warehouse-visualizer/src/utils/warehouse.ts` — most of those utilities should be entity methods.
