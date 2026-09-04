import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateColumnDto {
  @IsUUID()
  boardId: string;

  @IsString()
  @MinLength(1)
  title: string;
}
