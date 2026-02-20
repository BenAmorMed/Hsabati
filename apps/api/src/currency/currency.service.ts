import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import * as cron from 'node-cron';

@Injectable()
export class CurrencyService implements OnModuleInit {
    private readonly API_URL = 'https://open.er-api.com/v6/latest'; // Free, no key required for basic use

    constructor(private prisma: PrismaService) { }

    onModuleInit() {
        // Refresh rates daily
        cron.schedule('0 1 * * *', () => {
            this.refreshRates('USD');
        });
        console.log('Currency refresh cron job scheduled.');
    }

    async refreshRates(base: string = 'USD') {
        try {
            console.log(`Refreshing exchange rates for base: ${base}...`);
            const response = await axios.get(`${this.API_URL}/${base}`);
            const rates = response.data.rates;

            const updatePromises = Object.entries(rates).map(([currency, rate]) => {
                return this.prisma.currencyRate.upsert({
                    where: { from_to: { from: base, to: currency } },
                    update: { rate: rate as number, updatedAt: new Date() },
                    create: { from: base, to: currency, rate: rate as number },
                });
            });

            await Promise.all(updatePromises);
            console.log('Exchange rates updated successfully.');
        } catch (err) {
            console.error('Failed to refresh exchange rates:', err.message);
        }
    }

    async convert(amount: number, from: string, to: string): Promise<number> {
        if (from === to) return amount;

        // Try direct rate
        let rateRecord = await this.prisma.currencyRate.findUnique({
            where: { from_to: { from, to } },
        });

        if (rateRecord) return amount * rateRecord.rate;

        // Try inverse rate
        rateRecord = await this.prisma.currencyRate.findUnique({
            where: { from_to: { from: to, to: from } },
        });

        if (rateRecord) return amount * (1 / rateRecord.rate);

        // If still not found, try refreshing USD rates as default
        await this.refreshRates('USD');

        // Check again (simplified logic for now)
        return amount; // Fallback to 1:1 if rate unavailable
    }

    async getAllRates(base: string = 'USD') {
        return this.prisma.currencyRate.findMany({
            where: { from: base },
        });
    }
}
