import { describe, expect, it } from 'bun:test'

import { BayEntity } from '../entities'
import { InvalidPositionCountException } from '../exceptions'

import { CellStructureCalculator } from './CellStructureCalculator.service'

describe('CellStructureCalculator', () => {
  describe('generateAisleConfiguration', () => {
    it('should use only startLocationType when single aisle (endLocationType ignored)', () => {
      const calculator = new CellStructureCalculator()

      // When adding a single aisle (restructuring), only startLocationType matters
      const result = calculator.generateAisleConfiguration(1, 1, 'odd', 'even')

      // 'even' is ignored, 'odd' is used
      expect(result).toEqual([{ number: 1, locationType: 'odd' }])
    })

    it('should return two aisles with start and end location types', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.generateAisleConfiguration(1, 2, 'odd', 'even')

      expect(result).toEqual([
        { number: 1, locationType: 'odd' },
        { number: 2, locationType: 'even' }
      ])
    })

    it('should return middle aisles with "both" locationType', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.generateAisleConfiguration(1, 4, 'odd', 'even')

      expect(result).toEqual([
        { number: 1, locationType: 'odd' },
        { number: 2, locationType: 'both' },
        { number: 3, locationType: 'both' },
        { number: 4, locationType: 'even' }
      ])
    })

    it('should work with "both" as start and end types', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.generateAisleConfiguration(5, 7, 'both', 'both')

      expect(result).toEqual([
        { number: 5, locationType: 'both' },
        { number: 6, locationType: 'both' },
        { number: 7, locationType: 'both' }
      ])
    })

    it('should handle non-sequential aisle numbers', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.generateAisleConfiguration(10, 13, 'even', 'odd')

      expect(result).toEqual([
        { number: 10, locationType: 'even' },
        { number: 11, locationType: 'both' },
        { number: 12, locationType: 'both' },
        { number: 13, locationType: 'odd' }
      ])
    })
  })

  describe('calculatePositionRanges', () => {
    it('should calculate correct ranges for even number of positions', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.calculatePositionRanges(10)

      expect(result).toEqual({
        odd: { start: 1, end: 9, count: 5 },
        even: { start: 2, end: 10, count: 5 }
      })
    })

    it('splits an odd count neutrally (ceil on odd, floor on even) — not a supported aisle', () => {
      const calculator = new CellStructureCalculator()

      // `calculatePositionRanges` is a neutral splitter (decision 003): for an odd count it
      // puts the extra position on the odd side. An odd `locationsPerAisle` is NOT a legal
      // warehouse configuration (decisions 002/003) — it would give the two sides unequal
      // lengths. This test guards the split behaviour only; the rejection of odd totals is
      // enforced in `CreateCellUseCase` and declared on `CreateCellDto`.
      // 11 positions: odd gets one more (1,3,5,7,9,11 = 6) vs even (2,4,6,8,10 = 5)
      const result = calculator.calculatePositionRanges(11)

      expect(result).toEqual({
        odd: { start: 1, end: 11, count: 6 },
        even: { start: 2, end: 10, count: 5 }
      })
    })

    it('should work with minimum 3 positions (one bay)', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.calculatePositionRanges(3)

      expect(result).toEqual({
        odd: { start: 1, end: 3, count: 2 },
        even: { start: 2, end: 2, count: 1 }
      })
    })

    it('should throw InvalidPositionCountException for less than 3 positions', () => {
      const calculator = new CellStructureCalculator()

      expect(() => calculator.calculatePositionRanges(2)).toThrow(InvalidPositionCountException)
      expect(() => calculator.calculatePositionRanges(1)).toThrow(InvalidPositionCountException)
      expect(() => calculator.calculatePositionRanges(0)).toThrow(InvalidPositionCountException)
    })
  })

  describe('calculatePositionsPerSide', () => {
    it('should halve the total for a single two-sided aisle', () => {
      const calculator = new CellStructureCalculator()

      expect(calculator.calculatePositionsPerSide(6, [{ number: 1, locationType: 'both' }])).toBe(3)
    })

    it('should return the total for a single one-sided (odd) aisle', () => {
      const calculator = new CellStructureCalculator()

      expect(calculator.calculatePositionsPerSide(10, [{ number: 1, locationType: 'odd' }])).toBe(
        10
      )
    })

    it('should return the total for a two-aisle odd/even cell (one-sided)', () => {
      const calculator = new CellStructureCalculator()
      const config = calculator.generateAisleConfiguration(1, 2, 'odd', 'even')

      // No middle aisle, so neither aisle is two-sided: the total is the side length.
      expect(config).toEqual([
        { number: 1, locationType: 'odd' },
        { number: 2, locationType: 'even' }
      ])
      expect(calculator.calculatePositionsPerSide(10, config)).toBe(10)
    })

    it('should halve the total for a two-aisle odd/odd cell (middle aisle is two-sided)', () => {
      const calculator = new CellStructureCalculator()
      const config = calculator.generateAisleConfiguration(1, 3, 'odd', 'odd')

      // The middle aisle is always 'both', so the cell is two-sided.
      expect(config).toEqual([
        { number: 1, locationType: 'odd' },
        { number: 2, locationType: 'both' },
        { number: 3, locationType: 'odd' }
      ])
      expect(calculator.calculatePositionsPerSide(6, config)).toBe(3)
    })
  })

  describe('evaluateLocationsPerAisleRule', () => {
    const calculator = new CellStructureCalculator()
    const twoSided = [{ number: 1, locationType: 'both' as const }]
    const oneSided = [{ number: 1, locationType: 'odd' as const }]

    it('should accept even bay-decomposable totals for a two-sided aisle (6, 12)', () => {
      expect(calculator.evaluateLocationsPerAisleRule(6, twoSided)).toBeNull()
      expect(calculator.evaluateLocationsPerAisleRule(12, twoSided)).toBeNull()
    })

    it('should reject an odd total for a two-sided aisle', () => {
      const reason = calculator.evaluateLocationsPerAisleRule(7, twoSided)

      expect(reason).toContain('odd')
      expect(reason).toContain('two-sided aisle')
    })

    it('should reject a two-sided total of 10 (5 positions per side)', () => {
      const reason = calculator.evaluateLocationsPerAisleRule(10, twoSided)

      expect(reason).toContain('5')
      expect(reason).toContain('3- and 4-position bays')
    })

    it('should accept bay-decomposable totals for a one-sided aisle (3, 4, 7, 10)', () => {
      expect(calculator.evaluateLocationsPerAisleRule(3, oneSided)).toBeNull()
      expect(calculator.evaluateLocationsPerAisleRule(4, oneSided)).toBeNull()
      expect(calculator.evaluateLocationsPerAisleRule(7, oneSided)).toBeNull()
      expect(calculator.evaluateLocationsPerAisleRule(10, oneSided)).toBeNull()
    })

    it('should reject a one-sided total of 5', () => {
      expect(calculator.evaluateLocationsPerAisleRule(5, oneSided)).toContain(
        'not a sum of 3- and 4-position bays'
      )
    })

    it('should reject one-sided totals below 3 (1, 2)', () => {
      expect(calculator.evaluateLocationsPerAisleRule(1, oneSided)).toContain('at least 3')
      expect(calculator.evaluateLocationsPerAisleRule(2, oneSided)).toContain('at least 3')
    })
  })

  describe('calculateBayDistribution', () => {
    it('should return all width-4 bays when positions divide evenly by 4', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.calculateBayDistribution(104)

      expect(result).toEqual({
        width3Count: 0,
        width4Count: 26,
        totalBays: 26
      })
    })

    it('should return 1 width-3 bay for remainder 3', () => {
      const calculator = new CellStructureCalculator()

      // 103 = 25×4 + 1×3
      const result = calculator.calculateBayDistribution(103)

      expect(result).toEqual({
        width3Count: 1,
        width4Count: 25,
        totalBays: 26
      })
    })

    it('should return 2 width-3 bays for remainder 2', () => {
      const calculator = new CellStructureCalculator()

      // 102 = 24×4 + 2×3 = 96 + 6
      const result = calculator.calculateBayDistribution(102)

      expect(result).toEqual({
        width3Count: 2,
        width4Count: 24,
        totalBays: 26
      })
    })

    it('should return 3 width-3 bays for remainder 1', () => {
      const calculator = new CellStructureCalculator()

      // 101 = 23×4 + 3×3 = 92 + 9
      const result = calculator.calculateBayDistribution(101)

      expect(result).toEqual({
        width3Count: 3,
        width4Count: 23,
        totalBays: 26
      })
    })

    it('should handle small position counts', () => {
      const calculator = new CellStructureCalculator()

      // 7 = 1×4 + 1×3
      const result = calculator.calculateBayDistribution(7)

      expect(result).toEqual({
        width3Count: 1,
        width4Count: 1,
        totalBays: 2
      })
    })

    it('should throw InvalidPositionCountException for less than 3 positions', () => {
      const calculator = new CellStructureCalculator()

      expect(() => calculator.calculateBayDistribution(0)).toThrow(InvalidPositionCountException)
      expect(() => calculator.calculateBayDistribution(1)).toThrow(InvalidPositionCountException)
      expect(() => calculator.calculateBayDistribution(2)).toThrow(InvalidPositionCountException)
    })

    it('should throw InvalidPositionCountException for 5 positions (edge case)', () => {
      const calculator = new CellStructureCalculator()

      // 5 = 1×4 + remainder 1, but remainder 1 requires maxFours >= 2
      expect(() => calculator.calculateBayDistribution(5)).toThrow(InvalidPositionCountException)
    })

    it('should handle minimum valid counts (3, 4, 6)', () => {
      const calculator = new CellStructureCalculator()

      // 3 = 1×3
      expect(calculator.calculateBayDistribution(3)).toEqual({
        width3Count: 1,
        width4Count: 0,
        totalBays: 1
      })

      // 4 = 1×4
      expect(calculator.calculateBayDistribution(4)).toEqual({
        width3Count: 0,
        width4Count: 1,
        totalBays: 1
      })

      // 6 = 2×3
      expect(calculator.calculateBayDistribution(6)).toEqual({
        width3Count: 2,
        width4Count: 0,
        totalBays: 2
      })
    })
  })

  describe('generateLevels', () => {
    // === HAPPY PATHS ===

    it('generates [0, 10] for initial creation with 2 levels (minimum)', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.generateLevels(2, 0)

      expect(result).toEqual([0, 10])
    })

    it('generates [40, 50] when adding 2 levels to existing 4 levels', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.generateLevels(2, 4)

      expect(result).toEqual([40, 50])
    })

    it('returns empty array when adding 0 levels to existing structure', () => {
      const calculator = new CellStructureCalculator()

      const result = calculator.generateLevels(0, 2)

      expect(result).toEqual([])
    })

    // === VALIDATION ERRORS ===

    it('throws when initial creation has less than 2 levels', () => {
      const calculator = new CellStructureCalculator()

      const errorMessage = 'Initial structure requires at least 2 levels (ground + one beam)'

      expect(() => calculator.generateLevels(1, 0)).toThrow(errorMessage)
      expect(() => calculator.generateLevels(0, 0)).toThrow(errorMessage)
    })

    it('throws when existingLevelCount is 1 (physically impossible)', () => {
      const calculator = new CellStructureCalculator()

      expect(() => calculator.generateLevels(2, 1)).toThrow(
        'Existing structure with 1 level is physically impossible (minimum is 2)'
      )
    })

    it('throws when existingLevelCount or levelCount is negative', () => {
      const calculator = new CellStructureCalculator()

      const errorMessage = 'Level counts cannot be negative'

      expect(() => calculator.generateLevels(2, -1)).toThrow(errorMessage)
      expect(() => calculator.generateLevels(-2, 0)).toThrow(errorMessage)
    })
  })

  describe('chained position generation (positionRanges -> bayDistribution -> startPositions -> BayEntity.getPositions)', () => {
    // This chain is what the original defect slipped through: the bay specification was
    // derived from one side's count and applied to both, so positions could fall outside
    // the range `calculatePositionRanges` declares. A two-sided aisle has the same number
    // of positions on each side (decision 002), so both sides must match their range.

    it.each([6, 12, 20])(
      'generates exactly the declared per-side range for a total of %i',
      total => {
        const calculator = new CellStructureCalculator()
        const ranges = calculator.calculatePositionRanges(total)
        const positionsPerSide = total / 2
        const distribution = calculator.calculateBayDistribution(positionsPerSide)
        const bays = calculator
          .generateBayStartPositions(distribution)
          .map(
            (spec, index) =>
              new BayEntity(
                index + 1,
                index + 1,
                spec.width,
                spec.startPosition,
                1,
                new Date(),
                new Date()
              )
          )

        for (const [isOdd, range] of [
          [true, ranges.odd],
          [false, ranges.even]
        ] as const) {
          const positions = bays.flatMap(bay => bay.getPositions(isOdd))
          const expected = Array.from({ length: range.count }, (_, index) =>
            isOdd ? 2 * index + 1 : 2 * (index + 1)
          )

          expect(positions).toEqual(expected)
          expect(positions).toHaveLength(range.count)
          expect(Math.min(...positions)).toBe(range.start)
          expect(Math.max(...positions)).toBe(range.end)
          expect(
            positions.every(position => position >= range.start && position <= range.end)
          ).toBe(true)
        }
      }
    )
  })

  describe('generateBayStartPositions', () => {
    it('should generate all width-4 bays when no width-3 bays needed', () => {
      const calculator = new CellStructureCalculator()
      const distribution = { width4Count: 26, width3Count: 0, totalBays: 26 }

      const result = calculator.generateBayStartPositions(distribution)

      expect(result).toHaveLength(26)
      expect(result[0]).toEqual({ startPosition: 0, width: 4 })
      expect(result[25]).toEqual({ startPosition: 100, width: 4 })
    })

    it('should place width-3 bays at the end', () => {
      const calculator = new CellStructureCalculator()
      // 103 positions = 25 fours + 1 three
      const distribution = { width4Count: 25, width3Count: 1, totalBays: 26 }

      const result = calculator.generateBayStartPositions(distribution)

      expect(result).toHaveLength(26)
      expect(result[25]).toEqual({ startPosition: 100, width: 3 })
      expect(result[24]).toEqual({ startPosition: 96, width: 4 })
    })

    it('should handle small mixed distribution', () => {
      const calculator = new CellStructureCalculator()
      const distribution = { width4Count: 1, width3Count: 1, totalBays: 2 }

      const result = calculator.generateBayStartPositions(distribution)

      expect(result).toEqual([
        { startPosition: 0, width: 4 },
        { startPosition: 4, width: 3 }
      ])
    })

    it('should return empty array when no bays', () => {
      const calculator = new CellStructureCalculator()
      const distribution = { width4Count: 0, width3Count: 0, totalBays: 0 }

      const result = calculator.generateBayStartPositions(distribution)

      expect(result).toEqual([])
    })
  })
})
