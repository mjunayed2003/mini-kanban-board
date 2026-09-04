import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  columnId: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
