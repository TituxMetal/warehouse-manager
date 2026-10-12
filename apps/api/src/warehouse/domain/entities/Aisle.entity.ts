import type { AisleValueObject } from '../value-objects/Aisle.vo'

export class AisleEntity {
  constructor(
    public readonly id: number,
    public readonly number: AisleValueObject,
    public readonly isOdd: boolean,
    public readonly cellId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Returns a human-readable label for this aisle side
   * Example: "Aisle 016 (Odd)" or "Aisle 003 (Even)"
   */
  getLabel(): string {
    const side = this.isOdd ? '(Odd)' : '(Even)'

    return `Aisle ${this.number} ${side}`
  }

  /**
   * Returns the position range for this aisle side
   * @param locationsPerSide - Number of positions on ONE side of the aisle (the unit
   *   stored in `CellEntity.locationsPerAisle` per decision 005), not the total across
   *   both sides
   * @returns { start: number, end: number, count: number }
   *
   * A side of length N carries N positions spaced by 2, all with the side's parity:
   *   - Odd side:  { start: 1, end: 2N - 1, count: N }  (positions 1, 3, ..., 2N - 1)
   *   - Even side: { start: 2, end: 2N, count: N }      (positions 2, 4, ..., 2N)
   *
   * For a side of 5 positions:
   *   - Odd side:  { start: 1, end: 9, count: 5 }
   *   - Even side: { start: 2, end: 10, count: 5 }
   */
  getPositionRange(locationsPerSide: number): { start: number; end: number; count: number } {
    return {
      start: this.isOdd ? 1 : 2,
      end: this.isOdd ? locationsPerSide * 2 - 1 : locationsPerSide * 2,
      count: locationsPerSide
    }
  }
}
