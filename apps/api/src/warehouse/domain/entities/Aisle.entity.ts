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
   * @param locationsPerAisle - Total locations per aisle (from parent Cell)
   * @returns { start: number, end: number, count: number }
   *
   * For locationsPerAisle = 10:
   *   - Odd side:  { start: 1, end: 9, count: 5 }  (positions 1, 3, 5, 7, 9)
   *   - Even side: { start: 2, end: 10, count: 5 } (positions 2, 4, 6, 8, 10)
   */
  getPositionRange(locationsPerAisle: number): { start: number; end: number; count: number } {
    return {
      start: this.isOdd ? 1 : 2,
      end: this.isOdd ? locationsPerAisle - 1 : locationsPerAisle,
      count: this.isOdd ? Math.ceil(locationsPerAisle / 2) : Math.floor(locationsPerAisle / 2)
    }
  }
}
