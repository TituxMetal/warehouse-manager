/**
 * Utility for efficient batch processing of location creation operations
 *
 * This module provides a function to split large datasets of location records
 * into smaller batches for database insertion, preventing timeouts and
 * memory issues when creating thousands of warehouse locations at once.
 */
import type { Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '~/lib/prisma'

/**
 * Default number of records to process in each database operation
 * Balances performance with memory usage - adjust if needed based on
 * server capacity and database response times
 */
const BATCH_SIZE = 1000

/**
 * Creates multiple location records in the database using batched operations
 *
 * Splits a large array of location data into smaller batches and processes them
 * sequentially to prevent database timeout errors and memory issues. This is
 * essential when creating thousands of locations during warehouse implementation.
 *
 * @param data - Array of location objects to be created in the database
 * @param batchSize - Optional: Number of records per batch (defaults to 1000)
 * @param db - Optional: PrismaClient instance for dependency injection (defaults to global prisma client)
 *
 * @example
 * // Create 5000 location records in batches of 1000
 * const locationData = generateLocations(5000);
 * await createLocationsInBatches(locationData);
 *
 * @example
 * // Create locations with a custom batch size
 * await createLocationsInBatches(locationData, 500);
 *
 * @example
 * // Use with a test database during testing
 * await createLocationsInBatches(locationData, 1000, testPrismaClient);
 */
export const createLocationsInBatches = async (
  data: Prisma.LocationCreateManyInput[],
  batchSize: number = BATCH_SIZE,
  db: PrismaClient = prisma
) => {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    await db.location.createMany({ data: batch })
  }
}
