import { Prisma, webhook_events } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '../database/data-source';
import { injectable } from 'tsyringe';

@injectable()
export class WebhookEventRepository extends BaseRepository<
  webhook_events,
  Prisma.webhook_eventsCreateInput,
  Prisma.webhook_eventsUpdateInput
> {
  constructor() {
    super(prisma.webhook_events);
  }
}
