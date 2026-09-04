import { SetMetadata } from '@nestjs/common';

export type ResourceType = 'board' | 'column' | 'task';

export const RESOURCE_TYPE_KEY = 'resourceType';
export const ResourceType = (type: ResourceType) =>
  SetMetadata(RESOURCE_TYPE_KEY, type);
