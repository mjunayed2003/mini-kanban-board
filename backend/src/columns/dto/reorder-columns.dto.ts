import { Type } from 'class-transformer';
import { ArrayMinSize, IsUUID, ValidateNested } from 'class-validator';

class ColumnOrderItem {
  @IsUUID()
  columnId: string;
}

export class ReorderColumnsDto {
  @IsUUID()
  boardId: string;

  @ValidateNested({ each: true })
  @Type(() => ColumnOrderItem)
  @ArrayMinSize(1)
  orderedColumns: ColumnOrderItem[];
}
