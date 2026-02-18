import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AdvancedPaymentsService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
    ) { }

    async create(userId: string, data: any) {
        const payment = await this.prisma.advancedPayment.create({
            data: {
                ...data,
                userId,
                remaining: data.amount,
                status: 'unpaid',
            },
        });

        this.eventEmitter.emit('advanced_payment.created', { userId, paymentId: payment.id });
        return { success: true, data: payment };
    }

    async addRepayment(userId: string, paymentId: string, amount: number, note?: string) {
        const payment = await this.prisma.advancedPayment.findFirst({
            where: { id: paymentId, userId },
        });

        if (!payment) throw new NotFoundException('Advanced payment not found');

        const newRemaining = payment.remaining - amount;
        const newStatus = newRemaining <= 0 ? 'paid' : 'partial';

        const log = await this.prisma.paymentLog.create({
            data: {
                advancedPaymentId: paymentId,
                amount,
                note,
            },
        });

        await this.prisma.advancedPayment.update({
            where: { id: paymentId },
            data: {
                remaining: newRemaining,
                status: newStatus,
            },
        });

        // Repayments should also impact wallet balance
        // If I lend money, I get it back (+ balance)
        // If I borrow money, I pay it back (- balance)
        const transactionType = payment.type === 'lend' ? 'income' : 'expense';

        await this.prisma.transaction.create({
            data: {
                userId,
                amount,
                type: transactionType,
                description: `Repayment for ${payment.type}: ${payment.contactName}`,
            }
        });

        this.eventEmitter.emit('transaction.created', { userId });
        this.eventEmitter.emit('advanced_payment.updated', { userId, paymentId });

        return { success: true, data: log };
    }

    async findAll(userId: string) {
        const payments = await this.prisma.advancedPayment.findMany({
            where: { userId },
            include: { logs: true },
        });
        return { success: true, data: payments };
    }
}
