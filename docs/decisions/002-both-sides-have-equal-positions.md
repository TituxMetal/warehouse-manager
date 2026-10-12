# 002 — Both sides of an aisle always have the same number of positions

- **Status:** Accepted
- **Date:** 2026-10-12

## Context

Two distinct questions were being conflated because both are phrased in terms of odd and even sides:

1. **Which sides exist?** An aisle may have both sides, only the odd side, or only the even side.
2. **How many positions per side?** Whether the odd and even sides of one aisle may have different
   lengths.

Question (1) is already modelled: `CellStructureCalculator.generateAisleConfiguration` returns one
aisle configuration per aisle number with a `locationType` of `odd`, `even`, or `both`, and
`CreateCellUseCase` expands `both` into two aisle records (one per side). This part is correct and
unchanged by this decision.

Question (2) was never decided. The position formula itself is symmetric by construction —
`BayEntity.getPositions(isOdd)` computes `basePosition × 2 + 1` for odd sides and
`(basePosition + 1) × 2` for even sides, so a range of base positions always yields the same number
of positions on both sides. Nothing in the model can express an asymmetric aisle except by accident,
and the reference prototype has no defined behaviour for one (it derives
`Math.min(4, total / 2 - bayIndex × 4)`, which produces a fractional bound and silently generates
one position too many).

## Decision

**An aisle's two sides always have the same number of positions.**

The two rules together:

- An aisle may have one side or two.
- Whichever sides it has, they are the same length.

Allowing asymmetric sides is explicitly rejected as premature complexity: it would require separate
bay distributions per side, a per-side bay numbering that is no longer comparable across an aisle,
and dedicated tests — all to serve a case not currently needed.

## Alternatives considered

**Allow asymmetric sides.** Would require generating bay specifications per side rather than once
per aisle, and would make "number of bays in an aisle" ambiguous when the two sides differ. The
physical bay concept assumes one bay record belongs to exactly one aisle record (see
`docs/domain/BAY_CONCEPT.md`, `@@unique([aisleId, number])`), so per-side bay numbering is workable
but introduces a second dimension of variation. Rejected: no demonstrated need, significant added
complexity, and the current model cannot represent it without redesign.

## Consequences

- **`locationsPerAisle` is a total that must be even.** An odd total would imply sides of unequal
  length, which this decision forbids. See decision 003.
- The position formula in `BayEntity.getPositions` is already correct under this rule and needs no
  change.
- `calculatePositionRanges` must never be relied upon to handle an odd total meaningfully. Its
  current behaviour for odd input (`Math.ceil` on the odd side, `Math.floor` on the even side) is a
  neutral split, not a supported warehouse configuration. See decision 003 for where the constraint
  is enforced.
- Any future feature that needs asymmetric sides (e.g. tunnel bays reducing one side) is a new
  decision, not an extension of this one.
- The test at `CellStructureCalculator.service.spec.ts:81-90`, which asserts
  `calculatePositionRanges(11)` returns odd=6/even=5, describes an unsupported configuration. It
  remains valid as a test of the method's split behaviour, but must not be read as sanctioning an
  odd `locationsPerAisle`.

## Evidence

- `apps/api/src/warehouse/domain/services/CellStructureCalculator.service.ts` —
  `generateAisleConfiguration`, `calculatePositionRanges`
- `apps/api/src/warehouse/domain/entities/Bay.entity.ts:33-44` — `getPositions(isOdd)`
- `apps/api/src/warehouse/application/use-cases/cell/CreateCell.uc.ts` (PR #8) — expands `both` into
  two aisle records
- `reference/astro-warehouse-visualizer/src/services/cell.service.ts` — `createLocations`
- `docs/domain/CELL_STRUCTURE_CALCULATION.md` — Step 1 and Step 2
