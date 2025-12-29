import { PartialType } from '@nestjs/mapped-types'

import { CreateBlockReasonDto } from './CreateBlockReason.dto'

export class UpdateBlockReasonDto extends PartialType(CreateBlockReasonDto) {}
