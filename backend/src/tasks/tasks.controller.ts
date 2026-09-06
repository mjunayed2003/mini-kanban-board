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
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { MoveTaskDto } from './dto/move-task.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @UseGuards(BoardAccessGuard)
  @ResourceType('column')
  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('column')
  @Get('column/:columnId')
  findAllByColumn(@Param('columnId') columnId: string) {
    return this.tasksService.findAllByColumn(columnId);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('task')
  @Patch(':taskId')
  update(@Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(taskId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @ResourceType('task')
  @Delete(':taskId')
  remove(@Param('taskId') taskId: string) {
    return this.tasksService.remove(taskId);
  }

  // Move task endpoint
  @UseGuards(BoardAccessGuard)
  @ResourceType('task')
  @Post(':taskId/move')
  move(@Param('taskId') taskId: string, @Body() dto: MoveTaskDto) {
    return this.tasksService.moveTask(taskId, dto);
  }
}
