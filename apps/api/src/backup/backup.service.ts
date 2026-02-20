import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupService {
    constructor(private prisma: PrismaService) { }

    async exportData(userId: string) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
        });
        const advancedPayments = await this.prisma.advancedPayment.findMany({
            where: { userId },
            include: { logs: true },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                name: true,
                currency: true,
                language: true,
                theme: true,
            }
        });

        return {
            success: true,
            exportedAt: new Date().toISOString(),
            data: {
                transactions,
                advancedPayments,
                settings: user,
            },
        };
    }

    async importData(userId: string, data: any) {
        const { transactions, advancedPayments, settings } = data;

        const results = { transactions: 0, advancedPayments: 0, settings: false };

        if (Array.isArray(transactions) && transactions.length > 0) {
            const txData = transactions.map(({ id, userId: _u, ...rest }) => ({
                ...rest,
                userId,
                date: rest.date ? new Date(rest.date) : new Date(),
            }));
            const created = await this.prisma.transaction.createMany({
                data: txData,
                skipDuplicates: true,
            });
            results.transactions = created.count;
        }

        if (Array.isArray(advancedPayments) && advancedPayments.length > 0) {
            // Prisma createMany doesn't support nested includes (logs)
            // So we'll have to do this carefully or just skip logs for now if they are not in schema
            for (const payment of advancedPayments) {
                const { id, userId: _u, logs, ...rest } = payment;
                await this.prisma.advancedPayment.create({
                    data: {
                        ...rest,
                        userId,
                        dueDate: rest.dueDate ? new Date(rest.dueDate) : null,
                        logs: logs ? {
                            create: logs.map(({ id: _l, advancedPaymentId: _a, ...logRest }: any) => logRest)
                        } : undefined
                    }
                });
                results.advancedPayments++;
            }
        }

        if (settings) {
            await this.prisma.user.update({
                where: { id: userId },
                data: settings,
            });
            results.settings = true;
        }

        return {
            success: true,
            message: 'Backup imported successfully',
            results,
        };
    }
}
