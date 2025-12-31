import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import type { BlockLocationDto } from '~/warehouse/application/dtos'
import { BlockReasonEntity, LocationEntity } from '~/warehouse/domain/entities'
import {
  BlockReasonNotFoundException,
  LocationAlreadyBlockedException,
  LocationNotFoundException
} from '~/warehouse/domain/exceptions'
import type { IBlockReasonRepository, ILocationRepository } from '~/warehouse/domain/repositories'
import { LevelValueObject, PositionValueObject } from '~/warehouse/domain/value-objects'

import { BlockLocationUseCase } from './BlockLocation.uc'

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

const createTestBlockReasonEntity = (overrides?: { id?: number; code?: string; name?: string }) =>
  new BlockReasonEntity(
    overrides?.id ?? 1,
    overrides?.code ?? 'DAMAGED',
    overrides?.name ?? 'Damaged rack',
    null,
    false,
    new Date('2025-01-01'),
    new Date('2025-01-02')
  )

describe('BlockLocationUseCase', () => {
  let useCase: BlockLocationUseCase
  let mockLocationRepository: {
    findById: Mock<ILocationRepository['findById']>
    findByBayId: Mock<ILocationRepository['findByBayId']>
    findByAisleId: Mock<ILocationRepository['findByAisleId']>
    findPickingLocations: Mock<ILocationRepository['findPickingLocations']>
    findAvailableLocations: Mock<ILocationRepository['findAvailableLocations']>
    findBlockedLocations: Mock<ILocationRepository['findBlockedLocations']>
    create: Mock<ILocationRepository['create']>
    update: Mock<ILocationRepository['update']>
    delete: Mock<ILocationRepository['delete']>
  }
  let mockBlockReasonRepository: {
    findById: Mock<IBlockReasonRepository['findById']>
    findByCode: Mock<IBlockReasonRepository['findByCode']>
    findAll: Mock<IBlockReasonRepository['findAll']>
    create: Mock<IBlockReasonRepository['create']>
    update: Mock<IBlockReasonRepository['update']>
    delete: Mock<IBlockReasonRepository['delete']>
    exists: Mock<IBlockReasonRepository['exists']>
    isInUse: Mock<IBlockReasonRepository['isInUse']>
  }

  beforeEach(() => {
    mockLocationRepository = {
      findById: mock(() => {}) as unknown as Mock<ILocationRepository['findById']>,
      findByBayId: mock(() => {}) as unknown as Mock<ILocationRepository['findByBayId']>,
      findByAisleId: mock(() => {}) as unknown as Mock<ILocationRepository['findByAisleId']>,
      findPickingLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findPickingLocations']
      >,
      findAvailableLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findAvailableLocations']
      >,
      findBlockedLocations: mock(() => {}) as unknown as Mock<
        ILocationRepository['findBlockedLocations']
      >,
      create: mock(() => {}) as unknown as Mock<ILocationRepository['create']>,
      update: mock(() => {}) as unknown as Mock<ILocationRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<ILocationRepository['delete']>
    }
    mockBlockReasonRepository = {
      findById: mock(() => {}) as unknown as Mock<IBlockReasonRepository['findById']>,
      findByCode: mock(() => {}) as unknown as Mock<IBlockReasonRepository['findByCode']>,
      findAll: mock(() => {}) as unknown as Mock<IBlockReasonRepository['findAll']>,
      create: mock(() => {}) as unknown as Mock<IBlockReasonRepository['create']>,
      update: mock(() => {}) as unknown as Mock<IBlockReasonRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<IBlockReasonRepository['delete']>,
      exists: mock(() => {}) as unknown as Mock<IBlockReasonRepository['exists']>,
      isInUse: mock(() => {}) as unknown as Mock<IBlockReasonRepository['isInUse']>
    }
    useCase = new BlockLocationUseCase(
      mockLocationRepository as unknown as ILocationRepository,
      mockBlockReasonRepository as unknown as IBlockReasonRepository
    )
  })

  describe('execute', () => {
    it('should block an available location', async () => {
      const location = createTestLocationEntity({ id: 1, status: 'available' })
      const blockReason = createTestBlockReasonEntity({ id: 5 })
      const dto: BlockLocationDto = { blockReasonId: 5 }

      mockLocationRepository.findById.mockResolvedValueOnce(location)
      mockBlockReasonRepository.findById.mockResolvedValueOnce(blockReason)
      mockLocationRepository.update.mockResolvedValueOnce(location)

      const result = await useCase.execute(1, dto)

      expect(mockLocationRepository.findById).toHaveBeenCalledWith(1)
      expect(mockBlockReasonRepository.findById).toHaveBeenCalledWith(5)
      expect(mockLocationRepository.update).toHaveBeenCalled()
      expect(result.isBlocked).toBe(true)
    })

    it('should throw LocationNotFoundException when location not found', async () => {
      const dto: BlockLocationDto = { blockReasonId: 1 }
      mockLocationRepository.findById.mockResolvedValueOnce(null)

      await expect(useCase.execute(999, dto)).rejects.toThrow(LocationNotFoundException)
      expect(mockBlockReasonRepository.findById).not.toHaveBeenCalled()
    })

    it('should throw LocationAlreadyBlockedException when location is already blocked', async () => {
      const location = createTestLocationEntity({ id: 1, status: 'blocked', blockReasonId: 2 })
      const dto: BlockLocationDto = { blockReasonId: 5 }
      mockLocationRepository.findById.mockResolvedValueOnce(location)

      await expect(useCase.execute(1, dto)).rejects.toThrow(LocationAlreadyBlockedException)
      expect(mockBlockReasonRepository.findById).not.toHaveBeenCalled()
    })

    it('should throw BlockReasonNotFoundException when block reason not found', async () => {
      const location = createTestLocationEntity({ id: 1, status: 'available' })
      const dto: BlockLocationDto = { blockReasonId: 999 }
      mockLocationRepository.findById.mockResolvedValueOnce(location)
      mockBlockReasonRepository.findById.mockResolvedValueOnce(null)

      await expect(useCase.execute(1, dto)).rejects.toThrow(BlockReasonNotFoundException)
    })

    it('should handle repository errors', async () => {
      const dto: BlockLocationDto = { blockReasonId: 1 }
      const error = new Error('Database error')
      mockLocationRepository.findById.mockRejectedValueOnce(error)

      await expect(useCase.execute(1, dto)).rejects.toThrow(error)
    })
  })
})
