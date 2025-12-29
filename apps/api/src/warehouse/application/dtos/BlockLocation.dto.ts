import { IsInt, IsNotEmpty } from 'class-validator'

export class BlockLocationDto {
  @IsNotEmpty({ message: 'Block Reason ID is required' })
  @IsInt({ message: 'Block Reason ID must be an integer' })
  blockReasonId!: number
}
