import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { SyncGateway } from '../sync/sync.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private syncGateway: SyncGateway,
    ) { }

    @OnEvent('notification.created')
    async handleNotificationCreated(payload: any) {
        this.syncGateway.pushToUser(payload.userId, 'new_notification', payload);
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsRead(userId: string, id: string) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }
}
