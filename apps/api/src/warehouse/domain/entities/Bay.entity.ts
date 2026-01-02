export class BayEntity {
  constructor(
    public readonly id: number,
    public readonly number: number,
    public readonly width: number,
    public readonly startPosition: number,
    public readonly aisleId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Returns an array of position numbers that belong to this bay
   *
   * @param isOdd - Whether the parent aisle is odd (from AisleEntity.isOdd)
   * @returns Array of position numbers
   *
   * Position calculation:
   * - `startPosition` is the base index (0, 3, 7, 11, ...)
   * - Odd positions: basePosition * 2 + 1 → 1, 3, 5, 7...
   * - Even positions: (basePosition + 1) * 2 → 2, 4, 6, 8...
   *
   * Example with variable widths:
   * - Bay 1: startPosition=0, width=4 → base positions 0,1,2,3
   * - Bay 2: startPosition=4, width=3 → base positions 4,5,6
   * - Bay 3: startPosition=7, width=4 → base positions 7,8,9,10
   */
  getPositions(isOdd: boolean): number[] {
    const positions: number[] = []

    Array.from({ length: this.width }, (_, index) => {
      const basePosition = this.startPosition + index
      const position = isOdd ? basePosition * 2 + 1 : (basePosition + 1) * 2

      positions.push(position)
    })

    return positions
  }
}
