# 001 — `locationsPerAisle` is a total, not a per-side count

- **Status:** Accepted
- **Date:** 2026-10-12

## Context

`locationsPerAisle` names two different quantities depending on where it appears in the codebase:

- At the **form / DTO** level it is the total number of positions in an aisle, counting both sides.
- At the **bay calculation** level, `CellStructureCalculator.calculateBayDistribution` requires a
  count for _one side_ only.

This was never made explicit, and the codebase drifted. Three separate defects trace back to the
same missing boundary:

1. `CreateCellUseCase` stored `positionRanges.odd.count` — a per-side value — into
   `CellEntity.locationsPerAisle`, which `CellEntity.getTotalLocations()` documents and multiplies
   as a total (`aislesCount × locationsPerAisle × levelsPerLocation`). `totalLocations` in the API
   response is therefore understated by a factor of two.
2. `AisleEntity.getPositionRange(locationsPerAisle)` treats its parameter as a **total** and divides
   it by two internally — the opposite convention from `CellEntity.locationsPerAisle`, under the
   same field name.
3. The implementation read naturally as "compute the per-side count once, reuse it", which is what
   allowed defect (1) to look correct on review.

The reference prototype (`reference/astro-warehouse-visualizer`) amplifies the confusion: it
persists `input.locationsPerAisle / 2` while its own UI helper `calculateTotalLocations` treats the
same form field as "full aisle capacity".

## Decision

**`locationsPerAisle` is a total across both sides of an aisle.**

- The value collected by the form and carried by `CreateCellDto` is the full count for the aisle.
- `calculatePositionRanges(total)` is the single place that splits a total into odd and even sides.
- Everything that operates on one side must say so in its name — `locationsPerSide`, `odd.count`,
  `even.count` — and never be called `locationsPerAisle`.
- `CellEntity.getTotalLocations()` is correct as written and needs no change; it was being fed the
  wrong quantity.

### What the stored value means for a one-sided aisle

The value **stored** in `CellEntity.locationsPerAisle` is **positions per aisle record**, not
"positions across both sides". The distinction only shows up for a one-sided aisle, and it matters
because `CellEntity` knows nothing about its aisles — it holds a number and multiplies it by
`aislesCount` in `getTotalLocations()`.

| Aisle  | `locationsPerAisle` entered | Aisle records  | Stored | `getTotalLocations()` reads as   |
| ------ | --------------------------- | -------------- | ------ | -------------------------------- |
| `both` | 20                          | 2 (odd + even) | 20     | 20 × 2 aisle records × levels ✅ |
| `odd`  | 10                          | 1 (odd)        | 10     | 10 × 1 aisle record × levels ✅  |

The formula `aislesCount × locationsPerAisle × levelsPerLocation` is therefore correct in both
cases, because `aislesCount` counts **aisle records** (one per side), not aisle numbers. Storing
"positions per aisle record" is what makes that true. Whether a side is odd, even, or both lives on
`AisleEntity.isOdd` and in the aisle configuration — `CellEntity` does not need it and does not have
it.

## Alternatives considered

**Per-side everywhere.** Would require changing the form, `calculatePositionRanges`, the domain
documentation, and the calculation helpers. It satisfies only the reference prototype, which is
explicitly out of date functionally, while contradicting
`docs/archive/phases/phase-5-complex-use-cases.md` ("Total positions per aisle"),
`docs/archive/phases/phase-4-domain-services.md` (which names the sibling parameter
`locationsPerSide`), and `AisleEntity.getPositionRange`. Rejected: more sources contradicted, more
code changed, no benefit.

## Consequences

- `CreateCellUseCase` must store the value corresponding to what the aisle actually has, not
  `positionRanges.odd.count` picked unconditionally. For a two-sided aisle that is the total; for a
  one-sided aisle it is that side's length. This is a small value change that also fixes
  `CellResponseDto.totalLocations`.
- `CellEntity.locationsPerAisle` stores **positions per aisle record**, which coincides with "total
  across both sides" only when both sides exist. `CellEntity` cannot distinguish the two cases and
  does not need to — `aislesCount` already accounts for the number of sides.
- The boundary between "total" and "per side" must be visible in names, since the same quantity is
  legitimately converted twice along the pipeline (total → per side → bay distribution).
- `AisleEntity.getPositionRange` becomes consistent with `CellEntity.locationsPerAisle` rather than
  opposed to it.
- Fixing the naming is not cosmetic: the defect survived review precisely because
  `positionRanges.odd.count` carried a per-side value under a name that implied a total.

## Evidence

- `apps/api/src/warehouse/domain/entities/Cell.entity.ts` — `locationsPerAisle` +
  `getTotalLocations()`
- `apps/api/src/warehouse/domain/entities/Aisle.entity.ts` — `getPositionRange()`
- `apps/api/src/warehouse/application/use-cases/cell/CreateCell.uc.ts` (PR #8) — stores
  `positionRanges.odd.count`
- `docs/archive/phases/phase-5-complex-use-cases.md:52,71-78`
- `docs/archive/phases/phase-4-domain-services.md:70`
- `docs/domain/CELL_STRUCTURE_CALCULATION.md` — Step 2, "Positions per side: 104"
- `reference/astro-warehouse-visualizer/src/actions/cell.ts:26`
