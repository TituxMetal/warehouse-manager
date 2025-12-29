export class BlockReasonResponseDto {
  id!: number
  code!: string
  name!: string
  description?: string | null
  permanent!: boolean
  displayName!: string
  createdAt!: Date
  updatedAt!: Date
}
