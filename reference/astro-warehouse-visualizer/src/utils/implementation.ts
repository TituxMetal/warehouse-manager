// src/utils/implementation.ts

import type { AisleConfig, LocationsRange, LocationsSummary, LocationType } from '~/types/warehouse'

/**
 * Generates a configuration for a range of aisles in a warehouse cell
 * @param start - First aisle number
 * @param end - Last aisle number
 * @param startLocationType - Type of locations for first aisle ('odd', 'even', or 'both')
 * @param endLocationType - Type of locations for last aisle ('odd', 'even', or 'both')
 * @returns Array of aisle configurations
 * @example
 * // Generate aisles 1-3 with odd start and even end
 * generateAisleNumbers(1, 3, 'odd', 'even')
 * // Returns:
 * // [
 * //   { number: 1, locations: 'odd' },
 * //   { number: 2, locations: 'both' },
 * //   { number: 3, locations: 'even' }
 * // ]
 */
export const generateAisleNumbers = (
  start: number,
  end: number,
  startLocationType: LocationType,
  endLocationType: LocationType
): AisleConfig[] => {
  const aisles: AisleConfig[] = []

  // Handle first aisle
  aisles.push({ number: start, locations: startLocationType })

  // Handle middle aisles (always pairs)
  for (let current = start + 1; current < end; current++) {
    aisles.push({ number: current, locations: 'both' })
  }

  // Handle last aisle
  if (start !== end) {
    aisles.push({ number: end, locations: endLocationType })
  }

  return aisles
}

/**
 * Calculates the ranges of odd and even locations in an aisle
 * @param locationsPerAisle - Total number of locations per aisle
 * @returns Object containing ranges for odd and even locations
 * @example
 * calculateLocationRanges(10)
 * // Returns:
 * // {
 * //   odd: { count: 5, start: 1, end: 9 },
 * //   even: { count: 5, start: 2, end: 10 }
 * // }
 */
export const calculateLocationRanges = (locationsPerAisle: number): LocationsSummary => {
  const oddRange: LocationsRange = {
    count: Math.ceil(locationsPerAisle / 2),
    start: 1,
    end: locationsPerAisle - 1
  }

  const evenRange: LocationsRange = {
    count: Math.floor(locationsPerAisle / 2),
    start: 2,
    end: locationsPerAisle
  }

  return { odd: oddRange, even: evenRange }
}

/**
 * Generates a sequential array of location numbers
 * @param count - Total count of locations needed
 * @returns Array of numbers from 1 to count
 * @example
 * generateLocations(3) // returns [1, 2, 3]
 */
export const generateLocations = (count: number): number[] => {
  return Array.from({ length: count }, (_, i) => i + 1)
}

/**
 * Generates an array of level numbers for warehouse locations
 * Level 0 is typically the picking level (ground level)
 * Other levels are multiples of 10 (10, 20, 30, etc.)
 * @param count - Number of levels needed
 * @returns Array of level numbers
 * @example
 * generateLevels(3) // returns [0, 10, 20]
 * generateLevels(4) // returns [0, 10, 20, 30]
 */
export const generateLevels = (count: number): number[] => {
  return [0, ...Array.from({ length: count - 1 }, (_, i) => (i + 1) * 10)]
}
