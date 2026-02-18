import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class BalanceService {
    constructor(private prisma: PrismaService) { }

    @OnEvent('transaction.created')
    @OnEvent('transaction.updated')
    @OnEvent('transaction.deleted')
    async handleTransactionChange(payload: { userId: string }) {
        await this.recalculateBalance(payload.userId);
    }

    async recalculateBalance(userId: string) {
        const aggregate = await this.prisma.transaction.aggregate({
            where: { userId },
            _sum: {
                amount: true,
            },
        });

        // Note: In a real app, you'd separate income and expense in the aggregation
        // For now, I'll calculate total income and total expenses separately
        const income = await this.prisma.transaction.aggregate({
            where: { userId, type: 'income' },
            _sum: { amount: true },
        });

        const expenses = await this.prisma.transaction.aggregate({
            where: { userId, type: 'expense' },
            _sum: { amount: true },
        });

        const totalIncome = income._sum.amount || 0;
        const totalExpenses = expenses._sum.amount || 0;
        const balance = totalIncome - totalExpenses;

        await this.prisma.wallet.upsert({
            where: { userId },
            update: {
                balance,
                totalIncome,
                totalExpenses,
                lastUpdated: new Date(),
            },
            create: {
                userId,
                balance,
                totalIncome,
                totalExpenses,
            },
        });
    }
}
