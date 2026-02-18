import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                currency: true,
                language: true,
                theme: true,
                createdAt: true,
            },
        });
        if (!user) throw new NotFoundException('User not found');
        return { success: true, data: user };
    }

    async updateSettings(userId: string, data: any) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                currency: true,
                language: true,
                theme: true,
            },
        });
        return { success: true, data: user };
    }
}
