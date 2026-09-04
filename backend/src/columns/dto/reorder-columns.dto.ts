import { Type } from 'class-transformer';
import { ArrayMinSize, IsUUID, ValidateNested } from 'class-validator';

class ColumnOrderItem {
  @IsUUID()
  columnId: string;
}

export class ReorderColumnsDto {
  @IsUUID()
  boardId: string;

  // frontend থেকে drag করার পর নতুন order-এ columnId এর array আসবে
  @ValidateNested({ each: true })
  @Type(() => ColumnOrderItem)
  @ArrayMinSize(1)
  orderedColumns: ColumnOrderItem[];
}
