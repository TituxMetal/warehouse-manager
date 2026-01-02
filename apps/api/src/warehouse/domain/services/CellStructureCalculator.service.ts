import { InvalidLevelCountException, InvalidPositionCountException } from '../exceptions'

/**
 * CellStructureCalculator - Domain Service
 *
 * Encapsulates business logic for generating warehouse cell structures.
 * Pure domain logic with no infrastructure dependencies.
 */

export type LocationType = 'odd' | 'even' | 'both'

export interface AisleConfig {
  number: number
  locationType: LocationType
}

export interface PositionRange {
  start: number
  end: number
  count: number
}

export interface PositionRanges {
  odd: PositionRange
  even: PositionRange
}

export interface BayDistribution {
  width3Count: number
  width4Count: number
  totalBays: number
}

export interface BaySpec {
  startPosition: number
  width: 3 | 4
}

export class CellStructureCalculator {
  /**
   * Generates aisle configurations for a cell or a range of aisles.
   *
   * Business rules:
   * - First aisle uses startLocationType
   * - Last aisle uses endLocationType
   * - Middle aisles always have 'both' (odd and even sides)
   * - When aisleStart === aisleEnd (single aisle), only startLocationType is used
   *
   * Use cases:
   * - Creating a new cell with multiple aisles
   * - Adding aisles during cell restructuring
   *
   * @example
   * // Full cell creation
   * generateAisleConfiguration(1, 3, 'odd', 'even')
   * // Returns:
   * // [
   * //   { number: 1, locationType: 'odd' },
   * //   { number: 2, locationType: 'both' },
   * //   { number: 3, locationType: 'even' }
   * // ]
   *
   * @example
   * // Single aisle addition (restructuring)
   * generateAisleConfiguration(15, 15, 'both', 'both')
   * // Returns: [{ number: 15, locationType: 'both' }]
   */
  generateAisleConfiguration(
    aisleStart: number,
    aisleEnd: number,
    startLocationType: LocationType,
    endLocationType: LocationType
  ): AisleConfig[] {
    const aisles: AisleConfig[] = []

    // First aisle: uses startLocationType
    aisles.push({ number: aisleStart, locationType: startLocationType })

    // Middle aisles: always 'both' (they have racks on both sides)
    for (let current = aisleStart + 1; current < aisleEnd; current++) {
      aisles.push({ number: current, locationType: 'both' })
    }

    // Last aisle: uses endLocationType (only if different from first)
    if (aisleStart !== aisleEnd) {
      aisles.push({ number: aisleEnd, locationType: endLocationType })
    }

    return aisles
  }

  /**
   * Calculates position ranges for odd and even sides of an aisle.
   *
   * Business rules:
   * - Minimum 3 positions (physical constraint: one bay requires at least 3 positions)
   * - Odd positions: 1, 3, 5, 7... (start at 1, step by 2)
   * - Even positions: 2, 4, 6, 8... (start at 2, step by 2)
   * - Total positions split between odd and even
   *
   * @throws InvalidPositionCountException if locationsPerAisle < 3 (minimum one bay)
   *
   * @example
   * calculatePositionRanges(10)
   * // Returns:
   * // {
   * //   odd: { start: 1, end: 9, count: 5 },
   * //   even: { start: 2, end: 10, count: 5 }
   * // }
   */
  calculatePositionRanges(locationsPerAisle: number): PositionRanges {
    if (locationsPerAisle < 3) {
      throw new InvalidPositionCountException(locationsPerAisle)
    }

    const oddCount = Math.ceil(locationsPerAisle / 2)
    const evenCount = Math.floor(locationsPerAisle / 2)

    return {
      odd: {
        start: 1,
        end: oddCount * 2 - 1,
        count: oddCount
      },
      even: {
        start: 2,
        end: evenCount * 2,
        count: evenCount
      }
    }
  }

  /**
   * Generates an array of level numbers.
   *
   * Business rules:
   * - Level 0 is picking (ground level)
   * - Higher levels are multiples of 10 (10, 20, 30...)
   *
   * @example
   * generateLevels(4) // Returns [0, 10, 20, 30]
   */
  generateLevels(levelCount: number, existingLevelCount: number = 0): number[] {
    const levels: number[] = []

    if (levelCount < 0 || existingLevelCount < 0) {
      throw new InvalidLevelCountException('Level counts cannot be negative')
    }

    if (existingLevelCount === 0 && levelCount < 2) {
      throw new InvalidLevelCountException(
        'Initial structure requires at least 2 levels (ground + one beam)'
      )
    }

    if (existingLevelCount === 1) {
      throw new InvalidLevelCountException(
        'Existing structure with 1 level is physically impossible (minimum is 2)'
      )
    }

    if (levelCount === 0) {
      return levels
    }

    for (const levelIndex of Array.from({ length: levelCount }, (_, index) => index)) {
      levels.push((existingLevelCount + levelIndex) * 10)
    }

    return levels
  }

  /**
   * Calculates optimal distribution of 3-position and 4-position bays.
   * Maximizes 4-position bays (more efficient use of uprights).
   *
   * Algorithm:
   * - remainder 0: all 4-position bays
   * - remainder 1: (maxFours - 2) fours + 3 threes
   * - remainder 2: (maxFours - 1) fours + 2 threes
   * - remainder 3: maxFours fours + 1 three
   *
   * @param totalPositions - Number of positions on one side of an aisle
   * @returns Distribution of bay widths
   *
   * @example
   * calculateBayDistribution(104) // → { width3Count: 0, width4Count: 26, totalBays: 26 }
   * calculateBayDistribution(103) // → { width3Count: 1, width4Count: 25, totalBays: 26 }
   */
  calculateBayDistribution(totalPositions: number): BayDistribution {
    if (totalPositions < 3) {
      throw new InvalidPositionCountException(totalPositions)
    }

    const maxFours = Math.floor(totalPositions / 4)
    const remainder = totalPositions % 4

    let width3Count: number
    let width4Count: number

    switch (remainder) {
      case 0:
        width3Count = 0
        width4Count = maxFours
        break
      case 1:
        // 4k + 1: Replace two 4-bays with three 3-bays
        // Example: 101 = 23×4 + 3×3 = 92 + 9
        // Note: Requires maxFours >= 2, so totalPositions >= 9
        width3Count = 3
        width4Count = maxFours - 2
        break
      case 2:
        // 4k + 2: Replace one 4-bay with two 3-bays
        // Example: 102 = 24×4 + 2×3 = 96 + 6
        width3Count = 2
        width4Count = maxFours - 1
        break
      case 3:
        // 4k + 3: Add one 3-bay
        // Example: 103 = 25×4 + 1×3 = 100 + 3
        width3Count = 1
        width4Count = maxFours
        break
      default:
        throw new Error('Unexpected remainder')
    }

    // Edge case: totalPositions=5 produces negative width4Count
    if (width4Count < 0) {
      throw new InvalidPositionCountException(totalPositions, 6)
    }

    return {
      width3Count,
      width4Count,
      totalBays: width3Count + width4Count
    }
  }

  /**
   * Generates bay specifications with calculated start positions.
   * Places 4-position bays first, then 3-position bays at the end.
   *
   * @param distribution - Bay distribution from calculateBayDistribution()
   * @returns Array of bay specs with startPosition and width
   *
   * @example
   * generateBayStartPositions({ width4Count: 3, width3Count: 1, totalBays: 4 })
   * // Returns:
   * // [
   * //   { startPosition: 0, width: 4 },
   * //   { startPosition: 4, width: 4 },
   * //   { startPosition: 8, width: 4 },
   * //   { startPosition: 12, width: 3 }
   * // ]
   */
  generateBayStartPositions(distribution: BayDistribution): BaySpec[] {
    const { width3Count, width4Count } = distribution
    const width4Bays: BaySpec[] = Array.from({ length: width4Count }, (_, index) => ({
      startPosition: index * 4,
      width: 4
    }))

    const width3Bays: BaySpec[] = Array.from({ length: width3Count }, (_, index) => ({
      startPosition: width4Count * 4 + index * 3,
      width: 3
    }))

    return [...width4Bays, ...width3Bays]
  }
}
