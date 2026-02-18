import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getMonthlySummary(userId: string, year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const summary = await this.prisma.transaction.groupBy({
            by: ['type'],
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                amount: true,
            },
        });

        return {
            success: true,
            data: summary,
        };
    }

    async getOverview(userId: string) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });

        const recentTransactions = await this.prisma.transaction.findMany({
            where: { userId },
            take: 5,
            orderBy: { date: 'desc' },
        });

        return {
            success: true,
            data: {
                balance: wallet?.balance || 0,
                totalIncome: wallet?.totalIncome || 0,
                totalExpenses: wallet?.totalExpenses || 0,
                recentTransactions,
            },
        };
    }
}
