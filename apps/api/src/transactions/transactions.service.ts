import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TransactionsService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
    ) { }

    async create(userId: string, data: any) {
        const transaction = await this.prisma.transaction.create({
            data: {
                ...data,
                userId,
            },
        });

        this.eventEmitter.emit('transaction.created', { userId });
        return { success: true, data: transaction };
    }

    async findAll(userId: string) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { date: 'desc' },
        });
        return { success: true, data: transactions };
    }

    async findOne(userId: string, id: string) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id, userId },
        });
        if (!transaction) throw new NotFoundException('Transaction not found');
        return { success: true, data: transaction };
    }

    async update(userId: string, id: string, data: any) {
        const transaction = await this.prisma.transaction.updateMany({
            where: { id, userId },
            data,
        });

        this.eventEmitter.emit('transaction.updated', { userId });
        return { success: true, data: transaction };
    }

    async remove(userId: string, id: string) {
        await this.prisma.transaction.deleteMany({
            where: { id, userId },
        });

        this.eventEmitter.emit('transaction.deleted', { userId });
        return { success: true };
    }
}
