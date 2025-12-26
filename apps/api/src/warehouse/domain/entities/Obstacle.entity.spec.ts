import { describe, expect, it } from 'bun:test'

import { ObstacleEntity } from './Obstacle.entity'

const createObstacle = (
  overrides: {
    type?: string
    name?: string
  } = {}
) =>
  new ObstacleEntity(
    1,
    overrides.type ?? 'pillar',
    overrides.name ?? 'Main Support A',
    'A structural pillar',
    1,
    new Date(),
    new Date()
  )

describe('ObstacleEntity', () => {
  describe('getDisplayName', () => {
    it('should return the obstacle name', () => {
      const obstacle = createObstacle({ name: 'Fire Hose Reel 3' })

      expect(obstacle.getDisplayName()).toBe('Fire Hose Reel 3')
    })

    it('should return name regardless of type', () => {
      const obstacle = createObstacle({ type: 'fire_equipment', name: 'Extinguisher Station' })

      expect(obstacle.getDisplayName()).toBe('Extinguisher Station')
    })
  })
})
