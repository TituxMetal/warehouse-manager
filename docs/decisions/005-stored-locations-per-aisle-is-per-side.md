# 005 — The stored `locationsPerAisle` is the per-side count

- **Status:** Accepted
- **Date:** 2026-10-12
- **Supersedes:** the stored-value table and the "positions per aisle record" definition in
  [001](./001-locations-per-aisle-is-a-total.md). Decision 001's other findings stand.

## Context

Decision 001 is internally contradictory. It says the stored value is "positions per aisle record"
and that `CellEntity.getTotalLocations()` — untouched — multiplies it by `aislesCount`. But the
table it publishes to define that phrase stores the **entered total**:

| Aisle  | entered | Aisle records | Stored (001) | `getTotalLocations()` reads as |
| ------ | ------- | ------------- | ------------ | ------------------------------ |
| `both` | 20      | 2             | **20**       | 20 × 2 × levels                |
| `odd`  | 10      | 1             | 10           | 10 × 1 × levels                |

For a two-sided aisle those two claims cannot both hold. Storing 20 for a cell whose two sides have
10 positions each makes `getTotalLocations()` return **twice** the number of `Location` rows the use
case actually creates. That is not a rounding difference; it is the field meaning two things at
once, which is the exact defect class decision 001 was written to eliminate.

Three sources in the repository already answer the question, and they agree with each other against
the table:

1. **`docs/domain/CELL_STRUCTURE_CALCULATION.md`** works a real cell and totals it as
   `aisle records × positions per side × levels` — 35 records × 104 per side × 5 levels ≈ 17,780
   `Location` records (less the tunnel-level reduction). Its multiplier per aisle record is the
   **per-side** count, 104, not the two-side total of 208.
2. **`AisleEntity.getPositionRange(locationsPerAisle)`** divides its argument by two internally,
   i.e. it expects a **total** and derives a per-side count — while `CellEntity` stores the value it
   passes. Decision 001 itself listed this method as evidence, and named as a consequence that the
   two would "become consistent". They only become consistent if the stored value is per side.
3. **The reference prototype** (`reference/astro-warehouse-visualizer/src/actions/cell.ts:27,50`)
   persists `input.locationsPerAisle / 2` — the per-side value — for the same field.

The one-sided row of 001's table happens to be right, and by accident: for a one-sided aisle the
per-side value and the entered value are the same number. The error is only visible for a two-sided
aisle, which is why it survived.

Decision 001's Context asserts the original defect made `totalLocations` "understated by a factor of
two". That assertion is wrong. The original code stored `positionRanges.odd.count`, which for an
even total equals the per-side count and produced a `totalLocations` equal to the rows actually
created — correct by (A) below. What decision 001 correctly identified was the _naming_ defect: a
per-side quantity carried a name implying a total, and `totalLocations` was computed from a stored
per-side value under a "total" label. The fix is to correct the label and the documentation, not to
change which quantity is stored.

## Decision

**`CellEntity.locationsPerAisle` stores the number of positions on ONE SIDE of an aisle.**

- The value **entered** on the form / carried by `CreateCellDto` is the **total** for the aisle,
  counting both sides where both exist (decision 001, unchanged).
- The value **stored** on `CellEntity` is the **per-side** count: `total / 2` for a two-sided aisle,
  the total itself for a one-sided aisle.
- `CellEntity.getTotalLocations()` is **correct as written and is not modified**. Because
  `aislesCount` counts aisle **records** (one per side) and `levelsPerLocation` counts levels, the
  formula `aislesCount × locationsPerAisle × levelsPerLocation` yields the number of `Location` rows
  the cell contains, which is what `CellResponseDto.totalLocations` and
  `GetCellStatisticsDto.totalLocations` are for.

This holds in both shapes:

| Aisle  | entered | Aisle records | Stored | `getTotalLocations()` reads as | `Location` rows created |
| ------ | ------- | ------------- | ------ | ------------------------------ | ----------------------- |
| `both` | 6       | 2             | **3**  | 2 × 3 × levels ✅              | 2 × 3 × levels — equal  |
| `odd`  | 10      | 1             | **10** | 1 × 10 × levels ✅             | 1 × 10 × levels — equal |

In both rows the reported total equals the number of rows the use case generates, which is the
property the field is relied upon to have.

The phrase "positions per aisle record" from decision 001 is **withdrawn**. The field is named
`locationsPerAisle`, which remains misleading, but the name is out of scope here: the quantity
stored is per side, and every place that consumes it must treat it as such.

`AisleEntity.getPositionRange(locationsPerAisle)` takes its argument in the **same unit as the
stored value** — the per-side count — and must therefore be corrected: it currently divides by two,
which was only right when it was passed a total. It has no production callers today, so this is a
correctness/documentation change, not a migration. Its `@param` documentation must state the
per-side unit.

## Alternatives considered

**Store the entered total (decision 001's table).** Rejected: it makes `getTotalLocations()` report
twice the `Location` rows that exist for every two-sided cell, contradicting
`CELL_STRUCTURE_CALCULATION.md`'s own totals and the two other sources above. It would also require
either changing `getTotalLocations()` — which 001 forbids and which would break `Cell.mapper.ts` /
`GetCellStatistics.uc.ts` — or accepting a documented 2× overstatement in a public API field.

**Rename the stored field to `locationsPerSide`.** Would remove the naming trap at its source and is
arguably the cleanest end state. Rejected _for this change_: it touches `CellEntity`,
`CellResponseDto`, `CellMapper`, the statistics use case, the Prisma schema and the frontend
contract, i.e. every layer. It is a worthwhile separate decision, and is recorded as an open
question rather than done silently inside an application-layer repair.

**Edit decision 001 in place.** Forbidden by the registry rules ("Supersede, never edit").

## Consequences

- `CreateCellUseCase` must store the per-side count, derived from the aisle configuration being
  created: `total / 2` when any aisle is two-sided, the total otherwise. It must not store
  `dto.locationsPerAisle` directly.
- `CellEntity.getTotalLocations()` and `CellEntity.aisleCount` semantics are unchanged.
  `CellEntity.aislesCount` continues to count aisle **records**, one per side; that convention is
  what makes the per-side stored value correct.
- The number of `Location` rows created must not change: bay generation already consumes the
  per-side count, and the stored value now agrees with it instead of doubling it.
- `AisleEntity.getPositionRange` becomes genuinely consistent with the stored value, as decision 001
  claimed it would, once its division is removed.
- Any test asserting `totalLocations` for a two-sided cell must assert the row count, not twice it.
- Decision 001's Context claim about a factor-of-two understatement is corrected here; readers of
  001 should treat its stored-value table as superseded.

## Evidence

- `docs/domain/CELL_STRUCTURE_CALCULATION.md` — summary table: 35 aisle records × 104 positions per
  side × 5 levels ≈ 17,780 `Location` records
- `apps/api/src/warehouse/domain/entities/Aisle.entity.ts` — `getPositionRange` divides by two,
  expecting a total
- `reference/astro-warehouse-visualizer/src/actions/cell.ts:27,50` — persists
  `input.locationsPerAisle / 2`
- `apps/api/src/warehouse/application/mappers/Cell.mapper.ts:10` and
  `apps/api/src/warehouse/application/use-cases/cell/GetCellStatistics.uc.ts:48` — the two
  production consumers of `getTotalLocations()`
- `apps/api/src/warehouse/application/use-cases/cell/CreateCell.uc.ts` — stored value and `Location`
  row generation
- Independent review of PR #8 (`APPROVE-WITH-NITS`), which identified this contradiction
