import { Test } from '@nestjs/testing'
import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import type { CellResponseDto, CreateCellDto } from '~/warehouse/application/dtos'
import type {
  CellStatisticsDto,
  CellWithAislesResponseDto
} from '~/warehouse/application/use-cases/cell'
import {
  CreateCellUseCase,
  DeleteCellUseCase,
  GetAllCellsUseCase,
  GetCellByIdUseCase,
  GetCellByNumberUseCase,
  GetCellStatisticsUseCase,
  GetCellWithAislesUseCase
} from '~/warehouse/application/use-cases/cell'

import { CellService } from './Cell.service'

describe('CellService', () => {
  let service: CellService
  let mockCreateCellUseCase: { execute: Mock<typeof CreateCellUseCase.prototype.execute> }
  let mockGetAllCellsUseCase: { execute: Mock<typeof GetAllCellsUseCase.prototype.execute> }
  let mockGetCellByIdUseCase: { execute: Mock<typeof GetCellByIdUseCase.prototype.execute> }
  let mockGetCellByNumberUseCase: { execute: Mock<typeof GetCellByNumberUseCase.prototype.execute> }
  let mockGetCellWithAislesUseCase: {
    execute: Mock<typeof GetCellWithAislesUseCase.prototype.execute>
  }
  let mockGetCellStatisticsUseCase: {
    execute: Mock<typeof GetCellStatisticsUseCase.prototype.execute>
  }
  let mockDeleteCellUseCase: { execute: Mock<typeof DeleteCellUseCase.prototype.execute> }

  beforeEach(async () => {
    mockCreateCellUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof CreateCellUseCase.prototype.execute>
    }
    mockGetAllCellsUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetAllCellsUseCase.prototype.execute>
    }
    mockGetCellByIdUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetCellByIdUseCase.prototype.execute>
    }
    mockGetCellByNumberUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetCellByNumberUseCase.prototype.execute>
    }
    mockGetCellWithAislesUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetCellWithAislesUseCase.prototype.execute>
    }
    mockGetCellStatisticsUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetCellStatisticsUseCase.prototype.execute>
    }
    mockDeleteCellUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof DeleteCellUseCase.prototype.execute>
    }

    const module = await Test.createTestingModule({
      providers: [
        CellService,
        { provide: CreateCellUseCase, useValue: mockCreateCellUseCase },
        { provide: GetAllCellsUseCase, useValue: mockGetAllCellsUseCase },
        { provide: GetCellByIdUseCase, useValue: mockGetCellByIdUseCase },
        { provide: GetCellByNumberUseCase, useValue: mockGetCellByNumberUseCase },
        { provide: GetCellWithAislesUseCase, useValue: mockGetCellWithAislesUseCase },
        { provide: GetCellStatisticsUseCase, useValue: mockGetCellStatisticsUseCase },
        { provide: DeleteCellUseCase, useValue: mockDeleteCellUseCase }
      ]
    }).compile()

    service = module.get<CellService>(CellService)
  })

  describe('create', () => {
    it('should delegate to createCellUseCase with correct dto', async () => {
      const dto: CreateCellDto = {
        cellNumber: 1,
        aisleStart: 1,
        aisleEnd: 4,
        startLocationType: 'both',
        endLocationType: 'odd',
        locationsPerAisle: 6,
        levelCount: 2,
        hasPicking: true
      }
      const expectedResult: CellResponseDto = {
        id: 1,
        number: 1,
        aislesCount: 7,
        locationsPerAisle: 3,
        levelsPerLocation: 2,
        totalLocations: 42,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockCreateCellUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.create(dto)

      expect(mockCreateCellUseCase.execute).toHaveBeenCalledWith(dto)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getAll', () => {
    it('should delegate to getAllCellsUseCase', async () => {
      const expectedResult: CellResponseDto[] = [
        {
          id: 1,
          number: 1,
          aislesCount: 10,
          locationsPerAisle: 50,
          levelsPerLocation: 5,
          totalLocations: 2500,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      mockGetAllCellsUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getAll()

      expect(mockGetAllCellsUseCase.execute).toHaveBeenCalled()
      expect(result).toBe(expectedResult)
    })
  })

  describe('getById', () => {
    it('should delegate to getCellByIdUseCase with correct id', async () => {
      const cellId = 1
      const expectedResult: CellResponseDto = {
        id: cellId,
        number: 1,
        aislesCount: 10,
        locationsPerAisle: 50,
        levelsPerLocation: 5,
        totalLocations: 2500,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockGetCellByIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getById(cellId)

      expect(mockGetCellByIdUseCase.execute).toHaveBeenCalledWith(cellId)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getByNumber', () => {
    it('should delegate to getCellByNumberUseCase with correct number', async () => {
      const cellNumber = 5
      const expectedResult: CellResponseDto = {
        id: 1,
        number: cellNumber,
        aislesCount: 10,
        locationsPerAisle: 50,
        levelsPerLocation: 5,
        totalLocations: 2500,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockGetCellByNumberUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getByNumber(cellNumber)

      expect(mockGetCellByNumberUseCase.execute).toHaveBeenCalledWith(cellNumber)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getWithAisles', () => {
    it('should delegate to getCellWithAislesUseCase with correct id', async () => {
      const cellId = 1
      const expectedResult: CellWithAislesResponseDto = {
        id: cellId,
        number: 1,
        aislesCount: 10,
        locationsPerAisle: 50,
        levelsPerLocation: 5,
        totalLocations: 2500,
        aisles: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockGetCellWithAislesUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getWithAisles(cellId)

      expect(mockGetCellWithAislesUseCase.execute).toHaveBeenCalledWith(cellId)
      expect(result).toBe(expectedResult)
    })
  })

  describe('getStatistics', () => {
    it('should delegate to getCellStatisticsUseCase with correct id', async () => {
      const cellId = 1
      const expectedResult: CellStatisticsDto = {
        cellId,
        totalLocations: 100,
        availableLocations: 50,
        occupiedLocations: 30,
        blockedLocations: 20,
        pickingLocations: 10
      }
      mockGetCellStatisticsUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getStatistics(cellId)

      expect(mockGetCellStatisticsUseCase.execute).toHaveBeenCalledWith(cellId)
      expect(result).toBe(expectedResult)
    })
  })

  describe('delete', () => {
    it('should delegate to deleteCellUseCase with correct id', async () => {
      const cellId = 1
      mockDeleteCellUseCase.execute.mockResolvedValue(undefined)

      await service.delete(cellId)

      expect(mockDeleteCellUseCase.execute).toHaveBeenCalledWith(cellId)
    })
  })
})
