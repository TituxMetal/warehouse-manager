import type { LocationStatus } from '~/warehouse/domain/entities'

export class LocationResponseDto {
  id!: number
  level!: number
  position!: number
  status!: LocationStatus
  aisleId!: number
  bayId!: number
  blockReasonId!: number | null
  isPicking!: boolean
  isBlocked!: boolean
  isAvailable!: boolean
  createdAt!: Date
  updatedAt!: Date
}
