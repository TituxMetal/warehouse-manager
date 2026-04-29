import { IsBoolean, IsIn, IsInt, IsNotEmpty, Max, Min } from 'class-validator'

export class CreateCellDto {
  @IsNotEmpty({ message: 'cellNumber is required' })
  @IsInt({ message: 'cellNumber must be an integer' })
  @Min(1, { message: 'cellNumber must be at least 1' })
  @Max(9, { message: 'cellNumber must be at most 9' })
  cellNumber?: number

  @IsNotEmpty({ message: 'aisleStart is required' })
  @IsInt({ message: 'aisleStart must be an integer' })
  @Min(1, { message: 'aisleStart must be at least 1' })
  aisleStart?: number

  @IsNotEmpty({ message: 'aisleEnd is required' })
  @IsInt({ message: 'aisleEnd must be an integer' })
  @Min(1, { message: 'aisleEnd must be at least 1' })
  aisleEnd?: number

  @IsNotEmpty({ message: 'startLocationType is required' })
  @IsIn(['odd', 'even', 'both'], { message: 'startLocationType must be one of odd, even, both' })
  startLocationType?: string

  @IsNotEmpty({ message: 'endLocationType is required' })
  @IsIn(['odd', 'even', 'both'], { message: 'endLocationType must be one of odd, even, both' })
  endLocationType?: string

  @IsNotEmpty({ message: 'locationsPerAisle is required' })
  @IsInt({ message: 'locationsPerAisle must be an integer' })
  @Min(6, { message: 'locationsPerAisle must be at least 6' })
  locationsPerAisle?: number

  @IsNotEmpty({ message: 'levelCount is required' })
  @IsInt({ message: 'levelCount must be an integer' })
  @Min(2, { message: 'levelCount must be at least 2' })
  levelCount?: number

  @IsNotEmpty({ message: 'hasPicking is required' })
  @IsBoolean({ message: 'hasPicking must be a boolean' })
  hasPicking?: boolean
}
