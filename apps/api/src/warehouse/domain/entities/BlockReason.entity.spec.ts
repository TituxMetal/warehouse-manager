import { describe, expect, it } from 'bun:test'

import { BlockReasonEntity } from './BlockReason.entity'

const createBlockReason = (
  overrides: {
    name?: string
    permanent?: boolean
  } = {}
) =>
  new BlockReasonEntity(
    1,
    'PILLAR',
    overrides.name ?? 'Concrete Pillar',
    'A structural support pillar',
    overrides.permanent ?? true,
    new Date(),
    new Date()
  )

describe('BlockReasonEntity', () => {
  describe('isPermanent', () => {
    it('should return true for permanent block reasons', () => {
      const blockReason = createBlockReason({ permanent: true })

      expect(blockReason.isPermanent()).toBe(true)
    })

    it('should return false for temporary block reasons', () => {
      const blockReason = createBlockReason({ permanent: false })

      expect(blockReason.isPermanent()).toBe(false)
    })
  })

  describe('getDisplayName', () => {
    it('should append (Permanent) suffix for permanent reasons', () => {
      const blockReason = createBlockReason({ name: 'Concrete Pillar', permanent: true })

      expect(blockReason.getDisplayName()).toBe('Concrete Pillar (Permanent)')
    })

    it('should append (Temporary) suffix for temporary reasons', () => {
      const blockReason = createBlockReason({ name: 'Maintenance Work', permanent: false })

      expect(blockReason.getDisplayName()).toBe('Maintenance Work (Temporary)')
    })
  })
})
