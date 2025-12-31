import { Test } from '@nestjs/testing'
import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import type { LocationResponseDto } from '~/warehouse/application/dtos'
import {
  BlockLocationUseCase,
  GetAvailableLocationsUseCase,
  GetBlockedLocationsUseCase,
  GetLocationByIdUseCase,
  GetLocationsByAisleIdUseCase,
  GetLocationsByBayIdUseCase,
  GetPickingLocationsUseCase,
  UnblockLocationUseCase
} from '~/warehouse/application/use-cases/location'

import { LocationService } from './Location.service'

describe('LocationService', () => {
  let service: LocationService
  let mockGetLocationByIdUseCase: {
    execute: Mock<typeof GetLocationByIdUseCase.prototype.execute>
  }
  let mockGetLocationsByBayIdUseCase: {
    execute: Mock<typeof GetLocationsByBayIdUseCase.prototype.execute>
  }
  let mockGetLocationsByAisleIdUseCase: {
    execute: Mock<typeof GetLocationsByAisleIdUseCase.prototype.execute>
  }
  let mockGetPickingLocationsUseCase: {
    execute: Mock<typeof GetPickingLocationsUseCase.prototype.execute>
  }
  let mockGetAvailableLocationsUseCase: {
    execute: Mock<typeof GetAvailableLocationsUseCase.prototype.execute>
  }
  let mockGetBlockedLocationsUseCase: {
    execute: Mock<typeof GetBlockedLocationsUseCase.prototype.execute>
  }
  let mockBlockLocationUseCase: {
    execute: Mock<typeof BlockLocationUseCase.prototype.execute>
  }
  let mockUnblockLocationUseCase: {
    execute: Mock<typeof UnblockLocationUseCase.prototype.execute>
  }

  const createLocationResponseDto = (
    overrides: Partial<LocationResponseDto> = {}
  ): LocationResponseDto => ({
    id: 1,
    position: 1,
    level: 0,
    status: 'available',
    isPicking: true,
    isBlocked: false,
    isAvailable: true,
    aisleId: 1,
    bayId: 1,
    blockReasonId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  })

  beforeEach(async () => {
    mockGetLocationByIdUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetLocationByIdUseCase.prototype.execute>
    }
    mockGetLocationsByBayIdUseCase = {
      execute: mock(() => {}) as unknown as Mock<
        typeof GetLocationsByBayIdUseCase.prototype.execute
      >
    }
    mockGetLocationsByAisleIdUseCase = {
      execute: mock(() => {}) as unknown as Mock<
        typeof GetLocationsByAisleIdUseCase.prototype.execute
      >
    }
    mockGetPickingLocationsUseCase = {
      execute: mock(() => {}) as unknown as Mock<
        typeof GetPickingLocationsUseCase.prototype.execute
      >
    }
    mockGetAvailableLocationsUseCase = {
      execute: mock(() => {}) as unknown as Mock<
        typeof GetAvailableLocationsUseCase.prototype.execute
      >
    }
    mockGetBlockedLocationsUseCase = {
      execute: mock(() => {}) as unknown as Mock<
        typeof GetBlockedLocationsUseCase.prototype.execute
      >
    }
    mockBlockLocationUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof BlockLocationUseCase.prototype.execute>
    }
    mockUnblockLocationUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof UnblockLocationUseCase.prototype.execute>
    }

    const module = await Test.createTestingModule({
      providers: [
        LocationService,
        { provide: GetLocationByIdUseCase, useValue: mockGetLocationByIdUseCase },
        { provide: GetLocationsByBayIdUseCase, useValue: mockGetLocationsByBayIdUseCase },
        { provide: GetLocationsByAisleIdUseCase, useValue: mockGetLocationsByAisleIdUseCase },
        { provide: GetPickingLocationsUseCase, useValue: mockGetPickingLocationsUseCase },
        { provide: GetAvailableLocationsUseCase, useValue: mockGetAvailableLocationsUseCase },
        { provide: GetBlockedLocationsUseCase, useValue: mockGetBlockedLocationsUseCase },
        { provide: BlockLocationUseCase, useValue: mockBlockLocationUseCase },
        { provide: UnblockLocationUseCase, useValue: mockUnblockLocationUseCase }
      ]
    }).compile()

    service = module.get<LocationService>(LocationService)
  })

  describe('getById', () => {
    it('should delegate to getLocationByIdUseCase with correct id', async () => {
      const id = 1
      const expectedResult = createLocationResponseDto({ id })
      mockGetLocationByIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getById(id)

      expect(mockGetLocationByIdUseCase.execute).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getByBayId', () => {
    it('should delegate to getLocationsByBayIdUseCase with correct bayId', async () => {
      const bayId = 1
      const expectedResult = [createLocationResponseDto({ bayId })]
      mockGetLocationsByBayIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getByBayId(bayId)

      expect(mockGetLocationsByBayIdUseCase.execute).toHaveBeenCalledWith(bayId)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getByAisleId', () => {
    it('should delegate to getLocationsByAisleIdUseCase with correct aisleId', async () => {
      const aisleId = 1
      const expectedResult = [createLocationResponseDto({ aisleId })]
      mockGetLocationsByAisleIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getByAisleId(aisleId)

      expect(mockGetLocationsByAisleIdUseCase.execute).toHaveBeenCalledWith(aisleId)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getPickingLocations', () => {
    it('should delegate to getPickingLocationsUseCase', async () => {
      const expectedResult = [createLocationResponseDto({ level: 0, isPicking: true })]
      mockGetPickingLocationsUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getPickingLocations()

      expect(mockGetPickingLocationsUseCase.execute).toHaveBeenCalled()
      expect(result).toBe(expectedResult)
    })
  })

  describe('getAvailableLocations', () => {
    it('should delegate to getAvailableLocationsUseCase', async () => {
      const expectedResult = [createLocationResponseDto({ status: 'available' })]
      mockGetAvailableLocationsUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getAvailableLocations()

      expect(mockGetAvailableLocationsUseCase.execute).toHaveBeenCalled()
      expect(result).toBe(expectedResult)
    })
  })

  describe('getBlockedLocations', () => {
    it('should delegate to getBlockedLocationsUseCase', async () => {
      const expectedResult = [
        createLocationResponseDto({ status: 'blocked', isBlocked: true, blockReasonId: 1 })
      ]
      mockGetBlockedLocationsUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getBlockedLocations()

      expect(mockGetBlockedLocationsUseCase.execute).toHaveBeenCalled()
      expect(result).toBe(expectedResult)
    })
  })

  describe('block', () => {
    it('should delegate to blockLocationUseCase with correct id and dto', async () => {
      const id = 1
      const dto = { blockReasonId: 5 }
      const expectedResult = createLocationResponseDto({
        id,
        status: 'blocked',
        isBlocked: true,
        blockReasonId: 5
      })
      mockBlockLocationUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.block(id, dto)

      expect(mockBlockLocationUseCase.execute).toHaveBeenCalledWith(id, dto)
      expect(result).toBe(expectedResult)
    })
  })

  describe('unblock', () => {
    it('should delegate to unblockLocationUseCase with correct id', async () => {
      const id = 1
      const expectedResult = createLocationResponseDto({
        id,
        status: 'available',
        isBlocked: false
      })
      mockUnblockLocationUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.unblock(id)

      expect(mockUnblockLocationUseCase.execute).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedResult)
    })
  })
})
