import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateColumnDto } from './dto/create-column.dto.js';
import { UpdateColumnDto } from './dto/update-column.dto.js';
import { ReorderColumnsDto } from './dto/reorder-columns.dto.js';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateColumnDto) {
    // নতুন column সবসময় শেষে বসবে — বর্তমান সর্বোচ্চ position + 1000
    const last = await this.prisma.column.findFirst({
      where: { boardId: dto.boardId },
      orderBy: { position: 'desc' },
    });
    const position = last ? last.position + 1000 : 1000;

    return this.prisma.column.create({
      data: {
        boardId: dto.boardId,
        title: dto.title,
        position,
      },
    });
  }

  findAllByBoard(boardId: string) {
    return this.prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
      include: { tasks: { orderBy: { position: 'asc' } } },
    });
  }

  async update(columnId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });
    if (!column) throw new NotFoundException('Column not found');

    return this.prisma.column.update({
      where: { id: columnId },
      data: dto,
    });
  }

  remove(columnId: string) {
    return this.prisma.column.delete({ where: { id: columnId } });
  }

  // পুরো board-এর column গুলো নতুন order অনুযায়ী re-position করে দেয়
  async reorder(dto: ReorderColumnsDto) {
    const updates = dto.orderedColumns.map((item, index) =>
      this.prisma.column.update({
        where: { id: item.columnId },
        data: { position: (index + 1) * 1000 },
      }),
    );

    return this.prisma.$transaction(updates);
  }
}
