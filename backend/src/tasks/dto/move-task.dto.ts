import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  targetColumnId: string;

  // index-based positioning (frontend যদি শুধু index পাঠায়)
  @IsOptional()
  @IsInt()
  @Min(0)
  targetPosition?: number;

  // অথবা neighbour-based positioning (frontend যদি dnd-kit থেকে সরাসরি neighbour id পাঠায়)
  @IsOptional()
  @IsUUID()
  beforeTaskId?: string;

  @IsOptional()
  @IsUUID()
  afterTaskId?: string;
}
