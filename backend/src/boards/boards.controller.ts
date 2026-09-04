import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { BoardAccessGuard } from '../common/guards/board-access.guard.js';
import { ResourceType } from '../common/decorators/resource-type.decorator.js';
import { BoardsService } from './boards.service.js';
import { CreateBoardDto } from './dto/create-board.dto.js';
import { UpdateBoardDto } from './dto/update-board.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.boardsService.findAllForUser(req.user.id);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('board')
  @Get(':boardId')
  findOne(@Param('boardId') boardId: string) {
    return this.boardsService.findOne(boardId);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('board')
  @Patch(':boardId')
  update(@Param('boardId') boardId: string, @Body() dto: UpdateBoardDto) {
    return this.boardsService.update(boardId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('board')
  @Delete(':boardId')
  remove(@Param('boardId') boardId: string) {
    return this.boardsService.remove(boardId);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('board')
  @Post(':boardId/members')
  addMember(
    @Param('boardId') boardId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.boardsService.addMember(boardId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('board')
  @Delete(':boardId/members/:userId')
  removeMember(
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
  ) {
    return this.boardsService.removeMember(boardId, userId);
  }
}
