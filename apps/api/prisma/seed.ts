import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const defaultCategories = [
        // Income
        { name: 'Salary', type: 'income', icon: 'DollarSign' },
        { name: 'Freelance', type: 'income', icon: 'Briefcase' },
        { name: 'Gift', type: 'income', icon: 'Gift' },
        { name: 'Investment', type: 'income', icon: 'TrendingUp' },

        // Expense
        { name: 'Food & Drink', type: 'expense', icon: 'Coffee' },
        { name: 'Rent', type: 'expense', icon: 'Home' },
        { name: 'Transport', type: 'expense', icon: 'Car' },
        { name: 'Shopping', type: 'expense', icon: 'ShoppingBag' },
        { name: 'Entertainment', type: 'expense', icon: 'Film' },
        { name: 'Health', type: 'expense', icon: 'Activity' },
        { name: 'Utilities', type: 'expense', icon: 'Zap' },
    ];

    console.log('🌱 Start seeding...');

    // Note: We create categories without userId to mark them as "System" categories
    // But our schema requires userId. Let's create a "System" user if it doesn't exist 
    // or just use a dummy UUID.

    const systemUserId = '00000000-0000-0000-0000-000000000000';

    // Ensure system user exists (password doesn't matter, won't be used)
    await prisma.user.upsert({
        where: { id: systemUserId, email: 'system@hsabati.com' },
        update: {},
        create: {
            id: systemUserId,
            email: 'system@hsabati.com',
            password: 'SYSTEM_USER',
            name: 'System',
        }
    });

    for (const cat of defaultCategories) {
        await prisma.category.upsert({
            where: { id: `cat-${cat.name.toLowerCase().replace(/\s+/g, '-')}` },
            update: {},
            create: {
                id: `cat-${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
                userId: systemUserId,
                name: cat.name,
                type: cat.type,
                icon: cat.icon,
                isCustom: false,
            },
        });
    }

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
