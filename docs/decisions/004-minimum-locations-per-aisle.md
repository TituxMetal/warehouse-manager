# 004 — A side must be bay-decomposable: at least 3 positions, never 5

- **Status:** Accepted
- **Date:** 2026-10-12

> **Supersedes the first version of this record**, which set a flat minimum of
> `locationsPerAisle = 12`. That was too strict and misidentified where the constraint lives. See
> "Correction" below.

## Context

Bays have a physical width of 3 or 4 positions, and nothing else. A bay cannot have 1 or 2 positions
(minimum beam constraint, `docs/archive/phases/phase-4-domain-services.md:185-189`) and cannot
exceed 4 (maximum beam constraint). Therefore **the number of positions on a side must be
expressible as a sum of 3s and 4s**.

By the Frobenius property of 3 and 4 (largest non-representable value = 3×4 − 3 − 4 = 5), the
position counts that fail are exactly **1, 2 and 5**. Verified mechanically over 1..200 against the
real `calculateBayDistribution`: refused values are exactly `[1, 2, 5]`, and every accepted value
decomposes to exactly its own length.

`CellStructureCalculator.calculateBayDistribution` already encodes this correctly — for a remainder
of 1 it requires `maxFours >= 2`, i.e. at least 9 positions, because that case replaces two 4-wide
bays with three 3-wide bays. Below that it throws `InvalidPositionCountException`. The domain
documentation states the same bound ("Requires maxFours >= 2, so totalPositions >= 9",
`docs/domain/CELL_STRUCTURE_CALCULATION.md`, Step 5).

The defect is that **nothing enforces this on the way in**. `CreateCellDto` accepts any total ≥ 6,
so a total of 10 — even, and therefore legal under decision 003 — reaches the calculator and fails
at runtime with a generic `InvalidPositionCountException`, after validation already declared the
input valid.

## Decision

**The rule is stated per side, not as a total:** a side must have at least 3 positions and must not
have exactly 5.

Combined with decisions 001–003 (total, symmetric sides, even), this yields:

| Aisle configuration        | Legal `locationsPerAisle` (total)                   | Legal per side                   | Illegal total |
| -------------------------- | --------------------------------------------------- | -------------------------------- | ------------- |
| Two sides (`both`)         | even, ≥ 6, **≠ 10** — i.e. `{6, 8, 12, 14, 16, …}`  | `{3, 4, 6, 7, 8, …}` excluding 5 | `2, 4, 10`    |
| One side (`odd` or `even`) | ≥ 3, **≠ 5** — i.e. `{3, 4, 6, 7, 8, 9, 10, 11, …}` | the total itself                 | `1, 2, 5`     |

For a one-sided aisle there is a single length to decompose, so the side's length **is** the total —
which is why `10` is legal there and illegal for a two-sided aisle. A total of 10 gives five
positions per side when two sides exist (impossible) and ten positions on the only side when one
exists (3 + 3 + 4, perfectly valid).

> ### Reading trap: the same number means different things in the two columns
>
> The table above constrains the **total**, which is not the same quantity as a side's length. These
> two rows look contradictory and are not:
>
> | You enter `locationsPerAisle` | Per side | `calculateBayDistribution` receives | Result                                    |
> | ----------------------------- | -------- | ----------------------------------- | ----------------------------------------- |
> | **10**                        | 5 + 5    | `5`                                 | ❌ rejected — 5 is not a sum of 3s and 4s |
> | **20**                        | 10 + 10  | `10`                                | ✅ 2 bays of 3 + 1 bay of 4               |
>
> **3 + 3 + 4 is fully supported.** It is obtained with a total of 20, not 10. Bays of different
> widths coexist in the same aisle and the same side: `calculateBayDistribution` returns both
> `width3Count` and `width4Count` whenever the remainder is 1, 2 or 3, and
> `generateBayStartPositions` places the 4-wide bays first, then the 3-wide ones, with cumulative
> `startPosition` values. See `docs/domain/BAY_CONCEPT.md` for the resulting layout.
>
> Anyone reading "10 is illegal" as "3+3+4 is illegal" has confused the total with the side — the
> exact confusion decision 001 exists to prevent.

`calculateBayDistribution` is **not** modified. It correctly encodes a physical impossibility; the
defect is that invalid input reaches it.

## Correction: why not a flat minimum of 12

The first version of this record derived a minimum of 12 (two sides × 6 each) from the two-sided
case. That was wrong twice over:

- **Too strict.** A one-sided aisle needs only 3 positions, not 12. A flat 12 would reject legal
  configurations.
- **Wrong shape.** The original `@Min(6)` was not merely miscalibrated; expressing a per-side
  physical rule as a bound on a total is the error that produced the defect in the first place.
  Raising the constant would have preserved the error while narrowing it.

The correct formulation constrains the **side**, and the total is derived from it.

## Alternatives considered

**Flat minimum of 12 (the superseded version).** Rejected: rejects legal one-sided aisles, and keeps
the rule expressed on the wrong quantity.

**Loosen `calculateBayDistribution` to accept sides of 5.** Impossible: 5 is not a sum of 3s and 4s.
Relaxing it would invent a bay width outside the physical constraints or silently emit fewer
positions than declared.

**Keep `@Min(6)` and let the exception surface.** Rejected: validation errors must come from
validation, naming the field and the reason. An `InvalidPositionCountException` raised after the DTO
passed is indistinguishable from a bug.

## Consequences

- **A per-field decorator cannot express this rule**, because legality depends on the aisle
  configuration (`startLocationType` / `endLocationType`), which is not a property of the
  `locationsPerAisle` field. Validation must move to the object level (`class-validator` custom
  constraint on the DTO, or explicit validation in `CreateCellUseCase` before structure generation).
  This is a structural change to how `CreateCellDto` validates, not a constant swap.
- The failure moves from a runtime exception inside the calculator to a validation error at the
  boundary, with a message stating the physical constraint.
- Tests must cover the boundary per configuration: total 10 rejected for a two-sided aisle and
  accepted for a one-sided one; totals 1, 2, 5 rejected; 3, 4, 6, 8, 10 (one-sided), 12 accepted;
  plus an end-to-end check that a created cell's locations stay within the range
  `calculatePositionRanges` declares.
- **Related latent defect, not resolved here.** `CreateCellUseCase` derives the bay specification
  from `positionRanges.odd.count` unconditionally — `CreateCell.uc.ts:57`. For a one-sided **even**
  aisle the relevant count is `even.count`, not `odd.count`. With even totals these are equal
  (decision 002), so the defect is currently masked, but it is a second place where "per side" is
  assumed rather than derived from the aisle's actual side. Tracked as an open question in the
  registry.

## Evidence

- `apps/api/src/warehouse/domain/services/CellStructureCalculator.service.ts:192-227` —
  `calculateBayDistribution`, remainder-1 branch and `width4Count < 0` guard
- Verified mechanically over sides 1..200: refused values are exactly `{1, 2, 5}`; accepted values
  decompose to their own length; no integer ≥ 6 fails to decompose
- `docs/domain/CELL_STRUCTURE_CALCULATION.md` — Step 5, "Requires maxFours >= 2, so
  totalPositions >= 9"
- `docs/archive/phases/phase-4-domain-services.md:185-189` — physical bay width constraints
- `apps/api/src/warehouse/application/dtos/CreateCell.dto.ts:27-31` (PR #8) — `@Min(6)`
- `apps/api/src/warehouse/application/use-cases/cell/CreateCell.uc.ts:57-59` (PR #8) — bay specs
  from `odd.count`
