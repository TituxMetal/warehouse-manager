import { Test } from '@nestjs/testing'
import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import type { BayResponseDto } from '~/warehouse/application/dtos'
import type { BayWithLocationsResponseDto } from '~/warehouse/application/use-cases/bay'
import {
  GetBayByIdUseCase,
  GetBaysByAisleIdUseCase,
  GetBayWithLocationsUseCase
} from '~/warehouse/application/use-cases/bay'

import { BayService } from './Bay.service'

describe('BayService', () => {
  let service: BayService
  let mockGetBayByIdUseCase: { execute: Mock<typeof GetBayByIdUseCase.prototype.execute> }
  let mockGetBaysByAisleIdUseCase: {
    execute: Mock<typeof GetBaysByAisleIdUseCase.prototype.execute>
  }
  let mockGetBayWithLocationsUseCase: {
    execute: Mock<typeof GetBayWithLocationsUseCase.prototype.execute>
  }

  beforeEach(async () => {
    mockGetBayByIdUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetBayByIdUseCase.prototype.execute>
    }
    mockGetBaysByAisleIdUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetBaysByAisleIdUseCase.prototype.execute>
    }
    mockGetBayWithLocationsUseCase = {
      execute: mock(() => {}) as unknown as Mock<
        typeof GetBayWithLocationsUseCase.prototype.execute
      >
    }

    const module = await Test.createTestingModule({
      providers: [
        BayService,
        { provide: GetBayByIdUseCase, useValue: mockGetBayByIdUseCase },
        { provide: GetBaysByAisleIdUseCase, useValue: mockGetBaysByAisleIdUseCase },
        { provide: GetBayWithLocationsUseCase, useValue: mockGetBayWithLocationsUseCase }
      ]
    }).compile()

    service = module.get<BayService>(BayService)
  })

  describe('getById', () => {
    it('should delegate to getBayByIdUseCase with correct id', async () => {
      const id = 1
      const expectedResult: BayResponseDto = {
        id,
        number: 1,
        width: 100,
        startPosition: 0,
        aisleId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockGetBayByIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getById(id)

      expect(mockGetBayByIdUseCase.execute).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getByAisleId', () => {
    it('should delegate to getBaysByAisleIdUseCase with correct aisleId', async () => {
      const aisleId = 1
      const expectedResult: BayResponseDto[] = [
        {
          id: 1,
          number: 1,
          width: 100,
          startPosition: 0,
          aisleId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      mockGetBaysByAisleIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getByAisleId(aisleId)

      expect(mockGetBaysByAisleIdUseCase.execute).toHaveBeenCalledWith(aisleId)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getWithLocations', () => {
    it('should delegate to getBayWithLocationsUseCase with correct id', async () => {
      const id = 1
      const expectedResult: BayWithLocationsResponseDto = {
        id,
        number: 1,
        width: 100,
        startPosition: 0,
        aisleId: 1,
        locations: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockGetBayWithLocationsUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getWithLocations(id)

      expect(mockGetBayWithLocationsUseCase.execute).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedResult)
    })
  })
})
