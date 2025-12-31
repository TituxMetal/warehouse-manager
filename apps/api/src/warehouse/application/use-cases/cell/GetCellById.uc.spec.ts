import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import { CellMapper } from '~/warehouse/application/mappers'
import { CellEntity } from '~/warehouse/domain/entities'
import { CellNotFoundException } from '~/warehouse/domain/exceptions'
import type { ICellRepository } from '~/warehouse/domain/repositories'
import { CellValueObject } from '~/warehouse/domain/value-objects'

import { GetCellByIdUseCase } from './GetCellById.uc'

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

describe('GetCellByIdUseCase', () => {
  let useCase: GetCellByIdUseCase
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
    useCase = new GetCellByIdUseCase(mockCellRepository as unknown as ICellRepository)
  })

  describe('execute', () => {
    it('should return cell when found', async () => {
      const cell = createTestCellEntity({ id: 42 })
      mockCellRepository.findById.mockResolvedValue(cell)

      const result = await useCase.execute(42)

      expect(mockCellRepository.findById).toHaveBeenCalledWith(42)
      expect(result).toEqual(CellMapper.toResponseDto(cell))
    })

    it('should throw CellNotFoundException when not found', async () => {
      mockCellRepository.findById.mockResolvedValue(null)

      await expect(useCase.execute(999)).rejects.toThrow(CellNotFoundException)
      expect(mockCellRepository.findById).toHaveBeenCalledWith(999)
    })

    it('should handle repository errors', async () => {
      const error = new Error('Database error')
      mockCellRepository.findById.mockRejectedValue(error)

      await expect(useCase.execute(1)).rejects.toThrow(error)
    })
  })
})
