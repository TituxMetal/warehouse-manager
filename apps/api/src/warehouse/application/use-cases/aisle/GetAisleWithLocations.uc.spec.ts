import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { AisleEntity, LocationEntity } from '~/warehouse/domain/entities'
import type { IAisleRepository } from '~/warehouse/domain/repositories'
import {
  AisleValueObject,
  LevelValueObject,
  PositionValueObject
} from '~/warehouse/domain/value-objects'

import { GetAisleWithLocationsUseCase } from './GetAisleWithLocations.uc'

const createTestAisleEntity = (overrides: Partial<AisleEntity>) =>
  Object.assign(
    new AisleEntity(
      overrides.id ?? 1,
      overrides.number ?? new AisleValueObject(1),
      overrides.isOdd ?? true,
      overrides.cellId ?? 1,
      overrides.createdAt ?? new Date('2025-01-01'),
      overrides.updatedAt ?? new Date('2025-01-02')
    ),
    overrides
  )

const createTestLocationEntity = (overrides?: {
  id?: number
  position?: number
  level?: number
  status?: 'available' | 'occupied' | 'blocked'
  aisleId?: number
  bayId?: number
  blockReasonId?: number | null
}) =>
  new LocationEntity(
    overrides?.id ?? 1,
    new PositionValueObject(overrides?.position ?? 1),
    new LevelValueObject(overrides?.level ?? 0),
    overrides?.status ?? 'available',
    overrides?.aisleId ?? 1,
    overrides?.bayId ?? 1,
    overrides?.blockReasonId ?? null,
    new Date('2025-01-01'),
    new Date('2025-01-02')
  )

describe('GetAisleWithLocationsUseCase', () => {
  let useCase: GetAisleWithLocationsUseCase
  let mockAisleRepository: {
    findById: Mock<IAisleRepository['findById']>
    findByCellId: Mock<IAisleRepository['findByCellId']>
    findWithBays: Mock<IAisleRepository['findWithBays']>
    findWithLocations: Mock<IAisleRepository['findWithLocations']>
    create: Mock<IAisleRepository['create']>
    update: Mock<IAisleRepository['update']>
    delete: Mock<IAisleRepository['delete']>
  }

  beforeEach(() => {
    mockAisleRepository = {
      findById: mock(() => {}) as unknown as Mock<IAisleRepository['findById']>,
      findByCellId: mock(() => {}) as unknown as Mock<IAisleRepository['findByCellId']>,
      findWithBays: mock(() => {}) as unknown as Mock<IAisleRepository['findWithBays']>,
      findWithLocations: mock(() => {}) as unknown as Mock<IAisleRepository['findWithLocations']>,
      create: mock(() => {}) as unknown as Mock<IAisleRepository['create']>,
      update: mock(() => {}) as unknown as Mock<IAisleRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IAisleRepository['delete']>
    }
    useCase = new GetAisleWithLocationsUseCase(mockAisleRepository as unknown as IAisleRepository)
  })

  describe('execute', () => {
    it('should return aisle with its locations', async () => {
      const aisle = createTestAisleEntity({ id: 1 })
      const location1 = createTestLocationEntity({ id: 1, aisleId: 1 })
      const location2 = createTestLocationEntity({ id: 2, aisleId: 1 })
      const aisleWithLocations = Object.assign(aisle, { locations: [location1, location2] })

      mockAisleRepository.findWithLocations.mockResolvedValueOnce(aisleWithLocations)

      const result = await useCase.execute(1)

      expect(result).toHaveProperty('id', aisle.id)
      expect(result).toHaveProperty('number', aisle.number.value)
      expect(result).toHaveProperty('isOdd', aisle.isOdd)
      expect(result).toHaveProperty('locations')
      expect(result.locations).toHaveLength(2)
      expect(result.locations[0]).toHaveProperty('id', location1.id)
      expect(result.locations[1]).toHaveProperty('id', location2.id)
    })

    it('should return aisle with empty locations array', async () => {
      const aisle = createTestAisleEntity({ id: 2 })
      const aisleWithLocations = Object.assign(aisle, { locations: [] })

      mockAisleRepository.findWithLocations.mockResolvedValueOnce(aisleWithLocations)

      const result = await useCase.execute(2)

      expect(result).toHaveProperty('id', aisle.id)
      expect(result).toHaveProperty('number', aisle.number.value)
      expect(result).toHaveProperty('isOdd', aisle.isOdd)
      expect(result).toHaveProperty('locations')
      expect(result.locations).toHaveLength(0)
    })

    it('should throw AisleNotFoundException when not found', async () => {
      const aisleId = 999

      mockAisleRepository.findWithLocations.mockResolvedValueOnce(null)

      await expect(useCase.execute(aisleId)).rejects.toThrow(`Aisle not found: ${aisleId}`)
    })

    it('should handle repository errors', async () => {
      const aisleId = 1
      const error = new Error('Database error')

      mockAisleRepository.findWithLocations.mockRejectedValueOnce(error)

      await expect(useCase.execute(aisleId)).rejects.toThrow(error)
    })
  })
})
