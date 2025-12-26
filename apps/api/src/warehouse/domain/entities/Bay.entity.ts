export class BayEntity {
  constructor(
    public readonly id: number,
    public readonly number: number,
    public readonly width: number,
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
   * IMPORTANT ASSUMPTION: This formula assumes ALL bays have width=4.
   * The `bayIndex * 4` calculation only works with uniform bay widths.
   * If bays could have different widths, we would need to store startPosition
   * on the Bay model or calculate it from all previous bays' widths.
   *
   * Example: Bay 1 (number=1), width=4, isOdd=true → [1, 3, 5, 7]
   * Example: Bay 1 (number=1), width=4, isOdd=false → [2, 4, 6, 8]
   * Example: Bay 2 (number=2), width=4, isOdd=true → [9, 11, 13, 15]
   */
  getPositions(isOdd: boolean): number[] {
    const bayIndex = this.number - 1

    // NOTE: The "4" here assumes all bays have 4 positions.
    // If this changes, this formula will break!
    return Array.from({ length: this.width }, (_, positionIndex) => {
      const basePosition = bayIndex * 4 + positionIndex

      if (isOdd) {
        return basePosition * 2 + 1
      }

      return (basePosition + 1) * 2
    })
  }
}
