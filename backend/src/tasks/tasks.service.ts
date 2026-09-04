import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { MoveTaskDto } from './dto/move-task.dto.js';

const POSITION_GAP = 1000;
const MIN_GAP = 1; // এর চেয়ে ছোট gap হলে reindex ট্রিগার হবে

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto) {
    const last = await this.prisma.task.findFirst({
      where: { columnId: dto.columnId },
      orderBy: { position: 'desc' },
    });
    const position = last ? last.position + POSITION_GAP : POSITION_GAP;

    return this.prisma.task.create({
      data: {
        columnId: dto.columnId,
        title: dto.title,
        description: dto.description,
        position,
      },
    });
  }

  findAllByColumn(columnId: string) {
    return this.prisma.task.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
    });
  }

  async update(taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({ where: { id: taskId }, data: dto });
  }

  remove(taskId: string) {
    return this.prisma.task.delete({ where: { id: taskId } });
  }

  /**
   * Move a task — একই column-এ reorder অথবা অন্য column-এ move, দুটোই handle করে।
   * পুরো লজিক একটা transaction-এর ভিতরে, যাতে concurrent move-এ conflict না হয়।
   */
  async moveTask(taskId: string, dto: MoveTaskDto) {
    return this.prisma.$transaction(async (tx: any) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        include: { column: { select: { boardId: true } } },
      });
      if (!task) throw new NotFoundException('Task not found');

      const targetColumn = await tx.column.findUnique({
        where: { id: dto.targetColumnId },
        select: { boardId: true },
      });
      if (!targetColumn) {
        throw new NotFoundException('Target column not found');
      }

      // Security check: guard শুধু source task-এর board access verify করে।
      // target column অন্য কোনো board-এর হলে সেটা আটকাতে হবে এখানে manually।
      if (targetColumn.boardId !== task.column.boardId) {
        throw new ForbiddenException(
          'Cannot move a task to a column on a different board',
        );
      }

      // Step 1: neighbour resolve করা (before/after task, দুইভাবে হতে পারে)
      let { before, after } = await this.resolveNeighbours(
        tx,
        taskId,
        dto,
      );

      // Step 2: position calculate করা
      let newPosition = this.calculatePosition(before, after);

      // Step 3: gap খুব ছোট হয়ে গেলে (precision safeguard) — পুরো target column
      // reindex করে fresh gap বানিয়ে আবার calculate করা হবে
      const gapTooSmall =
        (before && Math.abs(newPosition - before.position) < MIN_GAP) ||
        (after && Math.abs(after.position - newPosition) < MIN_GAP);

      if (gapTooSmall) {
        await this.reindexColumn(tx, dto.targetColumnId, taskId);
        ({ before, after } = await this.resolveNeighbours(tx, taskId, dto));
        newPosition = this.calculatePosition(before, after);
      }

      // Step 4: task update — column change + নতুন position
      return tx.task.update({
        where: { id: taskId },
        data: {
          columnId: dto.targetColumnId,
          position: newPosition,
        },
      });
    });
  }

  // before/after task বের করে — হয় সরাসরি beforeTaskId/afterTaskId থেকে,
  // অথবা targetPosition (index) থেকে target column-এর বর্তমান order দেখে
  private async resolveNeighbours(
    tx: any,
    taskId: string,
    dto: MoveTaskDto,
  ): Promise<{
    before: { id: string; position: number } | null;
    after: { id: string; position: number } | null;
  }> {
    if (dto.beforeTaskId || dto.afterTaskId) {
      const before = dto.beforeTaskId
        ? await tx.task.findUnique({
            where: { id: dto.beforeTaskId },
            select: { id: true, position: true },
          })
        : null;

      const after = dto.afterTaskId
        ? await tx.task.findUnique({
            where: { id: dto.afterTaskId },
            select: { id: true, position: true },
          })
        : null;

      if (dto.beforeTaskId && !before) {
        throw new NotFoundException('beforeTaskId not found');
      }
      if (dto.afterTaskId && !after) {
        throw new NotFoundException('afterTaskId not found');
      }

      return { before, after };
    }

    // index-based fallback
    const siblings = await tx.task.findMany({
      where: { columnId: dto.targetColumnId, id: { not: taskId } },
      orderBy: { position: 'asc' },
      select: { id: true, position: true },
    });

    const index = dto.targetPosition ?? siblings.length; // না দিলে শেষে বসবে
    const before = index > 0 ? (siblings[index - 1] ?? null) : null;
    const after = siblings[index] ?? null;

    return { before, after };
  }

  private calculatePosition(
    before: { position: number } | null,
    after: { position: number } | null,
  ): number {
    if (before && after) {
      return (before.position + after.position) / 2;
    }
    if (before && !after) {
      return before.position + POSITION_GAP;
    }
    if (!before && after) {
      return after.position / 2;
    }
    return POSITION_GAP; // column খালি
  }

  // Column-এর সব task (excludeTaskId বাদে) নতুন করে 1000, 2000, 3000... করে দেয়
  private async reindexColumn(
    tx: any,
    columnId: string,
    excludeTaskId?: string,
  ) {
    const tasks = await tx.task.findMany({
      where: {
        columnId,
        ...(excludeTaskId ? { id: { not: excludeTaskId } } : {}),
      },
      orderBy: { position: 'asc' },
      select: { id: true },
    });

    for (let i = 0; i < tasks.length; i++) {
      await tx.task.update({
        where: { id: tasks[i].id },
        data: { position: (i + 1) * POSITION_GAP },
      });
    }
  }
}
