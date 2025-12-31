import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { CellMapper } from '~/warehouse/application/mappers'
import { CellEntity } from '~/warehouse/domain/entities'
import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { ICellRepository } from '~/warehouse/domain/repositories'
import { CellValueObject } from '~/warehouse/domain/value-objects'

import { GetCellByNumberUseCase } from './GetCellByNumber.uc'

const createTestCellEntity = (overrides?: {
  id?: number
  number?: number
  aislesCount?: number
  locationsPerAisle?: number
  levelsPerLocation?: number
  createdAt?: Date
  updatedAt?: Date
}) =>
  new CellEntity(
    overrides?.id ?? 1,
    new CellValueObject(overrides?.number ?? 4),
    overrides?.aislesCount ?? 20,
    overrides?.locationsPerAisle ?? 200,
    overrides?.levelsPerLocation ?? 6,
    overrides?.createdAt ?? new Date('2025-01-01'),
    overrides?.updatedAt ?? new Date('2025-01-02')
  )

describe('GetCellByNumberUseCase', () => {
  let useCase: GetCellByNumberUseCase
  let mockCellRepository: {
    findById: Mock<ICellRepository['findById']>
    findByNumber: Mock<ICellRepository['findByNumber']>
    findAll: Mock<ICellRepository['findAll']>
    findWithAisles: Mock<ICellRepository['findWithAisles']>
    create: Mock<ICellRepository['create']>
    update: Mock<ICellRepository['update']>
    delete: Mock<ICellRepository['delete']>
    exists: Mock<ICellRepository['exists']>
  }

  beforeEach(() => {
    mockCellRepository = {
      findById: mock(() => {}) as unknown as Mock<ICellRepository['findById']>,
      findByNumber: mock(() => {}) as unknown as Mock<ICellRepository['findByNumber']>,
      findAll: mock(() => {}) as unknown as Mock<ICellRepository['findAll']>,
      findWithAisles: mock(() => {}) as unknown as Mock<ICellRepository['findWithAisles']>,
      create: mock(() => {}) as unknown as Mock<ICellRepository['create']>,
      update: mock(() => {}) as unknown as Mock<ICellRepository['update']>,
      delete: mock(() => {}) as unknown as Mock<ICellRepository['delete']>,
      exists: mock(() => {}) as unknown as Mock<ICellRepository['exists']>
    }
    useCase = new GetCellByNumberUseCase(mockCellRepository as unknown as ICellRepository)
  })

  describe('execute', () => {
    it('should return cell when found by number', async () => {
      const cell = createTestCellEntity({ id: 1, number: 4 })
      mockCellRepository.findByNumber.mockResolvedValue(cell)

      const result = await useCase.execute(4)

      expect(mockCellRepository.findByNumber).toHaveBeenCalledWith(new CellValueObject(4))
      expect(result).toEqual(CellMapper.toResponseDto(cell))
    })

    it('should throw CellNotFoundException when not found', async () => {
      mockCellRepository.findByNumber.mockResolvedValue(null)

      await expect(useCase.execute(9)).rejects.toThrow(CellNotFoundException)
    })

    it('should throw error for invalid cell number', async () => {
      // CellValueObject validates that number must be 1-9
      await expect(useCase.execute(0)).rejects.toThrow()
      await expect(useCase.execute(10)).rejects.toThrow()
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockCellRepository.findByNumber.mockRejectedValue(error)

      await expect(useCase.execute(4)).rejects.toThrow(error)
    })
  })
})
