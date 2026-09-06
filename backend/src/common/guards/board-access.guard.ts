import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  RESOURCE_TYPE_KEY,
  ResourceType,
} from '../decorators/resource-type.decorator.js';

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType =
      this.reflector.getAllAndOverride<ResourceType>(RESOURCE_TYPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'board';

    const req = context.switchToHttp().getRequest();
    const userId: string = req.user?.id;

    const paramKey = `${resourceType}Id`;

    const resourceId: string = req.params?.[paramKey] ?? req.body?.[paramKey];

    if (!resourceId) {
      throw new NotFoundException(
        `Missing "${paramKey}" (param)`,
      );
    }

    const boardId = await this.resolveBoardId(resourceType, resourceId);

    if (!boardId) {
      throw new NotFoundException('Resource not found');
    }

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { ownerId: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.ownerId === userId) {
      req.boardRole = 'OWNER';
      req.boardId = boardId;
      return true;
    }

    const membership = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this board');
    }

    req.boardRole = membership.role;
    req.boardId = boardId;
    return true;
  }

  private async resolveBoardId(
    resourceType: ResourceType,
    resourceId: string,
  ): Promise<string | null> {
    switch (resourceType) {
      case 'board':
        return resourceId;

      case 'column': {
        const column = await this.prisma.column.findUnique({
          where: { id: resourceId },
          select: { boardId: true },
        });
        return column?.boardId ?? null;
      }

      case 'task': {
        const task = await this.prisma.task.findUnique({
          where: { id: resourceId },
          select: { column: { select: { boardId: true } } },
        });
        return task?.column?.boardId ?? null;
      }

      default:
        return null;
    }
  }
}
