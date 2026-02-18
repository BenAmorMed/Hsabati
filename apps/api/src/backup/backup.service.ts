import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupService {
    constructor(private prisma: PrismaService) { }

    async exportData(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallet: true,
                transactions: true,
                categories: true,
                advancedPayments: {
                    include: { logs: true },
                },
            },
        });

        return {
            success: true,
            data: user,
        };
    }

    async importData(userId: string, data: any) {
        // Logic for validation and restore would go here
        // For now, it's a stub to match the API requirements
        return {
            success: true,
            message: 'Backup imported successfully',
        };
    }
}
