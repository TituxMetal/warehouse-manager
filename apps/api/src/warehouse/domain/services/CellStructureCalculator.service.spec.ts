import { describe, expect, it } from 'bun:test'

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

    it('should calculate correct ranges for odd number of positions', () => {
      const calculator = new CellStructureCalculator()

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
