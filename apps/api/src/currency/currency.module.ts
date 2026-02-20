import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [CurrencyService],
    exports: [CurrencyService],
})
export class CurrencyModule { }
