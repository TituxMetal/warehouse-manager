import { Test } from '@nestjs/testing'
import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import type { AisleResponseDto } from '~/warehouse/application/dtos'
import type {
  AisleWithBaysResponseDto,
  AisleWithLocationsResponseDto
} from '~/warehouse/application/use-cases/aisle'
import {
  GetAisleByIdUseCase,
  GetAislesByCellIdUseCase,
  GetAisleWithBaysUseCase,
  GetAisleWithLocationsUseCase
} from '~/warehouse/application/use-cases/aisle'

import { AisleService } from './Aisle.service'

describe('AisleService', () => {
  let service: AisleService
  let mockGetAisleByIdUseCase: { execute: Mock<typeof GetAisleByIdUseCase.prototype.execute> }
  let mockGetAislesByCellIdUseCase: {
    execute: Mock<typeof GetAislesByCellIdUseCase.prototype.execute>
  }
  let mockGetAisleWithBaysUseCase: {
    execute: Mock<typeof GetAisleWithBaysUseCase.prototype.execute>
  }
  let mockGetAisleWithLocationsUseCase: {
    execute: Mock<typeof GetAisleWithLocationsUseCase.prototype.execute>
  }

  beforeEach(async () => {
    mockGetAisleByIdUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetAisleByIdUseCase.prototype.execute>
    }
    mockGetAislesByCellIdUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetAislesByCellIdUseCase.prototype.execute>
    }
    mockGetAisleWithBaysUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetAisleWithBaysUseCase.prototype.execute>
    }
    mockGetAisleWithLocationsUseCase = {
      execute: mock(() => {}) as unknown as Mock<
        typeof GetAisleWithLocationsUseCase.prototype.execute
      >
    }

    const module = await Test.createTestingModule({
      providers: [
        AisleService,
        { provide: GetAisleByIdUseCase, useValue: mockGetAisleByIdUseCase },
        { provide: GetAislesByCellIdUseCase, useValue: mockGetAislesByCellIdUseCase },
        { provide: GetAisleWithBaysUseCase, useValue: mockGetAisleWithBaysUseCase },
        { provide: GetAisleWithLocationsUseCase, useValue: mockGetAisleWithLocationsUseCase }
      ]
    }).compile()

    service = module.get<AisleService>(AisleService)
  })

  describe('getById', () => {
    it('should delegate to getAisleByIdUseCase with correct id', async () => {
      const id = 1
      const expectedResult: AisleResponseDto = {
        id,
        number: 1,
        isOdd: true,
        cellId: 1,
        label: 'Aisle 001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockGetAisleByIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getById(id)

      expect(mockGetAisleByIdUseCase.execute).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getByCellId', () => {
    it('should delegate to getAislesByCellIdUseCase with correct cellId', async () => {
      const cellId = 1
      const expectedResult: AisleResponseDto[] = [
        {
          id: 1,
          number: 1,
          isOdd: true,
          cellId,
          label: 'Aisle 001',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      mockGetAislesByCellIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getByCellId(cellId)

      expect(mockGetAislesByCellIdUseCase.execute).toHaveBeenCalledWith(cellId)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getWithBays', () => {
    it('should delegate to getAisleWithBaysUseCase with correct id', async () => {
      const id = 1
      const expectedResult: AisleWithBaysResponseDto = {
        id,
        number: 1,
        isOdd: true,
        cellId: 1,
        label: 'Aisle 001',
        bays: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockGetAisleWithBaysUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getWithBays(id)

      expect(mockGetAisleWithBaysUseCase.execute).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getWithLocations', () => {
    it('should delegate to getAisleWithLocationsUseCase with correct id', async () => {
      const id = 1
      const expectedResult: AisleWithLocationsResponseDto = {
        id,
        number: 1,
        isOdd: true,
        cellId: 1,
        label: 'Aisle 001',
        locations: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockGetAisleWithLocationsUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getWithLocations(id)

      expect(mockGetAisleWithLocationsUseCase.execute).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedResult)
    })
  })
})
