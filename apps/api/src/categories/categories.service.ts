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

    async findOne(userId: string, id: string) {
        const category = await this.prisma.category.findFirst({
            where: {
                id,
                OR: [
                    { userId },
                    { isCustom: false }
                ]
            },
        });
        if (!category) throw new NotFoundException('Category not found');
        return { success: true, data: category };
    }

    async update(userId: string, id: string, data: any) {
        const existing = await this.prisma.category.findFirst({
            where: { id, userId, isCustom: true },
        });
        if (!existing) throw new NotFoundException('Custom category not found or access denied');

        const category = await this.prisma.category.update({
            where: { id },
            data,
        });

        return { success: true, data: category };
    }

    async remove(userId: string, id: string) {
        const existing = await this.prisma.category.findFirst({
            where: { id, userId, isCustom: true },
        });
        if (!existing) throw new NotFoundException('Custom category not found or access denied');

        await this.prisma.category.delete({
            where: { id },
        });
        return { success: true };
    }
}
