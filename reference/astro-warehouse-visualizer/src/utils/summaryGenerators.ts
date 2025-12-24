// src/utils/summaryGenerators.ts
import type { AisleConfig } from '~/types/warehouse'

/**
 * Formats an aisle number to a three-digit string with leading zeros
 * @param num - The aisle number to format
 * @returns A string representation of the aisle number padded with leading zeros to 3 digits
 * @example
 * formatAisleNumber(1) // returns '001'
 * formatAisleNumber(12) // returns '012'
 * formatAisleNumber(123) // returns '123'
 */
const formatAisleNumber = (num: number) => num.toString().padStart(3, '0')

/**
 * Generates a human-readable summary of aisle configurations in a warehouse cell
 * @param aisles - Array of aisle configurations containing number and location type (odd/even/both)
 * @returns A formatted string describing the aisle layout with line breaks between sections
 * @example
 * // Returns something like:
 * // Aisle 001: odd locations
 * // Aisles from 002 to 004: both locations
 * // Aisle 005: even locations
 */
export const generateAisleSummary = (aisles: AisleConfig[]): string => {
  const [first, ...middle] = aisles
  const last = middle.pop()

  const parts = [
    `Aisle ${formatAisleNumber(first.number)}: ${first.locations} locations`,
    middle.length > 0 &&
      `Aisles from ${formatAisleNumber(middle[0].number)} to ${formatAisleNumber(
        middle[middle.length - 1].number
      )}: both locations`,
    last && `Aisle ${formatAisleNumber(last.number)}: ${last.locations} locations`
  ]

  return parts.filter(Boolean).join('\n')
}

/**
 * Creates a human-readable summary of the levels in a warehouse location
 * @param levels - Array of level numbers
 * @param hasPicking - Boolean indicating if level 0 is a picking level
 * @returns A comma-separated string of formatted level numbers with picking level marked
 * @example
 * generateLevelsSummary([0, 10, 20], true) // returns '00 (picking), 10, 20'
 * generateLevelsSummary([0, 10, 20], false) // returns '00, 10, 20'
 */
export const generateLevelsSummary = (levels: number[], hasPicking: boolean): string =>
  levels
    .map(level => ({
      level: level.toString().padStart(2, '0'),
      isPicking: hasPicking && level === 0
    }))
    .map(({ level, isPicking }) => `${level}${isPicking ? ' (picking)' : ''}`)
    .join(', ')

/**
 * Calculates the total number of storage locations in a warehouse cell
 * @param aisles - Array of aisle configurations
 * @param locationsPerAisle - Number of locations per aisle (full aisle capacity)
 * @param levelsCount - Number of vertical levels
 * @returns Total number of storage locations in the cell
 * @example
 * // For a cell with:
 * // - 1 aisle with both sides (full capacity)
 * // - 80 locations per aisle
 * // - 3 levels
 * calculateTotalLocations([{ number: 1, locations: 'both' }], 80, 3) // returns 240
 */
export const calculateTotalLocations = (
  aisles: AisleConfig[],
  locationsPerAisle: number,
  levelsCount: number
): number =>
  aisles.reduce(
    (total, aisle) =>
      total +
      (aisle.locations === 'both' ? locationsPerAisle : Math.ceil(locationsPerAisle / 2)) *
        levelsCount,
    0
  )
