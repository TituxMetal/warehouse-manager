# 003 — `locationsPerAisle` must be even

- **Status:** Accepted
- **Date:** 2026-10-12

## Context

Decision 001 makes `locationsPerAisle` a total across both sides. Decision 002 requires both sides
of an aisle to have the same number of positions. Together they imply that an odd total is not a
legal warehouse configuration: it cannot be split into two equal halves.

The codebase currently accepts odd totals. `CreateCellDto` validates only `@Min(6)`, and
`calculatePositionRanges` divides with `Math.ceil` / `Math.floor`, so an odd total silently produces
unequal sides. `CreateCellUseCase` then derives the bay distribution from the odd side's count alone
(`positionRanges.odd.count`) and applies that same specification to both sides — so for a total of 7
the even side generates four positions where only three exist, writing locations beyond the range
the domain says the cell contains.

A GitHub Copilot review on PR #8 identified this behaviour precisely, but proposed two mutually
exclusive remedies (forbid the odd case, or generate per-side bay specifications) without choosing.
Decision 002 chooses the first.

## Decision

**`locationsPerAisle` must be an even integer.** Odd values are rejected as invalid input, not
handled.

The constraint is enforced at the **input boundary**, in `CreateCellDto`, not inside
`CellStructureCalculator`. Note that this rule — and the side-decomposability rule it depends on —
cannot be expressed by a per-field decorator, since legality depends on whether the aisle has one
side or two. See decision 004 for where validation must actually live.

`calculatePositionRanges` remains a neutral splitter: it keeps working for any count and is not
given a new exception. It is a general-purpose division of a range into odd and even positions; the
warehouse rule that a total must be even belongs to the request that describes a warehouse, not to
the arithmetic that splits a number in two.

## Alternatives considered

**Reject odd totals inside `calculatePositionRanges` (domain layer).** Would place the rule closer
to the formula and protect any future caller from passing an odd value. Rejected: it duplicates the
constraint in two places (DTO and domain), destroys the method's generality as a splitter, and
invalidates an existing unit test that guards the split behaviour. The input boundary is where a
request is either a legal warehouse description or not.

**Generate per-side bay specifications and allow odd totals.** Rejected by decision 002: it requires
asymmetric sides, which are explicitly out of scope, and it would make bay numbering incomparable
between the two sides of one aisle.

**Leave the behaviour as is.** Rejected: it writes locations outside the declared range for every
odd total, which corrupts the meaning of `CellEntity.locationsPerAisle` and of any future address
lookup.

## Consequences

- `CreateCellDto` gains an evenness constraint with a message that states the reason (both sides
  must be equal length), not merely "must be even". The constraint is **conditional on the aisle
  having two sides**: a one-sided aisle has no parity requirement at all. See decision 004.
- A total of 7, 9, 11 must fail validation with a clear message, before any structure is generated.
- The defect Copilot reported on `CreateCell.uc.ts:57` becomes unreachable: with an even total,
  `odd.count === even.count`, so deriving one bay specification and applying it to both sides is
  correct by construction.
- `CreateCellUseCase` needs no conditional logic for this case. The fix is a validation rule, not an
  algorithmic branch — which is the point of enforcing it at the boundary.
- `calculatePositionRanges` keeps its current signature and behaviour, including for odd input.
- The existing test asserting `calculatePositionRanges(11) → odd=6/even=5` stays valid as a splitter
  test. No test should assert that an odd `locationsPerAisle` produces a valid cell.

## Evidence

- `apps/api/src/warehouse/application/dtos/CreateCell.dto.ts:27-31` (PR #8) — `@Min(6)` only
- `apps/api/src/warehouse/domain/services/CellStructureCalculator.service.ts:111-133` —
  `calculatePositionRanges`
- `apps/api/src/warehouse/application/use-cases/cell/CreateCell.uc.ts:57-59` (PR #8) — bay specs
  derived from `odd.count`
- `apps/api/src/warehouse/domain/entities/Bay.entity.ts:33-44` — `getPositions` ignores the side's
  range
- PR #8 review comments on `CreateCell.uc.ts:57`, `CreateCell.dto.ts:31`,
  `CreateCell.uc.spec.ts:160`
