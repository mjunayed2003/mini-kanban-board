import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  targetColumnId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetPosition?: number;

  @IsOptional()
  @IsUUID()
  beforeTaskId?: string;

  @IsOptional()
  @IsUUID()
  afterTaskId?: string;
}
