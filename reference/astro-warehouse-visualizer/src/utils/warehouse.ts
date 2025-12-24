// src/utils/warehouse.ts
import { FORMAT_LENGTHS, type FullLocation, type Location, REGEX_PATTERNS } from '~/types/warehouse'

/**
 * Custom error class for warehouse-related operations
 * Extends the built-in Error class with specific error codes
 * for better error handling and identification
 */
export class WarehouseError extends Error {
  constructor(
    message: string,
    public code:
      | 'INVALID_LEVEL'
      | 'INVALID_FORMAT'
      | 'CELL_NOT_FOUND'
      | 'INVALID_AISLE'
      | 'INVALID_POSITION'
  ) {
    super(message)
    this.name = 'WarehouseError'
  }
}

/**
 * Normalizes a part of the location to a specific length by adding leading zeros
 * @param value - The numeric or string value to normalize
 * @param length - The desired length of the output string
 * @returns String padded with leading zeros to match the specified length
 * @example
 * normalizePart(5, 3) // returns '005'
 * @private
 */
const normalizePart = (value: string | number, length: number): string => {
  return value.toString().padStart(length, '0')
}

/**
 * Normalizes a position-level location string to the standard format
 * @param location - The location string to normalize (format: position-level)
 * @returns Normalized location string with proper padding, or original if invalid format
 * @example
 * normalizeLocation('54-20') // returns '0054-20' (assuming FORMAT_LENGTHS.POSITION is 4)
 */
export const normalizeLocation = (location: string): string => {
  const parts = location.split('-')
  if (parts.length !== 2) return location

  const [position, level] = parts
  return [
    normalizePart(position, FORMAT_LENGTHS.POSITION),
    normalizePart(level, FORMAT_LENGTHS.LEVEL)
  ].join('-')
}

/**
 * Normalizes a full warehouse address to the standard format
 * @param address - The full address string to normalize (format: cell-aisle-position-level)
 * @returns Normalized address string with proper padding, or original if invalid format
 * @example
 * normalizeAddress('1-5-54-20') // returns '1-005-0054-20'
 * @private
 */
const normalizeAddress = (address: string): string => {
  const parts = address.split('-')
  if (parts.length !== 4) return address

  const [cell, aisle, position, level] = parts
  return [
    cell,
    normalizePart(aisle, FORMAT_LENGTHS.AISLE),
    normalizePart(position, FORMAT_LENGTHS.POSITION),
    normalizePart(level, FORMAT_LENGTHS.LEVEL)
  ].join('-')
}

/**
 * Validates and parses a full warehouse address string into a structured object
 * @param address - The full address string to parse (format: cell-aisle-position-level)
 * @returns Structured FullLocation object with numeric properties
 * @throws {WarehouseError} When address format is invalid or level is invalid
 * @example
 * parseFullAddress('1-005-0054-20') // returns { cell: 1, aisle: 5, position: 54, level: 20 }
 */
export const parseFullAddress = (address: string): FullLocation => {
  const normalized = normalizeAddress(address)
  const match = normalized.match(REGEX_PATTERNS.FULL_ADDRESS)
  if (!match) {
    throw new WarehouseError(
      'Invalid address format. Expected format: cell-aisle-position-level',
      'INVALID_FORMAT'
    )
  }

  const [, cellStr, aisleStr, positionStr, levelStr] = match
  const cell = parseInt(cellStr)
  const aisle = parseInt(aisleStr)
  const position = parseInt(positionStr)
  const level = parseInt(levelStr)

  // Validate level
  if (!isValidLevel(level)) {
    throw new WarehouseError('Invalid level. Levels must be 0, 10, 20, 30, or 40', 'INVALID_LEVEL')
  }

  return { cell, aisle, position, level }
}

/**
 * Checks if a full warehouse address string is valid
 * @param address - The full address string to validate (format: cell-aisle-position-level)
 * @returns Boolean indicating if the address is valid
 * @example
 * isValidAddress('1-005-0054-20') // returns true if valid
 */
export const isValidAddress = (address: string): boolean => {
  try {
    parseFullAddress(address)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Checks if a position-level location string is properly formatted
 * @param location - The location string to validate (format: position-level)
 * @returns Boolean indicating if the location is valid
 * @example
 * isValidLocation('0054-20') // returns true if valid
 */
export const isValidLocation = (location: string): boolean => {
  const normalized = normalizeLocation(location)
  const match = normalized.match(/^(\d{4})-(\d{2})$/)
  if (!match) return false

  const [, levelStr] = match
  const level = parseInt(levelStr)
  return isValidLevel(level)
}

/**
 * Checks if a level number is valid according to warehouse configuration
 * Valid levels are 0, 10, 20, 30, 40 where:
 * - 0 is typically the ground/picking level
 * - 10-40 are storage levels at different heights
 * @param level - The level number to validate
 * @returns Boolean indicating if the level is valid
 * @private
 */
const isValidLevel = (level: number): boolean => {
  const validLevels = [0, 10, 20, 30, 40]
  return validLevels.includes(level)
}

/**
 * Structured result type for validation operations
 * Provides a consistent pattern for returning validation results
 * with appropriate success status, data, and error information
 */
interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Validates and normalizes a position-level location string with detailed results
 * @param location - The location string to validate and normalize (format: position-level)
 * @returns Structured validation result with success status, normalized data if successful, or error message
 * @example
 * validateLocation('54-20') // returns { success: true, data: '0054-20' }
 * validateLocation('invalid') // returns { success: false, error: 'Invalid location format' }
 */
export const validateLocation = (location: string): ValidationResult<string> => {
  try {
    const normalized = normalizeLocation(location)
    const match = normalized.match(REGEX_PATTERNS.LOCATION)

    if (!match) {
      return {
        success: false,
        error: 'Invalid location format'
      }
    }

    const level = parseInt(match[2])
    if (!isValidLevel(level)) {
      return {
        success: false,
        error: 'Invalid level value'
      }
    }

    return {
      success: true,
      data: normalized
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Parses a position-level location string into a structured Location object
 * @param location - The location string to parse (format: position-level)
 * @returns Structured Location object with numeric properties, or null if invalid
 * @example
 * parseLocation('0054-20') // returns { position: 54, level: 20 }
 * parseLocation('invalid') // returns null
 */
export const parseLocation = (location: string): Location | null => {
  const validation = validateLocation(location)

  if (!validation.success || !validation.data) {
    return null
  }

  const [position, level] = validation.data.split('-').map(Number)

  if (!isValidLevel(level)) {
    return null
  }

  return { position, level }
}

// Cache for formatted addresses
const addressCache = new Map<string, string>()

/**
 * Formats a FullLocation object into a standardized address string
 * Uses caching for better performance when formatting the same address multiple times
 * @param location - The FullLocation object to format
 * @returns Formatted address string with proper padding
 * @example
 * formatAddress({ cell: 1, aisle: 5, position: 54, level: 20 })
 * // returns '1-005-0054-20'
 */
export const formatAddress = (location: FullLocation): string => {
  const cacheKey = `${location.cell}-${location.aisle}-${location.position}-${location.level}`

  if (addressCache.has(cacheKey)) {
    return addressCache.get(cacheKey)!
  }

  const formatted = [
    location.cell,
    normalizePart(location.aisle, FORMAT_LENGTHS.AISLE),
    normalizePart(location.position, FORMAT_LENGTHS.POSITION),
    normalizePart(location.level, FORMAT_LENGTHS.LEVEL)
  ].join('-')

  addressCache.set(cacheKey, formatted)
  return formatted
}

// Clear address cache when it grows too large to prevent memory issues
if (addressCache.size > 1000) {
  addressCache.clear()
}
