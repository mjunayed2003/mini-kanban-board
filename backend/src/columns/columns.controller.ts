import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { BoardAccessGuard } from '../common/guards/board-access.guard.js';
import { ResourceType } from '../common/decorators/resource-type.decorator.js';
import { ColumnsService } from './columns.service.js';
import { CreateColumnDto } from './dto/create-column.dto.js';
import { UpdateColumnDto } from './dto/update-column.dto.js';
import { ReorderColumnsDto } from './dto/reorder-columns.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  // boardId body-তে আসে, তাই ResourceType('board') — guard body fallback দিয়ে চেক করবে
  @UseGuards(BoardAccessGuard)
  @ResourceType('board')
  @Post()
  create(@Body() dto: CreateColumnDto) {
    return this.columnsService.create(dto);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('board')
  @Get('board/:boardId')
  findAllByBoard(@Param('boardId') boardId: string) {
    return this.columnsService.findAllByBoard(boardId);
  }

  // reorder-এ boardId body-তে থাকবে — @Patch(':columnId') এর আগেই সংজ্ঞায়িত করতে হবে
  @UseGuards(BoardAccessGuard)
  @ResourceType('board')
  @Patch('reorder')
  reorder(@Body() dto: ReorderColumnsDto) {
    return this.columnsService.reorder(dto);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('column')
  @Patch(':columnId')
  update(
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDto,
  ) {
    return this.columnsService.update(columnId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('column')
  @Delete(':columnId')
  remove(@Param('columnId') columnId: string) {
    return this.columnsService.remove(columnId);
  }
}
