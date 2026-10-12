# Decision Registry

> A log of the decisions that shape this project, and why they were made.

---

## Why this exists

This project was built logic-first: the domain and application layers were written before any
vertical slice existed. That produced a large body of coherent-looking code whose underlying
assumptions were never written down — and several of those assumptions contradicted each other
across files, docs, and the reference prototype.

The registry fixes that. A decision lives here as soon as it is made, in the repository, in version
control — not in a plan file outside the repo, and not only in the code that implements it. Code
shows _what_ was decided; these documents record _why_, and what was rejected.

## Rules

- **Write the decision before the code that depends on it.** A decision that only exists in an
  implementation is invisible to the next reader and will be re-litigated.
- **One decision per file.** Numbered, never renumbered.
- **Supersede, never edit.** When a decision changes, add a new record and mark the old one
  `Superseded by NNN`. The history of the reasoning is the valuable part.
- **State the alternatives.** A decision without rejected options is not a decision, it is a
  description.
- **Statuses:** `Accepted`, `Superseded by NNN`, `Rejected`.

## Index

| #                                                      | Decision                                                                                         | Status                   | Affects                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------ |
| [001](./001-locations-per-aisle-is-a-total.md)         | `locationsPerAisle` is a total across both sides; the stored value is positions per aisle record | Partly superseded by 005 | `CellEntity`, `CreateCellUseCase`, `AisleEntity` |
| [002](./002-both-sides-have-equal-positions.md)        | Both sides of an aisle always have the same number of positions                                  | Accepted                 | `CellStructureCalculator`, `CreateCellDto`       |
| [003](./003-position-count-is-even.md)                 | `locationsPerAisle` must be even                                                                 | Accepted                 | `CreateCellDto`                                  |
| [004](./004-minimum-locations-per-aisle.md)            | A side must be bay-decomposable: at least 3 positions, never 5                                   | Accepted                 | `CreateCellDto`, `CreateCellUseCase`             |
| [005](./005-stored-locations-per-aisle-is-per-side.md) | The stored `locationsPerAisle` is the per-side count, not the entered total                      | Accepted                 | `CellEntity`, `CreateCellUseCase`, `AisleEntity` |

## Open questions

Facts the code depends on that are still unsettled. Listed here so they are not silently guessed at,
and closed by a decision record when resolved.

| Question                                                                                     | Where it surfaced                                     | Status                                                                                                                                                |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Batch creation strategy for large cells (~17,000 locations)                                  | `docs/features/01-cell-creation.md` (Open Question 1) | Open — `createMany` added to interfaces in #7, transaction deferred to Phase 6                                                                        |
| `aislesCount` semantics: aisle _numbers_ or aisle _records_?                                 | `docs/features/01-cell-creation.md` (Open Question 2) | Open — decision 002 constrains this, not yet written                                                                                                  |
| Entity construction timestamps for creation                                                  | `docs/features/01-cell-creation.md` (Open Question 4) | Open                                                                                                                                                  |
| Transaction wrapping of the four `create*` calls                                             | `CreateCell.uc.ts` `TODO(infra)`                      | Open — deferred to infrastructure phase                                                                                                               |
| `calculateBayCount` removal                                                                  | `docs/archive/phases/phase-4-domain-services.md`      | Resolved in code (replaced by `calculateBayDistribution`), still documented in `ROADMAP.md`                                                           |
| Minimum `locationsPerAisle` for a **one-sided** aisle: is 12 too strict?                     | Decision 004 consequences                             | Resolved by decision 004 — the rule is per side, so a one-sided aisle needs only 3                                                                    |
| `CreateCellUseCase` derives bay specs from `odd.count` even for a one-sided **even** aisle   | Decision 004 consequences                             | Resolved — the bay spec is now derived from the side each aisle actually has, so an even one-sided aisle is no longer served by the odd count         |
| Rename `CellEntity.locationsPerAisle` / the response field to something that says "per side" | Decision 005 alternatives                             | Open — the current name implies a total while the stored value is per side; renaming touches entity, DTO, mapper, Prisma schema and frontend contract |

---

_Registry created: 2026-10-12_ _Context: project resumption — auditing PR #8 and reconciling
contradictory sources_
