import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as cron from 'node-cron';

@Injectable()
export class ReminderService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    onModuleInit() {
        // Run every day at 08:00
        cron.schedule('0 8 * * *', () => {
            this.checkDuePayments();
        });
    }

    async checkDuePayments() {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const duePayments = await this.prisma.advancedPayment.findMany({
            where: {
                status: { not: 'paid' },
                dueDate: {
                    lte: tomorrow,
                },
            },
        });

        for (const payment of duePayments) {
            await this.prisma.notification.create({
                data: {
                    userId: payment.userId,
                    title: 'Payment Reminder',
                    message: `Your payment for ${payment.contactName} is due soon: ${payment.remaining} ${payment.type === 'lend' ? 'to receive' : 'to pay'}.`,
                    type: 'reminder',
                },
            });

            // In a real app, you might emit a socket event here too
        }
    }
}
