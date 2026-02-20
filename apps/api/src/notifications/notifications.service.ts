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
        const notifications = await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return { success: true, data: notifications };
    }

    async markAsRead(userId: string, id: string) {
        const result = await this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
        return { success: true, data: result };
    }

    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { success: true, message: 'All notifications marked as read' };
    }
}
