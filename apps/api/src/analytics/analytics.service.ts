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

    async getTrends(userId: string) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6); // Last 7 days
        startDate.setHours(0, 0, 0, 0);

        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { date: 'asc' },
        });

        // Group by day
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const trends: any[] = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dayName = days[date.getDay()];

            const dayTransactions = transactions.filter(t =>
                new Date(t.date).toDateString() === date.toDateString()
            );

            const income = dayTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = dayTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            trends.push({
                name: dayName,
                income,
                expenses,
                date: date.toISOString().split('T')[0]
            });
        }

        return {
            success: true,
            data: trends,
        };
    }

    async getYearlySummary(userId: string, year: number) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            income: 0,
            expense: 0,
            net: 0,
        }));

        transactions.forEach(t => {
            const m = new Date(t.date).getMonth();
            if (t.type === 'income') {
                months[m].income += t.amount;
            } else {
                months[m].expense += t.amount;
            }
            months[m].net = months[m].income - months[m].expense;
        });

        return {
            success: true,
            data: { year, months },
        };
    }

    async getCategoryDistribution(userId: string, type: string = 'expense') {
        const distribution = await this.prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                type,
            },
            _sum: {
                amount: true,
            },
            _count: {
                id: true,
            },
        });

        // Get category names
        const categoryIds = distribution.map(d => d.categoryId).filter(Boolean) as string[];
        const categories = await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
        });

        const data = distribution.map(d => {
            const category = categories.find(c => c.id === d.categoryId);
            return {
                category: category?.name || 'Uncategorized',
                total: d._sum.amount || 0,
                count: d._count.id,
            };
        }).sort((a, b) => b.total - a.total);

        return {
            success: true,
            data,
        };
    }
}
