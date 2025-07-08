import { Prisma, contact_messages } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '../database/data-source';
import { injectable } from 'tsyringe';

@injectable()
export class ContactMessageRepository extends BaseRepository<
  contact_messages,
  Prisma.contact_messagesCreateInput,
  Prisma.contact_messagesUpdateInput
> {
  constructor() {
    super(prisma.contact_messages);
  }
}
