import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        // Find system categories (no userId or specific userId) and user-specific categories
        const categories = await this.prisma.category.findMany({
            where: {
                OR: [
                    { userId },
                    { isCustom: false } // Assuming system categories have isCustom: false
                ]
            }
        });
        return { success: true, data: categories };
    }

    async create(userId: string, data: any) {
        const category = await this.prisma.category.create({
            data: {
                ...data,
                userId,
                isCustom: true,
            },
        });
        return { success: true, data: category };
    }

    async remove(userId: string, id: string) {
        await this.prisma.category.deleteMany({
            where: { id, userId, isCustom: true },
        });
        return { success: true };
    }
}
