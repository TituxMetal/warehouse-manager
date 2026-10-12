# Feature 01: Cell Creation — Progress

**Plan:** `~/.claude/plans/warehouse-manager-01-cell-creation.md` **Started:** 2026-02-21

---

## PART 1: BACKEND

### Phase 1: Domain Layer Updates (Block 1)

- [x] Create `CellAlreadyExistsException` domain exception
- [x] Add `createMany` to `IAisleRepository`
- [x] Add `createMany` to `IBayRepository`
- [x] Add `createMany` to `ILocationRepository`
- [x] Update existing test mocks for Aisle/Bay/Location use cases

### Phase 2: Application Layer — CreateCell (Block 2)

- [x] Create `CreateCellDto` with class-validator decorators
- [x] Create `CreateCellUseCase` with orchestration logic
- [x] Update `CellService` facade (add create method)
- [x] Write tests for `CreateCellUseCase`

#### Phase 2b: Decision compliance (decisions 001–004)

The first pass above was marked complete but contradicted `docs/decisions/001`–`004`. Corrected here
so the application layer matches the accepted decisions:

- [x] Store the per-side count in `CellEntity.locationsPerAisle` (decision 005, which supersedes the
      stored-value table of decision 001): the split half for a two-sided aisle, the full total for
      a one-sided one — not `positionRanges.odd.count`
- [x] Enforce the `locationsPerAisle` rule in `CreateCellUseCase` via
      `InvalidLocationsPerAisleException` (two-sided: even, ≥ 6, ≠ 10; one-sided: ≥ 3, ≠ 5)
- [x] Declare the same rule as an object-level `class-validator` constraint on `CreateCellDto`
      (inert until a `ValidationPipe` exists)
- [x] Derive the bay specification from the side each aisle actually has, not `odd.count`
- [x] Rename `isUniqueCellNumber` to `existingCell`; use a single `now` per orchestration
- [x] Chain `calculatePositionRanges` → `calculateBayDistribution` → `getPositions` in tests and
      assert generated positions stay inside the declared range

_Not part of this block: the DTO constraint cannot run over HTTP until a `ValidationPipe` and a
controller exist (Phase 5/6)._

### Phase 3: Infrastructure — Mappers (Block 3)

- [ ] Create `CellInfrastructureMapper` (toDomain/toPrisma)
- [ ] Create `AisleInfrastructureMapper`
- [ ] Create `BayInfrastructureMapper`
- [ ] Create `LocationInfrastructureMapper`

### Phase 4: Infrastructure — Repositories (Block 3)

- [ ] Implement `PrismaCellRepository`
- [ ] Implement `PrismaAisleRepository` (with createMany)
- [ ] Implement `PrismaBayRepository` (with createMany)
- [ ] Implement `PrismaLocationRepository` (with batched createMany)
- [ ] Write repository tests
- [ ] Wrap `CreateCellUseCase` orchestration in a Prisma `$transaction` to prevent orphan
      Cell/Aisles/Bays on partial-persistence failures (see `TODO(infra)` in `CreateCell.uc.ts`)

### Phase 5: Infrastructure — Controller (Block 4)

- [ ] Create `CellController` (POST + GET endpoints)

### Phase 6: Module & Wiring (Block 4)

- [ ] Create `WarehouseModule` with DI wiring
- [ ] Register `WarehouseModule` in `AppModule`
- [ ] Verify full API via curl (create cell + list cells)

---

## PART 2: FRONTEND (deferred — separate plan)

_Will be planned via `/planning` once backend is complete._

---

## Verification

- [ ] All backend tests pass (`bun run --cwd apps/api test`)
- [ ] Type check passes (`bun run typecheck`)
- [ ] Lint passes (`bun run lint:check`)
- [ ] Format passes (`bun run format:check`)
- [ ] Manual API test: create cell via curl, list cells via curl
