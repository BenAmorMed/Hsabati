import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Parser } from 'json2csv';

@Injectable()
export class ExportService {
    constructor(private prisma: PrismaService) { }

    async exportTransactionsCsv(userId: string) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { date: 'desc' },
        });

        const fields = [
            { label: 'Date', value: 'date' },
            { label: 'Type', value: 'type' },
            { label: 'Amount', value: 'amount' },
            { label: 'Category', value: 'category.name' },
            { label: 'Description', value: 'description' },
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(transactions);

        return csv;
    }
}
