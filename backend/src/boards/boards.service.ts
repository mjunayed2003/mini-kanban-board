import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBoardDto } from './dto/create-board.dto.js';
import { UpdateBoardDto } from './dto/update-board.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        title: dto.title,
        ownerId: userId,
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.board.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  findOne(boardId: string) {
    return this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        columns: {
          orderBy: { position: 'asc' },
          include: { tasks: { orderBy: { position: 'asc' } } },
        },
      },
    });
  }

  update(boardId: string, dto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id: boardId },
      data: dto,
    });
  }

  remove(boardId: string) {
    return this.prisma.board.delete({ where: { id: boardId } });
  }

  async addMember(boardId: string, dto: AddMemberDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('No user found with this email');
    }

    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: user.id } },
    });
    if (existing) {
      throw new ConflictException('User is already a member of this board');
    }

    return this.prisma.boardMember.create({
      data: { boardId, userId: user.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  removeMember(boardId: string, userId: string) {
    return this.prisma.boardMember.delete({
      where: { boardId_userId: { boardId, userId } },
    });
  }
}
