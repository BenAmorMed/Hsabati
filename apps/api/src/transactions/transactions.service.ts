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

    async findAll(userId: string, query: any = {}) {
        const { type, categoryId, startDate, endDate, page = 1, limit = 20 } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = { userId };
        if (type) where.type = type;
        if (categoryId) where.categoryId = categoryId;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: { category: true },
                orderBy: { date: 'desc' },
                skip,
                take,
            }),
            this.prisma.transaction.count({ where }),
        ]);

        return {
            success: true,
            data: transactions,
            pagination: {
                page: Number(page),
                limit: take,
                total,
                pages: Math.ceil(total / take),
            },
        };
    }

    async findOne(userId: string, id: string) {
        const transaction = await this.prisma.transaction.findFirst({
            where: { id, userId },
            include: { category: true },
        });
        if (!transaction) throw new NotFoundException('Transaction not found');
        return { success: true, data: transaction };
    }

    async update(userId: string, id: string, data: any) {
        const existing = await this.prisma.transaction.findFirst({
            where: { id, userId },
        });
        if (!existing) throw new NotFoundException('Transaction not found');

        const transaction = await this.prisma.transaction.update({
            where: { id },
            data,
        });

        this.eventEmitter.emit('transaction.updated', { userId });
        return { success: true, data: transaction };
    }

    async remove(userId: string, id: string) {
        const existing = await this.prisma.transaction.findFirst({
            where: { id, userId },
        });
        if (!existing) throw new NotFoundException('Transaction not found');

        await this.prisma.transaction.delete({
            where: { id },
        });

        this.eventEmitter.emit('transaction.deleted', { userId });
        return { success: true };
    }
}
