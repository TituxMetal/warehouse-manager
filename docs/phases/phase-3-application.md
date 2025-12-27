# Phase 3: Application Layer

**Goal:** Create use cases and DTOs that define WHAT the system does.

**Why before Infrastructure?** In hexagonal architecture, Application layer defines the use cases
that Infrastructure will expose. Controllers CALL use cases, so use cases must exist first.

---

## Structure

```text
apps/api/src/warehouse/
└── application/
    ├── use-cases/
    │   ├── CreateCell.uc.ts
    │   ├── CreateCell.uc.spec.ts
    │   ├── GetCellOverview.uc.ts
    │   ├── GetCellOverview.uc.spec.ts
    │   ├── GetAisleDetails.uc.ts
    │   ├── GetAisleDetails.uc.spec.ts
    │   ├── FindLocation.uc.ts
    │   ├── FindLocation.uc.spec.ts
    │   └── index.ts
    ├── dtos/
    │   ├── CreateCell.dto.ts
    │   ├── CellResponse.dto.ts
    │   ├── AisleResponse.dto.ts
    │   ├── LocationResponse.dto.ts
    │   └── index.ts
    └── index.ts
```

---

## Steps

| Step | Action                                                                            | Verification                |
| ---- | --------------------------------------------------------------------------------- | --------------------------- |
| 3.1  | Create `application/use-cases/` folder                                            | Folder exists               |
| 3.2  | Create `CreateCell.uc.ts` — injects repository interface, executes business logic | File created                |
| 3.3  | Write tests for `CreateCell.uc.ts` (mock repository)                              | Tests pass                  |
| 3.4  | Create `GetCellOverview.uc.ts` — returns cell with stats                          | File created                |
| 3.5  | Write tests for `GetCellOverview.uc.ts`                                           | Tests pass                  |
| 3.6  | Create `GetAisleDetails.uc.ts` — returns aisle with locations                     | File created                |
| 3.7  | Write tests for `GetAisleDetails.uc.ts`                                           | Tests pass                  |
| 3.8  | Create `FindLocation.uc.ts` — find by address string                              | File created                |
| 3.9  | Write tests for `FindLocation.uc.ts`                                              | Tests pass                  |
| 3.10 | Create `application/dtos/` folder                                                 | Folder exists               |
| 3.11 | Create DTOs for requests/responses                                                | DTOs typed                  |
| 3.12 | Create barrel exports (`index.ts`)                                                | Exports work                |
| 3.13 | Run all checks                                                                    | Tests, typecheck, lint pass |
| 3.14 | Commit with atomic commits                                                        | Committed                   |
| 3.15 | Update VISION.md progress                                                         | Checklist updated           |
| 3.16 | Create PR to develop                                                              | PR created                  |

---

## Use Case Pattern

Reference existing patterns in `apps/api/src/users/` if available.

```typescript
// CreateCell.uc.ts
import { ICellRepository } from '../domain/repositories/Cell.repository'
import { CellEntity } from '../domain/entities/Cell.entity'
import { CreateCellDto } from '../dtos/CreateCell.dto'
import { CellResponseDto } from '../dtos/CellResponse.dto'

export class CreateCellUseCase {
  constructor(private readonly cellRepository: ICellRepository) {}

  async execute(dto: CreateCellDto): Promise<CellResponseDto> {
    // Validate business rules
    // Create entity
    // Save via repository
    // Return response DTO
  }
}
```

---

## DTO Pattern

DTOs are simple data transfer objects — no behavior, just typed data.

```typescript
// CreateCell.dto.ts
export interface CreateCellDto {
  name: string
  aisleCount: number
  positionsPerAisle: number
  levelsPerPosition: number
}

// CellResponse.dto.ts
export interface CellResponseDto {
  id: number
  name: string
  aisleCount: number
  totalLocations: number
  createdAt: Date
}
```

---

## Testing Use Cases

Mock the repository interface — use cases don't touch the database.

```typescript
// CreateCell.uc.spec.ts
import { describe, expect, it, mock } from 'bun:test'
import { CreateCellUseCase } from './CreateCell.uc'

const mockCellRepository = {
  create: mock(() => Promise.resolve({ id: 1, name: 'Cell A', ... })),
  findById: mock(() => Promise.resolve(null)),
  // ... other methods
}

describe('CreateCellUseCase', () => {
  it('should create a cell and return response dto', async () => {
    const useCase = new CreateCellUseCase(mockCellRepository)
    const result = await useCase.execute({ name: 'Cell A', ... })

    expect(result.id).toBe(1)
    expect(mockCellRepository.create).toHaveBeenCalled()
  })
})
```

---

## Commits for this Phase

Suggested atomic commits:

1. `feat(api): add CreateCell use case with tests`
2. `feat(api): add GetCellOverview use case with tests`
3. `feat(api): add GetAisleDetails use case with tests`
4. `feat(api): add FindLocation use case with tests`
5. `feat(api): add application layer DTOs`
6. `docs: update VISION.md for Phase 3 completion`
