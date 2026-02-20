import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as cron from 'node-cron';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RecurringTransactionsService implements OnModuleInit {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2
    ) { }

    onModuleInit() {
        // Run every day at midnight
        cron.schedule('0 0 * * *', () => {
            this.processRecurringTransactions();
        });
        console.log('Recurring transactions cron job scheduled.');
    }

    async processRecurringTransactions() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const recurring = await this.prisma.recurringTransaction.findMany({
            where: {
                isActive: true,
                nextRunDate: {
                    lte: today,
                },
            },
        });

        console.log(`Processing ${recurring.length} recurring transactions...`);

        for (const rt of recurring) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    // 1. Create the actual transaction
                    await tx.transaction.create({
                        data: {
                            userId: rt.userId,
                            type: rt.type,
                            amount: rt.amount,
                            categoryId: rt.categoryId,
                            description: `${rt.description} (Recurring)`,
                            date: new Date(),
                        },
                    });

                    // 2. Update the next run date
                    const nextRun = this.calculateNextRun(rt.nextRunDate, rt.frequency);
                    await tx.recurringTransaction.update({
                        where: { id: rt.id },
                        data: { nextRunDate: nextRun },
                    });
                });

                // 3. Emit event to update wallet/balance
                // Note: The transaction above will trigger individual transaction events 
                // if handled by typical patterns, but we might need explicit balance update
                this.eventEmitter.emit('transaction.created', {
                    userId: rt.userId,
                    amount: rt.amount,
                    type: rt.type
                });

            } catch (err) {
                console.error(`Failed to process recurring transaction ${rt.id}:`, err);
            }
        }
    }

    private calculateNextRun(baseDate: Date, frequency: string): Date {
        const next = new Date(baseDate);
        switch (frequency) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
            case 'yearly':
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
        return next;
    }

    async createRecurring(userId: string, data: any) {
        return this.prisma.recurringTransaction.create({
            data: {
                ...data,
                userId,
                nextRunDate: data.startDate || new Date(),
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.recurringTransaction.findMany({
            where: { userId },
            include: { category: true },
        });
    }

    async toggleActive(id: string, userId: string) {
        const rt = await this.prisma.recurringTransaction.findUnique({ where: { id } });
        if (!rt || rt.userId !== userId) throw new Error('Not found');

        return this.prisma.recurringTransaction.update({
            where: { id },
            data: { isActive: !rt.isActive },
        });
    }

    async remove(id: string, userId: string) {
        const rt = await this.prisma.recurringTransaction.findUnique({ where: { id } });
        if (!rt || rt.userId !== userId) throw new Error('Not found');

        return this.prisma.recurringTransaction.delete({ where: { id } });
    }
}
