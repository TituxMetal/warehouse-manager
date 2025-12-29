import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateBlockReasonDto {
  @IsNotEmpty({ message: 'Code is required' })
  @IsString({ message: 'Code must be a string' })
  @MinLength(6)
  @MaxLength(6, { message: 'Code must be exactly 6 characters long' })
  code?: string

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name?: string

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string | null

  @IsOptional()
  @IsBoolean({ message: 'Permanent must be a boolean value' })
  permanent?: boolean
}
