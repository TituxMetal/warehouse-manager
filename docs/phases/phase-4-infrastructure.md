# Phase 4: Infrastructure Layer

**Goal:** Implement Prisma repositories and NestJS controllers that expose the use cases.

**Why after Application?** Controllers CALL use cases. Prisma repositories IMPLEMENT repository
interfaces. Both depend on Application and Domain layers.

---

## Structure

```text
apps/api/src/warehouse/
├── infrastructure/
│   ├── repositories/
│   │   ├── PrismaCell.repository.ts
│   │   ├── PrismaCell.repository.spec.ts
│   │   ├── PrismaAisle.repository.ts
│   │   ├── PrismaAisle.repository.spec.ts
│   │   ├── PrismaBay.repository.ts
│   │   ├── PrismaLocation.repository.ts
│   │   └── index.ts
│   └── controllers/
│       ├── Cell.controller.ts
│       ├── Cell.controller.spec.ts
│       ├── Aisle.controller.ts
│       ├── Location.controller.ts
│       └── index.ts
└── Warehouse.module.ts
```

---

## Steps

| Step | Action                                                                  | Verification                |
| ---- | ----------------------------------------------------------------------- | --------------------------- |
| 4.1  | Create `infrastructure/repositories/` folder                            | Folder exists               |
| 4.2  | Create `PrismaCell.repository.ts` — implements ICellRepository          | File created                |
| 4.3  | Write tests for PrismaCell.repository (mock Prisma client)              | Tests pass                  |
| 4.4  | Create `PrismaAisle.repository.ts`                                      | File created                |
| 4.5  | Create `PrismaBay.repository.ts`                                        | File created                |
| 4.6  | Create `PrismaLocation.repository.ts`                                   | File created                |
| 4.7  | Create `infrastructure/controllers/` folder                             | Folder exists               |
| 4.8  | Create `Cell.controller.ts` — injects use cases, exposes REST endpoints | File created                |
| 4.9  | Write tests for Cell.controller                                         | Tests pass                  |
| 4.10 | Create `Aisle.controller.ts`                                            | File created                |
| 4.11 | Create `Location.controller.ts`                                         | File created                |
| 4.12 | Create `Warehouse.module.ts` — registers providers and controllers      | File created                |
| 4.13 | Register WarehouseModule in `app.module.ts`                             | API responds                |
| 4.14 | Write integration tests                                                 | Tests pass                  |
| 4.15 | Run all checks                                                          | Tests, typecheck, lint pass |
| 4.16 | Commit with atomic commits                                              | Committed                   |
| 4.17 | Update VISION.md progress                                               | Checklist updated           |
| 4.18 | Create PR to develop                                                    | PR created                  |

---

## Prisma Repository Pattern

Implements the domain repository interface using Prisma client.

```typescript
// PrismaCell.repository.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '~/shared/infrastructure/PrismaService'
import { ICellRepository } from '../../domain/repositories/Cell.repository'
import { CellEntity } from '../../domain/entities/Cell.entity'

@Injectable()
export class PrismaCellRepository implements ICellRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<CellEntity | null> {
    const cell = await this.prisma.cell.findUnique({ where: { id } })
    if (!cell) return null
    return new CellEntity(
      cell.id,
      cell.name,
      cell.aisleCount,
      cell.positionsPerAisle,
      cell.levelsPerPosition,
      cell.createdAt,
      cell.updatedAt
    )
  }

  async create(entity: CellEntity): Promise<CellEntity> {
    const cell = await this.prisma.cell.create({
      data: {
        name: entity.name,
        aisleCount: entity.aisleCount,
        positionsPerAisle: entity.positionsPerAisle,
        levelsPerPosition: entity.levelsPerPosition
      }
    })
    return new CellEntity(/* ... */)
  }

  // ... other methods
}
```

---

## Controller Pattern

Controllers inject use cases and expose REST endpoints.

```typescript
// Cell.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { CreateCellUseCase } from '../../application/use-cases/CreateCell.uc'
import { GetCellOverviewUseCase } from '../../application/use-cases/GetCellOverview.uc'
import { CreateCellDto } from '../../application/dtos/CreateCell.dto'

@Controller('cells')
export class CellController {
  constructor(
    private readonly createCellUseCase: CreateCellUseCase,
    private readonly getCellOverviewUseCase: GetCellOverviewUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreateCellDto) {
    return this.createCellUseCase.execute(dto)
  }

  @Get(':id')
  async getOverview(@Param('id') id: number) {
    return this.getCellOverviewUseCase.execute(id)
  }
}
```

---

## NestJS Module

```typescript
// Warehouse.module.ts
import { Module } from '@nestjs/common'
import { PrismaModule } from '~/shared/infrastructure/PrismaModule'

// Repositories
import { PrismaCellRepository } from './infrastructure/repositories/PrismaCell.repository'

// Use Cases
import { CreateCellUseCase } from './application/use-cases/CreateCell.uc'
import { GetCellOverviewUseCase } from './application/use-cases/GetCellOverview.uc'

// Controllers
import { CellController } from './infrastructure/controllers/Cell.controller'

@Module({
  imports: [PrismaModule],
  controllers: [CellController],
  providers: [
    // Repositories
    {
      provide: 'ICellRepository',
      useClass: PrismaCellRepository
    },
    // Use Cases
    CreateCellUseCase,
    GetCellOverviewUseCase
  ]
})
export class WarehouseModule {}
```

---

## Testing Repositories

Mock Prisma client for unit tests.

```typescript
// PrismaCell.repository.spec.ts
import { describe, expect, it, mock } from 'bun:test'
import { PrismaCellRepository } from './PrismaCell.repository'

const mockPrismaService = {
  cell: {
    findUnique: mock(() => Promise.resolve({ id: 1, name: 'Cell A', ... })),
    create: mock(() => Promise.resolve({ id: 1, ... })),
  }
}

describe('PrismaCellRepository', () => {
  it('should find cell by id', async () => {
    const repo = new PrismaCellRepository(mockPrismaService as any)
    const cell = await repo.findById(1)

    expect(cell).not.toBeNull()
    expect(cell?.id).toBe(1)
  })
})
```

---

## Commits for this Phase

Suggested atomic commits:

1. `feat(api): add Prisma cell repository with tests`
2. `feat(api): add Prisma aisle, bay, location repositories`
3. `feat(api): add Cell controller with tests`
4. `feat(api): add Aisle and Location controllers`
5. `feat(api): add Warehouse module and register in app`
6. `test(api): add integration tests for warehouse endpoints`
7. `docs: update VISION.md for Phase 4 completion`
