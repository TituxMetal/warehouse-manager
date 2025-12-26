import type { CellValueObject } from '../value-objects/Cell.vo'

export class CellEntity {
  constructor(
    public readonly id: number,
    public readonly number: CellValueObject,
    public readonly aislesCount: number,
    public readonly locationsPerAisle: number,
    public readonly levelsPerLocation: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Returns the total number of storage locations in this cell
   * Formula: aislesCount * locationsPerAisle * levelsPerLocation
   */
  getTotalLocations(): number {
    return this.aislesCount * this.locationsPerAisle * this.levelsPerLocation
  }

  /**
   * Returns the number of aisles in this cell
   */
  getAisleCount(): number {
    return this.aislesCount
  }

  /**
   * Returns an array of valid level numbers for this cell
   * Example: if levelsPerLocation is 6, returns [0, 10, 20, 30, 40, 50]
   */
  getValidLevels(): number[] {
    return Array.from({ length: this.levelsPerLocation }, (_, levelIndex) => levelIndex * 10)
  }
}
