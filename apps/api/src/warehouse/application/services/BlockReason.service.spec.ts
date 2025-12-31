import { Test } from '@nestjs/testing'
import type { Mock } from 'bun:test'
import { beforeEach, describe, expect, it, mock } from 'bun:test'

import type { BlockReasonResponseDto } from '~/warehouse/application/dtos'
import {
  CreateBlockReasonUseCase,
  DeleteBlockReasonUseCase,
  GetAllBlockReasonsUseCase,
  GetBlockReasonByIdUseCase,
  UpdateBlockReasonUseCase
} from '~/warehouse/application/use-cases/block-reason'

import { BlockReasonService } from './BlockReason.service'

describe('BlockReasonService', () => {
  let service: BlockReasonService
  let mockGetAllBlockReasonsUseCase: {
    execute: Mock<typeof GetAllBlockReasonsUseCase.prototype.execute>
  }
  let mockGetBlockReasonByIdUseCase: {
    execute: Mock<typeof GetBlockReasonByIdUseCase.prototype.execute>
  }
  let mockCreateBlockReasonUseCase: {
    execute: Mock<typeof CreateBlockReasonUseCase.prototype.execute>
  }
  let mockUpdateBlockReasonUseCase: {
    execute: Mock<typeof UpdateBlockReasonUseCase.prototype.execute>
  }
  let mockDeleteBlockReasonUseCase: {
    execute: Mock<typeof DeleteBlockReasonUseCase.prototype.execute>
  }

  beforeEach(async () => {
    mockGetAllBlockReasonsUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetAllBlockReasonsUseCase.prototype.execute>
    }
    mockGetBlockReasonByIdUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof GetBlockReasonByIdUseCase.prototype.execute>
    }
    mockCreateBlockReasonUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof CreateBlockReasonUseCase.prototype.execute>
    }
    mockUpdateBlockReasonUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof UpdateBlockReasonUseCase.prototype.execute>
    }
    mockDeleteBlockReasonUseCase = {
      execute: mock(() => {}) as unknown as Mock<typeof DeleteBlockReasonUseCase.prototype.execute>
    }

    const module = await Test.createTestingModule({
      providers: [
        BlockReasonService,
        { provide: GetAllBlockReasonsUseCase, useValue: mockGetAllBlockReasonsUseCase },
        { provide: GetBlockReasonByIdUseCase, useValue: mockGetBlockReasonByIdUseCase },
        { provide: CreateBlockReasonUseCase, useValue: mockCreateBlockReasonUseCase },
        { provide: UpdateBlockReasonUseCase, useValue: mockUpdateBlockReasonUseCase },
        { provide: DeleteBlockReasonUseCase, useValue: mockDeleteBlockReasonUseCase }
      ]
    }).compile()

    service = module.get<BlockReasonService>(BlockReasonService)
  })

  describe('getAll', () => {
    it('should delegate to getAllBlockReasonsUseCase', async () => {
      const expectedResult: BlockReasonResponseDto[] = [
        {
          id: 1,
          code: 'DAMAGE',
          name: 'Damaged',
          description: null,
          permanent: false,
          displayName: 'Damaged (DAMAGE)',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      mockGetAllBlockReasonsUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getAll()

      expect(mockGetAllBlockReasonsUseCase.execute).toHaveBeenCalled()
      expect(result).toBe(expectedResult)
    })
  })

  describe('getById', () => {
    it('should delegate to getBlockReasonByIdUseCase with correct id', async () => {
      const id = 1
      const expectedResult: BlockReasonResponseDto = {
        id,
        code: 'DAMAGE',
        name: 'Damaged',
        description: null,
        permanent: false,
        displayName: 'Damaged (DAMAGE)',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockGetBlockReasonByIdUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.getById(id)

      expect(mockGetBlockReasonByIdUseCase.execute).toHaveBeenCalledWith(id)
      expect(result).toBe(expectedResult)
    })
  })

  describe('create', () => {
    it('should delegate to createBlockReasonUseCase with correct dto', async () => {
      const dto = { code: 'DAMAGE', name: 'Damaged' }
      const expectedResult: BlockReasonResponseDto = {
        id: 1,
        code: 'DAMAGE',
        name: 'Damaged',
        description: null,
        permanent: false,
        displayName: 'Damaged (DAMAGE)',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockCreateBlockReasonUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.create(dto)

      expect(mockCreateBlockReasonUseCase.execute).toHaveBeenCalledWith(dto)
      expect(result).toBe(expectedResult)
    })
  })

  describe('update', () => {
    it('should delegate to updateBlockReasonUseCase with correct id and dto', async () => {
      const id = 1
      const dto = { name: 'Updated Name' }
      const expectedResult: BlockReasonResponseDto = {
        id,
        code: 'DAMAGE',
        name: 'Updated Name',
        description: null,
        permanent: false,
        displayName: 'Updated Name (DAMAGE)',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockUpdateBlockReasonUseCase.execute.mockResolvedValue(expectedResult)

      const result = await service.update(id, dto)

      expect(mockUpdateBlockReasonUseCase.execute).toHaveBeenCalledWith(id, dto)
      expect(result).toBe(expectedResult)
    })
  })

  describe('delete', () => {
    it('should delegate to deleteBlockReasonUseCase with correct id', async () => {
      const id = 1
      mockDeleteBlockReasonUseCase.execute.mockResolvedValue(undefined)

      await service.delete(id)

      expect(mockDeleteBlockReasonUseCase.execute).toHaveBeenCalledWith(id)
    })
  })
})
